# backend/models/__init__.py
from .users import User, Author
from .blog import Blog, BlogLike, Comment
from .travel import Destination, Package, Itinerary, ItineraryDestination, PackageDestination, Review
from .booking import Booking, Payment
from .interactions import Wishlist  