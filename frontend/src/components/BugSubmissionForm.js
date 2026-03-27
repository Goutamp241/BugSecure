import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Toast from "./Toast";

const severityOptions = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const BugSubmissionForm = ({ submissionId, prefill }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [attachments, setAttachments] = useState([]);

  const initialData = useMemo(() => {
    return {
      title: prefill?.generatedTitle || "",
      description: prefill?.generatedDescription || "",
      stepsToReproduce: prefill?.stepsToReproduce || "",
      expectedBehavior: prefill?.expectedBehavior || "",
      actualBehavior: prefill?.actualBehavior || "",
      severity: prefill?.suggestedSeverity || "MEDIUM",
    };
  }, [prefill]);

  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const evidence = {
    targetUrl: prefill?.targetUrl || "",
    payloadUsed: prefill?.payloadUsed || "",
    requestSnapshotText: prefill?.requestSnapshotText || "",
    responseSnapshotText: prefill?.responseSnapshotText || "",
    analyzerIssues: prefill?.analyzerIssues || [],
  };

  const canSubmit = useMemo(() => {
    const titleOk = (formData.title || "").trim().length >= 3;
    const descOk = (formData.description || "").trim().length >= 10;
    const stepsOk = (formData.stepsToReproduce || "").trim().length >= 10;
    return titleOk && descOk && stepsOk && !loading;
  }, [formData, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setToast(null);

    if (!canSubmit) {
      setError("Please fill in Title, Description, and Steps to Reproduce before submitting.");
      setToast({ message: "Missing required fields.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const bugReportData = {
        submissionId: submissionId,
        title: (formData.title || "").trim(),
        description: (formData.description || "").trim(),
        stepsToReproduce: (formData.stepsToReproduce || "").trim(),
        expectedBehavior: (formData.expectedBehavior || "").trim(),
        actualBehavior: (formData.actualBehavior || "").trim(),
        severity: formData.severity,
      };

      const res = await API.post("/api/bug-reports", bugReportData);
      if (!res.data?.success) {
        throw new Error(res.data?.error || "Failed to submit bug report");
      }

      const created = res.data.data || {};
      const bugReportId = created.id;
      if (!bugReportId) {
        // Still consider the bug report submitted; attachments can't be uploaded without id.
        setToast({ message: "Bug report submitted. (Attachments skipped)", type: "success" });
        navigate("/dashboard");
        return;
      }

      // Upload attachments sequentially so we can show meaningful errors.
      for (const file of attachments) {
        const fd = new FormData();
        fd.append("file", file);
        await API.post(`/api/bug-reports/${bugReportId}/attachments`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setToast({ message: "Bug report submitted successfully.", type: "success" });
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || "Failed to submit bug report.";
      setError(msg);
      setToast({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      <div className="p-5 border-b border-gray-700 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">Submit Bug Finding</h1>
          <p className="text-gray-400 text-sm mt-1">
            Everything is auto-filled from your last testing session. Review details and submit.
          </p>
        </div>
        <div className="text-gray-400 text-xs">
          Submission: <span className="text-gray-200 font-semibold">{submissionId}</span>
        </div>
      </div>

      {error ? (
        <div className="bg-red-600/15 border border-red-500/40 text-red-100 p-3 m-5 rounded-lg text-sm">
          {error}
        </div>
      ) : null}

      {toast ? (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={3500} />
      ) : null}

      <form onSubmit={handleSubmit}>
        <div className="p-5 space-y-5">
          {/* Bug Details */}
          <div className="bg-gray-900/30 border border-gray-700 rounded-xl p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-blue-400 font-bold">🧾</div>
              <h2 className="text-lg font-bold text-white">Bug Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm mb-2 font-medium">
                  Bug Title <span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Possible XSS in /api/users"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData((p) => ({ ...p, severity: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {severityOptions.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                <p className="text-gray-400 text-xs mt-2">
                  Suggested severity based on analyzer signals (editable).
                </p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">
                  Payload Used <span className="text-gray-400 ml-1">(readonly)</span>
                </label>
                <textarea
                  value={evidence.payloadUsed}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-900/40 text-gray-200 rounded-lg border border-gray-700 focus:ring-0 text-xs font-mono h-28"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm mb-2 font-medium">
                  Description <span className="text-red-400 ml-1">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={4}
                  placeholder="Explain what vulnerability you found..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Technical Evidence */}
          <div className="bg-gray-900/30 border border-gray-700 rounded-xl p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-blue-400 font-bold">🧪</div>
              <h2 className="text-lg font-bold text-white">Technical Evidence</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">
                  Target URL <span className="text-gray-400 ml-1">(readonly)</span>
                </label>
                <input
                  value={evidence.targetUrl}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-900/40 text-gray-200 rounded-lg border border-gray-700 focus:ring-0 text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">Request Snapshot</label>
                <textarea
                  value={evidence.requestSnapshotText}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-900/40 text-gray-200 rounded-lg border border-gray-700 focus:ring-0 text-xs font-mono h-28"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm mb-2 font-medium">Response Snapshot</label>
                <textarea
                  value={evidence.responseSnapshotText}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-900/40 text-gray-200 rounded-lg border border-gray-700 focus:ring-0 text-xs font-mono h-36"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm mb-2 font-medium">
                  Steps to Reproduce <span className="text-red-400 ml-1">*</span>
                </label>
                <textarea
                  value={formData.stepsToReproduce}
                  onChange={(e) => setFormData((p) => ({ ...p, stepsToReproduce: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={5}
                  placeholder="1. Step one..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2 font-medium">Expected Behavior</label>
                    <textarea
                      value={formData.expectedBehavior}
                      onChange={(e) => setFormData((p) => ({ ...p, expectedBehavior: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-0 text-sm"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2 font-medium">Actual Behavior</label>
                    <textarea
                      value={formData.actualBehavior}
                      onChange={(e) => setFormData((p) => ({ ...p, actualBehavior: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-0 text-sm"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-gray-900/30 border border-gray-700 rounded-xl p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-blue-400 font-bold">📎</div>
              <h2 className="text-lg font-bold text-white">Attachments</h2>
            </div>

            <p className="text-gray-400 text-xs mt-0">
              Optional. Add evidence screenshots, logs, or a minimal reproduction file.
            </p>
            <input
              type="file"
              multiple
              onChange={(e) => setAttachments(Array.from(e.target.files || []))}
              className="mt-3 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-600 file:text-white"
            />
            {attachments.length > 0 ? (
              <div className="text-gray-400 text-xs mt-3">
                {attachments.length} attachment(s) selected.
              </div>
            ) : null}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {loading ? "Submitting..." : "Submit Bug Report"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-4 md:px-6 py-2 md:py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition text-sm md:text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BugSubmissionForm;

