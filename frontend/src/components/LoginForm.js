import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await AuthService.login(email, password);
      if (data.token) {
        // Store user info in localStorage
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-20 md:pt-24 px-4 pb-12">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-blue-400 text-center">
          Login to BugSecure
        </h2>

        {error && (
          <p className="text-red-500 text-center font-semibold mb-4 text-sm md:text-base">{error}</p>
        )}

        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-300 text-sm md:text-base">Email</label>
          <input
            type="email"
            className="w-full p-2 md:p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-300 text-sm md:text-base">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-2 md:p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 text-sm md:text-base pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? (
                // Eye icon when password is visible
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                // EyeOff icon when password is hidden
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 md:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition shadow-lg hover:shadow-blue-500/40 text-sm md:text-base"
        >
          Login
        </button>

        <p className="text-gray-400 text-center mt-4 text-sm">
          <span
            className="text-blue-400 cursor-pointer hover:underline"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </span>
        </p>
        <p className="text-gray-400 text-center mt-6 text-sm md:text-base">
          Don't have an account?{" "}
          <span
            className="text-blue-400 cursor-pointer hover:underline"
            onClick={() => navigate("/register")}
          >
            Register here
          </span>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
