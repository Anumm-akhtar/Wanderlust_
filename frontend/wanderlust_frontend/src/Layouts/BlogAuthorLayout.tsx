import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Spin } from "antd";

const Dashboard = lazy(() => import("../screens/blogAuthor/Dashboard"));

const BlogAuthorLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Blog Author</p>
          <h1 className="text-base font-semibold text-slate-900">Wanderlust Publishing</h1>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <Suspense fallback={<div className="flex items-center justify-center py-16"><Spin size="large" /></div>}>
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default BlogAuthorLayout;