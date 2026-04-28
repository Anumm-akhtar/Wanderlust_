from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config.database import get_db
from config.security import decode_access_token
from models.users import User, Author, Admin
from services.auth import auth_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_admin(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> Admin:
    payload = decode_access_token(token)
    email = payload.get("sub")
    role = payload.get("role")
    if not email or role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    result = await db.execute(select(Admin).filter(Admin.email == email))
    admin = result.scalars().first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return admin

async def get_current_author(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> Author:
    payload = decode_access_token(token)
    email = payload.get("sub")
    role = payload.get("role")
    if not email or role != "Author":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials for Author",
            headers={"WWW-Authenticate": "Bearer"},
        )

    result = await db.execute(select(Author).filter(Author.email == email))
    author = result.scalars().first()
    
    if not author:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Author not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return author

async def get_current_user_or_none(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)),
):
    if not token:
        return None
    payload = decode_access_token(token)
    email = payload.get("sub")
    role = payload.get("role")
    
    if not email or role != "User":
        return None

    return await auth_service.get_user_by_email(db, email)

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    payload = decode_access_token(token)
    email = payload.get("sub")
    role = payload.get("role")
    if not email or role != "User":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await auth_service.get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
