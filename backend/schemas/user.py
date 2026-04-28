from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    firstName: str
    lastName: str
    ph_num: Optional[str] = None
    addr: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[EmailStr] = None

class User(BaseModel):
    userID: int
    email: EmailStr
    firstName: str
    lastName: str
    ph_num: Optional[str] = None
    addr: Optional[str] = None

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    firstName: str
    lastName: str
    ph_num: Optional[str] = None
    addr: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

class BookingSummary(BaseModel):
    booking_id: int
    status: Optional[str] = None
    bk_date: Optional[datetime] = None
    bk_type: Optional[str] = None
    travel_start_date: Optional[datetime] = None
    travel_end_date: Optional[datetime] = None
    bk_cost: Optional[float] = None

class ReviewSummary(BaseModel):
    review_id: int
    dest_id: int
    rating: Optional[int] = None
    content: Optional[str] = None
    review_date: Optional[datetime] = None

class UserDashboard(BaseModel):
    total_bookings: int
    pending_bookings: int
    confirmed_bookings: int
    cancelled_bookings: int
    upcoming_trips: List[BookingSummary]
    recent_bookings: List[BookingSummary]
    recent_reviews: List[ReviewSummary]


# Aliases for route handlers
UserProfile = User
UserUpdate = UserProfileUpdate
