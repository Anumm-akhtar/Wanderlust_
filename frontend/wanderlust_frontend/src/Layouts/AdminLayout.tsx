import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

const Dashboard = lazy(() => import("../screens/admin/Dashboard"));
const Destinations = lazy(() => import("../screens/admin/Destinations"));
const Packages = lazy(() => import("../screens/admin/Packages"));

const AdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f8fafc" }}>
      <AdminSidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-auto">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <Spin size="large" />
              </div>
            }
          >
            <Routes>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="destinations" element={<Destinations />} />
              <Route path="packages" element={<Packages />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
