import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await AuthService.forgotPassword(email);
      if (result.success) {
        setToken(result.token);
        setMessage(`OTP sent! Your OTP is: ${result.otp} (Check console in production)`);
        setStep(2);
      } else {
        setError(result.error || "Failed to send OTP");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await AuthService.verifyOtp(token, otp);
      if (result.success) {
        setStep(3);
        setMessage("");
      } else {
        setError(result.error || "Invalid OTP");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const result = await AuthService.resetPassword(token, otp, newPassword);
      if (result.success) {
        alert("Password reset successfully! Please login.");
        navigate("/login");
      } else {
        setError(result.error || "Failed to reset password");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-20 md:pt-24 px-4 pb-12">
      <div className="bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-blue-400 text-center">
          Reset Password
        </h2>

        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4 text-sm">{error}</div>
        )}

        {message && (
          <div className="bg-green-600 text-white p-3 rounded mb-4 text-sm">{message}</div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestReset}>
            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-300">Email</label>
              <input
                type="email"
                className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              Send OTP
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-300">Enter OTP</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP"
                maxLength="6"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              Verify OTP
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2 mt-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition"
            >
              Back
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-300">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 pr-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-300">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
            >
              Reset Password
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-2 mt-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition"
            >
              Back
            </button>
          </form>
        )}

        <p className="text-gray-400 text-center mt-6 text-sm">
          <span
            className="text-blue-400 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;







