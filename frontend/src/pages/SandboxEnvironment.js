import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

const SandboxEnvironment = () => {
  const { sandboxId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sandboxInfo, setSandboxInfo] = useState(null);

  // Execution state (Run + Logs)
  const [taskType] = useState("RUN_CODE"); // UI currently focuses on code execution + scan.
  const [language, setLanguage] = useState("python"); // python|node|java
  const [timeoutSeconds, setTimeoutSeconds] = useState(20);
  const [sourceCode, setSourceCode] = useState("");
  const [mainClass, setMainClass] = useState("Main");
  const [sourceFileName, setSourceFileName] = useState("");

  const [execLoading, setExecLoading] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [scanResultText, setScanResultText] = useState("");

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get(`/api/sandbox/info/${sandboxId}`);
        if (res.data?.success) {
          setSandboxInfo(res.data.data);
        } else {
          setError(res.data?.error || "Failed to fetch sandbox info");
        }
      } catch (e) {
        setError(e?.response?.data?.error || "Failed to fetch sandbox info");
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [sandboxId]);

  const iframeSrc = useMemo(() => {
    const url = sandboxInfo?.url;
    return url ? url : "";
  }, [sandboxInfo]);

  const handleStop = async () => {
    try {
      await API.delete(`/api/sandbox/stop/${sandboxId}`);
      navigate("/dashboard");
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to stop sandbox");
    }
  };

  const handleExecute = async () => {
    if (!sourceCode?.trim()) {
      alert("Please enter code to execute.");
      return;
    }

    setExecLoading(true);
    setError("");
    setExecutionResult(null);
    setScanResultText("");

    try {
      const res = await API.post(`/api/sandbox/execute/${sandboxId}`, {
        taskType: "RUN_CODE",
        language,
        sourceCode,
        sourceFileName: sourceFileName || null,
        mainClass,
        timeoutSeconds,
      });

      if (res.data?.success) {
        setExecutionResult(res.data.data);
      } else {
        setError(res.data?.error || "Execution failed");
      }
    } catch (e) {
      setError(e?.response?.data?.error || "Execution failed");
    } finally {
      setExecLoading(false);
    }
  };

  const handleSecurityScan = async () => {
    setExecLoading(true);
    setError("");
    setExecutionResult(null);
    setScanResultText("");

    try {
      const res = await API.post(`/api/sandbox/execute/${sandboxId}`, {
        taskType: "SECURITY_SCAN",
        timeoutSeconds,
      });

      if (res.data?.success) {
        // In this v1 UI, we render scan result as JSON/string.
        const json = res.data?.data?.resultJson;
        setScanResultText(json || res.data?.data?.stdout || "");
      } else {
        setError(res.data?.error || "Scan failed");
      }
    } catch (e) {
      setError(e?.response?.data?.error || "Scan failed");
    } finally {
      setExecLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white p-4">Loading sandbox...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-400 mb-1">
              Sandbox Environment
            </h1>
            <p className="text-gray-300 text-sm md:text-base">
              Session: {sandboxInfo?.sandboxId || sandboxId}
              {sandboxInfo?.submissionId ? ` • Submission: ${sandboxInfo.submissionId}` : ""}
            </p>
            {sandboxInfo?.status && (
              <p className="text-gray-400 text-sm md:text-base">Status: {sandboxInfo.status}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleStop}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={execLoading}
            >
              Stop
            </button>
            <button
              type="button"
              onClick={() => {
                if (!sandboxInfo?.submissionId) return;
                navigate(`/testing/${sandboxInfo.submissionId}`);
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={execLoading || !sandboxInfo?.submissionId}
              title={sandboxInfo?.submissionId ? "Open Testing Panel" : "Submission not available yet"}
            >
              Testing Panel
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={execLoading}
            >
              Back
            </button>
          </div>
        </div>

        {error && <div className="bg-red-600 text-white p-3 rounded mb-4">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-blue-400">Sandbox Preview</h2>
              <p className="text-gray-400 text-sm">Sandbox content is served from the container.</p>
            </div>
            {iframeSrc ? (
              <iframe
                title="sandbox-preview"
                className="w-full h-[60vh] md:h-[70vh] bg-black"
                src={iframeSrc}
              />
            ) : (
              <div className="p-4 text-gray-400">No sandbox URL available.</div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 md:p-6">
            <h2 className="text-lg font-bold text-blue-400 mb-4">Run + Logs</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                >
                  <option value="python">Python</option>
                  <option value="node">Node.js</option>
                  <option value="java">Java</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Timeout (seconds)</label>
                <input
                  type="number"
                  value={timeoutSeconds}
                  onChange={(e) => setTimeoutSeconds(parseInt(e.target.value || "20", 10))}
                  min={1}
                  max={120}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                />
              </div>
            </div>

            {language === "java" && (
              <div className="mb-3">
                <label className="block text-gray-300 text-sm mb-1">Java Main Class</label>
                <input
                  value={mainClass}
                  onChange={(e) => setMainClass(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                />
              </div>
            )}

            <div className="mb-3">
              <label className="block text-gray-300 text-sm mb-1">Source Code</label>
              <textarea
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                className="w-full p-3 rounded-lg bg-black text-white font-mono text-xs border border-gray-700 focus:ring-2 focus:ring-blue-500"
                rows={10}
                placeholder={
                  language === "python"
                    ? "print('Hello from Python')"
                    : language === "node"
                    ? "console.log('Hello from Node.js');"
                    : "public class Main { public static void main(String[] args) { System.out.println(\"Hello from Java\"); } }"
                }
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={handleExecute}
                disabled={execLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {execLoading ? "Executing..." : "Execute Code"}
              </button>
              <button
                type="button"
                onClick={handleSecurityScan}
                disabled={execLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {execLoading ? "Scanning..." : "Security Scan (Offline)"}
              </button>
            </div>

            {executionResult && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white mb-2">
                  Execution Output
                </h3>
                <pre className="bg-black rounded border border-gray-700 p-3 font-mono text-xs text-green-400 whitespace-pre-wrap overflow-x-auto">
                  {executionResult?.stdout || ""}
                </pre>
                {executionResult?.stderr && (
                  <pre className="mt-3 bg-black rounded border border-gray-700 p-3 font-mono text-xs text-red-400 whitespace-pre-wrap overflow-x-auto">
                    {executionResult?.stderr || ""}
                  </pre>
                )}
                {executionResult?.failureReason && (
                  <div className="mt-3 text-red-300 text-sm">
                    {executionResult.failureReason}
                  </div>
                )}
              </div>
            )}

            {scanResultText && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">
                  Security Scan Result
                </h3>
                <pre className="bg-black rounded border border-gray-700 p-3 font-mono text-xs text-blue-300 whitespace-pre-wrap overflow-x-auto">
                  {scanResultText}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SandboxEnvironment;

