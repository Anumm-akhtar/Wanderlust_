from sqlalchemy import Column, DateTime, Integer, String, Numeric, Text, ForeignKey
from sqlalchemy.orm import relationship
from config.database import Base

class Destination(Base):
    __tablename__ = "destinations"

    dest_id = Column(Integer, primary_key=True, index=True)
    destName = Column(String)
    image = Column(String)
    price = Column(Numeric)
    description = Column(Text)

    itinerary_destinations = relationship("ItineraryDestination", back_populates="destination")
    reviews = relationship("Review", back_populates="destination")
    wishlists = relationship("Wishlist", back_populates="destination")
    package_destinations = relationship("PackageDestination", back_populates="destination")
    
class Package(Base):
    __tablename__ = "packages"

    pkg_id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    image = Column(String)
    price = Column(Numeric)
    description = Column(Text)

    package_destinations = relationship("PackageDestination", back_populates="package")

class Itinerary(Base):
    __tablename__ = "itineraries"

    itinerary_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.userID"))
    price = Column(Numeric)
    itinerary_name = Column(String)

    user = relationship("User", back_populates="itineraries")
    itinerary_destinations = relationship("ItineraryDestination", back_populates="itinerary")

class ItineraryDestination(Base):
    __tablename__ = "itinerary_destinations"

    id = Column(Integer, primary_key=True, index=True)
    itinerary_id = Column(Integer, ForeignKey("itineraries.itinerary_id"))
    dest_id = Column(Integer, ForeignKey("destinations.dest_id"))

    itinerary = relationship("Itinerary", back_populates="itinerary_destinations")
    destination = relationship("Destination", back_populates="itinerary_destinations")

class PackageDestination(Base):
    __tablename__ = "package_destinations"

    id = Column(Integer, primary_key=True, index=True)
    pkg_id = Column(Integer, ForeignKey("packages.pkg_id"))
    dest_id = Column(Integer, ForeignKey("destinations.dest_id"))

    package = relationship("Package", back_populates="package_destinations")
    destination = relationship("Destination", back_populates="package_destinations")

class Review(Base):
    __tablename__ = "reviews"

    review_id = Column(Integer, primary_key=True, index=True)
    dest_id = Column(Integer, ForeignKey("destinations.dest_id"))
    rating = Column(Integer)
    content = Column(Text)
    user_id = Column(Integer, ForeignKey("users.userID"))
    review_date = Column(DateTime)

    destination = relationship("Destination", back_populates="reviews")
    user = relationship("User", back_populates="reviews")