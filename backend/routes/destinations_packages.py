from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config.database import get_db
from models.travel import Destination, Package, ItineraryDestination, PackageDestination
from models.users import Admin
from schemas.travel import (
    DestinationCreate,
    DestinationResponse,
    DestinationUpdate,
    PackageCreate,
    PackageResponse,
    PackageUpdate,
)
from services.dependencies import get_current_admin

router = APIRouter()


# ========== DESTINATIONS ==========

@router.get("/destinations", response_model=List[DestinationResponse])
async def list_destinations(db: AsyncSession = Depends(get_db), q: Optional[str] = None):
    stmt = select(Destination)
    if q:
        stmt = stmt.where(Destination.destName.ilike(f"%{q}%"))
    result = await db.execute(stmt)
    return [DestinationResponse.model_validate(d) for d in result.scalars().all()]


@router.get("/destinations/{dest_id}", response_model=DestinationResponse)
async def get_destination(dest_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Destination).where(Destination.dest_id == dest_id))
    dest = result.scalars().first()
    if not dest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Destination not found")
    return DestinationResponse.model_validate(dest)


@router.post("/destinations", response_model=DestinationResponse, status_code=status.HTTP_201_CREATED)
async def create_destination(
    payload: DestinationCreate,
    db: AsyncSession = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    destination = Destination(
        destName=payload.destName,
        image=payload.image,
        price=payload.price,
        description=payload.description,
    )
    db.add(destination)
    await db.commit()
    await db.refresh(destination)
    return DestinationResponse.model_validate(destination)


@router.put("/destinations/{dest_id}", response_model=DestinationResponse)
async def update_destination(
    dest_id: int,
    payload: DestinationUpdate,
    db: AsyncSession = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(Destination).where(Destination.dest_id == dest_id))
    dest = result.scalars().first()
    if not dest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Destination not found")

    if payload.destName is not None:
        dest.destName = payload.destName
    if payload.image is not None:
        dest.image = payload.image
    if payload.price is not None:
        dest.price = payload.price
    if payload.description is not None:
        dest.description = payload.description

    await db.commit()
    await db.refresh(dest)
    return DestinationResponse.model_validate(dest)


@router.delete("/destinations/{dest_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_destination(
    dest_id: int,
    db: AsyncSession = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(Destination).where(Destination.dest_id == dest_id))
    dest = result.scalars().first()
    if not dest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Destination not found")

    await db.delete(dest)
    await db.commit()
    return None


# ========== PACKAGES ==========

@router.get("/packages", response_model=List[PackageResponse])
async def list_packages(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Package))
    return [PackageResponse.model_validate(p) for p in result.scalars().all()]


@router.get("/packages/{pkg_id}", response_model=PackageResponse)
async def get_package(pkg_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Package).where(Package.pkg_id == pkg_id))
    pkg = result.scalars().first()
    if not pkg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
    return PackageResponse.model_validate(pkg)


@router.post("/packages", response_model=PackageResponse, status_code=status.HTTP_201_CREATED)
async def create_package(
    payload: PackageCreate,
    db: AsyncSession = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    package = Package(
        name=payload.name,
        image=payload.image,
        price=payload.price,
        description=payload.description,
    )
    db.add(package)
    await db.commit()
    await db.refresh(package)
    return PackageResponse.model_validate(package)


@router.put("/packages/{pkg_id}", response_model=PackageResponse)
async def update_package(
    pkg_id: int,
    payload: PackageUpdate,
    db: AsyncSession = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(Package).where(Package.pkg_id == pkg_id))
    pkg = result.scalars().first()
    if not pkg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")

    if payload.name is not None:
        pkg.name = payload.name
    if payload.image is not None:
        pkg.image = payload.image
    if payload.price is not None:
        pkg.price = payload.price
    if payload.description is not None:
        pkg.description = payload.description

    await db.commit()
    await db.refresh(pkg)
    return PackageResponse.model_validate(pkg)


@router.delete("/packages/{pkg_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_package(
    pkg_id: int,
    db: AsyncSession = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(select(Package).where(Package.pkg_id == pkg_id))
    pkg = result.scalars().first()
    if not pkg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")

    await db.delete(pkg)
    await db.commit()
    return None


# ========== PACKAGE-DESTINATION ASSOCIATIONS ==========

@router.post("/packages/{pkg_id}/destinations/{dest_id}", status_code=status.HTTP_201_CREATED)
async def add_destination_to_package(
    pkg_id: int,
    dest_id: int,
    db: AsyncSession = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    pkg_result = await db.execute(select(Package).where(Package.pkg_id == pkg_id))
    pkg = pkg_result.scalars().first()
    if not pkg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")

    dest_result = await db.execute(select(Destination).where(Destination.dest_id == dest_id))
    if not dest_result.scalars().first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Destination not found")

    # Check if already exists
    exists_result = await db.execute(
        select(PackageDestination).where(
            PackageDestination.pkg_id == pkg_id, PackageDestination.dest_id == dest_id
        )
    )
    if exists_result.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Destination already in package")

    pd = PackageDestination(pkg_id=pkg_id, dest_id=dest_id)
    db.add(pd)
    await db.commit()
    return {"message": "Destination added to package"}


@router.delete("/packages/{pkg_id}/destinations/{dest_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_destination_from_package(
    pkg_id: int,
    dest_id: int,
    db: AsyncSession = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    result = await db.execute(
        select(PackageDestination).where(
            PackageDestination.pkg_id == pkg_id, PackageDestination.dest_id == dest_id
        )
    )
    pd = result.scalars().first()
    if not pd:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Destination not in package")

    await db.delete(pd)
    await db.commit()
    return None
