from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config.database import get_db
from models.travel import Destination, Package
from schemas.travel import DestinationResponse, PackageResponse

router = APIRouter()


@router.get("/destinations", response_model=List[DestinationResponse])
async def list_destinations(db: AsyncSession = Depends(get_db), q: Optional[str] = None):
    stmt = select(Destination)
    if q:
        stmt = stmt.where(Destination.destName.ilike(f"%{q}%"))
    result = await db.execute(stmt)
    return [DestinationResponse.model_validate(d) for d in result.scalars().all()]


@router.get("/destinations/{dest_id}", response_model=DestinationResponse)
async def get_destination(dest_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Destination).where(Destination.dest_id == dest_id))
    dest = result.scalars().first()
    if not dest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Destination not found")
    return DestinationResponse.model_validate(dest)


@router.get("/packages", response_model=List[PackageResponse])
async def list_packages(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Package))
    return [PackageResponse.model_validate(p) for p in result.scalars().all()]


@router.get("/packages/{pkg_id}", response_model=PackageResponse)
async def get_package(pkg_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Package).where(Package.pkg_id == pkg_id))
    pkg = result.scalars().first()
    if not pkg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
    return PackageResponse.model_validate(pkg)
