import { useSelector } from "react-redux";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { RootState } from "../store/store";

const AdminHeader = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <header
      className="flex items-center justify-between px-6 flex-shrink-0 bg-white"
      style={{ height: 64, borderBottom: "1px solid #e2e8f0" }}
    >
      <span className="text-slate-400 text-sm font-medium tracking-wide uppercase">
        Admin Panel
      </span>

      <div className="flex items-center gap-3">
        <Avatar
          size={34}
          icon={<UserOutlined />}
          style={{ backgroundColor: "#aa3bff", flexShrink: 0 }}
        />
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-700 leading-tight">
            {user?.email ?? "Admin"}
          </p>
          <p className="text-xs text-slate-400">Administrator</p>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
