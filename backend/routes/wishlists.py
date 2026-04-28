from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config.database import get_db
from models.travel import Destination
from models.interactions import Wishlist
from models.users import User
from schemas.interactions import WishlistAddRequest, WishlistResponse
from services.dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=List[WishlistResponse])
async def get_wishlist(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Wishlist).filter(Wishlist.user_id == user.userID)
    )
    return [WishlistResponse.model_validate(w) for w in result.scalars().all()]


@router.post("/", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
async def add_to_wishlist(
    payload: WishlistAddRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    dest_result = await db.execute(
        select(Destination).filter(Destination.dest_id == payload.dest_id)
    )
    if not dest_result.scalars().first():
        raise HTTPException(status_code=404, detail="Destination not found")

    existing_result = await db.execute(
        select(Wishlist).filter(Wishlist.dest_id == payload.dest_id, Wishlist.user_id == user.userID)
    )
    existing = existing_result.scalars().first()

    if existing:
        return WishlistResponse.model_validate(existing)

    new_wishlist = Wishlist(
        dest_id=payload.dest_id,
        user_id=user.userID
    )
    db.add(new_wishlist)
    await db.commit()
    await db.refresh(new_wishlist)
    
    return WishlistResponse.model_validate(new_wishlist)


@router.delete("/{wishlist_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_wishlist(
    wishlist_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Wishlist).filter(Wishlist.item_id == wishlist_id)
    )
    wishlist_item = result.scalars().first()
    
    if not wishlist_item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
        
    if wishlist_item.user_id != user.userID:
        raise HTTPException(status_code=403, detail="Not authorized to remove this item")

    await db.delete(wishlist_item)
    await db.commit()
    return None
