import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  CompassOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import { logout } from "../screens/auth/store/auth.slice";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: DashboardOutlined },
  { label: "Destinations", path: "/destinations", icon: EnvironmentOutlined },
  { label: "Packages", path: "/packages", icon: AppstoreOutlined },
];

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  return (
    <aside
      className="flex flex-col h-screen flex-shrink-0 transition-all duration-300"
      style={{
        width: collapsed ? 64 : 240,
        background: "#0f172a",
        borderRight: "1px solid #1e293b",
      }}
    >
      {/* Brand */}
      <div
        className="flex items-center gap-3 px-4 flex-shrink-0"
        style={{ height: 64, borderBottom: "1px solid #1e293b" }}
      >
        <CompassOutlined style={{ color: "#aa3bff", fontSize: 22, flexShrink: 0 }} />
        {!collapsed && (
          <span className="font-bold text-white text-base tracking-wide truncate">
            Wanderlust
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map(({ label, path, icon: Icon }) => (
          <Tooltip key={path} title={collapsed ? label : ""} placement="right">
            <NavLink
              to={path}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium",
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800",
                ].join(" ")
              }
              style={({ isActive }) =>
                isActive
                  ? { background: "rgba(170,59,255,0.18)", color: "#aa3bff" }
                  : {}
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    style={{
                      fontSize: 16,
                      flexShrink: 0,
                      color: isActive ? "#aa3bff" : undefined,
                    }}
                  />
                  {!collapsed && <span>{label}</span>}
                </>
              )}
            </NavLink>
          </Tooltip>
        ))}
      </nav>

      {/* Collapse toggle + Logout */}
      <div style={{ borderTop: "1px solid #1e293b" }} className="p-2 flex flex-col gap-1">
        <Tooltip title={collapsed ? "Logout" : ""} placement="right">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <LogoutOutlined style={{ fontSize: 16, flexShrink: 0 }} />
            {!collapsed && <span>Logout</span>}
          </button>
        </Tooltip>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors text-sm"
        >
          {collapsed ? (
            <MenuUnfoldOutlined style={{ fontSize: 16 }} />
          ) : (
            <>
              <MenuFoldOutlined style={{ fontSize: 16, flexShrink: 0 }} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
