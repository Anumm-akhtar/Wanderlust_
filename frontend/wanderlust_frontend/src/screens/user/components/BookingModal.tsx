import { useState } from "react";
import { Modal, Form, DatePicker, InputNumber, Button, Divider } from "antd";
import { CalendarOutlined, TeamOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { RootState, AppDispatch } from "../../../store/store";
import { createBooking } from "../store/bookings.slice";
import dayjs from "dayjs";

const ACCENT = "#aa3bff";

interface Props {
  open: boolean;
  onClose: () => void;
  tripId: number;
  bkType: "destination" | "package" | "itinerary";
  tripName: string;
  pricePerPerson: number;
}

interface BookingFormValues {
  dates: [dayjs.Dayjs, dayjs.Dayjs];
  numtravelers: number;
}

const BookingModal = ({ open, onClose, tripId, bkType, tripName, pricePerPerson }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { actionLoading } = useSelector((state: RootState) => state.bookings);
  const [form] = Form.useForm<BookingFormValues>();
  const [totalCost, setTotalCost] = useState<number>(pricePerPerson);

  const recalculate = () => {
    const travelers = form.getFieldValue("numtravelers") ?? 1;
    setTotalCost(pricePerPerson * travelers);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const [start, end] = values.dates;

    const res = await dispatch(
      createBooking({
        bk_type: bkType,
        trip_id: tripId,
        travel_start_date: start.toISOString(),
        travel_end_date: end.toISOString(),
        numtravelers: values.numtravelers,
        bk_cost: totalCost,
      }),
    );

    if (createBooking.fulfilled.match(res)) {
      toast.success("Booking created! Complete payment to confirm.");
      onClose();
      navigate("/bookings");
    } else {
      toast.error((res.payload as string) || "Booking failed");
    }
  };

  return (
    <Modal
      title={
        <div>
          <p className="font-semibold text-slate-800 text-base">Book Now</p>
          <p className="text-slate-500 text-sm font-normal">{tripName}</p>
        </div>
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        setTotalCost(pricePerPerson);
        onClose();
      }}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ numtravelers: 1 }}
        onValuesChange={recalculate}
        className="mt-4"
      >
        <Form.Item
          name="dates"
          label="Travel Dates"
          rules={[{ required: true, message: "Please select travel dates" }]}
        >
          <DatePicker.RangePicker
            style={{ width: "100%" }}
            disabledDate={(d) => d.isBefore(dayjs(), "day")}
            format="MMM D, YYYY"
            suffixIcon={<CalendarOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="numtravelers"
          label="Number of Travelers"
          rules={[{ required: true, message: "Please enter number of travelers" }]}
        >
          <InputNumber
            min={1}
            max={20}
            style={{ width: "100%" }}
            prefix={<TeamOutlined />}
            onChange={recalculate}
          />
        </Form.Item>

        <Divider />

        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-500">
            {bkType === "itinerary" ? "Itinerary base price" : "Price per person"}
          </span>
          <span className="font-medium text-slate-700">${pricePerPerson.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between mb-6 bg-purple-50 rounded-lg px-4 py-3">
          <span className="font-semibold text-slate-800">Total Estimate</span>
          <span className="font-bold text-lg" style={{ color: ACCENT }}>
            ${totalCost.toLocaleString()}
          </span>
        </div>

        <Button
          type="primary"
          block
          loading={actionLoading}
          onClick={handleSubmit}
          style={{ backgroundColor: ACCENT, borderColor: ACCENT, height: 40 }}
        >
          Confirm Booking
        </Button>
      </Form>
    </Modal>
  );
};

export default BookingModal;
