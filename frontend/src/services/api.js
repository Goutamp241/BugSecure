import axios from "axios";

// Get API base URL from environment variable or use default
// For mobile access, set REACT_APP_API_URL=http://YOUR_IP_ADDRESS:8080
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach JWT token for all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
