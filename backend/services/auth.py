from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.users import User, Author, Admin
from schemas.user import UserCreate
from config.security import get_password_hash, verify_password

class AuthService:
    async def get_user_by_email(self, db: AsyncSession, email: str):
        result = await db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

    async def get_admin_by_email(self, db: AsyncSession, email: str):
        result = await db.execute(select(Admin).filter(Admin.email == email))
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

    async def register_admin(self, db: AsyncSession, email: str, password: str):
        # Check if admin already exists
        existing_admin = await self.get_admin_by_email(db, email)
        if existing_admin:
            return None

        hashed_password = get_password_hash(password)
        new_admin = Admin(email=email, password=hashed_password)
        db.add(new_admin)
        await db.commit()
        await db.refresh(new_admin)
        return new_admin

    async def register_author(self, db: AsyncSession, email: str, password: str, firstName: str = None, lastName: str = None):
        # Check if author or user with this email already exists
        result_author = await db.execute(select(Author).filter(Author.email == email))
        if result_author.scalars().first():
            return None
        
        result_user = await db.execute(select(User).filter(User.email == email))
        if result_user.scalars().first():
            return None

        hashed_password = get_password_hash(password)
        new_author = Author(
            email=email,
            password=hashed_password,
            firstName=firstName,
            lastName=lastName
        )
        db.add(new_author)
        await db.commit()
        await db.refresh(new_author)
        return new_author

    async def authenticate_user(self, db: AsyncSession, email: str, password: str):
        # 1. Use 'result' instead of 'user' for the raw DB execution
        db_user = await self.get_user_by_email(db, email)
        
        # 2. Wrap db_user.password in str() to satisfy the type checker
        if not db_user or not verify_password(password, str(db_user.password)):
            return None
            
        return db_user

    async def authenticate_author(self, db: AsyncSession, email: str, password: str):
        result = await db.execute(select(Author).filter(Author.email == email))
        db_author = result.scalars().first()
        if not db_author or not verify_password(password, str(db_author.password)):
            return None
        return db_author

    async def authenticate_admin(self, db: AsyncSession, email: str, password: str):
        db_admin = await self.get_admin_by_email(db, email)
        if not db_admin or not verify_password(password, str(db_admin.password)):
            return None
        return db_admin

auth_service = AuthService()