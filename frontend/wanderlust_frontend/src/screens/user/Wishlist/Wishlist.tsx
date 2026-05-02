import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Empty, Spin } from "antd";
import toast from "react-hot-toast";
import type { RootState, AppDispatch } from "../../../store/store";
import { fetchWishlist, removeFromWishlist } from "../store/wishlist.slice";
import { fetchDestinations } from "../store/userDestinations.slice";
import DestinationCard from "../components/DestinationCard";
import type { Destination } from "../services/destinations.service";

const Wishlist = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading: wishlistLoading, actionLoading } = useSelector(
    (state: RootState) => state.wishlist,
  );
  const { destinations, loading: destLoading } = useSelector(
    (state: RootState) => state.userDestinations,
  );

  useEffect(() => {
    dispatch(fetchWishlist());
    dispatch(fetchDestinations(undefined));
  }, [dispatch]);

  const wishlistedDestIds = new Set(items.map((i) => i.dest_id));

  const wishlistedDestinations = destinations.filter((d) =>
    wishlistedDestIds.has(d.dest_id),
  );

  const handleRemove = async (dest: Destination) => {
    const item = items.find((i) => i.dest_id === dest.dest_id);
    if (!item) return;
    const res = await dispatch(removeFromWishlist(item.item_id));
    if (removeFromWishlist.fulfilled.match(res)) {
      toast.success(`Removed ${dest.destName} from wishlist`);
    } else {
      toast.error("Failed to remove from wishlist");
    }
  };

  const isLoading = wishlistLoading || destLoading;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Wishlist</h1>
        <p className="text-slate-500 text-sm mt-1">
          {items.length} saved destination{items.length !== 1 ? "s" : ""}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spin size="large" />
        </div>
      ) : wishlistedDestinations.length === 0 ? (
        <Empty
          description="Your wishlist is empty — start exploring to save destinations!"
          className="py-16"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {wishlistedDestinations.map((dest) => (
            <DestinationCard
              key={dest.dest_id}
              destination={dest}
              wishlisted
              wishlistLoading={actionLoading}
              onToggleWishlist={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
