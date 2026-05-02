import { useEffect, useState } from "react";
import { Modal, Radio, Input, Spin, Empty, Form } from "antd";
import { PlusOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import type { RootState, AppDispatch } from "../../../store/store";
import { fetchItineraries, addDestinationToItinerary } from "../store/itineraries.slice";

const ACCENT = "#aa3bff";

type Mode = "existing" | "new";

interface Props {
  open: boolean;
  onClose: () => void;
  destId: number;
  destName: string;
}

const AddToItineraryModal = ({ open, onClose, destId, destName }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { itineraries, loading, actionLoading } = useSelector(
    (state: RootState) => state.itineraries,
  );

  const [mode, setMode] = useState<Mode>("existing");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      dispatch(fetchItineraries());
      setMode(itineraries.length === 0 ? "new" : "existing");
      setSelectedId(null);
      setNewName("");
    }
  }, [open, dispatch]);

  // Auto-switch to "new" when no itineraries exist
  useEffect(() => {
    if (!loading && itineraries.length === 0) setMode("new");
  }, [loading, itineraries.length]);

  const handleOk = async () => {
    if (mode === "existing") {
      if (!selectedId) {
        toast.error("Please select an itinerary");
        return;
      }
      const res = await dispatch(
        addDestinationToItinerary({ dest_id: destId, itinerary_id: selectedId }),
      );
      if (addDestinationToItinerary.fulfilled.match(res)) {
        toast.success(`${destName} added to itinerary`);
        onClose();
      } else {
        toast.error((res.payload as string) || "Failed to add destination");
      }
    } else {
      const trimmed = newName.trim();
      if (!trimmed) {
        toast.error("Please enter an itinerary name");
        return;
      }
      const res = await dispatch(
        addDestinationToItinerary({ dest_id: destId, new_itinerary_name: trimmed }),
      );
      if (addDestinationToItinerary.fulfilled.match(res)) {
        toast.success(`New itinerary "${trimmed}" created with ${destName}`);
        onClose();
      } else {
        toast.error((res.payload as string) || "Failed to create itinerary");
      }
    }
  };

  return (
    <Modal
      title={
        <div>
          <p className="font-semibold text-slate-800 text-base">Add to Itinerary</p>
          <p className="text-slate-500 text-sm font-normal truncate">{destName}</p>
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={actionLoading}
      okText="Add"
      okButtonProps={{ style: { backgroundColor: ACCENT, borderColor: ACCENT } }}
      destroyOnClose
    >
      <div className="mt-4 space-y-4">
        {/* Mode selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode("existing")}
            disabled={itineraries.length === 0}
            className={[
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors",
              mode === "existing" && itineraries.length > 0
                ? "border-purple-400 bg-purple-50 text-purple-700"
                : "border-slate-200 text-slate-400 cursor-not-allowed",
            ].join(" ")}
          >
            <UnorderedListOutlined />
            Existing
          </button>
          <button
            onClick={() => setMode("new")}
            className={[
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors",
              mode === "new"
                ? "border-purple-400 bg-purple-50 text-purple-700"
                : "border-slate-200 text-slate-500 hover:border-slate-300",
            ].join(" ")}
          >
            <PlusOutlined />
            New
          </button>
        </div>

        {/* Content */}
        {mode === "existing" ? (
          loading ? (
            <div className="flex justify-center py-6">
              <Spin />
            </div>
          ) : itineraries.length === 0 ? (
            <Empty description="No itineraries yet — create one below" className="py-4" />
          ) : (
            <Radio.Group
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full"
            >
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {itineraries.map((it) => (
                  <label
                    key={it.itinerary_id}
                    className={[
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedId === it.itinerary_id
                        ? "border-purple-400 bg-purple-50"
                        : "border-slate-100 hover:border-slate-200",
                    ].join(" ")}
                  >
                    <Radio value={it.itinerary_id} />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">
                        {it.itinerary_name ?? `Itinerary #${it.itinerary_id}`}
                      </p>
                      <p className="text-xs text-slate-400">
                        ${(it.price ?? 0).toLocaleString()} total
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </Radio.Group>
          )
        ) : (
          <Form form={form} layout="vertical">
            <Form.Item label="Itinerary Name" className="mb-0">
              <Input
                placeholder="e.g. Summer Europe Trip"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onPressEnter={handleOk}
                autoFocus
              />
            </Form.Item>
          </Form>
        )}
      </div>
    </Modal>
  );
};

export default AddToItineraryModal;
