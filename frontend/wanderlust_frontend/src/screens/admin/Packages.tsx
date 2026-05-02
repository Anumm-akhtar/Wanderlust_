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
  Select,
  Divider,
  List,
  Badge,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  LinkOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import type { RootState, AppDispatch } from "../../store/store";
import {
  fetchPackages,
  createPackage,
  updatePackage,
  deletePackage,
  addDestinationToPackage,
  removeDestinationFromPackage,
  fetchPackageDestinations,
} from "./store/packages.slice";
import { fetchDestinations } from "./store/destinations.slice";
import type { Package } from "./services/packages.service";

const { Title } = Typography;

const ACCENT = "#aa3bff";

const Packages = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { packages, loading, actionLoading, packageDestinations } = useSelector(
    (state: RootState) => state.packages,
  );
  const { destinations } = useSelector((state: RootState) => state.destinations);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [destModalOpen, setDestModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [selectedDestId, setSelectedDestId] = useState<number | undefined>(undefined);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchPackages());
    dispatch(fetchDestinations(undefined));
  }, [dispatch]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (pkg: Package) => {
    setEditing(pkg);
    form.setFieldsValue({
      name: pkg.name,
      price: pkg.price,
      image: pkg.image ?? "",
      description: pkg.description ?? "",
    });
    setModalOpen(true);
  };

  const openDestModal = (pkg: Package) => {
    setSelectedPkg(pkg);
    setSelectedDestId(undefined);
    setDestModalOpen(true);
    dispatch(fetchPackageDestinations(pkg.pkg_id));
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      name: values.name,
      price: values.price,
      image: values.image || undefined,
      description: values.description || undefined,
    };

    if (editing) {
      const res = await dispatch(updatePackage({ id: editing.pkg_id, data: payload }));
      if (updatePackage.fulfilled.match(res)) {
        toast.success("Package updated");
        setModalOpen(false);
      } else {
        toast.error((res.payload as string) || "Update failed");
      }
    } else {
      const res = await dispatch(createPackage(payload));
      if (createPackage.fulfilled.match(res)) {
        toast.success("Package created");
        setModalOpen(false);
      } else {
        toast.error((res.payload as string) || "Create failed");
      }
    }
  };

  const handleDelete = async (id: number) => {
    const res = await dispatch(deletePackage(id));
    if (deletePackage.fulfilled.match(res)) {
      toast.success("Package deleted");
    } else {
      toast.error((res.payload as string) || "Delete failed");
    }
  };

  const handleAddDestination = async () => {
    if (!selectedPkg || !selectedDestId) return;
    const res = await dispatch(
      addDestinationToPackage({ pkgId: selectedPkg.pkg_id, destId: selectedDestId }),
    );
    if (addDestinationToPackage.fulfilled.match(res)) {
      toast.success("Destination added to package");
      setSelectedDestId(undefined);
    } else {
      toast.error((res.payload as string) || "Failed to add destination");
    }
  };

  const handleRemoveDestination = async (destId: number) => {
    if (!selectedPkg) return;
    const res = await dispatch(
      removeDestinationFromPackage({ pkgId: selectedPkg.pkg_id, destId }),
    );
    if (removeDestinationFromPackage.fulfilled.match(res)) {
      toast.success("Destination removed");
    } else {
      toast.error((res.payload as string) || "Failed to remove destination");
    }
  };

  const linkedDestIds = selectedPkg ? (packageDestinations[selectedPkg.pkg_id] ?? []) : [];
  const linkedDestinations = destinations.filter((d) => linkedDestIds.includes(d.dest_id));
  const availableDestinations = destinations.filter((d) => !linkedDestIds.includes(d.dest_id));

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
            alt="package"
            width={48}
            height={48}
            className="rounded-lg object-cover"
            preview={{ mask: false }}
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
            <AppstoreOutlined className="text-slate-300 text-base" />
          </div>
        ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: Package, b: Package) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <span className="font-medium text-slate-700">{name}</span>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: (a: Package, b: Package) => a.price - b.price,
      render: (price: number) => (
        <Tag color="blue" className="font-semibold">
          ${price.toLocaleString()}
        </Tag>
      ),
    },
    {
      title: "Destinations",
      key: "destinations",
      render: (_: unknown, record: Package) => {
        const count = (packageDestinations[record.pkg_id] ?? []).length;
        return (
          <Badge
            count={count}
            showZero
            style={{ backgroundColor: count > 0 ? ACCENT : "#cbd5e1" }}
          />
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (desc: string | undefined) =>
        desc ? (
          <span className="text-slate-500 text-sm">
            {desc.length > 60 ? `${desc.slice(0, 60)}…` : desc}
          </span>
        ) : (
          <span className="text-slate-300 text-sm">—</span>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 130,
      render: (_: unknown, record: Package) => (
        <Space>
          <Button
            type="text"
            icon={<LinkOutlined />}
            onClick={() => openDestModal(record)}
            style={{ color: "#10b981" }}
            title="Manage destinations"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
            style={{ color: "#3b82f6" }}
          />
          <Popconfirm
            title="Delete package?"
            description="This cannot be undone."
            onConfirm={() => handleDelete(record.pkg_id)}
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
            Packages
          </Title>
          <p className="text-slate-500 text-sm mt-1">
            {packages.length} package{packages.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
        >
          Add Package
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table
          dataSource={packages}
          columns={columns}
          rowKey="pkg_id"
          loading={loading}
          locale={{ emptyText: <Empty description="No packages yet" /> }}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `${total} packages`,
            showSizeChanger: false,
          }}
        />
      </div>

      {/* Create / Edit modal */}
      <Modal
        title={
          <span className="text-slate-800 font-semibold">
            {editing ? "Edit Package" : "New Package"}
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
            name="name"
            label="Name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="e.g. Tropical Escape" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price (USD)"
            rules={[{ required: true, message: "Price is required" }]}
          >
            <InputNumber
              min={0}
              prefix="$"
              placeholder="2500"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item name="image" label="Image URL">
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Short description of the package…" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Manage destinations modal */}
      <Modal
        title={
          <span className="text-slate-800 font-semibold">
            Manage Destinations — {selectedPkg?.name}
          </span>
        }
        open={destModalOpen}
        onCancel={() => setDestModalOpen(false)}
        footer={null}
        width={520}
        destroyOnClose
      >
        {/* Add a destination */}
        <div className="flex gap-2 mt-2">
          <Select
            placeholder="Select a destination to add"
            style={{ flex: 1 }}
            value={selectedDestId}
            onChange={(val) => setSelectedDestId(val)}
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
            options={availableDestinations.map((d) => ({
              value: d.dest_id,
              label: d.destName,
            }))}
            notFoundContent={
              availableDestinations.length === 0
                ? "All destinations already linked"
                : "No match"
            }
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddDestination}
            disabled={!selectedDestId}
            loading={actionLoading}
            style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
          >
            Add
          </Button>
        </div>

        <Divider titlePlacement="left" plain>
          <span className="text-slate-400 text-xs">
            Linked ({linkedDestinations.length})
          </span>
        </Divider>

        {linkedDestinations.length === 0 ? (
          <Empty
            description="No destinations linked yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            size="small"
            dataSource={linkedDestinations}
            renderItem={(dest) => (
              <List.Item
                actions={[
                  <Button
                    key="remove"
                    type="text"
                    danger
                    size="small"
                    icon={<MinusCircleOutlined />}
                    onClick={() => handleRemoveDestination(dest.dest_id)}
                    loading={actionLoading}
                  >
                    Remove
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <span className="text-sm font-medium text-slate-700">
                      {dest.destName}
                    </span>
                  }
                  description={
                    <span className="text-xs text-slate-400">
                      ${dest.price.toLocaleString()}
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
};

export default Packages;
