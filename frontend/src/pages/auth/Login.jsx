<<<<<<< HEAD
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as loginApi } from "../../api/authApi";
import { ROLES } from "../../config/permissions";
import useAuth from "../../hooks/useAuth";
import AuthSlider from "../../components/auth/AuthSlider";
import PasswordInput from "../../components/auth/PasswordInput";

const EnvelopeIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [demoRole, setDemoRole] = useState("Operator");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");

  // Seeded demo accounts (see backend/app/core/seed_users.py)
  const DEMO_CREDENTIALS = {
    Admin: { email: "admin@smrt.local", password: "admin123" },
    "Production Manager": { email: "production@smrt.local", password: "demo123" },
    "Store Manager": { email: "store@smrt.local", password: "demo123" },
    "HR Manager": { email: "hr@smrt.local", password: "demo123" },
    Accountant: { email: "accounts@smrt.local", password: "demo123" },
    Operator: { email: "operator@smrt.local", password: "demo123" },
  };

  const handleDemoLogin = async () => {
    setError("");
    const creds = DEMO_CREDENTIALS[demoRole] || DEMO_CREDENTIALS.Operator;
    setDemoLoading(true);
    try {
      const data = await loginApi(creds.email, creds.password);
      login({ access_token: data.access_token, refresh_token: data.refresh_token, user: data.user });
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.detail;
      setError(typeof msg === "string" ? msg : "Demo login failed. Is the API running?");
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter email and password");
      return;
    }
    setLoading(true);
    try {
      const data = await loginApi(email.trim(), password);
      login({ access_token: data.access_token, refresh_token: data.refresh_token, user: data.user });
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.detail;
      setError(typeof msg === "string" ? msg : "Login failed. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative" style={{ minHeight: "480px" }}>
          <div className="flex">
              {/* Left Panel - Login Form */}
              <div className="w-1/2 flex flex-col justify-center items-center p-12 bg-white">
              <div className="text-center mb-8 w-full">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">SMRT AI ERP</h1>
                <p className="text-gray-600 text-sm">AI-Powered Manufacturing ERP</p>
                <p className="text-gray-500 text-xs mt-1">Systematic Manufacturing Real-time Tracking</p>
              </div>

              {error && (
                <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-3.5 text-gray-400">
                    <EnvelopeIcon />
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <PasswordInput
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<LockIcon />}
                  autoComplete="current-password"
                />

                <div className="flex justify-between items-center text-xs">
                  <Link to="/forgot-password" className="text-gray-600 hover:text-teal-600">Forgot Your Password?</Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold uppercase tracking-wider rounded-lg transition disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "SIGN IN"}
                </button>
              </form>

              <p className="text-xs text-gray-500 mt-2">API: admin@smrt.local / admin123</p>
            </div>

            {/* Right Panel - Image Slider + Register Prompt */}
            <AuthSlider className="w-1/2">
              <h2 className="text-4xl font-bold mb-4">Hello</h2>
              <p className="text-center text-sm mb-8 max-w-xs text-teal-50/90">
                Register with your personal details to use all of site features
              </p>
              <Link
                to="/register"
                className="px-8 py-3 border-2 border-white text-white font-bold uppercase rounded-lg hover:bg-white hover:text-teal-600 transition"
              >
                SIGN UP
              </Link>
            </AuthSlider>
          </div>
          </div>

        {/* Demo Login Box */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg max-w-md">
          <p className="text-center text-sm font-semibold text-teal-600 mb-3">Quick Login (seeded accounts)</p>
          <p className="text-xs text-gray-600 text-center mb-3">Select a role to sign in with a real demo account:</p>
          <select
            value={demoRole}
            onChange={(e) => setDemoRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {ROLES.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold uppercase text-sm rounded-lg transition disabled:opacity-50"
          >
            {demoLoading ? "Signing in..." : `Continue as ${demoRole}`}
          </button>
        </div>
      </div>
    </div>
  );
}
=======
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as loginApi } from "../../api/authApi";
import { ROLES, ROLE_PERMISSIONS } from "../../config/permissions";
import useAuth from "../../hooks/useAuth";
import AuthSlider from "../../components/auth/AuthSlider";
import PasswordInput from "../../components/auth/PasswordInput";

const EnvelopeIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [demoRole, setDemoRole] = useState("Operator");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");

  // Seeded demo accounts (see backend/app/core/seed_users.py)
  const DEMO_CREDENTIALS = {
    Admin: { email: "admin@smrt.local", password: "admin123" },
    "Production Manager": { email: "production@smrt.local", password: "demo123" },
    "Store Manager": { email: "store@smrt.local", password: "demo123" },
    "HR Manager": { email: "hr@smrt.local", password: "demo123" },
    Accountant: { email: "accounts@smrt.local", password: "demo123" },
    Operator: { email: "operator@smrt.local", password: "demo123" },
  };

  const handleDemoLogin = async () => {
    setError("");
    const creds = DEMO_CREDENTIALS[demoRole] || DEMO_CREDENTIALS.Operator;
    setDemoLoading(true);
    try {
      const data = await loginApi(creds.email, creds.password);

      const scopedUser = {
        ...data.user,
        role: demoRole,
        roles: [demoRole],
        permissions: ROLE_PERMISSIONS[demoRole] || [],
      };

      login({ access_token: data.access_token, refresh_token: data.refresh_token, user: scopedUser });
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.detail;
      setError(typeof msg === "string" ? msg : "Demo login failed. Is the API running?");
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter email and password");
      return;
    }
    setLoading(true);
    try {
      const data = await loginApi(email.trim(), password);

      // Use the first role returned, or default to matching against available roles
      const userRoles = Array.isArray(data.user.roles)
        ? data.user.roles
        : data.user.role
        ? [data.user.role]
        : [];

      const roleToUse = userRoles[0] || "Admin";

      const scopedUser = {
        ...data.user,
        role: roleToUse,
        roles: userRoles,
        permissions: ROLE_PERMISSIONS[roleToUse] || [],
      };

      login({ access_token: data.access_token, refresh_token: data.refresh_token, user: scopedUser });
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.detail;
      setError(typeof msg === "string" ? msg : "Login failed. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      {/* Main login card */}
      <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
        <div className="flex min-h-[580px] flex-col lg:flex-row">

          {/* ── Left Panel – Login Form ── */}
          <div className="flex w-full flex-col justify-between bg-white p-8 lg:w-[45%] lg:p-10">
            {/* Top: branding + form */}
            <div className="flex flex-col items-center">
              {/* Branding */}
              <div className="text-center mb-7 w-full">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-0.5">SMRT</h1>
                <p className="text-gray-600 text-sm font-semibold">Manufacturing ERP</p>
                <p className="text-gray-400 text-[11px] mt-0.5">Systematic Manufacturing Real-time Tracking</p>
              </div>

              {/* Error */}
              {error && (
                <div className="w-full mb-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}

              {/* Sign-in form */}
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                {/* Email */}
                <div className="relative">
                  <div className="absolute left-4 top-3.5 text-gray-400">
                    <EnvelopeIcon />
                  </div>
                  <input
                    type="email"
                    id="login-email"
                    placeholder="admin@smrt.local"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Password */}
                <PasswordInput
                  id="login-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<LockIcon />}
                  autoComplete="current-password"
                />

                {/* Forgot password */}
                <div className="flex items-center text-xs">
                  <Link to="/forgot-password" className="text-gray-500 hover:text-teal-600 transition-colors">
                    Forgot Your Password?
                  </Link>
                </div>

                {/* Sign in button */}
                <button
                  type="submit"
                  id="login-submit"
                  disabled={loading}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold uppercase tracking-wider rounded-xl transition-all duration-150 disabled:opacity-50"
                >
                  {loading ? "Signing in…" : "SIGN IN"}
                </button>
              </form>

              {/* API hint */}
              <p className="text-[10px] text-gray-400 mt-3">
                API: admin@smrt.local / admin123
              </p>
            </div>

            {/* Bottom: Quick Login card */}
            <div className="mt-6 rounded-2xl border border-slate-100 bg-gray-50 p-5 shadow-sm">
              <p className="text-center text-sm font-semibold text-teal-600 mb-0.5">
                Quick Login (seeded accounts)
              </p>
              <p className="text-[11px] text-gray-500 text-center mb-4">
                Select a role to sign in with a real demo account:
              </p>
              {/* Role dropdown */}
              <div className="relative mb-4">
                <select
                  id="demo-role-select"
                  value={demoRole}
                  onChange={(e) => setDemoRole(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
                {/* Dropdown chevron */}
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <button
                id="demo-login-btn"
                type="button"
                onClick={handleDemoLogin}
                disabled={demoLoading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold uppercase text-xs tracking-wider rounded-xl transition-all duration-150 disabled:opacity-50"
              >
                {demoLoading ? "Signing in…" : `CONTINUE AS ${demoRole.toUpperCase()}`}
              </button>
            </div>
          </div>

          {/* ── Right Panel – Image Slider + Hello / Sign Up ── */}
          <AuthSlider className="w-full min-h-[260px] border-t border-slate-100 lg:min-h-0 lg:w-[55%] lg:border-t-0">
            <div className="flex flex-col items-center justify-center py-4 lg:py-0">
              <h2 className="mb-2 text-3xl font-extrabold text-white tracking-tight">Hello</h2>
              <p className="mb-5 max-w-[15rem] text-center text-sm leading-relaxed text-teal-50/90">
                Register with your personal details to use all of site features
              </p>
              <Link
                to="/register"
                className="rounded-full border-2 border-white/90 px-8 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition-all duration-200 hover:bg-white hover:text-teal-700"
              >
                SIGN UP
              </Link>
            </div>
          </AuthSlider>
        </div>
      </div>
    </div>
  );
}
>>>>>>> 42502626 (first commit)
