from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class BlogBase(BaseModel):
    title: str
    content: str


class BlogCreate(BlogBase):
    pass


class BlogResponse(BlogBase):
    blog_id: int
    author_id: int
    publication_date: Optional[datetime] = None
    like_count: Optional[int] = 0

    class Config:
        from_attributes = True


class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    pass


class CommentResponse(CommentBase):
    cmnt_id: int
    blog_id: int
    user_id: int
    date_posted: Optional[datetime] = None

    class Config:
        from_attributes = True


class BlogDetails(BaseModel):
    blog: BlogResponse
    comments: List[CommentResponse]
    user_liked: bool = False


class ReviewCreate(BaseModel):
    dest_id: int
    rating: int
    content: str


class ReviewUpdate(BaseModel):
    rating: int
    content: str


class ReviewResponse(BaseModel):
    review_id: int
    dest_id: int
    rating: int
    content: str
    user_id: int
    review_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class WishlistResponse(BaseModel):
    item_id: int
    dest_id: int
    user_id: int

    class Config:
        from_attributes = True


class WishlistAddRequest(BaseModel):
    dest_id: int
