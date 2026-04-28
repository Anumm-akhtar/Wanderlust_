from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config.database import get_db
from models.travel import Review, Destination
from models.users import User
from schemas.interactions import ReviewCreate, ReviewResponse, ReviewUpdate
from services.dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ReviewResponse])
async def list_reviews(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Review).order_by(Review.review_date.desc()))
    return [ReviewResponse.model_validate(r) for r in result.scalars().all()]


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    payload: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if payload.rating < 1 or payload.rating > 5 or not payload.content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid rating or content"
        )

    res = await db.execute(select(Destination).filter(Destination.dest_id == payload.dest_id))
    if not res.scalars().first():
        raise HTTPException(status_code=404, detail="Destination not found")

    new_review = Review(
        dest_id=payload.dest_id,
        user_id=user.userID,
        rating=payload.rating,
        content=payload.content,
        review_date=datetime.utcnow()
    )
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)
    
    return ReviewResponse.model_validate(new_review)

@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review(review_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Review).filter(Review.review_id == review_id))
    review = result.scalars().first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    return ReviewResponse.model_validate(review)

@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: int,
    payload: ReviewUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if payload.rating < 1 or payload.rating > 5 or not payload.content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid rating or content"
        )

    result = await db.execute(select(Review).filter(Review.review_id == review_id))
    review = result.scalars().first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    if review.user_id != user.userID:
        raise HTTPException(status_code=403, detail="Not authorized to edit this review")

    review.rating = payload.rating
    review.content = payload.content
    review.review_date = datetime.utcnow()
    
    await db.commit()
    await db.refresh(review)
    
    return ReviewResponse.model_validate(review)


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(Review).filter(Review.review_id == review_id))
    review = result.scalars().first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    if review.user_id != user.userID:
        raise HTTPException(status_code=403, detail="Not authorized to delete this review")

    await db.delete(review)
    await db.commit()
    return None
