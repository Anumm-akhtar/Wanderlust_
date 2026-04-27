from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from config.database import Base

class Wishlist(Base):
    __tablename__ = "wishlists"

    item_id = Column(Integer, primary_key=True, index=True)
    dest_id = Column(Integer, ForeignKey("destinations.dest_id"))
    user_id = Column(Integer, ForeignKey("users.userID"))

    destination = relationship("Destination", back_populates="wishlists")
    user = relationship("User", back_populates="wishlists")