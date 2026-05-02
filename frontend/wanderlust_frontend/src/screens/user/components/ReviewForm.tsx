import { useEffect } from "react";
import { Modal, Form, Rate, Input } from "antd";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import type { RootState, AppDispatch } from "../../../store/store";
import { createReview, updateReview } from "../store/reviews.slice";
import type { Review } from "../services/reviews.service";

const ACCENT = "#aa3bff";

interface Props {
  open: boolean;
  onClose: () => void;
  destId: number;
  existingReview?: Review | null;
}

interface FormValues {
  rating: number;
  content: string;
}

const ReviewForm = ({ open, onClose, destId, existingReview }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { actionLoading } = useSelector((state: RootState) => state.reviews);
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        existingReview
          ? { rating: existingReview.rating, content: existingReview.content }
          : { rating: 0, content: "" },
      );
    }
  }, [open, existingReview, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();

    let res;
    if (existingReview) {
      res = await dispatch(updateReview({ id: existingReview.review_id, data: values }));
    } else {
      res = await dispatch(createReview({ dest_id: destId, ...values }));
    }

    const action = existingReview ? updateReview : createReview;
    if (action.fulfilled.match(res)) {
      toast.success(existingReview ? "Review updated" : "Review submitted");
      onClose();
    } else {
      toast.error((res.payload as string) || "Failed to save review");
    }
  };

  return (
    <Modal
      title={
        <span className="font-semibold text-slate-800">
          {existingReview ? "Edit Review" : "Write a Review"}
        </span>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={actionLoading}
      okText={existingReview ? "Update" : "Submit"}
      okButtonProps={{ style: { backgroundColor: ACCENT, borderColor: ACCENT } }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="rating"
          label="Your Rating"
          rules={[
            { required: true, message: "Please give a rating" },
            {
              validator: (_, v) =>
                v > 0 ? Promise.resolve() : Promise.reject("Rating must be at least 1 star"),
            },
          ]}
        >
          <Rate allowHalf={false} style={{ color: ACCENT }} />
        </Form.Item>

        <Form.Item
          name="content"
          label="Your Review"
          rules={[
            { required: true, message: "Please write a review" },
            { min: 10, message: "Review must be at least 10 characters" },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Share your experience with this destination…"
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReviewForm;
