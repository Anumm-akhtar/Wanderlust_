from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from config.database import Base

class Booking(Base):
    __tablename__ = "bookings"

    booking_id = Column(Integer, primary_key=True, index=True)
    bk_date = Column(DateTime)
    status = Column(String)
    user_id = Column(Integer, ForeignKey("users.userID"))
    bk_type = Column(String)
    trip_id = Column(Integer)
    travel_start_date = Column(DateTime)
    travel_end_date = Column(DateTime)
    numtravelers = Column(Integer)
    bk_cost = Column(Numeric)

    user = relationship("User", back_populates="bookings")

class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.booking_id"))
    payMethod = Column(String)
    amount = Column(Numeric)
    payment_date = Column(DateTime)

    booking = relationship("Booking", back_populates="payments")

Booking.payments = relationship("Payment", order_by=Payment.payment_id, back_populates="booking")