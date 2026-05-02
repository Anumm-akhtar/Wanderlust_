import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Tag,
  Skeleton,
  Empty,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Descriptions,
  Timeline,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import type { RootState, AppDispatch } from "../../../store/store";
import { fetchBookingById, confirmPayment, cancelBooking, clearSelected } from "../store/bookings.slice";

const ACCENT = "#aa3bff";

const STATUS_COLOR: Record<string, string> = {
  Pending: "orange",
  Confirmed: "green",
  Cancelled: "red",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  Pending: <ClockCircleOutlined />,
  Confirmed: <CheckCircleOutlined />,
  Cancelled: <CloseCircleOutlined />,
};

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "long" })
    : "—";

interface PaymentFormValues {
  payMethod: string;
  amount: number;
}

const BookingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const bookingId = Number(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { selected, loading, actionLoading } = useSelector(
    (state: RootState) => state.bookings,
  );

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [form] = Form.useForm<PaymentFormValues>();

  useEffect(() => {
    dispatch(fetchBookingById(bookingId));
    return () => {
      dispatch(clearSelected());
    };
  }, [dispatch, bookingId]);

  const booking = selected?.booking;
  const payments = selected?.payments ?? [];
  const tripInfo =
    selected?.destination_info ?? selected?.package_info ?? selected?.itinerary_info;
  const tripName =
    (selected?.destination_info as any)?.destName ??
    (selected?.package_info as any)?.name ??
    (selected?.itinerary_info as any)?.itinerary_name ??
    `${booking?.bk_type} #${booking?.trip_id}`;

  const handleConfirmPayment = async () => {
    const values = await form.validateFields();
    const res = await dispatch(
      confirmPayment({ bookingId, data: values }),
    );
    if (confirmPayment.fulfilled.match(res)) {
      toast.success("Payment confirmed! Booking is now Confirmed.");
      setPaymentModalOpen(false);
      dispatch(fetchBookingById(bookingId));
    } else {
      toast.error((res.payload as string) || "Payment failed");
    }
  };

  const handleCancel = async () => {
    const res = await dispatch(cancelBooking(bookingId));
    if (cancelBooking.fulfilled.match(res)) {
      toast.success("Booking cancelled");
    } else {
      toast.error((res.payload as string) || "Failed to cancel");
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (!booking && !loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Empty description="Booking not found" />
        <Button className="mt-4" onClick={() => navigate("/bookings")}>
          Back to My Bookings
        </Button>
      </div>
    );
  }

  const status = booking?.status ?? "Pending";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-6 transition-colors"
      >
        <ArrowLeftOutlined /> Back
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{tripName}</h1>
          <p className="text-slate-400 text-sm mt-0.5">Booking #{booking?.booking_id}</p>
        </div>
        <Tag
          icon={STATUS_ICON[status]}
          color={STATUS_COLOR[status]}
          className="text-sm px-3 py-1"
        >
          {status}
        </Tag>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
        <Descriptions column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Type">
            <span className="capitalize">{booking?.bk_type}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Booked On">
            {formatDate(booking?.bk_date)}
          </Descriptions.Item>
          <Descriptions.Item label="Travel Start">
            {formatDate(booking?.travel_start_date)}
          </Descriptions.Item>
          <Descriptions.Item label="Travel End">
            {formatDate(booking?.travel_end_date)}
          </Descriptions.Item>
          {booking?.numtravelers && (
            <Descriptions.Item label="Travelers">
              {booking.numtravelers}
            </Descriptions.Item>
          )}
          {booking?.bk_cost != null && (
            <Descriptions.Item label="Total Cost">
              <span className="font-semibold" style={{ color: ACCENT }}>
                ${booking.bk_cost.toLocaleString()}
              </span>
            </Descriptions.Item>
          )}
        </Descriptions>
      </div>

      {tripInfo && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
          <h2 className="font-semibold text-slate-700 mb-3">Trip Details</h2>
          {(tripInfo as any).image && (
            <img
              src={(tripInfo as any).image}
              alt={tripName}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
          )}
          {(tripInfo as any).description && (
            <p className="text-slate-500 text-sm">{(tripInfo as any).description}</p>
          )}
        </div>
      )}

      {payments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
          <h2 className="font-semibold text-slate-700 mb-4">Payment History</h2>
          <Timeline
            items={payments.map((p) => ({
              color: "green",
              children: (
                <div>
                  <p className="font-medium text-slate-700">
                    ${p.amount.toLocaleString()} via {p.payMethod}
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(p.payment_date)}</p>
                </div>
              ),
            }))}
          />
        </div>
      )}

      <Divider />

      <div className="flex gap-3 flex-wrap">
        {status === "Pending" && (
          <>
            <Button
              type="primary"
              icon={<CreditCardOutlined />}
              onClick={() => {
                form.setFieldsValue({ amount: booking?.bk_cost ?? 0, payMethod: "" });
                setPaymentModalOpen(true);
              }}
              style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
            >
              Pay Now
            </Button>
            <Button danger onClick={handleCancel} loading={actionLoading}>
              Cancel Booking
            </Button>
          </>
        )}
        <Button onClick={() => navigate("/bookings")}>Back to Bookings</Button>
      </div>

      <Modal
        title={
          <span className="font-semibold text-slate-800">Confirm Payment</span>
        }
        open={paymentModalOpen}
        onOk={handleConfirmPayment}
        onCancel={() => setPaymentModalOpen(false)}
        confirmLoading={actionLoading}
        okText="Pay"
        okButtonProps={{ style: { backgroundColor: ACCENT, borderColor: ACCENT } }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="payMethod"
            label="Payment Method"
            rules={[{ required: true, message: "Select a payment method" }]}
          >
            <Input placeholder="e.g. Credit Card, Bank Transfer" />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount (USD)"
            rules={[
              { required: true, message: "Enter amount" },
              {
                validator: (_, v) =>
                  v > 0 ? Promise.resolve() : Promise.reject("Amount must be greater than 0"),
              },
            ]}
          >
            <InputNumber
              prefix="$"
              min={0.01}
              style={{ width: "100%" }}
              precision={2}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookingDetail;
