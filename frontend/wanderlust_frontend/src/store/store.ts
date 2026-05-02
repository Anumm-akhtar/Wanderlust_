import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../screens/auth/store/auth.slice";
import destinationsReducer from "../screens/admin/store/destinations.slice";
import packagesReducer from "../screens/admin/store/packages.slice";
import userDestinationsReducer from "../screens/user/store/userDestinations.slice";
import userPackagesReducer from "../screens/user/store/userPackages.slice";
import bookingsReducer from "../screens/user/store/bookings.slice";
import reviewsReducer from "../screens/user/store/reviews.slice";
import wishlistReducer from "../screens/user/store/wishlist.slice";
import itinerariesReducer from "../screens/user/store/itineraries.slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    destinations: destinationsReducer,
    packages: packagesReducer,
    userDestinations: userDestinationsReducer,
    userPackages: userPackagesReducer,
    bookings: bookingsReducer,
    reviews: reviewsReducer,
    wishlist: wishlistReducer,
    itineraries: itinerariesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
