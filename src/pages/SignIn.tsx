import React, { useState } from "react";
import { API_BASE_URL } from "../config/constants";
import { Link, useNavigate } from "react-router-dom";


const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);
   const navigate = useNavigate();

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e : any) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/SysUser/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,     // Must match C# record
            password: formData.password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await response.json();

      console.log("Login Success:", data);

      if (!data.isSuccess) {
      setError("Invalid email or password");
      return;
    }
setSuccess("Registration successful! Redirecting to login...");
setTimeout(() => navigate("/datatable"), 1500);
      // Example: store token if returned
    localStorage.setItem("token", data.token);
    localStorage.setItem("role",data.role)

    } catch (err) {
      setError("Something went wrong");
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
      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiWSHo3egzpXlUV8tNe2spORVNOA-NsfJyiA&s"
      alt="Mastera Logo"
      className="h-24 w-24 object-contain"
    />
  </a>
        <h2 className="text-4xl font-medium text-gray-900">
          Mastera Sign in
        </h2>

        <p className="mt-4 text-base text-gray-500">
          Please enter your details to access.
        </p>

        <div className="mt-10">
          <label className="font-medium text-gray-700">
            Email
          </label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div className="mt-6">
          <label className="font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

         {success && (
          <p className="mt-4 text-sm text-green-600">{success}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full rounded-md bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="mt-6 text-sm text-gray-600 text-center">
  Don't have an account?{" "}
  <Link to="/register" className="text-indigo-600 hover:underline">
    Register here
  </Link>
</p>

      </form>
    </main>
  );
};

export default SignIn;
