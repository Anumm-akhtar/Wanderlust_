import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  CompassOutlined,
  SearchOutlined,
  CalendarOutlined,
  HeartOutlined,
  UnorderedListOutlined,
  ReadOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown } from "antd";
import type { MenuProps } from "antd";
import type { RootState } from "../store/store";
import { logout } from "../screens/auth/store/auth.slice";

const ACCENT = "#aa3bff";

const navLinks = [
  { label: "Browse", path: "/browse", icon: SearchOutlined },
  { label: "Itineraries", path: "/itineraries", icon: UnorderedListOutlined },
  { label: "Blogs", path: "/blogs", icon: ReadOutlined },
  { label: "My Bookings", path: "/bookings", icon: CalendarOutlined },
  { label: "Wishlist", path: "/wishlist", icon: HeartOutlined },
];

const UserHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  const dropdownItems: MenuProps["items"] = [
    {
      key: "email",
      label: (
        <span className="text-slate-500 text-xs px-1">{user?.email}</span>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header
      className="flex items-center justify-between px-4 sm:px-6 shrink-0 bg-white sticky top-0 z-50"
      style={{ height: 64, borderBottom: "1px solid #e2e8f0" }}
    >
      {/* Brand */}
      <NavLink
        to="/browse"
        className="flex items-center gap-2 shrink-0 text-slate-800 hover:text-slate-900 no-underline"
      >
        <CompassOutlined style={{ color: ACCENT, fontSize: 22 }} />
        <span className="font-bold text-base tracking-wide hidden sm:block">Wanderlust</span>
      </NavLink>

      {/* Nav */}
      <nav className="flex items-center gap-1">
        {navLinks.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              [
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline",
                isActive
                  ? "text-purple-600 bg-purple-50"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50",
              ].join(" ")
            }
            style={({ isActive }) => (isActive ? { color: ACCENT } : {})}
          >
            <Icon style={{ fontSize: 15 }} />
            <span className="hidden md:inline">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User menu */}
      <Dropdown menu={{ items: dropdownItems }} trigger={["click"]} placement="bottomRight">
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 transition-colors">
          <Avatar
            size={32}
            icon={<UserOutlined />}
            style={{ backgroundColor: ACCENT, flexShrink: 0 }}
          />
          <span className="text-sm text-slate-600 hidden lg:block max-w-36 truncate">
            {user?.email}
          </span>
        </button>
      </Dropdown>
    </header>
  );
};

export default UserHeader;
