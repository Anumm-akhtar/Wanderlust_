from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
import os
from dotenv import load_dotenv

load_dotenv()

# Connection String Format: postgresql+asyncpg://user:password@host:port/dbname
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:5432/{DB_NAME}"

# Engine: Database se baat karne wala "Engine"
engine = create_async_engine(DATABASE_URL, echo=True)

# Session: Database mein queries chalane ke liye
SessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)

# Base class: Isse hum apne tables (Models) banayenge
class Base(DeclarativeBase):
    pass

# Dependency: Har request ke liye database session kholne aur band karne ke liye
async def get_db():
    async with SessionLocal() as session:
        yield session