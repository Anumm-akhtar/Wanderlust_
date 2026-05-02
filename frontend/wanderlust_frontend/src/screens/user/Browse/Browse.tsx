import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input, Tabs, Empty, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import type { RootState, AppDispatch } from "../../../store/store";
import { fetchDestinations } from "../store/userDestinations.slice";
import { fetchPackages } from "../store/userPackages.slice";
import { fetchWishlist, addToWishlist, removeFromWishlist } from "../store/wishlist.slice";
import DestinationCard from "../components/DestinationCard";
import PackageCard from "../components/PackageCard";
import type { Destination } from "../services/destinations.service";

const Browse = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { destinations, loading: destLoading } = useSelector(
    (state: RootState) => state.userDestinations,
  );
  const { packages, loading: pkgLoading } = useSelector(
    (state: RootState) => state.userPackages,
  );
  const { items: wishlistItems, actionLoading: wishlistActionLoading } = useSelector(
    (state: RootState) => state.wishlist,
  );

  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchDestinations(undefined));
    dispatch(fetchPackages());
    dispatch(fetchWishlist());
  }, [dispatch]);

  const wishlistedIds = new Set(wishlistItems.map((i) => i.dest_id));

  const handleSearch = () => {
    dispatch(fetchDestinations(search.trim() || undefined));
  };

  const handleClearSearch = () => {
    setSearch("");
    dispatch(fetchDestinations(undefined));
  };

  const handleToggleWishlist = async (dest: Destination) => {
    const existing = wishlistItems.find((i) => i.dest_id === dest.dest_id);
    if (existing) {
      const res = await dispatch(removeFromWishlist(existing.item_id));
      if (removeFromWishlist.fulfilled.match(res)) {
        toast.success(`Removed ${dest.destName} from wishlist`);
      } else {
        toast.error("Failed to update wishlist");
      }
    } else {
      const res = await dispatch(addToWishlist(dest.dest_id));
      if (addToWishlist.fulfilled.match(res)) {
        toast.success(`Added ${dest.destName} to wishlist`);
      } else {
        toast.error("Failed to update wishlist");
      }
    }
  };

  const destinationsTab = (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        <Input
          placeholder="Search destinations…"
          prefix={<SearchOutlined className="text-slate-300" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={handleSearch}
          allowClear
          onClear={handleClearSearch}
          style={{ maxWidth: 300 }}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:border-purple-400 hover:text-purple-600 transition-colors"
        >
          Search
        </button>
      </div>

      {destLoading ? (
        <div className="flex justify-center py-16">
          <Spin size="large" />
        </div>
      ) : destinations.length === 0 ? (
        <Empty description="No destinations found" className="py-16" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {destinations.map((dest) => (
            <DestinationCard
              key={dest.dest_id}
              destination={dest}
              wishlisted={wishlistedIds.has(dest.dest_id)}
              wishlistLoading={wishlistActionLoading}
              onToggleWishlist={handleToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );

  const packagesTab = (
    <div>
      {pkgLoading ? (
        <div className="flex justify-center py-16">
          <Spin size="large" />
        </div>
      ) : packages.length === 0 ? (
        <Empty description="No packages available" className="py-16" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {packages.map((pkg) => (
            <PackageCard key={pkg.pkg_id} pkg={pkg} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Explore</h1>
        <p className="text-slate-500 text-sm mt-1">
          Discover destinations and curated travel packages
        </p>
      </div>

      <Tabs
        defaultActiveKey="destinations"
        size="large"
        items={[
          {
            key: "destinations",
            label: `Destinations (${destinations.length})`,
            children: destinationsTab,
          },
          {
            key: "packages",
            label: `Packages (${packages.length})`,
            children: packagesTab,
          },
        ]}
      />
    </div>
  );
};

export default Browse;
