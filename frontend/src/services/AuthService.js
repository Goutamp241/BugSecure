import API from "./api";

const register = async (username, email, password, role, companyName, contractAccepted = false, contractHash = null) => {
  const response = await API.post("/api/users/register", {
    username,
    email,
    password,
    role,
    companyName: role === "COMPANY" ? companyName : null,
    contractAccepted,
    contractHash,
  });
  return response.data;
};

const forgotPassword = async (email) => {
  const response = await API.post("/api/auth/forgot-password", { email });
  return response.data;
};

const verifyOtp = async (token, otp) => {
  const response = await API.post("/api/auth/verify-otp", { token, otp });
  return response.data;
};

const resetPassword = async (token, otp, newPassword) => {
  const response = await API.post("/api/auth/reset-password", { token, otp, newPassword });
  return response.data;
};

const login = async (email, password) => {
  const response = await API.post("/api/auth/login", {
    email,
    password,
  });

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
  }

  return response.data;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export default { register, login, logout, forgotPassword, verifyOtp, resetPassword };
