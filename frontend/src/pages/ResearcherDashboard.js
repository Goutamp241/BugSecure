import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import SubmissionList from "../components/SubmissionList";
import AnalyticsCharts from "../components/AnalyticsCharts";
import Wallet from "../components/Wallet";

const ResearcherDashboard = ({ user }) => {
  const [submissions, setSubmissions] = useState([]);
  const [bugReports, setBugReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [sortBy, setSortBy] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
    fetchMyBugReports();
    fetchAnalytics();
  }, [sortBy]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      let url = "/api/submissions?status=open";
      if (sortBy) {
        url += `&sort=${sortBy}`;
      }
      const res = await API.get(url);
      if (res.data.success) {
        setSubmissions(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBugReports = async () => {
    try {
      const res = await API.get("/api/bug-reports/my-reports");
      if (res.data.success) {
        setBugReports(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching bug reports:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/api/analytics/researcher");
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
              Researcher Dashboard
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

        {/* Wallet Section */}
        <div className="mb-8">
          <Wallet />
        </div>

        {/* Analytics Charts */}
        {analytics && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Analytics</h2>
            <AnalyticsCharts analytics={analytics} userRole="USER" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8 mb-8">
          <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg md:text-xl font-bold text-blue-400 mb-2 md:mb-4">
              Open Submissions
            </h3>
            <p className="text-2xl md:text-3xl font-bold text-white">{submissions.length}</p>
          </div>
          <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg md:text-xl font-bold text-blue-400 mb-2 md:mb-4">
              My Bug Reports
            </h3>
            <p className="text-2xl md:text-3xl font-bold text-white">{bugReports.length}</p>
            {analytics && analytics.totalRewardsPaid > 0 && (
              <p className="text-green-400 text-sm md:text-base mt-2">
                Total Earned: ₹{(analytics.totalRewardsPaid * 83).toFixed(2)} (≈ ${analytics.totalRewardsPaid.toFixed(2)})
              </p>
            )}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-blue-400">
              Available Programs
            </h2>
            <div className="flex items-center gap-2">
              <label className="text-gray-300 text-sm">Sort by:</label>
              <select
                className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">Default</option>
                <option value="amount">Highest Reward</option>
                <option value="date">Latest Arrivals</option>
              </select>
            </div>
          </div>
          <SubmissionList
            submissions={submissions}
            onUpdate={fetchSubmissions}
            isCompanyView={false}
          />
        </div>

        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-blue-400">My Bug Reports</h2>
          <div className="space-y-4">
            {bugReports.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No bug reports submitted yet.</p>
            ) : (
              bugReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                    <h3 className="text-lg md:text-xl font-bold text-white break-words">{report.title}</h3>
                    <span
                      className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap ${
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

                  {/* Description */}
                  <div className="mb-4">
                    <h4 className="text-blue-400 font-semibold text-sm md:text-base mb-1">Description</h4>
                    <p className="text-gray-300 text-sm md:text-base break-words whitespace-pre-wrap">{report.description}</p>
                  </div>

                  {/* Steps to Reproduce */}
                  {report.stepsToReproduce && (
                    <div className="mb-4">
                      <h4 className="text-blue-400 font-semibold text-sm md:text-base mb-1">Steps to Reproduce</h4>
                      <p className="text-gray-300 text-sm md:text-base break-words whitespace-pre-wrap">{report.stepsToReproduce}</p>
                    </div>
                  )}

                  {/* Expected Behavior */}
                  {report.expectedBehavior && (
                    <div className="mb-4">
                      <h4 className="text-blue-400 font-semibold text-sm md:text-base mb-1">Expected Behavior</h4>
                      <p className="text-gray-300 text-sm md:text-base break-words whitespace-pre-wrap">{report.expectedBehavior}</p>
                    </div>
                  )}

                  {/* Actual Behavior */}
                  {report.actualBehavior && (
                    <div className="mb-4">
                      <h4 className="text-blue-400 font-semibold text-sm md:text-base mb-1">Actual Behavior</h4>
                      <p className="text-gray-300 text-sm md:text-base break-words whitespace-pre-wrap">{report.actualBehavior}</p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-400 text-xs md:text-sm mb-1">
                      <span className="font-semibold">Submission:</span> <span className="text-white">{report.submissionTitle}</span>
                    </p>
                    <p className="text-gray-400 text-xs md:text-sm mb-1">
                      <span className="font-semibold">Severity:</span> <span className="text-white">{report.severity}</span>
                    </p>
                    <p className="text-gray-400 text-xs md:text-sm">
                      <span className="font-semibold">Reported:</span> <span className="text-white">{new Date(report.createdAt).toLocaleString()}</span>
                    </p>
                  </div>

                  {/* Reward Amount */}
                  {report.rewardAmount && (
                    <div className="mb-4 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                      <p className="text-green-400 font-bold text-sm md:text-base">
                        Reward: ₹{(report.rewardAmount * 83).toFixed(2)} INR
                      </p>
                      <p className="text-green-300 text-xs md:text-sm">
                        ≈ ${report.rewardAmount.toFixed(2)} USD
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearcherDashboard;

