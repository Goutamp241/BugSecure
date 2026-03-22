import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import CompanyDashboard from "../pages/CompanyDashboard";
import ResearcherDashboard from "../pages/ResearcherDashboard";
import AdminDashboard from "../pages/AdminDashboard";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/api/dashboard/me");
        if (res.data.user) {
          setUser(res.data.user);
          // Update localStorage with latest user info
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      } catch {
        // If token is invalid, redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Route to appropriate dashboard based on role
  if (user.role === "COMPANY") {
    return <CompanyDashboard user={user} />;
  } else if (user.role === "ADMIN") {
    return <AdminDashboard user={user} />;
  } else {
    return <ResearcherDashboard user={user} />;
  }
};

export default Dashboard;
