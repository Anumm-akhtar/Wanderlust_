
from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import DateTime, Integer, String, Numeric, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from config.database import Base

if TYPE_CHECKING:
    from .interactions import Wishlist
    from .users import User

class Destination(Base):
    __tablename__ = "destinations"

    dest_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    destName: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    image: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    price: Mapped[Optional[Decimal]] = mapped_column(Numeric, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    itinerary_destinations: Mapped[List["ItineraryDestination"]] = relationship("ItineraryDestination", back_populates="destination")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="destination")
    wishlists: Mapped[List["Wishlist"]] = relationship("Wishlist", back_populates="destination")
    package_destinations: Mapped[List["PackageDestination"]] = relationship("PackageDestination", back_populates="destination")
    
class Package(Base):
    __tablename__ = "packages"

    pkg_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    image: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    price: Mapped[Optional[Decimal]] = mapped_column(Numeric, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    package_destinations: Mapped[List["PackageDestination"]] = relationship("PackageDestination", back_populates="package")

class Itinerary(Base):
    __tablename__ = "itineraries"

    itinerary_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.userID"), nullable=True)
    price: Mapped[Optional[Decimal]] = mapped_column(Numeric, nullable=True)
    itinerary_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="itineraries")
    itinerary_destinations: Mapped[List["ItineraryDestination"]] = relationship("ItineraryDestination", back_populates="itinerary")

class ItineraryDestination(Base):
    __tablename__ = "itinerary_destinations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    itinerary_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("itineraries.itinerary_id"), nullable=True)
    dest_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("destinations.dest_id"), nullable=True)

    itinerary: Mapped[Optional["Itinerary"]] = relationship("Itinerary", back_populates="itinerary_destinations")
    destination: Mapped[Optional["Destination"]] = relationship("Destination", back_populates="itinerary_destinations")

class PackageDestination(Base):
    __tablename__ = "package_destinations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    pkg_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("packages.pkg_id"), nullable=True)
    dest_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("destinations.dest_id"), nullable=True)

    package: Mapped[Optional["Package"]] = relationship("Package", back_populates="package_destinations")
    destination: Mapped[Optional["Destination"]] = relationship("Destination", back_populates="package_destinations")

class Review(Base):
    __tablename__ = "reviews"

    review_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    dest_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("destinations.dest_id"), nullable=True)
    rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.userID"), nullable=True)
    review_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    destination: Mapped[Optional["Destination"]] = relationship("Destination", back_populates="reviews")
    user: Mapped[Optional["User"]] = relationship("User", back_populates="reviews")