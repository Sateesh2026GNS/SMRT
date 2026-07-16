import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/authApi";
import PasswordInput from "../../components/auth/PasswordInput";

const LockIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!token) {
      setError("Invalid reset link. Request a new password reset.");
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
      const data = await resetPassword(token, password);
      setMessage(data.message || "Password reset successfully.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const msg = err.response?.data?.detail;
      setError(typeof msg === "string" ? msg : "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
        <p className="text-sm text-gray-600 mb-6">Choose a new password for your account.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            placeholder="New password (min 8)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<LockIcon />}
            autoComplete="new-password"
          />
          <PasswordInput
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<LockIcon />}
            autoComplete="new-password"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center">
          <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
