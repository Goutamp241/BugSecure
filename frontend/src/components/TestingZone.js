import React, { useState, useEffect } from "react";
import API from "../services/api";

const TestingZone = () => {
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRunTest, setShowRunTest] = useState(false);
  const [testType, setTestType] = useState("COMMAND");
  const [scriptContent, setScriptContent] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submissionId, setSubmissionId] = useState("");
  const [currentExecutionId, setCurrentExecutionId] = useState(null);
  const [testOutput, setTestOutput] = useState("");
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    fetchTestHistory();
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  const fetchTestHistory = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/testing/history");
      if (res.data.success) {
        setTestHistory(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch test history");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setScriptContent(event.target.result);
        // Determine file type
        const extension = file.name.split('.').pop().toLowerCase();
        setTestType(extension === 'js' ? 'FILE_UPLOAD' : 
                   extension === 'py' ? 'FILE_UPLOAD' : 
                   'FILE_UPLOAD');
      };
      reader.readAsText(file);
    }
  };

  const handleRunTest = async (e) => {
    e.preventDefault();
    setError("");

    if (!scriptContent.trim() && !uploadedFile) {
      setError("Please provide a script or upload a file");
      return;
    }

    try {
      const testRequest = {
        testType: uploadedFile ? "FILE_UPLOAD" : testType,
        scriptContent: scriptContent,
        fileName: uploadedFile ? uploadedFile.name : null,
        fileType: uploadedFile ? uploadedFile.name.split('.').pop().toUpperCase() : null,
        submissionId: submissionId || null,
      };

      const res = await API.post("/api/testing/run", testRequest);
      if (res.data.success) {
        const executionId = res.data.data.executionId;
        setCurrentExecutionId(executionId);
        setShowRunTest(false);
        setScriptContent("");
        setUploadedFile(null);
        setSubmissionId("");
        
        // Poll for results
        const interval = setInterval(async () => {
          try {
            const resultRes = await API.get(`/api/testing/result/${executionId}`);
            if (resultRes.data.success) {
              const result = resultRes.data.data;
              setTestOutput(result.output || "");
              
              if (result.status === "COMPLETED" || result.status === "FAILED") {
                clearInterval(interval);
                setPollingInterval(null);
                setCurrentExecutionId(null);
                fetchTestHistory();
              }
            }
          } catch (err) {
            console.error("Error polling test result:", err);
          }
        }, 2000); // Poll every 2 seconds
        
        setPollingInterval(interval);
        alert("Test execution started! Results will appear shortly.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to run test");
    }
  };

  const viewTestResult = async (executionId) => {
    try {
      const res = await API.get(`/api/testing/result/${executionId}`);
      if (res.data.success) {
        const result = res.data.data;
        setTestOutput(result.output || result.errorLog || "No output available");
        setCurrentExecutionId(executionId);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch test result");
    }
  };

  if (loading) {
    return <div className="text-white p-4">Loading testing zone...</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-400">Testing Zone</h2>
        <button
          onClick={() => {
            setShowRunTest(true);
            setError("");
            setTestOutput("");
            setCurrentExecutionId(null);
          }}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
        >
          Run Test
        </button>
      </div>

      {error && (
        <div className="bg-red-600 text-white p-3 rounded mb-4">{error}</div>
      )}

      {/* Run Test Modal */}
      {showRunTest && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-blue-400 mb-4">Run Vulnerability Test</h3>
            <form onSubmit={handleRunTest}>
              <div className="mb-4">
                <label className="block mb-2 text-gray-300">Test Type</label>
                <select
                  className="w-full p-3 rounded-lg bg-gray-700 text-white"
                  value={testType}
                  onChange={(e) => {
                    setTestType(e.target.value);
                    if (e.target.value !== "FILE_UPLOAD") {
                      setUploadedFile(null);
                    }
                  }}
                >
                  <option value="COMMAND">Command/Query</option>
                  <option value="SCRIPT">Script</option>
                  <option value="FILE_UPLOAD">Upload File (JS, Python, etc.)</option>
                </select>
              </div>

              {testType === "FILE_UPLOAD" && (
                <div className="mb-4">
                  <label className="block mb-2 text-gray-300">Upload Test File</label>
                  <input
                    type="file"
                    accept=".js,.py,.txt,.sh"
                    onChange={handleFileUpload}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white"
                  />
                  {uploadedFile && (
                    <p className="text-green-400 text-sm mt-2">
                      File loaded: {uploadedFile.name}
                    </p>
                  )}
                </div>
              )}

              <div className="mb-4">
                <label className="block mb-2 text-gray-300">
                  {testType === "FILE_UPLOAD" ? "Script Content (Preview)" : "Script/Command Content"}
                </label>
                <textarea
                  className="w-full p-3 rounded-lg bg-gray-700 text-white font-mono text-sm"
                  rows="10"
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  placeholder={
                    testType === "COMMAND"
                      ? "Enter test command or query..."
                      : "Enter test script or paste code here..."
                  }
                  required={testType !== "FILE_UPLOAD"}
                  readOnly={testType === "FILE_UPLOAD" && uploadedFile}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-gray-300">Link to Program (Optional)</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg bg-gray-700 text-white"
                  value={submissionId}
                  onChange={(e) => setSubmissionId(e.target.value)}
                  placeholder="Submission ID (optional)"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
                >
                  Run Test
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRunTest(false);
                    setScriptContent("");
                    setUploadedFile(null);
                    setSubmissionId("");
                  }}
                  className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Output Console */}
      {currentExecutionId && testOutput && (
        <div className="mb-6 bg-gray-900 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-green-400">Test Output</h3>
            <button
              onClick={() => {
                setTestOutput("");
                setCurrentExecutionId(null);
              }}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="bg-black rounded p-4 font-mono text-sm text-green-400 max-h-96 overflow-y-auto whitespace-pre-wrap">
            {testOutput}
          </div>
        </div>
      )}

      {/* Test History */}
      <div className="mt-6">
        <h3 className="text-xl font-bold text-blue-400 mb-4">Test History</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {testHistory.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No test executions yet. Run your first test!</p>
          ) : (
            testHistory.map((test) => (
              <div
                key={test.id}
                className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition"
                onClick={() => viewTestResult(test.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-white font-semibold">
                      {test.testType} Test
                    </p>
                    {test.fileName && (
                      <p className="text-gray-400 text-sm">File: {test.fileName}</p>
                    )}
                    <p className="text-gray-400 text-sm">
                      {test.createdAt ? new Date(test.createdAt).toLocaleString() : "N/A"}
                    </p>
                    {test.executionTimeMs && (
                      <p className="text-gray-500 text-xs">
                        Execution time: {test.executionTimeMs}ms
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      test.status === "COMPLETED"
                        ? "bg-green-600"
                        : test.status === "FAILED"
                        ? "bg-red-600"
                        : test.status === "RUNNING"
                        ? "bg-yellow-600"
                        : "bg-gray-600"
                    }`}
                  >
                    {test.status}
                  </span>
                </div>
                {test.output && (
                  <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300 max-h-20 overflow-y-auto">
                    {test.output.substring(0, 200)}
                    {test.output.length > 200 && "..."}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TestingZone;
