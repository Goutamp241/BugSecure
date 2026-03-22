import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import AnalyticsCharts from "../components/AnalyticsCharts";

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [bugReports, setBugReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchBugReports();
    fetchAnalytics();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/api/admin/stats");
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/api/admin/users");
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchBugReports = async () => {
    try {
      const res = await API.get("/api/admin/bug-reports");
      if (res.data.success) {
        setBugReports(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching bug reports:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/api/analytics/admin");
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleUpdateBugReportStatus = async (reportId, status) => {
    try {
      const res = await API.put(`/api/bug-reports/${reportId}/status`, { status });
      if (res.data.success) {
        fetchBugReports();
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating bug report status:", error);
      alert("Failed to update bug report status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-20 md:pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-300 text-sm md:text-base">Welcome, {user.username}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 md:px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition text-sm md:text-base"
          >
            Logout
          </button>
        </div>

        {/* Analytics Charts */}
        {analytics && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Analytics</h2>
            <AnalyticsCharts analytics={analytics} userRole="ADMIN" />
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
            <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700">
              <h3 className="text-sm md:text-lg font-semibold text-blue-400 mb-2">
                Total Users
              </h3>
              <p className="text-2xl md:text-3xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700">
              <h3 className="text-sm md:text-lg font-semibold text-blue-400 mb-2">
                Companies
              </h3>
              <p className="text-2xl md:text-3xl font-bold text-white">{stats.totalCompanies}</p>
            </div>
            <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700">
              <h3 className="text-sm md:text-lg font-semibold text-blue-400 mb-2">
                Researchers
              </h3>
              <p className="text-2xl md:text-3xl font-bold text-white">{stats.totalResearchers}</p>
            </div>
            <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700">
              <h3 className="text-sm md:text-lg font-semibold text-blue-400 mb-2">
                Submissions
              </h3>
              <p className="text-2xl md:text-3xl font-bold text-white">{stats.totalSubmissions}</p>
            </div>
            <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700">
              <h3 className="text-sm md:text-lg font-semibold text-blue-400 mb-2">
                Bug Reports
              </h3>
              <p className="text-2xl md:text-3xl font-bold text-white">{stats.totalBugReports}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-blue-400">All Users</h2>
            <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="bg-gray-700 p-3 md:p-4 rounded-lg mb-2 border border-gray-600"
                >
                  <p className="text-white font-semibold text-sm md:text-base">{u.username}</p>
                  <p className="text-gray-400 text-xs md:text-sm">{u.email}</p>
                  <p className="text-blue-400 text-xs md:text-sm">{u.role}</p>
                  {u.companyName && (
                    <p className="text-gray-300 text-xs md:text-sm">{u.companyName}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-blue-400">Bug Reports</h2>
            <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
              {bugReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-gray-700 p-3 md:p-4 rounded-lg mb-2 border border-gray-600"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                    <h3 className="text-white font-semibold text-sm md:text-base">{report.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        report.status === "APPROVED"
                          ? "bg-green-600 text-white"
                          : report.status === "REJECTED"
                          ? "bg-red-600 text-white"
                          : "bg-yellow-600 text-white"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs md:text-sm mb-2">
                    By: {report.reporterName}
                  </p>
                  <p className="text-gray-400 text-xs md:text-sm mb-2">
                    Severity: {report.severity}
                  </p>
                  {report.status === "PENDING" && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        onClick={() =>
                          handleUpdateBugReportStatus(report.id, "APPROVED")
                        }
                        className="px-2 md:px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs md:text-sm font-semibold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateBugReportStatus(report.id, "REJECTED")
                        }
                        className="px-2 md:px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs md:text-sm font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

