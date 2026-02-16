import React, { useState } from "react";
import { API_BASE_URL } from "../config/constants";
import { Link, useNavigate } from "react-router-dom";


const companies = [
  "B100 - Wajhat Advanced Arch.",
  "B200 - Fit Interiors",
  "B300 - Engineering New Cities Co",
  "B400 - Edge Eng for specialized",
  "BH01 - SIAC H.for Build Mat&Supp",
  "C100 - SIAC Construction",
  "C101 - Qatar Branch",
  "C102 - Yemen Branch",
  "C103 - SIAC International Contra",
  "C104 - SIAC Solutions",
  "C200 - Edge Construction & Indus",
  "C300 - STEEL TEC - Enginerring",
  "C400 - Integrated Real Estate De",
  "CH01 - SIAC Holding for Eng&Cons",
  "D100 - Pyramids Development Indu",
  "D200 - Pyramids Zona Franca Egyp",
  "D300 - Polaris International Ind",
  "D400 - Bonyan For Investment & D",
  "D500 - Group Real Estate Develop",
  "D600 - Gulf of Suez Development",
  "D700 - Siac Assets & Facilities",
  "D710 - Siac Facilities Managemen",
  "D800 - SIAC Developments",
  "DH01 - SIAC H.for Develop&Manage",
  "K300 - Tripple Ten Company",
  "SIAC - SIAC H.for Fi.Investments",
];

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    companyCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
     const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/SysUser/createnewUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            companyCode: formData.companyCode,
          }),
        }
      );

      const data = await response.json();
 if (!response.ok) {
      setError(data.details || data.message || "Registration failed.");
      return;
    }

    // 🔥 If you also use isSuccess flag
    if (data.success === false) {
      setError(data.message || "Registration failed.");
      return;
    }

      setSuccess("Registration successful! You can now login.");
      setTimeout(() => navigate("/"), 1500);

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
      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiWSHo3egzpXlUV8tNe2spORVNOA-NsfJyiA&s"
      alt="Mastera Logo"
      className="h-24 w-24 object-contain"
    />
  </a>
        <h2 className="text-4xl font-medium text-gray-900">
          Mastera Register
        </h2>

        <p className="mt-4 text-base text-gray-500">
          Create your account to continue.
        </p>

        {/* Full Name */}
        <div className="mt-8">
          <label className="font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Email */}
        <div className="mt-6">
          <label className="font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Password */}
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

        {/* Company Dropdown */}
        <div className="mt-6">
          <label className="font-medium text-gray-700">
            Company
          </label>
          <select
            name="companyCode"
            value={formData.companyCode}
            onChange={handleChange}
            required
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 bg-white"
          >
            <option value="">Select Company</option>
            {companies.map((company) => {
              const code = company.split(" - ")[0]; // 🔥 Extract Code
              return (
                <option key={code} value={code}>
                  {company}
                </option>
              );
            })}
          </select>
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
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="mt-6 text-sm text-gray-600 text-center">
  Already have an account?{" "}
  <Link to="/" className="text-indigo-600 hover:underline">
    Sign in here
  </Link>
</p>

      </form>
    </main>
  );
};

export default Register;
