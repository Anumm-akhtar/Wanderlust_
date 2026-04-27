from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from config.database import Base

class User(Base):
    __tablename__ = "users"

    userID = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    firstName = Column(String)
    lastName = Column(String)
    ph_num = Column(String)
    addr = Column(String)

    # Relationships (Equivalent to ICollection in C#)
    bookings = relationship("Booking", back_populates="user")
    comments = relationship("Comment", back_populates="user")
    itineraries = relationship("Itinerary", back_populates="user")
    blog_likes = relationship("BlogLike", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    wishlists = relationship("Wishlist", back_populates="user")

class Author(Base):
    __tablename__ = "authors"

    author_id = Column(Integer, primary_key=True, index=True)
    firstName = Column(String)
    lastName = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)

    # Relationships
    blogs = relationship("Blog", back_populates="author")