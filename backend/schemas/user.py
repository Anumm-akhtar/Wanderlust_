from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    firstName: str
    lastName: str
    ph_num: Optional[str] = None
    addr: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[EmailStr] = None

class User(BaseModel):
    userID: int
    email: EmailStr
    firstName: str
    lastName: str
    ph_num: Optional[str] = None
    addr: Optional[str] = None

    class Config:
        from_attributes = True
