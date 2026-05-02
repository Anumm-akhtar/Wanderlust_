import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";
import UserHeader from "../components/UserHeader";

const Browse = lazy(() => import("../screens/user/Browse/Browse"));
const DestinationDetail = lazy(() => import("../screens/user/Browse/DestinationDetail"));
const PackageDetail = lazy(() => import("../screens/user/Browse/PackageDetail"));
const Bookings = lazy(() => import("../screens/user/Bookings/Bookings"));
const BookingDetail = lazy(() => import("../screens/user/Bookings/BookingDetail"));
const Wishlist = lazy(() => import("../screens/user/Wishlist/Wishlist"));
const Itineraries = lazy(() => import("../screens/user/Itineraries/Itineraries"));
const ItineraryDetail = lazy(() => import("../screens/user/Itineraries/ItineraryDetail"));

const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f8fafc" }}>
      <UserHeader />

      <main className="flex-1 overflow-auto">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-64">
              <Spin size="large" />
            </div>
          }
        >
          <Routes>
            <Route index element={<Navigate to="browse" replace />} />
            <Route path="browse" element={<Browse />} />
            <Route path="destinations/:id" element={<DestinationDetail />} />
            <Route path="packages/:id" element={<PackageDetail />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="itineraries" element={<Itineraries />} />
            <Route path="itineraries/:id" element={<ItineraryDetail />} />
            <Route path="*" element={<Navigate to="browse" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default UserLayout;
