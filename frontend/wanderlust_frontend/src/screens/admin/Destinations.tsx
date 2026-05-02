import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Space,
  Tag,
  Image,
  Typography,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import type { RootState, AppDispatch } from "../../store/store";
import {
  fetchDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
} from "./store/destinations.slice";
import type { Destination } from "./services/destinations.service";

const { Title } = Typography;

const ACCENT = "#aa3bff";

const Destinations = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { destinations, loading, actionLoading } = useSelector(
    (state: RootState) => state.destinations,
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchDestinations(undefined));
  }, [dispatch]);

  const handleSearch = () => {
    dispatch(fetchDestinations(searchQuery || undefined));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    dispatch(fetchDestinations(undefined));
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (dest: Destination) => {
    setEditing(dest);
    form.setFieldsValue({
      destName: dest.destName,
      price: dest.price,
      image: dest.image ?? "",
      description: dest.description ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      destName: values.destName,
      price: values.price,
      image: values.image || undefined,
      description: values.description || undefined,
    };

    if (editing) {
      const res = await dispatch(updateDestination({ id: editing.dest_id, data: payload }));
      if (updateDestination.fulfilled.match(res)) {
        toast.success("Destination updated");
        setModalOpen(false);
      } else {
        toast.error((res.payload as string) || "Update failed");
      }
    } else {
      const res = await dispatch(createDestination(payload));
      if (createDestination.fulfilled.match(res)) {
        toast.success("Destination created");
        setModalOpen(false);
      } else {
        toast.error((res.payload as string) || "Create failed");
      }
    }
  };

  const handleDelete = async (id: number) => {
    const res = await dispatch(deleteDestination(id));
    if (deleteDestination.fulfilled.match(res)) {
      toast.success("Destination deleted");
    } else {
      toast.error((res.payload as string) || "Delete failed");
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 72,
      render: (img: string | undefined) =>
        img ? (
          <Image
            src={img}
            alt="destination"
            width={48}
            height={48}
            className="rounded-lg object-cover"
            preview={{ mask: false }}
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
            <EnvironmentOutlined className="text-slate-300 text-base" />
          </div>
        ),
    },
    {
      title: "Name",
      dataIndex: "destName",
      key: "destName",
      sorter: (a: Destination, b: Destination) => a.destName.localeCompare(b.destName),
      render: (name: string) => (
        <span className="font-medium text-slate-700">{name}</span>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: (a: Destination, b: Destination) => a.price - b.price,
      render: (price: number) => (
        <Tag color="purple" className="font-semibold">
          ${price.toLocaleString()}
        </Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (desc: string | undefined) =>
        desc ? (
          <span className="text-slate-500 text-sm">
            {desc.length > 70 ? `${desc.slice(0, 70)}…` : desc}
          </span>
        ) : (
          <span className="text-slate-300 text-sm">—</span>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_: unknown, record: Destination) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
            style={{ color: "#3b82f6" }}
          />
          <Popconfirm
            title="Delete destination?"
            description="This cannot be undone."
            onConfirm={() => handleDelete(record.dest_id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
          >
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <Title level={3} style={{ margin: 0, color: "#1e293b" }}>
            Destinations
          </Title>
          <p className="text-slate-500 text-sm mt-1">
            {destinations.length} destination{destinations.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
        >
          Add Destination
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Input
          placeholder="Search by name…"
          prefix={<SearchOutlined className="text-slate-300" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onPressEnter={handleSearch}
          style={{ maxWidth: 280 }}
          allowClear
          onClear={handleClearSearch}
        />
        <Button onClick={handleSearch}>Search</Button>
        {searchQuery && (
          <Button type="text" onClick={handleClearSearch} className="text-slate-400">
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table
          dataSource={destinations}
          columns={columns}
          rowKey="dest_id"
          loading={loading}
          locale={{ emptyText: <Empty description="No destinations yet" /> }}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `${total} destinations`,
            showSizeChanger: false,
          }}
        />
      </div>

      {/* Create / Edit modal */}
      <Modal
        title={
          <span className="text-slate-800 font-semibold">
            {editing ? "Edit Destination" : "New Destination"}
          </span>
        }
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={actionLoading}
        okText={editing ? "Update" : "Create"}
        okButtonProps={{ style: { backgroundColor: ACCENT, borderColor: ACCENT } }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="destName"
            label="Name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="e.g. Maldives" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price (USD)"
            rules={[{ required: true, message: "Price is required" }]}
          >
            <InputNumber
              min={0}
              prefix="$"
              placeholder="1500"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item name="image" label="Image URL">
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Short description of the destination…" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Destinations;
