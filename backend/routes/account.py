from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config.database import get_db
from models.users import User
from models.booking import Booking
from models.travel import Review
from schemas.user import UserUpdate, UserProfile
from schemas.booking import BookingResponse
from services.dependencies import get_current_user

router = APIRouter()


@router.get("/profile", response_model=UserProfile)
async def get_profile(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(User).where(User.userID == user.userID))
    db_user = result.scalars().first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserProfile.model_validate(db_user)


@router.put("/profile", response_model=UserProfile)
async def update_profile(
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(User).where(User.userID == user.userID))
    db_user = result.scalars().first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db_user.firstName = payload.firstName
    db_user.lastName = payload.lastName
    db_user.ph_num = payload.ph_num
    db_user.addr = payload.addr

    await db.commit()
    await db.refresh(db_user)
    return UserProfile.model_validate(db_user)


@router.get("/bookings", response_model=List[BookingResponse])
async def my_bookings(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Booking).where(Booking.user_id == user.userID).order_by(Booking.bk_date.desc())
    )
    bookings = result.scalars().all()
    return [BookingResponse.model_validate(b) for b in bookings]


@router.get("/reviews", response_model=List[dict])
async def my_reviews(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Review).where(Review.user_id == user.userID).order_by(Review.review_date.desc()))
    reviews = result.scalars().all()
    return [
        {
            "review_id": r.review_id,
            "dest_id": r.dest_id,
            "rating": r.rating,
            "content": r.content,
            "review_date": r.review_date,
        }
        for r in reviews
    ]
