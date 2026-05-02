import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Empty, Spin, Tabs } from "antd";
import toast from "react-hot-toast";
import type { RootState, AppDispatch } from "../../../store/store";
import { fetchBookings, cancelBooking } from "../store/bookings.slice";
import BookingCard from "../components/BookingCard";

const Bookings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, loading, actionLoading } = useSelector(
    (state: RootState) => state.bookings,
  );

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const handleCancel = async (bookingId: number) => {
    const res = await dispatch(cancelBooking(bookingId));
    if (cancelBooking.fulfilled.match(res)) {
      toast.success("Booking cancelled");
    } else {
      toast.error((res.payload as string) || "Failed to cancel booking");
    }
  };

  const pending = bookings.filter((b) => b.status === "Pending");
  const confirmed = bookings.filter((b) => b.status === "Confirmed");
  const cancelled = bookings.filter((b) => b.status === "Cancelled");

  const renderList = (items: typeof bookings, showCancel = false) => {
    if (items.length === 0) return <Empty description="No bookings here" className="py-8" />;
    return (
      <div className="space-y-3">
        {items.map((b) => (
          <BookingCard
            key={b.booking_id}
            booking={b}
            onCancel={showCancel ? handleCancel : undefined}
            cancelLoading={actionLoading}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Bookings</h1>
        <p className="text-slate-500 text-sm mt-1">
          {bookings.length} total booking{bookings.length !== 1 ? "s" : ""}
        </p>
      </div>

      <Tabs
        defaultActiveKey="all"
        items={[
          {
            key: "all",
            label: `All (${bookings.length})`,
            children: renderList(bookings, true),
          },
          {
            key: "pending",
            label: `Pending (${pending.length})`,
            children: renderList(pending, true),
          },
          {
            key: "confirmed",
            label: `Confirmed (${confirmed.length})`,
            children: renderList(confirmed),
          },
          {
            key: "cancelled",
            label: `Cancelled (${cancelled.length})`,
            children: renderList(cancelled),
          },
        ]}
      />
    </div>
  );
};

export default Bookings;
