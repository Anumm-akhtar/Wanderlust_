import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Tag,
  Skeleton,
  Empty,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  AppstoreOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import type { RootState, AppDispatch } from "../../../store/store";
import { fetchPackageById, clearSelected } from "../store/userPackages.slice";
import BookingModal from "../components/BookingModal";

const ACCENT = "#aa3bff";

const PackageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const pkgId = Number(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { selected: pkg, selectedDestinations, detailLoading } = useSelector(
    (state: RootState) => state.userPackages,
  );

  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchPackageById(pkgId));
    return () => {
      dispatch(clearSelected());
    };
  }, [dispatch, pkgId]);

  if (detailLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!pkg && !detailLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Empty description="Package not found" />
        <Button className="mt-4" onClick={() => navigate("/browse")}>
          Back to Browse
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {pkg?.image ? (
        <div className="relative h-72 sm:h-96 overflow-hidden">
          <img
            src={pkg.image}
            alt={pkg.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 flex items-center gap-2 text-white bg-black/30 hover:bg-black/50 rounded-lg px-3 py-2 text-sm transition-colors"
          >
            <ArrowLeftOutlined /> Back
          </button>
        </div>
      ) : (
        <div className="h-56 bg-slate-100 flex items-center justify-center relative">
          <AppstoreOutlined style={{ fontSize: 48, color: "#cbd5e1" }} />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 flex items-center gap-2 text-slate-600 hover:text-slate-800 text-sm"
          >
            <ArrowLeftOutlined /> Back
          </button>
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-800">{pkg?.name}</h1>

          <div className="flex items-center gap-3 flex-wrap">
            <Tag color="purple" className="text-base font-semibold px-3 py-1">
              ${pkg?.price?.toLocaleString()}
            </Tag>
            <Button
              type="primary"
              onClick={() => setBookingOpen(true)}
              style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
            >
              Book Now
            </Button>
          </div>
        </div>

        {pkg?.description && (
          <p className="text-slate-600 leading-relaxed mb-6">{pkg.description}</p>
        )}

        {selectedDestinations.length > 0 && (
          <>
            <Divider />
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Included Destinations ({selectedDestinations.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedDestinations.map((dest) => (
                <div
                  key={dest.dest_id}
                  className="flex gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-purple-200 transition-colors cursor-pointer"
                  onClick={() => navigate(`/destinations/${dest.dest_id}`)}
                >
                  {dest.image ? (
                    <img
                      src={dest.image}
                      alt={dest.destName}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <EnvironmentOutlined style={{ color: "#94a3b8" }} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate">{dest.destName}</p>
                    {dest.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                        {dest.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {pkg && (
        <BookingModal
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          tripId={pkg.pkg_id}
          bkType="package"
          tripName={pkg.name}
          pricePerPerson={pkg.price}
        />
      )}
    </div>
  );
};

export default PackageDetail;
