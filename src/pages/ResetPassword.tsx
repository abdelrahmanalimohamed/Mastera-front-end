import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/constants";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import plogo from "../assets/logo/plogo.png";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Invalid reset link. No token provided.");
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/SysUser/resetpassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            newPassword: formData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to reset password.");
        return;
      }

      if (data.success === false) {
        setError(data.message || "Invalid or expired token.");
        return;
      }

      setSuccess("Password reset successfully! Redirecting to sign in...");
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center w-full px-4 bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-96 flex-col bg-white p-8 rounded-xl shadow-sm"
      >
        <a href="/" className="mb-8 self-start" title="Go to Home">
          <img
            src={plogo}
            alt="Mastera Logo"
            className="h-24 w-24 object-contain"
          />
        </a>
        <h2 className="text-4xl font-medium text-gray-900">
          Reset Password
        </h2>

        <p className="mt-4 text-base text-gray-500">
          Enter your new password below.
        </p>

        <div className="mt-10">
          <label className="font-medium text-gray-700">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter new password"
          />
        </div>

        <div className="mt-6">
          <label className="font-medium text-gray-700">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Confirm new password"
          />
        </div>

        {error && (
          <div className="mt-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 text-green-600 text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !token}
          className="mt-8 w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          Remember your password?{" "}
          <Link to="/" className="text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
};

export default ResetPassword;