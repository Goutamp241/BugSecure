import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import BugReportForm from "./BugReportForm";

const SubmissionList = ({ submissions, onUpdate, onViewBugReports, isCompanyView }) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showBugReportForm, setShowBugReportForm] = useState(false);
  const navigate = useNavigate();

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
                  <span className="break-words">Reward: ₹{(((submission.rewardAmount || 0) * 83)).toFixed(2)} INR (≈ ${submission.rewardAmount?.toFixed(2) || "0.00"} USD)</span>
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

            {submission.codeContent && (
              <div className="mb-4">
                <details>
                  <summary className="cursor-pointer text-blue-400 hover:text-blue-300 font-semibold mb-2 text-sm md:text-base">
                    View Code
                  </summary>
                  <pre className="bg-gray-900 p-2 md:p-4 rounded-lg overflow-x-auto text-xs md:text-sm text-gray-300">
                    {submission.codeContent.substring(0, 500)}
                    {submission.codeContent.length > 500 && "..."}
                  </pre>
                </details>
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
    </div>
  );
};

export default SubmissionList;

