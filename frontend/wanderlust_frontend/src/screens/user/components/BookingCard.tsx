import { Card, Tag, Button, Popconfirm, Space } from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  DollarOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { Booking } from "../services/bookings.service";

const STATUS_COLOR: Record<string, string> = {
  Pending: "orange",
  Confirmed: "green",
  Cancelled: "red",
};

interface Props {
  booking: Booking;
  onCancel?: (bookingId: number) => void;
  cancelLoading?: boolean;
}

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—";

const BookingCard = ({ booking, onCancel, cancelLoading }: Props) => {
  const navigate = useNavigate();
  const status = booking.status ?? "Pending";

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-semibold text-slate-800 capitalize">
              {booking.bk_type} #{booking.trip_id}
            </span>
            <Tag color={STATUS_COLOR[status] ?? "default"}>{status}</Tag>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <CalendarOutlined />
              {formatDate(booking.travel_start_date)} → {formatDate(booking.travel_end_date)}
            </span>
            {booking.numtravelers && (
              <span className="flex items-center gap-1">
                <TeamOutlined />
                {booking.numtravelers} traveler{booking.numtravelers > 1 ? "s" : ""}
              </span>
            )}
            {booking.bk_cost != null && (
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <DollarOutlined />
                ${booking.bk_cost.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/bookings/${booking.booking_id}`)}
          >
            Details
          </Button>

          {status === "Pending" && onCancel && (
            <Popconfirm
              title="Cancel this booking?"
              description="This action cannot be undone."
              onConfirm={() => onCancel(booking.booking_id)}
              okText="Cancel Booking"
              okButtonProps={{ danger: true }}
              cancelText="Keep"
            >
              <Button danger loading={cancelLoading}>
                Cancel
              </Button>
            </Popconfirm>
          )}
        </Space>
      </div>
    </Card>
  );
};

export default BookingCard;
