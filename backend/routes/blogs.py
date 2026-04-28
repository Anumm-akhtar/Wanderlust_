from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config.database import get_db
from models.blog import Blog, BlogLike, Comment
from models.users import Author, User
from schemas.interactions import BlogCreate, BlogDetails, BlogResponse, CommentCreate, CommentResponse
from services.dependencies import get_current_author, get_current_user, get_current_user_or_none

router = APIRouter()

@router.get("/", response_model=List[BlogResponse])
async def get_blogs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Blog).order_by(Blog.publication_date.desc()))
    return [BlogResponse.model_validate(b) for b in result.scalars().all()]

@router.get("/me", response_model=List[BlogResponse])
async def get_my_blogs(
    db: AsyncSession = Depends(get_db),
    author: Author = Depends(get_current_author),
):
    result = await db.execute(
        select(Blog).filter(Blog.author_id == author.author_id).order_by(Blog.publication_date.desc())
    )
    return [BlogResponse.model_validate(b) for b in result.scalars().all()]

@router.post("/", response_model=BlogResponse)
async def create_blog(
    payload: BlogCreate,
    db: AsyncSession = Depends(get_db),
    author: Author = Depends(get_current_author),
):
    new_blog = Blog(
        author_id=author.author_id,
        title=payload.title,
        content=payload.content,
        publication_date=datetime.utcnow(),
        like_count=0
    )
    db.add(new_blog)
    await db.commit()
    await db.refresh(new_blog)
    return BlogResponse.model_validate(new_blog)

@router.put("/{blog_id}", response_model=BlogResponse)
async def edit_blog(
    blog_id: int,
    payload: BlogCreate,
    db: AsyncSession = Depends(get_db),
    author: Author = Depends(get_current_author),
):
    result = await db.execute(select(Blog).filter(Blog.blog_id == blog_id))
    blog = result.scalars().first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    if blog.author_id != author.author_id:
        raise HTTPException(status_code=403, detail="Cannot edit someone else's blog")

    blog.title = payload.title
    blog.content = payload.content
    blog.publication_date = datetime.utcnow()
    
    await db.commit()
    await db.refresh(blog)
    return BlogResponse.model_validate(blog)

@router.get("/{blog_id}", response_model=BlogDetails)
async def get_blog_details(
    blog_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_or_none)
):
    result = await db.execute(select(Blog).filter(Blog.blog_id == blog_id))
    blog = result.scalars().first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    comments_result = await db.execute(
        select(Comment).filter(Comment.blog_id == blog_id).order_by(Comment.date_posted.desc())
    )
    comments = comments_result.scalars().all()

    user_liked = False
    if current_user:
        like_result = await db.execute(
            select(BlogLike).filter(BlogLike.blog_id == blog_id, BlogLike.user_id == current_user.userID)
        )
        if like_result.scalars().first():
            user_liked = True

    return BlogDetails(
        blog=BlogResponse.model_validate(blog),
        comments=[CommentResponse.model_validate(c) for c in comments],
        user_liked=user_liked
    )

@router.post("/{blog_id}/like")
async def toggle_like(
    blog_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(Blog).filter(Blog.blog_id == blog_id))
    blog = result.scalars().first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    like_result = await db.execute(
        select(BlogLike).filter(BlogLike.blog_id == blog_id, BlogLike.user_id == user.userID)
    )
    existing_like = like_result.scalars().first()

    if existing_like:
        await db.delete(existing_like)
        blog.like_count = max(0, (blog.like_count or 0) - 1)
        user_liked = False
    else:
        new_like = BlogLike(blog_id=blog_id, user_id=user.userID, like_date=datetime.utcnow())
        db.add(new_like)
        blog.like_count = (blog.like_count or 0) + 1
        user_liked = True
        
    await db.commit()
    await db.refresh(blog)
    
    return {
        "success": True,
        "likes": blog.like_count,
        "userLiked": user_liked
    }

@router.post("/{blog_id}/comments", response_model=CommentResponse)
async def add_comment(
    blog_id: int,
    payload: CommentCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(Blog).filter(Blog.blog_id == blog_id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Blog not found")

    new_comment = Comment(
        blog_id=blog_id,
        user_id=user.userID,
        content=payload.content,
        date_posted=datetime.utcnow()
    )
    db.add(new_comment)
    await db.commit()
    await db.refresh(new_comment)
    
    return CommentResponse.model_validate(new_comment)
