import { Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import { Spin } from "antd";
import Auth from "./screens/auth/Auth";
import ProtectedRoutes from "./Layouts/ProtectedRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Suspense fallback={<Spin fullscreen />}>
      <Toaster />
      <Routes>
        <Route path="/auth/*" element={<Auth />} />
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </Suspense>
  );
}

export default App;
