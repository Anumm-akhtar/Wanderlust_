from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from config.database import Base

if TYPE_CHECKING:
    from .users import User

class Booking(Base):
    __tablename__ = "bookings"

    booking_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    bk_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.userID"), nullable=True)
    bk_type: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    trip_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    travel_start_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    travel_end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    numtravelers: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    bk_cost: Mapped[Optional[Decimal]] = mapped_column(Numeric, nullable=True)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="bookings")

class Payment(Base):
    __tablename__ = "payments"

    payment_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    booking_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("bookings.booking_id"), nullable=True)
    payMethod: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    amount: Mapped[Optional[Decimal]] = mapped_column(Numeric, nullable=True)
    payment_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    booking: Mapped[Optional["Booking"]] = relationship("Booking", back_populates="payments")

Booking.payments = relationship("Payment", order_by=Payment.payment_id, back_populates="booking")