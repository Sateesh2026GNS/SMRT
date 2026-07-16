<<<<<<< HEAD
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerApi } from "../../api/authApi";
import useAuth from "../../hooks/useAuth";
import AuthSlider from "../../components/auth/AuthSlider";
import PasswordInput from "../../components/auth/PasswordInput";

const BuildingIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V7a2 2 0 012-2h3v16M12 21V4a2 2 0 012-2h3a2 2 0 012 2v17M8 10h.01M8 14h.01M8 18h.01M16 10h.01M16 14h.01M16 18h.01" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MailIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!companyName.trim() || !fullName.trim() || !email.trim()) {
      setError("Fill in company name, full name, and email");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const data = await registerApi(
        companyName.trim(),
        fullName.trim(),
        email.trim(),
        password
      );
      if (data.email_verification_required || !data.access_token) {
        setSuccess(data.message || "Registration successful. Please verify your email before signing in.");
        return;
      }
      login({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: data.user,
      });
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.detail;
      setError(typeof msg === "string" ? msg : "Registration failed. Email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative" style={{ minHeight: "600px" }}>
          <div className="flex h-full">
              {/* Left Panel - Image Slider + Sign In Prompt */}
              <AuthSlider className="w-1/2">
                <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
                <p className="text-center text-sm mb-8 max-w-xs text-teal-50/90">
                  Enter your personal details to use all of site features
                </p>
                <Link
                  to="/login"
                  className="px-8 py-3 border-2 border-white text-white font-bold uppercase rounded-lg hover:bg-white hover:text-teal-600 transition"
                >
                  SIGN IN
                </Link>
              </AuthSlider>

              {/* Right Panel - Register Form */}
              <div className="w-1/2 flex flex-col justify-center items-center p-12 bg-white overflow-y-auto">
                <div className="text-center mb-8 w-full">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">SMRT AI ERP</h1>
                  <p className="text-gray-600 text-sm">AI-Powered Manufacturing ERP</p>
                  <p className="text-gray-500 text-xs mt-1">Create your SMRT AI ERP account</p>
                </div>

                {success && (
                  <div className="w-full mb-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg text-sm">
                    {success}{" "}
                    <Link to="/login" className="font-semibold underline">
                      Sign in
                    </Link>
                  </div>
                )}

                {error && (
                  <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    className="w-12 h-12 mx-auto border-2 border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 transition"
                  >
                    <span className="text-xl">G+</span>
                  </button>

                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-gray-400">
                      <BuildingIcon />
                    </div>
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-gray-400">
                      <UserIcon />
                    </div>
                    <input
                      type="text"
                      placeholder="Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-gray-400">
                      <MailIcon />
                    </div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <PasswordInput
                      placeholder="Password (min 8)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      leftIcon={<LockIcon />}
                      autoComplete="new-password"
                    />
                    <PasswordInput
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      leftIcon={<LockIcon />}
                      autoComplete="new-password"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    Remember Password
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold uppercase tracking-wider rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? "Creating Account..." : "SIGN UP"}
                  </button>
                </form>

                <p className="text-xs text-gray-600 mt-4">
                  Already have an account?{" "}
                  <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
=======
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerApi } from "../../api/authApi";
import { ROLES } from "../../config/permissions";
import useAuth from "../../hooks/useAuth";
import AuthSlider from "../../components/auth/AuthSlider";
import PasswordInput from "../../components/auth/PasswordInput";

const BuildingIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V7a2 2 0 012-2h3v16M12 21V4a2 2 0 012-2h3a2 2 0 012 2v17M8 10h.01M8 14h.01M8 18h.01M16 10h.01M16 14h.01M16 18h.01" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MailIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [selectedRole, setSelectedRole] = useState("Operator");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!companyName.trim() || !fullName.trim() || !email.trim()) {
      setError("Fill in company name, full name, and email");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const data = await registerApi(
        companyName.trim(),
        fullName.trim(),
        email.trim(),
        password,
        selectedRole
      );
      if (data.email_verification_required || !data.access_token) {
        setSuccess(data.message || "Registration successful. Please verify your email before signing in.");
        return;
      }
      const scopedUser = {
        ...data.user,
        role: selectedRole,
        roles: [selectedRole],
      };
      login({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: scopedUser,
      });
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.detail;
      setError(typeof msg === "string" ? msg : "Registration failed. Email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative" style={{ minHeight: "600px" }}>
          <div className="flex h-full">
              {/* Left Panel - Image Slider + Sign In Prompt */}
              <AuthSlider className="w-1/2">
                <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
                <p className="text-center text-sm mb-8 max-w-xs text-teal-50/90">
                  Enter your personal details to use all of site features
                </p>
                <Link
                  to="/login"
                  className="px-8 py-3 border-2 border-white text-white font-bold uppercase rounded-lg hover:bg-white hover:text-teal-600 transition"
                >
                  SIGN IN
                </Link>
              </AuthSlider>

              {/* Right Panel - Register Form */}
              <div className="w-1/2 flex flex-col justify-center items-center p-12 bg-white overflow-y-auto">
                <div className="text-center mb-8 w-full">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">SMRT</h1>
                  <p className="text-gray-600 text-sm">Manufacturing ERP</p>
                  <p className="text-gray-500 text-xs mt-1">Create Your Own Manufacturing ERP Account</p>
                </div>

                {success && (
                  <div className="w-full mb-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg text-sm">
                    {success}{" "}
                    <Link to="/login" className="font-semibold underline">
                      Sign in
                    </Link>
                  </div>
                )}

                {error && (
                  <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-gray-400">
                      <BuildingIcon />
                    </div>
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-gray-400 pointer-events-none">
                      <UserIcon />
                    </div>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full pl-12 pr-10 py-3 bg-gray-100 border-none rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
                    >
                      {ROLES.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-4 text-gray-400 pointer-events-none">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-gray-400">
                      <UserIcon />
                    </div>
                    <input
                      type="text"
                      placeholder="Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-gray-400">
                      <MailIcon />
                    </div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <PasswordInput
                      placeholder="Password (min 8)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      leftIcon={<LockIcon />}
                      autoComplete="new-password"
                    />
                    <PasswordInput
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      leftIcon={<LockIcon />}
                      autoComplete="new-password"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    Remember Password
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold uppercase tracking-wider rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? "Creating Account..." : "SIGN UP"}
                  </button>
                </form>

                <p className="text-xs text-gray-600 mt-4">
                  Already have an account?{" "}
                  <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
>>>>>>> 42502626 (first commit)
