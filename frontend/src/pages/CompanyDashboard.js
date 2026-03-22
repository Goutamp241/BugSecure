import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import CodeSubmissionForm from "../components/CodeSubmissionForm";
import SubmissionList from "../components/SubmissionList";
import AnalyticsCharts from "../components/AnalyticsCharts";
import Wallet from "../components/Wallet";
import Toast from "../components/Toast";

const CompanyDashboard = ({ user }) => {
  const [submissions, setSubmissions] = useState([]);
  const [bugReports, setBugReports] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
    fetchAnalytics();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await API.get("/api/submissions/my-submissions");
      if (res.data.success) {
        setSubmissions(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBugReports = async (submissionId) => {
    try {
      const res = await API.get(`/api/bug-reports/submission/${submissionId}`);
      if (res.data.success) {
        setBugReports(res.data.data);
        setSelectedSubmission(submissionId);
      }
    } catch (error) {
      console.error("Error fetching bug reports:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/api/analytics/company");
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const handleUpdateBugReportStatus = async (reportId, status) => {
    try {
      const res = await API.put(`/api/bug-reports/${reportId}/status`, { status });
      if (res.data.success) {
        if (status === "APPROVED") {
          // Wallet transfer is automatically handled by backend
          setToast({
            message: "Reward transferred successfully via wallet!",
            type: "success"
          });
        } else if (status === "REJECTED") {
          setToast({
            message: "Bug report rejected.",
            type: "info"
          });
        }
        if (selectedSubmission) {
          fetchBugReports(selectedSubmission);
        }
        fetchAnalytics();
        // Refresh wallet balance
        window.dispatchEvent(new Event('wallet-update'));
      }
    } catch (error) {
      console.error("Error updating bug report status:", error);
      const errorMsg = error.response?.data?.error || "Failed to update bug report status";
      if (errorMsg.includes("Insufficient balance")) {
        setToast({
          message: "Insufficient wallet balance. Please add funds to your wallet before approving bug reports.",
          type: "error"
        });
      } else {
        setToast({
          message: errorMsg,
          type: "error"
        });
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSubmissionCreated = () => {
    setShowForm(false);
    fetchSubmissions();
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
              Company Dashboard
            </h1>
            <p className="text-gray-300 text-sm md:text-base">
              Welcome, {user.companyName || user.username}!
            </p>
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
            <AnalyticsCharts analytics={analytics} userRole="COMPANY" />
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-6">
              <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700">
                <h3 className="text-sm md:text-lg font-semibold text-blue-400 mb-2">Total Submissions</h3>
                <p className="text-2xl md:text-3xl font-bold text-white">{analytics.totalSubmissions || 0}</p>
              </div>
              <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700">
                <h3 className="text-sm md:text-lg font-semibold text-blue-400 mb-2">Open</h3>
                <p className="text-2xl md:text-3xl font-bold text-white">{analytics.openSubmissions || 0}</p>
              </div>
              <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700">
                <h3 className="text-sm md:text-lg font-semibold text-blue-400 mb-2">Bug Reports</h3>
                <p className="text-2xl md:text-3xl font-bold text-white">{analytics.totalBugReports || 0}</p>
              </div>
              <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700">
                <h3 className="text-sm md:text-lg font-semibold text-blue-400 mb-2">Total Paid</h3>
                <p className="text-2xl md:text-3xl font-bold text-white">${(analytics.totalRewardsPaid || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full md:w-auto px-4 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition shadow-lg text-sm md:text-base"
          >
            {showForm ? "Cancel" : "+ Create New Submission"}
          </button>
        </div>

        {showForm && (
          <div className="mb-8">
            <CodeSubmissionForm onSubmissionCreated={handleSubmissionCreated} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-blue-400">My Submissions</h2>
            <SubmissionList
              submissions={submissions}
              onUpdate={fetchSubmissions}
              onViewBugReports={fetchBugReports}
              isCompanyView={true}
            />
          </div>

          {selectedSubmission && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-blue-400">Bug Reports</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {bugReports.length === 0 ? (
                  <p className="text-gray-400">No bug reports for this submission.</p>
                ) : (
                  bugReports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
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
                          <span className="font-semibold">Severity:</span> <span className="text-white">{report.severity}</span>
                        </p>
                        <p className="text-gray-400 text-xs md:text-sm mb-1">
                          <span className="font-semibold">Reporter:</span> <span className="text-white">{report.reporterName}</span>
                        </p>
                        <p className="text-gray-400 text-xs md:text-sm">
                          <span className="font-semibold">Reported:</span> <span className="text-white">{new Date(report.createdAt).toLocaleString()}</span>
                        </p>
                      </div>

                      {/* Reward Amount */}
                      {report.rewardAmount && (
                        <div className="mb-4 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                          <p className="text-green-400 font-bold text-sm md:text-base">
                            Reward: ${report.rewardAmount.toFixed(2)} USD
                          </p>
                          <p className="text-green-300 text-xs md:text-sm">
                            ≈ ₹{(report.rewardAmount * 83).toFixed(2)} INR
                          </p>
                        </div>
                      )}
                      {report.status === "PENDING" && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          <button
                            onClick={() =>
                              handleUpdateBugReportStatus(report.id, "APPROVED")
                            }
                            className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition text-xs md:text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateBugReportStatus(report.id, "REJECTED")
                            }
                            className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition text-xs md:text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {report.status === "APPROVED" && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={async () => {
                              try {
                                const res = await API.post("/api/payments", {
                                  bugReportId: report.id,
                                  paymentMethod: "BANK_TRANSFER",
                                });
                                if (res.data.success) {
                                  alert("Payment created successfully! Check Payments page.");
                                  fetchBugReports(selectedSubmission);
                                }
                              } catch (error) {
                                if (error.response?.data?.error?.includes("already exists")) {
                                  alert("Payment already created for this bug report.");
                                } else {
                                  alert(error.response?.data?.error || "Failed to create payment");
                                }
                              }
                            }}
                            className="px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition text-xs md:text-sm"
                          >
                            Create Payment
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;

