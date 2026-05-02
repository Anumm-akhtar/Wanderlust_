import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Rate,
  Tag,
  Spin,
  Empty,
  Popconfirm,
  Avatar,
  Divider,
  Skeleton,
} from "antd";
import {
  ArrowLeftOutlined,
  HeartFilled,
  HeartOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import type { RootState, AppDispatch } from "../../../store/store";
import { fetchDestinationById, clearSelected } from "../store/userDestinations.slice";
import { fetchReviews, deleteReview } from "../store/reviews.slice";
import { fetchWishlist, addToWishlist, removeFromWishlist } from "../store/wishlist.slice";
import BookingModal from "../components/BookingModal";
import ReviewForm from "../components/ReviewForm";
import AddToItineraryModal from "../components/AddToItineraryModal";
import type { Review } from "../services/reviews.service";

const ACCENT = "#aa3bff";

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" }) : "";

const DestinationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const destId = Number(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { selected: destination, detailLoading } = useSelector(
    (state: RootState) => state.userDestinations,
  );
  const { reviews, loading: reviewsLoading, actionLoading: reviewActionLoading } = useSelector(
    (state: RootState) => state.reviews,
  );
  const { items: wishlistItems, actionLoading: wishlistActionLoading } = useSelector(
    (state: RootState) => state.wishlist,
  );

  const [bookingOpen, setBookingOpen] = useState(false);
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    dispatch(fetchDestinationById(destId));
    dispatch(fetchReviews());
    dispatch(fetchWishlist());
    return () => {
      dispatch(clearSelected());
    };
  }, [dispatch, destId]);

  const destReviews = reviews.filter((r) => r.dest_id === destId);
  const avgRating =
    destReviews.length > 0
      ? destReviews.reduce((sum, r) => sum + r.rating, 0) / destReviews.length
      : 0;

  const wishlistItem = wishlistItems.find((i) => i.dest_id === destId);
  const isWishlisted = Boolean(wishlistItem);

  const handleToggleWishlist = async () => {
    if (wishlistItem) {
      const res = await dispatch(removeFromWishlist(wishlistItem.item_id));
      if (removeFromWishlist.fulfilled.match(res)) toast.success("Removed from wishlist");
      else toast.error("Failed to update wishlist");
    } else {
      const res = await dispatch(addToWishlist(destId));
      if (addToWishlist.fulfilled.match(res)) toast.success("Added to wishlist");
      else toast.error("Failed to update wishlist");
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    const res = await dispatch(deleteReview(reviewId));
    if (deleteReview.fulfilled.match(res)) toast.success("Review deleted");
    else toast.error((res.payload as string) || "Failed to delete review");
  };

  const openEditReview = (review: Review) => {
    setEditingReview(review);
    setReviewFormOpen(true);
  };

  const openNewReview = () => {
    setEditingReview(null);
    setReviewFormOpen(true);
  };

  if (detailLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!destination && !detailLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Empty description="Destination not found" />
        <Button className="mt-4" onClick={() => navigate("/browse")}>
          Back to Browse
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {destination?.image ? (
        <div className="relative h-72 sm:h-96 overflow-hidden">
          <img
            src={destination.image}
            alt={destination.destName}
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
          <EnvironmentOutlined style={{ fontSize: 48, color: "#cbd5e1" }} />
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
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{destination?.destName}</h1>
            {destReviews.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <Rate disabled value={avgRating} allowHalf style={{ fontSize: 14 }} />
                <span className="text-slate-500 text-sm">
                  {avgRating.toFixed(1)} ({destReviews.length} review{destReviews.length !== 1 ? "s" : ""})
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Tag color="purple" className="text-base font-semibold px-3 py-1">
              ${destination?.price?.toLocaleString()}
            </Tag>

            <Button
              icon={isWishlisted ? <HeartFilled /> : <HeartOutlined />}
              onClick={handleToggleWishlist}
              loading={wishlistActionLoading}
              style={isWishlisted ? { borderColor: ACCENT, color: ACCENT } : {}}
            >
              {isWishlisted ? "Wishlisted" : "Wishlist"}
            </Button>

            <Button
              icon={<UnorderedListOutlined />}
              onClick={() => setItineraryOpen(true)}
            >
              Add to Itinerary
            </Button>

            <Button
              type="primary"
              onClick={() => setBookingOpen(true)}
              style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
            >
              Book Now
            </Button>
          </div>
        </div>

        {destination?.description && (
          <p className="text-slate-600 leading-relaxed mb-8">{destination.description}</p>
        )}

        <Divider />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Reviews{destReviews.length > 0 && ` (${destReviews.length})`}
          </h2>
          <Button icon={<PlusOutlined />} onClick={openNewReview}>
            Write a Review
          </Button>
        </div>

        {reviewsLoading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : destReviews.length === 0 ? (
          <Empty description="No reviews yet — be the first!" className="py-8" />
        ) : (
          <div className="space-y-4">
            {destReviews.map((review) => (
              <div
                key={review.review_id}
                className="bg-slate-50 rounded-xl p-4 flex gap-3"
              >
                <Avatar style={{ backgroundColor: ACCENT, flexShrink: 0 }}>
                  {review.user_id}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <Rate disabled value={review.rating} style={{ fontSize: 13 }} />
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(review.review_date)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => openEditReview(review)}
                        style={{ color: "#3b82f6" }}
                      />
                      <Popconfirm
                        title="Delete this review?"
                        onConfirm={() => handleDeleteReview(review.review_id)}
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        cancelText="Cancel"
                      >
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          danger
                          loading={reviewActionLoading}
                        />
                      </Popconfirm>
                    </div>
                  </div>
                  <p className="text-slate-700 text-sm mt-2 leading-relaxed">{review.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {destination && (
        <BookingModal
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          tripId={destination.dest_id}
          bkType="destination"
          tripName={destination.destName}
          pricePerPerson={destination.price}
        />
      )}

      <ReviewForm
        open={reviewFormOpen}
        onClose={() => {
          setReviewFormOpen(false);
          setEditingReview(null);
        }}
        destId={destId}
        existingReview={editingReview}
      />

      {destination && (
        <AddToItineraryModal
          open={itineraryOpen}
          onClose={() => setItineraryOpen(false)}
          destId={destination.dest_id}
          destName={destination.destName}
        />
      )}
    </div>
  );
};

export default DestinationDetail;
