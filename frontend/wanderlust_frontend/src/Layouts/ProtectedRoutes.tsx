import { Spin } from "antd";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import BlogAuthorLayout from "./BlogAuthorLayout";
import UserLayout from "./UserLayout";
import NotFound from "../components/Layout/NotFound";
import type { RootState } from "../store/store";
import {
  initAuthFromToken,
  type AuthState,
} from "../screens/auth/store/auth.slice";

const ProtectedRoutes = () => {
  const userState = useSelector((state: RootState) => state.auth) as AuthState;
  const dispatch = useDispatch();
  const initRef = useRef(false);

  // Initialize auth from stored token on component mount (only once)
  useEffect(() => {
    if (!initRef.current && !userState.hasInitialized) {
      initRef.current = true;
      dispatch(initAuthFromToken());
    }
  }, [dispatch, userState.hasInitialized]);

  // Show loading spinner while initializing
  if (userState.loading) return <Spin fullscreen />;

  // Redirect to login if not authenticated
  if (!userState.isAuthenticated || !userState.role) {
    return <Navigate to="/auth" replace />;
  }

  // Render appropriate layout based on role
  const renderLayout = () => {
    switch (userState.role) {
      case "Admin":
        return <AdminLayout />;
      case "Author":
        return <BlogAuthorLayout />;
      case "User":
        return <UserLayout />;
      default:
        return <NotFound />;
    }
  };

  return <>{renderLayout()}</>;
};

export default ProtectedRoutes;
