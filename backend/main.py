from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database import engine, Base
from routes import auth, account, booking, destinations_packages, itineraries, blogs, reviews, wishlists

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(account.router, prefix="/account", tags=["account"])
app.include_router(booking.router, prefix="/bookings", tags=["bookings"])
app.include_router(destinations_packages.router, tags=["destinations_packages"])
app.include_router(itineraries.router, prefix="/itineraries", tags=["itineraries"])
app.include_router(blogs.router, prefix="/blogs", tags=["blogs"])
app.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
app.include_router(wishlists.router, prefix="/wishlists", tags=["wishlists"])

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # This will create tables based on your models.
        # In a production environment, you would use a migration tool like Alembic.
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Wanderlust API"}