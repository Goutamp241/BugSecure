import React, { useState, useEffect } from "react";
import API from "../services/api";

const BugReportForm = ({ submissionId, onBugReportSubmitted }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stepsToReproduce: "",
    expectedBehavior: "",
    actualBehavior: "",
    severity: "MEDIUM",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState(null);
  
  // Testing Zone state
  const [showTestingZone, setShowTestingZone] = useState(true);
  const [testScript, setTestScript] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testExecutionId, setTestExecutionId] = useState(null);

  useEffect(() => {
    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      const res = await API.get(`/api/submissions/${submissionId}`);
      if (res.data.success) {
        setSubmission(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching submission:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRunTest = async () => {
    if (!testScript.trim()) {
      setError("Please enter a test script");
      return;
    }

    setTestLoading(true);
    setTestOutput("");
    setError("");

    try {
      const testRequest = {
        programId: submissionId,
        testType: "SCRIPT",
        scriptContent: testScript,
      };

      const res = await API.post("/api/testing/run", testRequest);
      if (res.data.success) {
        const executionId = res.data.data.executionId;
        setTestExecutionId(executionId);
        
        // Poll for results
        const pollInterval = setInterval(async () => {
          try {
            const resultRes = await API.get(`/api/testing/result/${executionId}`);
            if (resultRes.data.success) {
              const result = resultRes.data.data;
              setTestOutput(result.output || result.errorLog || "");
              
              if (result.status === "COMPLETED" || result.status === "FAILED") {
                clearInterval(pollInterval);
                setTestLoading(false);
                setTestExecutionId(null);
              }
            }
          } catch (err) {
            clearInterval(pollInterval);
            setTestLoading(false);
            setError("Failed to fetch test results");
          }
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to run test");
      setTestLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const bugReportData = {
        ...formData,
        submissionId: submissionId,
      };

      const res = await API.post("/api/bug-reports", bugReportData);
      if (res.data.success) {
        onBugReportSubmitted();
      } else {
        setError(res.data.error || "Failed to submit bug report");
      }
    } catch (err) {
      setError("Failed to submit bug report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-blue-400">
        Submit Bug Report
      </h2>
      {error && (
        <div className="bg-red-600 text-white p-3 rounded mb-4 text-sm md:text-base">{error}</div>
      )}

      {/* Testing Zone Section */}
      {showTestingZone && submission && (
        <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-600">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-green-400">Testing Zone</h3>
            <button
              type="button"
              onClick={() => setShowTestingZone(!showTestingZone)}
              className="text-gray-400 hover:text-white text-sm"
            >
              {showTestingZone ? "Hide" : "Show"}
            </button>
          </div>
          
          {/* Target URL (read-only) */}
          {submission.website && (
            <div className="mb-4">
              <label className="block mb-2 text-gray-300 text-sm">Target URL</label>
              <input
                type="text"
                value={submission.website}
                readOnly
                className="w-full p-2 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 text-sm"
              />
            </div>
          )}

          {/* Test Script Input */}
          <div className="mb-4">
            <label className="block mb-2 text-gray-300 text-sm">
              Test Script / Command
            </label>
            <textarea
              value={testScript}
              onChange={(e) => setTestScript(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 text-white font-mono text-sm border border-gray-700 focus:ring-2 focus:ring-green-500"
              rows="6"
              placeholder="Enter your test script, command, or payload here..."
            />
          </div>

          {/* Run Test Button */}
          <button
            type="button"
            onClick={handleRunTest}
            disabled={testLoading || !testScript.trim()}
            className="mb-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {testLoading ? "Running Test..." : "Run Test"}
          </button>

          {/* Test Output Console */}
          {testOutput && (
            <div className="mt-4 p-3 bg-black rounded border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-green-400 font-semibold text-sm">Test Output</h4>
                <button
                  type="button"
                  onClick={() => setTestOutput("")}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  Clear
                </button>
              </div>
              <div className="font-mono text-xs text-green-400 whitespace-pre-wrap max-h-64 overflow-y-auto">
                {testOutput}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bug Report Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-300 text-sm md:text-base">
            Bug Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 md:p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-300 text-sm md:text-base">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 md:p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            rows="3"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-300 text-sm md:text-base">
            Steps to Reproduce
          </label>
          <textarea
            name="stepsToReproduce"
            value={formData.stepsToReproduce}
            onChange={handleChange}
            className="w-full p-2 md:p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            rows="4"
            placeholder="1. Step one..."
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-300 text-sm md:text-base">
            Expected Behavior
          </label>
          <textarea
            name="expectedBehavior"
            value={formData.expectedBehavior}
            onChange={handleChange}
            className="w-full p-2 md:p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            rows="3"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-300 text-sm md:text-base">
            Actual Behavior
          </label>
          <textarea
            name="actualBehavior"
            value={formData.actualBehavior}
            onChange={handleChange}
            className="w-full p-2 md:p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            rows="3"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-300 text-sm md:text-base">
            Severity
          </label>
          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            className="w-full p-2 md:p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            required
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition disabled:opacity-50 text-sm md:text-base"
          >
            {loading ? "Submitting..." : "Submit Bug Report"}
          </button>
          <button
            type="button"
            onClick={onBugReportSubmitted}
            className="px-4 md:px-6 py-2 md:py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition text-sm md:text-base"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BugReportForm;
