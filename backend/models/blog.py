from __future__ import annotations

from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from config.database import Base

if TYPE_CHECKING:
    from .users import User, Author

class Blog(Base):
    __tablename__ = "blogs"

    blog_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    author_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("authors.author_id"), nullable=True)
    title: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    publication_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    like_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    author: Mapped[Optional["Author"]] = relationship("Author", back_populates="blogs")
    comments: Mapped[List["Comment"]] = relationship("Comment", back_populates="blog")
    likes: Mapped[List["BlogLike"]] = relationship("BlogLike", back_populates="blog")

class BlogLike(Base):
    __tablename__ = "blog_likes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    blog_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("blogs.blog_id"), nullable=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.userID"), nullable=True)
    like_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    blog: Mapped[Optional["Blog"]] = relationship("Blog", back_populates="likes")
    user: Mapped[Optional["User"]] = relationship("User", back_populates="blog_likes")

class Comment(Base):
    __tablename__ = "comments"

    cmnt_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    blog_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("blogs.blog_id"), nullable=True)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.userID"), nullable=True)
    date_posted: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    blog: Mapped[Optional["Blog"]] = relationship("Blog", back_populates="comments")
    user: Mapped[Optional["User"]] = relationship("User", back_populates="comments")