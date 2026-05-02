import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, Input, Button, Alert, Segmented } from "antd";
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  CompassOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { authService } from "../services/authService";
import {
  setLoading,
  setRegisterSuccess,
  setError,
  clearError,
  type AuthState,
} from "../store/auth.slice";
import type { RootState } from "../../../store/store";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, loading } = useSelector(
    (state: RootState) => state.auth,
  ) as AuthState;
  const [registrationType, setRegistrationType] = useState<"user" | "author">("user");

  const handleSubmit = async (values: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    dispatch(clearError());
    dispatch(setLoading(true));
    try {
      if (registrationType === "author") {
        await authService.registerAuthor({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
        });
      } else {
        await authService.register({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
        });
      }
      dispatch(
        setRegisterSuccess({
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
        }),
      );
      navigate("/auth/login", {
        state: { message: "Account created successfully. Please sign in." },
      });
    } catch (err: any) {
      dispatch(
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            "Registration failed. Please try again.",
        ),
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)",
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: 420,
            height: 420,
            background: "rgba(170,59,255,0.12)",
            top: "-80px",
            left: "-80px",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 320,
            height: 320,
            background: "rgba(170,59,255,0.1)",
            bottom: "-60px",
            right: "-60px",
            filter: "blur(60px)",
          }}
        />

        <div className="relative z-10 text-center max-w-xs">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{
              background: "rgba(170,59,255,0.2)",
              border: "1px solid rgba(170,59,255,0.3)",
            }}
          >
            <CompassOutlined style={{ fontSize: 30, color: "#aa3bff" }} />
          </div>

          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Wanderlust</h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Your journey starts here.<br />Join thousands of explorers.
          </p>

          <div className="mt-10 flex flex-col gap-3 text-left">
            {[
              "Free to join, no hidden fees",
              "Personalised travel recommendations",
              "Book and manage trips easily",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(170,59,255,0.2)" }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#aa3bff" }}
                  />
                </div>
                <span className="text-slate-300 text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <CompassOutlined style={{ fontSize: 22, color: "#aa3bff" }} />
            <span className="text-xl font-bold text-slate-800">Wanderlust</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Create account</h2>
          <p className="text-slate-400 text-sm mb-6">
            Start your adventure — it only takes a minute.
          </p>

          <Segmented
            value={registrationType}
            onChange={(val) => setRegistrationType(val as "user" | "author")}
            options={[
              { label: <span className="flex items-center gap-2"><UserOutlined />Traveler</span>, value: "user" },
              { label: <span className="flex items-center gap-2"><EditOutlined />Author</span>, value: "author" },
            ]}
            block
            className="mb-8"
          />

          {error && <Alert message={error} type="error" showIcon className="mb-5" />}

          <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            <div className="grid grid-cols-2 gap-3">
              <Form.Item
                name="firstName"
                label={<span className="text-slate-600 text-sm font-medium">First name</span>}
                rules={[{ required: true, message: "Required" }]}
                className="mb-4"
              >
                <Input
                  prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="John"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="lastName"
                label={<span className="text-slate-600 text-sm font-medium">Last name</span>}
                rules={[{ required: true, message: "Required" }]}
                className="mb-4"
              >
                <Input placeholder="Doe" size="large" />
              </Form.Item>
            </div>

            <Form.Item
              name="email"
              label={<span className="text-slate-600 text-sm font-medium">Email</span>}
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Enter a valid email" },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
                placeholder="you@example.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="text-slate-600 text-sm font-medium">Password</span>}
              rules={[
                { required: true, message: "Password is required" },
                { min: 6, message: "At least 6 characters" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
                placeholder="••••••••"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={
                <span className="text-slate-600 text-sm font-medium">Confirm password</span>
              }
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
                placeholder="••••••••"
                size="large"
              />
            </Form.Item>

            <Form.Item className="mt-6 mb-0">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                size="large"
                style={{ backgroundColor: "#aa3bff", borderColor: "#aa3bff", height: 46 }}
              >
                Create account
              </Button>
            </Form.Item>
          </Form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/auth/login" className="font-semibold" style={{ color: "#aa3bff" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
