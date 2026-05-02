import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Statistic } from "antd";
import {
  EnvironmentOutlined,
  AppstoreOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { fetchDestinations } from "./store/destinations.slice";
import { fetchPackages } from "./store/packages.slice";
import type { RootState, AppDispatch } from "../../store/store";

const statCards = (destCount: number, pkgCount: number) => [
  {
    title: "Total Destinations",
    value: destCount,
    icon: <EnvironmentOutlined />,
    iconBg: "rgba(170,59,255,0.12)",
    iconColor: "#aa3bff",
    suffix: "places",
  },
  {
    title: "Total Packages",
    value: pkgCount,
    icon: <AppstoreOutlined />,
    iconBg: "rgba(59,130,246,0.12)",
    iconColor: "#3b82f6",
    suffix: "packages",
  },
  {
    title: "Avg. per Package",
    value: pkgCount > 0 ? +(destCount / pkgCount).toFixed(1) : 0,
    icon: <RiseOutlined />,
    iconBg: "rgba(16,185,129,0.12)",
    iconColor: "#10b981",
    suffix: "destinations",
  },
];

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { destinations, loading: dLoading } = useSelector(
    (state: RootState) => state.destinations,
  );
  const { packages, loading: pLoading } = useSelector(
    (state: RootState) => state.packages,
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchDestinations(undefined));
    dispatch(fetchPackages());
  }, [dispatch]);

  const cards = statCards(destinations.length, packages.length);
  const loading = dLoading || pLoading;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""} 👋
        </h2>
        <p className="text-slate-500 mt-1 text-sm">
          Here's a summary of your travel platform.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <Card
            key={card.title}
            loading={loading}
            className="shadow-sm hover:shadow-md transition-shadow"
            styles={{ body: { padding: "20px 24px" } }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: card.iconBg, color: card.iconColor }}
              >
                {card.icon}
              </div>
              <Statistic
                title={
                  <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                    {card.title}
                  </span>
                }
                value={card.value}
                suffix={
                  <span className="text-slate-400 text-sm font-normal">
                    {card.suffix}
                  </span>
                }
                valueStyle={{ fontSize: 24, fontWeight: 700, color: "#1e293b" }}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          className="shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          styles={{ body: { padding: "20px 24px" } }}
          onClick={() => (window.location.href = "/destinations")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700 group-hover:text-purple-600 transition-colors">
                Manage Destinations
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Add, edit, or remove travel destinations
              </p>
            </div>
            <EnvironmentOutlined style={{ fontSize: 24, color: "#aa3bff" }} />
          </div>
        </Card>

        <Card
          className="shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          styles={{ body: { padding: "20px 24px" } }}
          onClick={() => (window.location.href = "/packages")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                Manage Packages
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Create and configure travel packages
              </p>
            </div>
            <AppstoreOutlined style={{ fontSize: 24, color: "#3b82f6" }} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
