import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import SubmissionList from "../components/SubmissionList";
import AnalyticsCharts from "../components/AnalyticsCharts";
import Wallet from "../components/Wallet";
import { convertUSDToINR } from "../utils/currency";
import NotificationsWidget from "../components/NotificationsWidget";

const ResearcherDashboard = ({ user }) => {
  const [submissions, setSubmissions] = useState([]);
  const [bugReports, setBugReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsRange, setAnalyticsRange] = useState("monthly");
  const [sortBy, setSortBy] = useState("");
  const [contractAccepted, setContractAccepted] = useState(!!user?.contractAccepted);
  const [contractAgreeChecked, setContractAgreeChecked] = useState(false);
  const [contractAcceptLoading, setContractAcceptLoading] = useState(false);
  const [bugFilters, setBugFilters] = useState({
    q: "",
    status: "",
    severity: "",
  });
  const [bugMeta, setBugMeta] = useState(null);
  const [bugPage, setBugPage] = useState(0);
  const [bugPageSize, setBugPageSize] = useState(10);
  const [bugLoading, setBugLoading] = useState(false);
  const navigate = useNavigate();

  const [attachmentsByReportId, setAttachmentsByReportId] = useState({});
  const [uploadFilesByReportId, setUploadFilesByReportId] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [previewMimeType, setPreviewMimeType] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    setContractAccepted(!!user?.contractAccepted);
  }, [user?.contractAccepted]);

  useEffect(() => {
    fetchSubmissions();
  }, [sortBy]);

  useEffect(() => {
    fetchMyBugReports();
  }, [bugPage, bugPageSize]);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsRange]);

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

  const fetchMyBugReports = async (overrides = {}) => {
    const pageToUse = overrides.page != null ? overrides.page : bugPage;
    const pageSizeToUse =
      overrides.pageSize != null ? overrides.pageSize : bugPageSize;
    try {
      setBugLoading(true);
      const res = await API.get("/api/bug-reports/my-reports", {
        params: {
          q: bugFilters.q || undefined,
          status: bugFilters.status || undefined,
          severity: bugFilters.severity || undefined,
          page: pageToUse,
          pageSize: pageSizeToUse,
        },
      });
      if (res.data.success) {
        setBugReports(res.data.data);
        setBugMeta(res.data.meta || null);
      }
    } catch (error) {
      console.error("Error fetching bug reports:", error);
    } finally {
      setBugLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await API.get(`/api/analytics/researcher?range=${analyticsRange}`);
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const loadAttachmentsForReport = async (reportId) => {
    try {
      const res = await API.get(`/api/bug-reports/${reportId}/attachments`);
      if (res.data.success) {
        setAttachmentsByReportId((prev) => ({ ...prev, [reportId]: res.data.data || [] }));
      }
    } catch (e) {
      console.error("Failed to load attachments:", e);
    }
  };

  const handleAcceptSmartContract = async () => {
    if (!contractAgreeChecked) return;
    setContractAcceptLoading(true);

    try {
      const contractText =
        "Terms and Conditions for Bug Bounty Researchers: " +
        "You agree to conduct security testing only on authorized targets and within the scope defined by the company. " +
        "You will not access, modify, or delete data beyond what is necessary to demonstrate the vulnerability. " +
        "You will not disclose vulnerabilities publicly before the company has had reasonable time to fix them. " +
        "You will not perform any denial of service attacks or actions that could harm the company's infrastructure. " +
        "You agree to comply with all applicable laws and regulations.";

      const res = await API.post("/api/contract/accept", { contractText });
      if (!res.data?.success) {
        throw new Error(res.data?.error || "Failed to accept contract");
      }

      // Update localStorage + local state so SubmissionList re-renders and reveals Preview/Sandbox.
      const updatedUser = {
        ...(JSON.parse(localStorage.getItem("user") || "{}") || {}),
        contractAccepted: true,
        contractHash: res.data.contractHash,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setContractAccepted(true);
      setContractAgreeChecked(false);
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || "Failed to accept contract");
    } finally {
      setContractAcceptLoading(false);
    }
  };

  useEffect(() => {
    if (!bugReports || bugReports.length === 0) return;
    bugReports.forEach((r) => loadAttachmentsForReport(r.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bugReports]);

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewTitle("");
    setPreviewText("");
    setPreviewError("");
    setPreviewLoading(false);
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
    }
    setPreviewBlobUrl(null);
    setPreviewMimeType("");
  };

  const openAttachmentPreview = async (reportId, attachment) => {
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError("");
    setPreviewText("");
    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    setPreviewBlobUrl(null);
    setPreviewMimeType("");
    setPreviewTitle(attachment?.name || "Attachment Preview");

    try {
      const mimeType = attachment?.mimeType || "";
      const treatAsText = mimeType.startsWith("text/") || attachment?.type === "CODE";

      if (treatAsText) {
        const res = await API.get(
          `/api/bug-reports/${reportId}/attachments/${attachment.id}/preview`,
          {
            params: { limit: 60000 },
            responseType: "text",
          }
        );
        setPreviewText(res.data || "");
      } else {
        const res = await API.get(
          `/api/bug-reports/${reportId}/attachments/${attachment.id}/preview`,
          {
            params: { limit: 60000 },
            responseType: "blob",
          }
        );
        const blob = res.data;
        const url = URL.createObjectURL(blob);
        setPreviewBlobUrl(url);
        setPreviewMimeType(blob?.type || mimeType || "application/octet-stream");
      }
    } catch (e) {
      setPreviewError(e.response?.data?.error || "Failed to preview attachment");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleUploadAttachment = async (reportId) => {
    const file = uploadFilesByReportId[reportId];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await API.post(
        `/api/bug-reports/${reportId}/attachments`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        // Clear local selection and refresh attachment metadata.
        setUploadFilesByReportId((prev) => ({ ...prev, [reportId]: null }));
        await loadAttachmentsForReport(reportId);
      } else {
        alert(res.data.error || "Failed to upload attachment");
      }
    } catch (e) {
      alert(e.response?.data?.error || "Failed to upload attachment");
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

        <NotificationsWidget limit={5} />

        {/* Analytics Charts */}
        {analytics && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Analytics</h2>
            <AnalyticsCharts
              analytics={analytics}
              userRole="USER"
              range={analyticsRange}
              onRangeChange={setAnalyticsRange}
            />
          </div>
        )}

        {!contractAccepted && (
          <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-yellow-500/50">
            <h2 className="text-xl font-bold text-yellow-300 mb-2">Smart Contract Required</h2>
            <p className="text-gray-300 text-sm mb-3">
              Accept the contract to unlock code preview and sandbox testing.
            </p>
            <label className="flex items-center gap-2 text-gray-300 text-sm mb-4">
              <input
                type="checkbox"
                checked={contractAgreeChecked}
                onChange={(e) => setContractAgreeChecked(e.target.checked)}
                className="w-4 h-4"
              />
              I have read and agree to the terms and conditions.
            </label>
            <button
              type="button"
              onClick={handleAcceptSmartContract}
              disabled={!contractAgreeChecked || contractAcceptLoading}
              className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {contractAcceptLoading ? "Accepting..." : "Accept Contract"}
            </button>
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
                Total Earned: ₹{convertUSDToINR(analytics.totalRewardsPaid).toFixed(2)} (≈ ${analytics.totalRewardsPaid.toFixed(2)})
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
          {/* Search / Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-gray-300 text-xs md:text-sm mb-1">
                Search (title/desc)
              </label>
              <input
                value={bugFilters.q}
                onChange={(e) =>
                  setBugFilters((prev) => ({ ...prev, q: e.target.value }))
                }
                placeholder="e.g. XSS"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-xs md:text-sm mb-1">
                Status
              </label>
              <select
                value={bugFilters.status}
                onChange={(e) =>
                  setBugFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="FIXED">FIXED</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-xs md:text-sm mb-1">
                Severity
              </label>
              <select
                value={bugFilters.severity}
                onChange={(e) =>
                  setBugFilters((prev) => ({ ...prev, severity: e.target.value }))
                }
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => {
                setBugPage(0);
                fetchMyBugReports({ page: 0 });
              }}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition text-sm"
              disabled={bugLoading}
            >
              {bugLoading ? "Searching..." : "Apply"}
            </button>
            <button
              onClick={() => {
                setBugFilters({ q: "", status: "", severity: "" });
                setBugPage(0);
                fetchMyBugReports({ page: 0 });
              }}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition text-sm"
              disabled={bugLoading}
            >
              Clear
            </button>

            <div className="ml-auto flex items-center gap-2">
              <label className="text-gray-300 text-xs md:text-sm">Page size</label>
              <select
                value={bugPageSize}
                onChange={(e) => {
                  const nextSize = parseInt(e.target.value, 10);
                  setBugPageSize(nextSize);
                  setBugPage(0);
                }}
                className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={bugLoading}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {bugLoading ? (
            <p className="text-gray-300 text-sm">Loading...</p>
          ) : bugReports.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No bug reports submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {bugReports.map((report) => (
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
                        Reward: ₹{convertUSDToINR(report.rewardAmount).toFixed(2)} INR
                      </p>
                      <p className="text-green-300 text-xs md:text-sm">
                        ≈ ${report.rewardAmount.toFixed(2)} USD
                      </p>
                    </div>
                  )}

                  {/* Attachments */}
                  {attachmentsByReportId[report.id] && (
                    <div className="mb-4">
                      <div className="text-blue-400 font-semibold text-sm md:text-base mb-2">
                        Attachments ({attachmentsByReportId[report.id].length})
                      </div>
                      {attachmentsByReportId[report.id].length > 0 && (
                        <div className="flex flex-col gap-2">
                          {attachmentsByReportId[report.id].map((att) => (
                            <button
                              key={att.id}
                              onClick={() => openAttachmentPreview(report.id, att)}
                              className="px-3 md:px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition text-xs md:text-sm text-left"
                            >
                              {att.name || "Attachment"}{" "}
                              <span className="text-gray-400 font-normal">
                                ({Math.round((att.size || 0) / 1024)} KB)
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Upload Attachment (reporter only) */}
                  {String(report.reporterId) === String(user?.id) && (
                    <div className="mb-4 p-3 bg-gray-700/40 border border-gray-600 rounded-lg">
                      <div className="text-blue-400 font-semibold text-sm md:text-base mb-2">
                        Add attachment
                      </div>
                      <input
                        type="file"
                        className="w-full text-sm md:text-base text-gray-300"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setUploadFilesByReportId((prev) => ({ ...prev, [report.id]: f }));
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleUploadAttachment(report.id)}
                        disabled={!uploadFilesByReportId[report.id]}
                        className="mt-3 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Upload
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-3 gap-3">
            <button
              onClick={() => {
                if (bugPage > 0) {
                  const nextPage = bugPage - 1;
                  setBugPage(nextPage);
                }
              }}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={bugPage <= 0 || bugLoading}
            >
              Prev
            </button>
            <div className="text-gray-300 text-sm whitespace-nowrap">
              Page {bugMeta?.page ?? 0} / {bugMeta?.totalPages ?? 1} (Total: {bugMeta?.total ?? 0})
            </div>
            <button
              onClick={() => {
                const totalPages = bugMeta?.totalPages ?? 1;
                if (bugPage < totalPages - 1) {
                  const nextPage = bugPage + 1;
                  setBugPage(nextPage);
                }
              }}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={(bugMeta?.totalPages ?? 1) <= bugPage + 1 || bugLoading}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-blue-400">{previewTitle}</h3>
                {previewError && <p className="text-red-400 text-sm mt-2">{previewError}</p>}
              </div>
              <button
                onClick={closePreview}
                className="text-gray-300 hover:text-white text-sm md:text-base"
              >
                Close
              </button>
            </div>

            {previewLoading ? (
              <div className="text-gray-300 text-sm md:text-base">Loading preview...</div>
            ) : previewText ? (
              <pre className="bg-black rounded border border-gray-700 p-3 font-mono text-xs md:text-sm text-green-400 whitespace-pre-wrap overflow-x-auto">
                {previewText}
              </pre>
            ) : previewBlobUrl ? (
              previewMimeType && previewMimeType.startsWith("image/") ? (
                <img
                  src={previewBlobUrl}
                  alt="preview"
                  className="max-w-full rounded border border-gray-700"
                />
              ) : (
                <iframe
                  src={previewBlobUrl}
                  title="attachment-preview"
                  className="w-full h-[70vh] rounded border border-gray-700 bg-black"
                />
              )
            ) : (
              <div className="text-gray-300 text-sm md:text-base">No preview available.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearcherDashboard;

