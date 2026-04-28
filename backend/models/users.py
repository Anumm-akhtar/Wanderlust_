from __future__ import annotations

from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from config.database import Base

if TYPE_CHECKING:
    from .booking import Booking
    from .blog import Comment
    from .travel import Itinerary, Review
    from .interactions import Wishlist
    from .blog import BlogLike, Blog

class User(Base):
    __tablename__ = "users"

    userID: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    firstName: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    lastName: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    ph_num: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    addr: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Relationships (Equivalent to ICollection in C#)
    bookings: Mapped[List["Booking"]] = relationship("Booking", back_populates="user")
    comments: Mapped[List["Comment"]] = relationship("Comment", back_populates="user")
    itineraries: Mapped[List["Itinerary"]] = relationship("Itinerary", back_populates="user")
    blog_likes: Mapped[List["BlogLike"]] = relationship("BlogLike", back_populates="user")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="user")
    wishlists: Mapped[List["Wishlist"]] = relationship("Wishlist", back_populates="user")

class Author(Base):
    __tablename__ = "authors"

    author_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    firstName: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    lastName: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Relationships
    blogs: Mapped[List["Blog"]] = relationship("Blog", back_populates="author")