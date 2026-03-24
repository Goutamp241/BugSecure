import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import BugReportForm from "./BugReportForm";
import { convertUSDToINR } from "../utils/currency";

const SubmissionList = ({ submissions, onUpdate, onViewBugReports, isCompanyView }) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showBugReportForm, setShowBugReportForm] = useState(false);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const canPreviewSubmission =
    currentUser?.role === "ADMIN" ||
    currentUser?.role === "COMPANY" ||
    (currentUser?.role === "USER" && currentUser?.contractAccepted);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [previewMimeType, setPreviewMimeType] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this submission?")) {
      try {
        const res = await API.delete(`/api/submissions/${id}`);
        if (res.data.success) {
          onUpdate();
        }
      } catch (error) {
        console.error("Error deleting submission:", error);
        alert("Failed to delete submission");
      }
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await API.put(`/api/submissions/${id}/status`, { status });
      if (res.data.success) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating submission:", error);
      alert("Failed to update submission status");
    }
  };

  const handleSubmitBugReport = (submissionId) => {
    const submission = submissions.find((s) => s.id === submissionId);
    setSelectedSubmission(submission);
    setShowBugReportForm(true);
  };

  const handleBugReportSubmitted = () => {
    setShowBugReportForm(false);
    setSelectedSubmission(null);
    navigate("/dashboard");
  };

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

  const handlePreviewCode = async (submissionId) => {
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError("");
    setPreviewText("");
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
    }
    setPreviewBlobUrl(null);
    setPreviewMimeType("");
    setPreviewTitle("Code Preview");

    try {
      const res = await API.get(`/api/submissions/${submissionId}/code/preview`, {
        params: { limit: 60000 },
        responseType: "text",
      });
      setPreviewText(res.data || "");
    } catch (e) {
      setPreviewError(e.response?.data?.error || "Failed to preview code");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePreviewFile = async (file) => {
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError("");
    setPreviewText("");
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
    }
    setPreviewBlobUrl(null);
    setPreviewMimeType("");
    setPreviewTitle(file?.name || "File Preview");

    try {
      const mimeType = file?.mimeType || "";
      const isTextLike = (mimeType && mimeType.startsWith("text/")) || file?.type === "CODE";

      if (isTextLike) {
        const res = await API.get(`/api/submissions/files/${file.id}/preview`, {
          params: { limit: 60000 },
          responseType: "text",
        });
        setPreviewText(res.data || "");
      } else {
        const res = await API.get(`/api/submissions/files/${file.id}/preview`, {
          responseType: "blob",
        });
        const blob = res.data;
        const url = URL.createObjectURL(blob);
        setPreviewBlobUrl(url);
        setPreviewMimeType(blob?.type || mimeType || "application/octet-stream");
      }
    } catch (e) {
      setPreviewError(e.response?.data?.error || "Failed to preview file");
    } finally {
      setPreviewLoading(false);
    }
  };

  if (submissions.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <p className="text-gray-400 text-center">
          No submissions found.
        </p>
      </div>
    );
  }

  return (
    <div>
      {showBugReportForm && selectedSubmission && (
        <div className="mb-6">
          <BugReportForm
            submissionId={selectedSubmission.id}
            onBugReportSubmitted={handleBugReportSubmitted}
          />
        </div>
      )}

      <div className="space-y-4">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition"
          >
            <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 break-words">
                  {submission.title}
                </h3>
                <p className="text-gray-300 mb-2 text-sm md:text-base break-words">{submission.description}</p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-xs md:text-sm text-gray-400 mb-2">
                  <span className="break-words">File: {submission.fileName || "N/A"}</span>
                  <span className="break-words">
                    Reward: ₹{convertUSDToINR(submission.rewardAmount || 0).toFixed(2)} INR (≈ ${submission.rewardAmount?.toFixed(2) || "0.00"} USD)
                  </span>
                  <span>Created: {new Date(submission.createdAt).toLocaleDateString()}</span>
                </div>
                {!isCompanyView && (
                  <>
                    <p className="text-blue-400 text-xs md:text-sm break-words">
                      Company: {submission.companyName}
                    </p>
                    {submission.website && (
                      <div className="mt-2">
                        <a
                          href={submission.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-xs md:text-sm font-semibold transition underline"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          Visit Website for Testing
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
              <span
                className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap ${
                  submission.status === "OPEN"
                    ? "bg-green-600 text-white"
                    : submission.status === "CLOSED"
                    ? "bg-gray-600 text-white"
                    : "bg-yellow-600 text-white"
                }`}
              >
                {submission.status}
              </span>
            </div>

            {canPreviewSubmission && (
              <div className="mb-4 flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handlePreviewCode(submission.id)}
                    className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition text-xs md:text-sm"
                  >
                    Preview Code
                  </button>
                </div>

                {submission.files && submission.files.length > 0 && (
                  <details>
                    <summary className="cursor-pointer text-blue-400 hover:text-blue-300 font-semibold mb-1 text-sm md:text-base">
                      Attachments ({submission.files.length})
                    </summary>
                    <div className="space-y-2 mt-2">
                      {submission.files.map((file) => (
                        <div
                          key={file.id}
                          className="bg-gray-900/40 border border-gray-700 rounded-lg p-3 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate text-sm md:text-base">
                              {file.name}
                            </p>
                            <p className="text-gray-400 text-xs md:text-sm">
                              {file.type} • {file.mimeType || "unknown"} • {file.size || 0} bytes
                            </p>
                          </div>
                          <button
                            onClick={() => handlePreviewFile(file)}
                            className="shrink-0 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-xs md:text-sm transition"
                          >
                            Preview
                          </button>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {isCompanyView ? (
                <>
                  <button
                    onClick={() => onViewBugReports && onViewBugReports(submission.id)}
                    className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition text-xs md:text-sm"
                  >
                    View Bug Reports
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(submission.id, "CLOSED")}
                    className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition text-xs md:text-sm disabled:opacity-50"
                    disabled={submission.status === "CLOSED"}
                  >
                    Close Submission
                  </button>
                  <button
                    onClick={() => handleDelete(submission.id)}
                    className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition text-xs md:text-sm"
                  >
                    Delete
                  </button>
                </>
              ) : (
                submission.status === "OPEN" && (
                  <button
                    onClick={() => handleSubmitBugReport(submission.id)}
                    className="w-full sm:w-auto px-4 md:px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition text-sm md:text-base"
                  >
                    Submit Bug Report
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>

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
              <div>
                {previewMimeType && previewMimeType.startsWith("image/") ? (
                  <img
                    src={previewBlobUrl}
                    alt="preview"
                    className="max-w-full rounded border border-gray-700"
                  />
                ) : (
                  <iframe
                    src={previewBlobUrl}
                    title="preview"
                    className="w-full h-[70vh] rounded border border-gray-700 bg-black"
                  />
                )}
              </div>
            ) : (
              <div className="text-gray-300 text-sm md:text-base">No preview available.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionList;

