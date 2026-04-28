from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class BookingBase(BaseModel):
    bk_type: str
    trip_id: int
    travel_start_date: Optional[datetime] = None
    travel_end_date: Optional[datetime] = None
    numtravelers: Optional[int] = None
    bk_cost: Optional[float] = None


class BookingCreate(BookingBase):
    pass


class BookingResponse(BookingBase):
    booking_id: int
    status: Optional[str] = None
    user_id: int
    bk_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaymentCreate(BaseModel):
    payMethod: str
    amount: float


class PaymentResponse(BaseModel):
    payment_id: int
    booking_id: int
    payMethod: str
    amount: float
    payment_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class DestinationInfo(BaseModel):
    dest_id: int
    destName: Optional[str] = None
    image: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True


class PackageInfo(BaseModel):
    pkg_id: int
    name: Optional[str] = None
    image: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True


class ItineraryInfo(BaseModel):
    itinerary_id: int
    itinerary_name: Optional[str] = None
    price: Optional[float] = None

    class Config:
        from_attributes = True


class BookingDetails(BaseModel):
    booking: BookingResponse
    payments: List[PaymentResponse]
    package_info: Optional[PackageInfo] = None
    destination_info: Optional[DestinationInfo] = None
    itinerary_info: Optional[ItineraryInfo] = None


class BookingSummary(BaseModel):
    booking: BookingResponse
    payment: Optional[PaymentResponse] = None
    package_info: Optional[PackageInfo] = None
    destination_info: Optional[DestinationInfo] = None
    itinerary_info: Optional[ItineraryInfo] = None


class BookItineraryRequest(BaseModel):
    itinerary_id: int
    travel_start_date: datetime
    travel_end_date: datetime
    numtravelers: int
    special_requests: Optional[str] = None
