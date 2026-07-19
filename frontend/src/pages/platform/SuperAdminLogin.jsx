import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { superAdminLogin } from "../../api/platformApi";
import BrandLogo from "../../components/common/BrandLogo";
import PasswordInput from "../../components/auth/PasswordInput";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await superAdminLogin(email.trim(), password);
      navigate("/gns-admin/verify-otp", {
        replace: true,
        state: {
          challengeToken: data.challenge_token,
          maskedMobile: data.masked_mobile,
          expiresInSeconds: data.expires_in_seconds,
          resendAfterSeconds: data.resend_after_seconds,
          devOtp: data.dev_otp || null,
        },
      });
    } catch (err) {
      if (!err.response) {
        setError(
          "Cannot reach the API server. Make sure the backend is running on http://localhost:8000, then try again."
        );
      } else {
        const detail = err.response?.data?.detail;
        setError(typeof detail === "string" ? detail : "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandLogo size="lg" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">GNS Admin Portal</h1>
          <p className="mt-1 text-sm text-slate-500">Super Admin sign in</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Company Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Continue"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Company users?{" "}
          <Link to="/login" className="font-medium text-teal-600 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
