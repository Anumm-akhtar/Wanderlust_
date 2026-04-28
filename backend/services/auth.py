from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.users import User, Author
from schemas.user import UserCreate
from config.security import get_password_hash, verify_password

class AuthService:
    async def get_user_by_email(self, db: AsyncSession, email: str):
        result = await db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

    async def register_user(self, db: AsyncSession, user_data: UserCreate):
        # Check if user or author with this email already exists
        result_user = await db.execute(select(User).filter(User.email == user_data.email))
        if result_user.scalars().first():
            return None
        
        result_author = await db.execute(select(Author).filter(Author.email == user_data.email))
        if result_author.scalars().first():
            return None

        hashed_password = get_password_hash(user_data.password)
        new_user = User(
            email=user_data.email,
            password=hashed_password,
            firstName=user_data.firstName,
            lastName=user_data.lastName,
            ph_num=user_data.ph_num,
            addr=user_data.addr
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user

    async def authenticate_user(self, db: AsyncSession, email: str, password: str):
        # 1. Use 'result' instead of 'user' for the raw DB execution
        db_user = await self.get_user_by_email(db, email)
        
        # 2. Wrap db_user.password in str() to satisfy the type checker
        if not db_user or not verify_password(password, str(db_user.password)):
            return None
            
        return db_user

    async def authenticate_author(self, db: AsyncSession, email: str):
        # Cleaning up the variable names here too for good measure
        result = await db.execute(select(Author).filter(Author.email == email))
        db_author = result.scalars().first()
        return db_author

auth_service = AuthService()