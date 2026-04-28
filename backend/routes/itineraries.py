from typing import List
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config.database import get_db
from models.travel import Destination, Itinerary, ItineraryDestination
from models.users import User
from schemas.travel import (
    AddDestinationToItineraryRequest,
    DestinationResponse,
    ItineraryDetails,
    ItineraryResponse,
    ItineraryCreate,
)
from services.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=List[ItineraryResponse])
async def list_itineraries(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Itinerary)
        .where(Itinerary.user_id == user.userID)
        .order_by(Itinerary.itinerary_id.desc())
    )
    itineraries = result.scalars().all()
    return [ItineraryResponse.model_validate(i) for i in itineraries]


@router.post("/", response_model=ItineraryResponse, status_code=status.HTTP_201_CREATED)
async def create_itinerary(
    payload: ItineraryCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    itinerary = Itinerary(
        user_id=user.userID,
        itinerary_name=payload.itinerary_name,
        price=Decimal("0"),
    )
    db.add(itinerary)
    await db.commit()
    await db.refresh(itinerary)
    return ItineraryResponse.model_validate(itinerary)


@router.get("/{itinerary_id}", response_model=ItineraryDetails)
async def get_itinerary(
    itinerary_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Itinerary).where(
            Itinerary.itinerary_id == itinerary_id, Itinerary.user_id == user.userID
        )
    )
    itinerary = result.scalars().first()
    if not itinerary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found"
        )

    # Get destinations
    id_result = await db.execute(
        select(ItineraryDestination).where(ItineraryDestination.itinerary_id == itinerary_id)
    )
    itinerary_dests = id_result.scalars().all()
    dest_ids = [i.dest_id for i in itinerary_dests]

    destinations = []
    if dest_ids:
        dest_result = await db.execute(
            select(Destination).where(Destination.dest_id.in_(dest_ids))
        )
        destinations = dest_result.scalars().all()

    return ItineraryDetails(
        itinerary=ItineraryResponse.model_validate(itinerary),
        destinations=[DestinationResponse.model_validate(d) for d in destinations],
    )


@router.post("/add-destination", response_model=ItineraryDetails)
async def add_destination_to_itinerary(
    payload: AddDestinationToItineraryRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Fetch destination
    dest_result = await db.execute(
        select(Destination).where(Destination.dest_id == payload.dest_id)
    )
    destination = dest_result.scalars().first()
    if not destination:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Destination not found"
        )

    if payload.itinerary_id:
        # Add to existing itinerary
        result = await db.execute(
            select(Itinerary).where(
                Itinerary.itinerary_id == payload.itinerary_id,
                Itinerary.user_id == user.userID,
            )
        )
        itinerary = result.scalars().first()
        if not itinerary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found"
            )

        # Check if it already exists
        exists_result = await db.execute(
            select(ItineraryDestination).where(
                ItineraryDestination.itinerary_id == payload.itinerary_id,
                ItineraryDestination.dest_id == payload.dest_id,
            )
        )
        if not exists_result.scalars().first():
            itinerary.price = (itinerary.price or Decimal("0")) + (destination.price or Decimal("0"))
            db.add(
                ItineraryDestination(
                    itinerary_id=itinerary.itinerary_id, dest_id=payload.dest_id
                )
            )
            await db.commit()
            await db.refresh(itinerary)
    elif payload.new_itinerary_name:
        # Create new itinerary
        itinerary = Itinerary(
            user_id=user.userID,
            itinerary_name=payload.new_itinerary_name,
            price=destination.price,
        )
        db.add(itinerary)
        await db.commit()
        await db.refresh(itinerary)

        db.add(
            ItineraryDestination(itinerary_id=itinerary.itinerary_id, dest_id=payload.dest_id)
        )
        await db.commit()

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either itinerary_id or new_itinerary_name",
        )

    # Return updated itinerary details
    return await get_itinerary(itinerary.itinerary_id, db, user)


@router.put("/{itinerary_id}", response_model=ItineraryResponse)
async def update_itinerary(
    itinerary_id: int,
    payload: ItineraryCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Itinerary).where(
            Itinerary.itinerary_id == itinerary_id, Itinerary.user_id == user.userID
        )
    )
    itinerary = result.scalars().first()
    if not itinerary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found"
        )

    if payload.itinerary_name:
        itinerary.itinerary_name = payload.itinerary_name

    await db.commit()
    await db.refresh(itinerary)
    return ItineraryResponse.model_validate(itinerary)


@router.delete("/{itinerary_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_itinerary(
    itinerary_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Itinerary).where(
            Itinerary.itinerary_id == itinerary_id, Itinerary.user_id == user.userID
        )
    )
    itinerary = result.scalars().first()
    if not itinerary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found"
        )

    await db.delete(itinerary)
    await db.commit()
    return None
