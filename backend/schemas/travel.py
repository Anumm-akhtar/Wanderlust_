from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ReviewBase(BaseModel):
    rating: int
    content: Optional[str] = None


class ReviewResponse(ReviewBase):
    review_id: int
    dest_id: int
    user_id: int
    review_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class DestinationBase(BaseModel):
    destName: Optional[str] = None
    image: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None


class DestinationCreate(DestinationBase):
    destName: str  # Required for creation
    price: float  # Required for creation


class DestinationUpdate(BaseModel):
    destName: Optional[str] = None
    image: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None


class DestinationResponse(DestinationBase):
    dest_id: int

    class Config:
        from_attributes = True


class DestinationDetails(BaseModel):
    destination: DestinationResponse
    reviews: List[ReviewResponse]


class PackageBase(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None


class PackageCreate(PackageBase):
    name: str  # Required for creation
    price: float  # Required for creation


class PackageUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None


class PackageResponse(PackageBase):
    pkg_id: int

    class Config:
        from_attributes = True


class PackageDetails(BaseModel):
    package: PackageResponse
    destinations: List[DestinationResponse]


class ItineraryBase(BaseModel):
    itinerary_name: Optional[str] = None


class ItineraryCreate(ItineraryBase):
    pass


class ItineraryResponse(ItineraryBase):
    itinerary_id: int
    user_id: int
    price: Optional[float] = None

    class Config:
        from_attributes = True


class ItineraryDetails(BaseModel):
    itinerary: ItineraryResponse
    destinations: List[DestinationResponse]


class AddDestinationToItineraryRequest(BaseModel):
    dest_id: int
    new_itinerary_name: Optional[str] = None
    itinerary_id: Optional[int] = None
