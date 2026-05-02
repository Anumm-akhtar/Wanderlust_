import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Tag,
  Skeleton,
  Empty,
  Popconfirm,
  Modal,
  Form,
  Input,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import type { RootState, AppDispatch } from "../../../store/store";
import {
  fetchItineraryById,
  renameItinerary,
  deleteItinerary,
  clearSelected,
} from "../store/itineraries.slice";
import BookingModal from "../components/BookingModal";

const ACCENT = "#aa3bff";

const ItineraryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const itineraryId = Number(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { selected, detailLoading, actionLoading } = useSelector(
    (state: RootState) => state.itineraries,
  );

  const [bookingOpen, setBookingOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameForm] = Form.useForm<{ itinerary_name: string }>();

  useEffect(() => {
    dispatch(fetchItineraryById(itineraryId));
    return () => {
      dispatch(clearSelected());
    };
  }, [dispatch, itineraryId]);

  const itinerary = selected?.itinerary;
  const destinations = selected?.destinations ?? [];

  const handleRename = async () => {
    const { itinerary_name } = await renameForm.validateFields();
    const res = await dispatch(
      renameItinerary({ id: itineraryId, data: { itinerary_name: itinerary_name.trim() } }),
    );
    if (renameItinerary.fulfilled.match(res)) {
      toast.success("Itinerary renamed");
      setRenameOpen(false);
    } else {
      toast.error((res.payload as string) || "Failed to rename");
    }
  };

  const handleDelete = async () => {
    const res = await dispatch(deleteItinerary(itineraryId));
    if (deleteItinerary.fulfilled.match(res)) {
      toast.success("Itinerary deleted");
      navigate("/itineraries");
    } else {
      toast.error((res.payload as string) || "Failed to delete");
    }
  };

  if (detailLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!itinerary && !detailLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Empty description="Itinerary not found" />
        <Button className="mt-4" onClick={() => navigate("/itineraries")}>
          Back to Itineraries
        </Button>
      </div>
    );
  }

  const totalPrice = itinerary?.price ?? 0;
  const name = itinerary?.itinerary_name ?? `Itinerary #${itinerary?.itinerary_id}`;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-6 transition-colors"
      >
        <ArrowLeftOutlined /> Back
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-800">{name}</h1>
            <Tooltip title="Rename">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  renameForm.setFieldsValue({ itinerary_name: itinerary?.itinerary_name ?? "" });
                  setRenameOpen(true);
                }}
                style={{ color: "#3b82f6" }}
              />
            </Tooltip>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            {destinations.length} stop{destinations.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Tag color="purple" className="text-base font-semibold px-3 py-1 m-0">
            ${totalPrice.toLocaleString()} total
          </Tag>
          <Button
            type="primary"
            icon={<CalendarOutlined />}
            onClick={() => setBookingOpen(true)}
            disabled={destinations.length === 0}
            style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
          >
            Book This Trip
          </Button>
          <Popconfirm
            title="Delete this itinerary?"
            description="All destination links will be removed."
            onConfirm={handleDelete}
            okText="Delete"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
          >
            <Button danger icon={<DeleteOutlined />} loading={actionLoading} />
          </Popconfirm>
        </div>
      </div>

      {/* Destinations */}
      {destinations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl shadow-sm">
          <EnvironmentOutlined style={{ fontSize: 40, color: "#cbd5e1" }} className="mb-3" />
          <p className="text-slate-500 mb-1">No destinations yet</p>
          <p className="text-slate-400 text-sm mb-5">
            Browse destinations and use "Add to Itinerary" to build your trip
          </p>
          <Button
            icon={<SearchOutlined />}
            onClick={() => navigate("/browse")}
          >
            Browse Destinations
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {destinations.map((dest, index) => (
            <div
              key={dest.dest_id}
              className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/destinations/${dest.dest_id}`)}
            >
              {/* Step number */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
                style={{ background: ACCENT }}
              >
                {index + 1}
              </div>

              {/* Image */}
              {dest.image ? (
                <img
                  src={dest.image}
                  alt={dest.destName}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <EnvironmentOutlined style={{ color: "#94a3b8", fontSize: 20 }} />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{dest.destName}</p>
                {dest.description && (
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {dest.description}
                  </p>
                )}
              </div>

              <Tag color="purple" className="m-0 font-medium flex-shrink-0">
                ${(dest.price ?? 0).toLocaleString()}
              </Tag>
            </div>
          ))}

          {/* Total row */}
          <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100">
            <span className="text-slate-600 font-medium">Estimated Total</span>
            <span className="font-bold text-lg" style={{ color: ACCENT }}>
              ${totalPrice.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Book modal */}
      {itinerary && (
        <BookingModal
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          tripId={itinerary.itinerary_id}
          bkType="itinerary"
          tripName={name}
          pricePerPerson={totalPrice}
        />
      )}

      {/* Rename modal */}
      <Modal
        title={<span className="font-semibold text-slate-800">Rename Itinerary</span>}
        open={renameOpen}
        onOk={handleRename}
        onCancel={() => setRenameOpen(false)}
        confirmLoading={actionLoading}
        okText="Save"
        okButtonProps={{ style: { backgroundColor: ACCENT, borderColor: ACCENT } }}
        destroyOnClose
      >
        <Form form={renameForm} layout="vertical" className="mt-4">
          <Form.Item
            name="itinerary_name"
            label="New Name"
            rules={[
              { required: true, message: "Please enter a name" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input
              placeholder="e.g. Winter Japan Tour"
              autoFocus
              onPressEnter={handleRename}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ItineraryDetail;
