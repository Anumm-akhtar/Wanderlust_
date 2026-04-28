from datetime import datetime
from typing import List, Optional, cast
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config.database import get_db
from models.booking import Booking, Payment
from models.travel import Destination, Itinerary, Package
from models.users import User
from schemas.booking import (
    BookingCreate,
    BookingDetails,
    BookingResponse,
    BookingSummary,
    BookItineraryRequest,
    DestinationInfo,
    ItineraryInfo,
    PackageInfo,
    PaymentCreate,
    PaymentResponse,
)
from services.dependencies import get_current_user

router = APIRouter()


def to_booking_response(booking: Booking) -> BookingResponse:
    return BookingResponse(
        booking_id=cast(int, booking.booking_id),
        bk_type=cast(str, booking.bk_type) if booking.bk_type is not None else "",
        trip_id=cast(int, booking.trip_id) if booking.trip_id is not None else 0,
        travel_start_date=booking.travel_start_date,
        travel_end_date=booking.travel_end_date,
        numtravelers=cast(Optional[int], booking.numtravelers),
        bk_cost=float(booking.bk_cost) if booking.bk_cost is not None else None,
        status=cast(Optional[str], booking.status),
        user_id=cast(int, booking.user_id),
        bk_date=booking.bk_date,
    )


def to_payment_response(payment: Payment) -> PaymentResponse:
    return PaymentResponse(
        payment_id=payment.payment_id,
        booking_id=cast(int, payment.booking_id),
        payMethod=cast(str, payment.payMethod) if payment.payMethod is not None else "",
        amount=float(payment.amount) if payment.amount is not None else 0.0,
        payment_date=payment.payment_date,
    )


async def get_trip_info(
    db: AsyncSession, booking: Booking
) -> tuple[Optional[PackageInfo], Optional[DestinationInfo], Optional[ItineraryInfo]]:
    package_info = None
    destination_info = None
    itinerary_info = None

    booking_type = (booking.bk_type or "").lower()
    if booking_type == "package":
        result = await db.execute(select(Package).where(Package.pkg_id == booking.trip_id))
        package = result.scalars().first()
        if package:
            package_info = PackageInfo.model_validate(package)
    elif booking_type == "destination":
        result = await db.execute(
            select(Destination).where(Destination.dest_id == booking.trip_id)
        )
        destination = result.scalars().first()
        if destination:
            destination_info = DestinationInfo.model_validate(destination)
    elif booking_type == "itinerary":
        result = await db.execute(
            select(Itinerary).where(Itinerary.itinerary_id == booking.trip_id)
        )
        itinerary = result.scalars().first()
        if itinerary:
            itinerary_info = ItineraryInfo.model_validate(itinerary)

    return package_info, destination_info, itinerary_info


@router.get("/", response_model=List[BookingResponse])
async def list_bookings(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Booking)
        .where(Booking.user_id == user.userID)
        .order_by(Booking.bk_date.desc())
    )
    bookings = result.scalars().all()
    return [to_booking_response(booking) for booking in bookings]


@router.get("/{booking_id}", response_model=BookingDetails)
async def get_booking_details(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Booking).where(
            Booking.booking_id == booking_id, Booking.user_id == user.userID
        )
    )
    booking = result.scalars().first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    payment_result = await db.execute(
        select(Payment).where(Payment.booking_id == booking.booking_id)
    )
    payments = payment_result.scalars().all()

    package_info, destination_info, itinerary_info = await get_trip_info(db, booking)

    return BookingDetails(
        booking=to_booking_response(booking),
        payments=[to_payment_response(payment) for payment in payments],
        package_info=package_info,
        destination_info=destination_info,
        itinerary_info=itinerary_info,
    )


@router.post("/itinerary", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def book_itinerary(
    payload: BookItineraryRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Itinerary).where(Itinerary.itinerary_id == payload.itinerary_id)
    )
    itinerary = result.scalars().first()
    if not itinerary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found")

    if itinerary.user_id != user.userID:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only book itineraries that belong to your account",
        )

    total_cost = (float(itinerary.price) if itinerary.price is not None else 0.0) * payload.numtravelers

    booking = Booking(
        bk_type="itinerary",
        trip_id=payload.itinerary_id,
        travel_start_date=payload.travel_start_date,
        travel_end_date=payload.travel_end_date,
        numtravelers=payload.numtravelers,
        bk_cost=total_cost,
        user_id=user.userID,
        bk_date=datetime.utcnow(),
        status="Pending",
    )

    db.add(booking)
    await db.commit()
    await db.refresh(booking)

    return to_booking_response(booking)


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    payload: BookingCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    bk_type = payload.bk_type.lower()
    if bk_type not in {"package", "destination", "itinerary"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid booking type",
        )

    bk_cost = payload.bk_cost
    if bk_type == "itinerary" and bk_cost is None:
        result = await db.execute(
            select(Itinerary).where(Itinerary.itinerary_id == payload.trip_id)
        )
        itinerary = result.scalars().first()
        if not itinerary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found"
            )
        if not payload.numtravelers:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="numtravelers is required for itinerary bookings",
            )
        bk_cost = (float(itinerary.price) if itinerary.price is not None else 0.0) * payload.numtravelers

    booking = Booking(
        bk_type=bk_type,
        trip_id=payload.trip_id,
        travel_start_date=payload.travel_start_date,
        travel_end_date=payload.travel_end_date,
        numtravelers=payload.numtravelers,
        bk_cost=bk_cost,
        user_id=user.userID,
        bk_date=datetime.utcnow(),
        status="Pending",
    )

    db.add(booking)
    await db.commit()
    await db.refresh(booking)

    return to_booking_response(booking)


@router.get("/{booking_id}/payment", response_model=BookingResponse)
async def get_payment(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Booking).where(
            Booking.booking_id == booking_id, Booking.user_id == user.userID
        )
    )
    booking = result.scalars().first()
    if not booking or booking.status != "Pending":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    return to_booking_response(booking)


@router.post("/{booking_id}/payment", response_model=BookingSummary)
async def confirm_payment(
    booking_id: int,
    payload: PaymentCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if payload.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment amount must be greater than zero",
        )

    result = await db.execute(
        select(Booking).where(
            Booking.booking_id == booking_id, Booking.user_id == user.userID
        )
    )
    booking = result.scalars().first()
    if not booking or booking.status != "Pending":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    payment = Payment(
        booking_id=cast(int, booking.booking_id),
        payMethod=payload.payMethod,
        amount=payload.amount,
        payment_date=datetime.utcnow(),
    )

    db.add(payment)
    booking.status = "Confirmed"
    await db.commit()
    await db.refresh(booking)
    await db.refresh(payment)

    package_info, destination_info, itinerary_info = await get_trip_info(db, booking)

    return BookingSummary(
        booking=to_booking_response(booking),
        payment=to_payment_response(payment),
        package_info=package_info,
        destination_info=destination_info,
        itinerary_info=itinerary_info,
    )


@router.get("/{booking_id}/summary", response_model=BookingSummary)
async def booking_summary(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Booking).where(
            Booking.booking_id == booking_id, Booking.user_id == user.userID
        )
    )
    booking = result.scalars().first()
    if not booking or booking.status != "Confirmed":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    payment_result = await db.execute(
        select(Payment)
        .where(Payment.booking_id == booking.booking_id)
        .order_by(Payment.payment_id.desc())
    )
    payment = payment_result.scalars().first()

    package_info, destination_info, itinerary_info = await get_trip_info(db, booking)

    return BookingSummary(
        booking=to_booking_response(booking),
        payment=to_payment_response(payment) if payment else None,
        package_info=package_info,
        destination_info=destination_info,
        itinerary_info=itinerary_info,
    )


@router.post("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Booking).where(
            Booking.booking_id == booking_id, Booking.user_id == user.userID
        )
    )
    booking = result.scalars().first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    if booking.status != "Pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending bookings can be cancelled",
        )

    booking.status = "Cancelled"
    await db.commit()

    return {"message": "Booking cancelled successfully"}
