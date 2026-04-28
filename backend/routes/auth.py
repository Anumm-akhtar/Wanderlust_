from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta

from schemas.user import UserCreate, User as UserSchema, Token
from services.auth import auth_service
from config.database import get_db
from config.security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

@router.post("/register", response_model=UserSchema)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    user = await auth_service.register_user(db, user_in)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    return user

@router.post("/admin/register")
async def register_admin(
    email: str,
    password: str,
    db: AsyncSession = Depends(get_db)
):
    admin = await auth_service.register_admin(db, email, password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin email already registered",
        )
    return {"message": "Admin registered successfully"}

@router.post("/login", response_model=Token)
async def login_for_access_token(db: AsyncSession = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    # First, check if it's an admin
    admin = await auth_service.authenticate_admin(db, email=form_data.username, password=form_data.password)
    if admin:
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": admin.email, "role": "Admin"}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}

    # Then, check if it's an author
    author = await auth_service.authenticate_author(db, email=form_data.username)
    if author:
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": author.email, "role": "Author"}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}

    # If not an author, check if it's a user
    user = await auth_service.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": "User"}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
