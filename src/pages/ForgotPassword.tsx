import React, { useState } from "react";
import { API_BASE_URL } from "../config/constants";
import { Link } from "react-router-dom";
import plogo from "../assets/logo/plogo.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/SysUser/forgotpassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send reset email.");
        return;
      }

      if (data.success === false) {
        setError(data.message || "Failed to send reset email.");
        return;
      }

      setSuccess("If an account with that email exists, a password reset link has been sent.");
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
          Forgot Password
        </h2>

        <p className="mt-4 text-base text-gray-500">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <div className="mt-10">
          <label className="font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter your email"
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
          disabled={loading}
          className="mt-8 w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;