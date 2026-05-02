import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  Popconfirm,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  CompassOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import type { RootState, AppDispatch } from "../../../store/store";
import {
  fetchItineraries,
  createItinerary,
  deleteItinerary,
} from "../store/itineraries.slice";

const ACCENT = "#aa3bff";

const Itineraries = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { itineraries, loading, actionLoading } = useSelector(
    (state: RootState) => state.itineraries,
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm<{ itinerary_name: string }>();

  useEffect(() => {
    dispatch(fetchItineraries());
  }, [dispatch]);

  const handleCreate = async () => {
    const { itinerary_name } = await form.validateFields();
    const res = await dispatch(createItinerary({ itinerary_name: itinerary_name.trim() }));
    if (createItinerary.fulfilled.match(res)) {
      toast.success("Itinerary created");
      setCreateOpen(false);
      form.resetFields();
      navigate(`/itineraries/${res.payload.itinerary_id}`);
    } else {
      toast.error((res.payload as string) || "Failed to create itinerary");
    }
  };

  const handleDelete = async (id: number) => {
    const res = await dispatch(deleteItinerary(id));
    if (deleteItinerary.fulfilled.match(res)) {
      toast.success("Itinerary deleted");
    } else {
      toast.error((res.payload as string) || "Failed to delete");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Itineraries</h1>
          <p className="text-slate-500 text-sm mt-1">
            Plan your trip by curating a list of destinations
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateOpen(true)}
          style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
        >
          New Itinerary
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spin size="large" />
        </div>
      ) : itineraries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CompassOutlined style={{ fontSize: 48, color: "#cbd5e1" }} className="mb-4" />
          <p className="text-slate-500 mb-2">No itineraries yet</p>
          <p className="text-slate-400 text-sm mb-6">
            Create one and start adding destinations from the Browse page
          </p>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
          >
            Create Your First Itinerary
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {itineraries.map((it) => (
            <div
              key={it.itinerary_id}
              className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(170,59,255,0.1)" }}
                >
                  <EnvironmentOutlined style={{ color: ACCENT, fontSize: 18 }} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">
                    {it.itinerary_name ?? `Itinerary #${it.itinerary_id}`}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Tag color="purple" className="m-0 text-xs font-medium">
                      ${(it.price ?? 0).toLocaleString()} total
                    </Tag>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/itineraries/${it.itinerary_id}`)}
                >
                  View
                </Button>
                <Popconfirm
                  title="Delete this itinerary?"
                  description="All destinations in it will be unlinked."
                  onConfirm={() => handleDelete(it.itinerary_id)}
                  okText="Delete"
                  okButtonProps={{ danger: true }}
                  cancelText="Cancel"
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    loading={actionLoading}
                  />
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal
        title={<span className="font-semibold text-slate-800">New Itinerary</span>}
        open={createOpen}
        onOk={handleCreate}
        onCancel={() => {
          setCreateOpen(false);
          form.resetFields();
        }}
        confirmLoading={actionLoading}
        okText="Create"
        okButtonProps={{ style: { backgroundColor: ACCENT, borderColor: ACCENT } }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="itinerary_name"
            label="Itinerary Name"
            rules={[
              { required: true, message: "Please enter a name" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input
              placeholder="e.g. Summer Europe Trip"
              autoFocus
              onPressEnter={handleCreate}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Itineraries;
