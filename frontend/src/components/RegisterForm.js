import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService";

const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("USER");
  const [companyName, setCompanyName] = useState("");
  const [showContract, setShowContract] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Show contract for hackers/researchers
    if (role === "USER" && !contractAccepted) {
      setShowContract(true);
      return;
    }

    try {
      const contractHash = contractAccepted ? 
        `CONTRACT_${Date.now()}_${email}` : null;
      
      const result = await AuthService.register(
        username, 
        email, 
        password, 
        role, 
        companyName,
        contractAccepted,
        contractHash
      );
      if (result.success) {
        alert("Registration successful! Please login now.");
        navigate("/login");
      } else {
        setError(result.message || "Registration failed. Try again.");
      }
    } catch (err) {
      setError("Registration failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-20 md:pt-24 px-4 pb-12">
      <form
        onSubmit={handleRegister}
        className="bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-blue-400 text-center">
          Create Your Account
        </h2>

        {error && (
          <p className="text-red-500 text-center font-semibold mb-4 text-sm md:text-base">{error}</p>
        )}

        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-300 text-sm md:text-base">Username</label>
          <input
            type="text"
            className="w-full p-2 md:p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

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

        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-300 text-sm md:text-base">Role</label>
          <select
            className="w-full p-2 md:p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="USER">Researcher/User</option>
            <option value="COMPANY">Company</option>
          </select>
        </div>

        {role === "COMPANY" && (
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-300 text-sm md:text-base">Company Name</label>
            <input
              type="text"
              className="w-full p-2 md:p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
        )}

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
          Register
        </button>

        <p className="text-gray-400 text-center mt-6 text-sm md:text-base">
          Already have an account?{" "}
          <span
            className="text-blue-400 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </p>
      </form>

      {/* Smart Contract Modal */}
      {showContract && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">Smart Contract Agreement</h3>
            <div className="text-gray-300 mb-6 space-y-4 text-sm">
              <p className="font-semibold text-white">Terms and Conditions for Bug Bounty Researchers:</p>
              <p>1. You agree to conduct security testing only on authorized targets and within the scope defined by the company.</p>
              <p>2. You will not access, modify, or delete data beyond what is necessary to demonstrate the vulnerability.</p>
              <p>3. You will not disclose vulnerabilities publicly before the company has had reasonable time to fix them.</p>
              <p>4. You will not perform any denial of service attacks or actions that could harm the company's infrastructure.</p>
              <p>5. You understand that rewards are subject to company approval and may vary based on severity and quality of the report.</p>
              <p>6. You agree to comply with all applicable laws and regulations.</p>
              <p>7. The company reserves the right to reject any submission that does not meet their criteria.</p>
              <p>8. All intellectual property rights in your submissions remain with you, but you grant the company a license to use the information to fix vulnerabilities.</p>
            </div>
            <div className="mb-6">
              <label className="flex items-center text-gray-300">
                <input
                  type="checkbox"
                  checked={contractAccepted}
                  onChange={(e) => setContractAccepted(e.target.checked)}
                  className="mr-2 w-4 h-4"
                />
                <span>I have read and agree to the terms and conditions</span>
              </label>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  if (contractAccepted) {
                    setShowContract(false);
                    handleRegister({ preventDefault: () => {} });
                  }
                }}
                disabled={!contractAccepted}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
              >
                Sign and Continue
              </button>
              <button
                onClick={() => {
                  setShowContract(false);
                  setContractAccepted(false);
                }}
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
