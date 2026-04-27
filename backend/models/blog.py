from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from config.database import Base

class Blog(Base):
    __tablename__ = "blogs"

    blog_id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("authors.author_id"))
    title = Column(String)
    content = Column(Text)
    publication_date = Column(DateTime)
    like_count = Column(Integer, nullable=True)

    author = relationship("Author", back_populates="blogs")
    comments = relationship("Comment", back_populates="blog")
    likes = relationship("BlogLike", back_populates="blog")

class BlogLike(Base):
    __tablename__ = "blog_likes"

    id = Column(Integer, primary_key=True, index=True)
    blog_id = Column(Integer, ForeignKey("blogs.blog_id"))
    user_id = Column(Integer, ForeignKey("users.userID"))
    like_date = Column(DateTime)

    blog = relationship("Blog", back_populates="likes")
    user = relationship("User", back_populates="blog_likes")

class Comment(Base):
    __tablename__ = "comments"

    cmnt_id = Column(Integer, primary_key=True, index=True)
    blog_id = Column(Integer, ForeignKey("blogs.blog_id"))
    content = Column(Text)
    user_id = Column(Integer, ForeignKey("users.userID"))
    date_posted = Column(DateTime)

    blog = relationship("Blog", back_populates="comments")
    user = relationship("User", back_populates="comments")