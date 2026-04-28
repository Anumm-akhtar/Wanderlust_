from __future__ import annotations

from typing import Optional, TYPE_CHECKING
from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from config.database import Base

if TYPE_CHECKING:
    from .travel import Destination
    from .users import User


class Wishlist(Base):
    __tablename__ = "wishlists"

    item_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    dest_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("destinations.dest_id"), nullable=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.userID"), nullable=True)

    destination: Mapped[Optional["Destination"]] = relationship("Destination", back_populates="wishlists")
    user: Mapped[Optional["User"]] = relationship("User", back_populates="wishlists")