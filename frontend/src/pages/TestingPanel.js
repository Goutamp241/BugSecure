import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import Toast from "../components/Toast";
import RequestBuilder from "../components/testingPanel/RequestBuilder";
import ResponseViewer from "../components/testingPanel/ResponseViewer";
import ResponseAnalyzer from "../components/testingPanel/ResponseAnalyzer";
import { analyzeResponse } from "../components/testingPanel/response-analysis";
import PayloadPanel from "../components/testingPanel/PayloadPanel";
import HistoryPanel from "../components/testingPanel/HistoryPanel";

const LS_LAST_TEST_SESSION_KEY = "bugsecure_last_test_session_v1";

const safeJsonParse = (s) => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

const nowIso = () => new Date().toISOString();

const TestingPanel = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [target, setTarget] = useState(null);

  const [toast, setToast] = useState(null);
  const [activeInsertTarget, setActiveInsertTarget] = useState("body"); // body | query | header | url
  const [lastUsedPayload, setLastUsedPayload] = useState("");
  const [highlightedField, setHighlightedField] = useState("");
  const responseViewerRef = useRef(null);

  const [builderState, setBuilderState] = useState({
    method: "GET",
    endpoint: "",
    fullUrlPreview: "",
    headers: [{ id: "h1", key: "", value: "", enabled: false }],
    queryParams: [{ id: "q1", key: "", value: "", enabled: false }],
    bodyType: "json", // json | form-data | x-www-form-urlencoded | raw
    bodyRaw: "{\n  \"example\": \"__PAYLOAD__\"\n}",
    bodyFields: [{ id: "b1", key: "", value: "", enabled: false }], // form-data / urlencoded fields
    timeoutMs: 20000,
    maxResponseBytes: 2000000,
  });

  const [response, setResponse] = useState(null);
  const [analyzedIssues, setAnalyzedIssues] = useState([]);
  const [sendLoading, setSendLoading] = useState(false);
  const [requestHistory, setRequestHistory] = useState([]);
  const [testCases, setTestCases] = useState([]);

  useEffect(() => {
    const loadSubmission = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get(`/api/submissions/${submissionId}`);
        if (res.data?.success) setTarget(res.data.data);
        else setError(res.data?.error || "Failed to load target");
      } catch (e) {
        setError(e?.response?.data?.error || "Failed to load target");
      } finally {
        setLoading(false);
      }
    };
    loadSubmission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId]);

  useEffect(() => {
    const loadHistoryAndCases = async () => {
      try {
        const [histRes, casesRes] = await Promise.all([
          API.get("/api/testing/http/history"),
          API.get("/api/testing/http/test-cases"),
        ]);
        if (histRes.data?.success) setRequestHistory(histRes.data.data || []);
        if (casesRes.data?.success) setTestCases(casesRes.data?.data || []);
      } catch (e) {
        // If backend isn't ready yet, keep empty lists.
      }
    };
    loadHistoryAndCases();
  }, []);

  const baseUrl = target?.website || "";

  const urlPreview = useMemo(() => {
    const endpoint = (builderState.endpoint || "").trim();
    if (!endpoint) return "";
    if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) return endpoint;
    if (!baseUrl) return endpoint;
    const b = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const e = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return b + e;
  }, [builderState.endpoint, baseUrl]);

  useEffect(() => {
    setBuilderState((s) => ({ ...s, fullUrlPreview: urlPreview }));
  }, [urlPreview]);

  const targetScopeHint = useMemo(() => {
    const list = target?.inScopeTargets;
    if (Array.isArray(list) && list.length > 0) {
      const trimmed = list.filter((x) => typeof x === "string" && x.trim()).slice(0, 4);
      if (trimmed.length) return trimmed.join(", ");
    }
    return "";
  }, [target]);

  const [jsonFormatError, setJsonFormatError] = useState("");

  const highlightField = (fieldKey) => {
    setHighlightedField(fieldKey);
    window.setTimeout(() => setHighlightedField(""), 1200);
  };

  const withPayloadInserted = (currentState, payload, targetField) => {
    const prev = currentState;
    const target = targetField || activeInsertTarget;

    if (target === "body") {
      const currentRaw = prev.bodyRaw || "";
      const hasPlaceholder = currentRaw.includes("__PAYLOAD__") || currentRaw.includes("_PAYLOAD_");
      let nextRaw;

      if (hasPlaceholder) {
        nextRaw = currentRaw
          .replaceAll("__PAYLOAD__", payload)
          .replaceAll("_PAYLOAD_", payload);
      } else if (prev.bodyType === "json") {
        const parsed = safeJsonParse(currentRaw);
        // Safety handling:
        // If JSON is valid and no placeholder, append payload as text at end.
        // If invalid JSON, fallback to raw append.
        nextRaw = parsed ? `${currentRaw}\n${payload}` : `${currentRaw ? currentRaw + "\n" : ""}${payload}`;
      } else {
        nextRaw = `${currentRaw ? currentRaw + "\n" : ""}${payload}`;
      }

      return {
        nextState: { ...prev, bodyRaw: nextRaw },
        insertedInto: "Body",
      };
    }

    if (target === "query") {
      const qp = prev.queryParams || [];
      const idx = qp.findIndex((x) => x.enabled);
      if (idx >= 0) {
        return {
          nextState: {
            ...prev,
            queryParams: qp.map((x, i) => (i === idx ? { ...x, value: payload } : x)),
          },
          insertedInto: "Query",
        };
      }
      return {
        nextState: {
          ...prev,
          queryParams: [
            ...qp,
            { id: "q" + Math.random().toString(16).slice(2), key: "payload", value: payload, enabled: true },
          ],
        },
        insertedInto: "Query",
      };
    }

    if (target === "header") {
      const hs = prev.headers || [];
      const idx = hs.findIndex((x) => x.enabled);
      if (idx >= 0) {
        return {
          nextState: {
            ...prev,
            headers: hs.map((x, i) => (i === idx ? { ...x, value: payload } : x)),
          },
          insertedInto: "Header",
        };
      }
      return {
        nextState: {
          ...prev,
          headers: [
            ...hs,
            { id: "h" + Math.random().toString(16).slice(2), key: "X-Payload", value: payload, enabled: true },
          ],
        },
        insertedInto: "Header",
      };
    }

    // target === "url"
    const endpoint = prev.endpoint || "";
    const hasPlaceholder = endpoint.includes("__PAYLOAD__") || endpoint.includes("_PAYLOAD_");
    if (hasPlaceholder) {
      return {
        nextState: {
          ...prev,
          endpoint: endpoint.replaceAll("__PAYLOAD__", payload).replaceAll("_PAYLOAD_", payload),
        },
        insertedInto: "URL",
      };
    }
    const separator = endpoint.includes("?") ? "&" : "?";
    const appended = endpoint ? `${endpoint}${separator}payload=${encodeURIComponent(payload)}` : payload;
    return {
      nextState: { ...prev, endpoint: appended },
      insertedInto: "URL",
    };
  };

  const handlePayloadClick = (payload) => {
    const { nextState, insertedInto } = withPayloadInserted(builderState, payload, activeInsertTarget);
    setBuilderState(nextState);
    setLastUsedPayload(payload);
    highlightField(activeInsertTarget);
    setToast({ message: `✅ Payload inserted into ${insertedInto}`, type: "success" });
  };

  const buildRequestPayload = (state = builderState) => {
    const enabledHeaders = (state.headers || []).filter((h) => h && h.enabled && h.key?.trim());
    const enabledQuery = (state.queryParams || []).filter((q) => q && q.enabled && q.key?.trim());
    const enabledBodyFields = (state.bodyFields || []).filter((f) => f && f.enabled && f.key?.trim());

    const request = {
      method: state.method,
      url: state.fullUrlPreview,
      headers: enabledHeaders.map((h) => ({ key: h.key, value: h.value, enabled: h.enabled })),
      queryParams: enabledQuery.map((q) => ({ key: q.key, value: q.value, enabled: q.enabled })),
      bodyType: state.bodyType,
      bodyRaw: state.bodyRaw,
      bodyFields: enabledBodyFields.map((f) => ({ key: f.key, value: f.value, enabled: f.enabled })),
      timeoutMs: state.timeoutMs,
      maxResponseBytes: state.maxResponseBytes,
    };
    return request;
  };

  const validateBeforeSend = (state = builderState) => {
    if (!state.fullUrlPreview?.trim()) return "Enter a URL or endpoint.";
    const method = state.method?.trim().toUpperCase();
    const okMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"];
    if (!okMethods.includes(method)) return "Invalid HTTP method.";
    if ((state.bodyType === "json" || state.bodyType === "raw") && state.bodyRaw) {
      if (state.bodyType === "json") {
        const parsed = safeJsonParse(state.bodyRaw);
        if (!parsed) return "JSON body is not valid. Fix syntax or switch body type.";
      }
    }
    return "";
  };

  const handleSend = async (stateOverride = null, options = {}) => {
    const effectiveState = stateOverride || builderState;
    setToast(null);
    setError("");

    const validationError = validateBeforeSend(effectiveState);
    if (validationError) {
      setToast({ message: validationError, type: "error" });
      return;
    }

    const requestPayload = buildRequestPayload(effectiveState);
    setSendLoading(true);
    try {
      const started = nowIso();
      const res = await API.post("/api/testing/http/send", requestPayload);

      if (res.data?.success) {
        const data = res.data.data;
        const nextResponse = {
          statusCode: data.statusCode,
          durationMs: data.durationMs,
          responseSizeBytes: data.responseSizeBytes,
          truncated: data.truncated,
          headers: data.headers || {},
          body: data.body || "",
          receivedAt: started,
        };

        setResponse(nextResponse);
        const payloadUsed = options.payloadUsed || lastUsedPayload || "";
        const issues = analyzeResponse(nextResponse.body, nextResponse.headers, nextResponse.statusCode, {
          lastPayload: payloadUsed,
          url: effectiveState.fullUrlPreview,
        });
        setAnalyzedIssues(issues);

        // Persist last test session for one-click reporting.
        const requestSnapshot = buildRequestPayload(effectiveState);
        const lastTestSession = {
          submissionId,
          programTitle: target?.title || "",
          requestedAt: started,
          payloadUsed,
          requestSnapshot,
          responseSnapshot: {
            statusCode: nextResponse.statusCode,
            headers: nextResponse.headers || {},
            body: nextResponse.body || "",
          },
          analyzerIssues: issues,
        };
        try {
          localStorage.setItem(LS_LAST_TEST_SESSION_KEY, JSON.stringify(lastTestSession));
        } catch {
          // ignore
        }

        // Persisted log entry from backend.
        if (data.log) {
          const item = {
            id: data.log.id,
            createdAt: data.log.createdAt || nowIso(),
            method: data.log.method || effectiveState.method,
            endpoint: data.log.endpoint || effectiveState.endpoint,
            fullUrlPreview: data.log.fullUrlPreview || effectiveState.fullUrlPreview,
            request: data.log.request,
          };
          setRequestHistory((prev) => [item, ...prev].slice(0, 50));
        }

        setToast({ message: "Request sent.", type: "success" });
        if (options.scrollToResponse && responseViewerRef.current) {
          responseViewerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        const msg = res.data?.error || "Request failed.";
        setToast({ message: msg, type: "error" });
        setResponse(null);
        setAnalyzedIssues([]);
      }
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || "Network error.";
      setToast({ message: msg, type: "error" });
      setResponse(null);
      setAnalyzedIssues([]);
    } finally {
      setSendLoading(false);
    }
  };

  const handlePayloadAndSend = async (payload) => {
    const { nextState, insertedInto } = withPayloadInserted(builderState, payload, activeInsertTarget);
    setBuilderState(nextState);
    setLastUsedPayload(payload);
    highlightField(activeInsertTarget);
    setToast({ message: `✅ Payload inserted into ${insertedInto}. Sending...`, type: "success" });
    await handleSend(nextState, { scrollToResponse: true, payloadUsed: payload });
  };

  const handleLoadHistory = (item) => {
    const r = item?.request;
    if (!r) return;
    setBuilderState((prev) => ({
      ...prev,
      method: r.method || "GET",
      endpoint: item.endpoint || "",
      fullUrlPreview: item.fullUrlPreview || r.url || "",
      headers: (r.headers || []).map((h, i) => ({ id: "h" + i, key: h.key, value: h.value, enabled: h.enabled })),
      queryParams: (r.queryParams || []).map((q, i) => ({ id: "q" + i, key: q.key, value: q.value, enabled: q.enabled })),
      bodyType: r.bodyType || "raw",
      bodyRaw: r.bodyRaw || "",
      bodyFields: (r.bodyFields || []).map((f, i) => ({ id: "b" + i, key: f.key, value: f.value, enabled: f.enabled })),
      timeoutMs: r.timeoutMs || 20000,
      maxResponseBytes: r.maxResponseBytes || 2000000,
    }));
    setToast({ message: "Loaded request from history.", type: "success" });
  };

  const handleSaveTestCase = (name) => {
    if (!name?.trim()) return;
    const payload = buildRequestPayload();

    const create = async () => {
      try {
        const res = await API.post("/api/testing/http/test-cases", {
          name: name.trim(),
          description: "Saved from Testing Panel",
          snapshot: payload,
        });
        if (res.data?.success) {
          const saved = res.data.data;
          if (saved) setTestCases((prev) => [saved, ...prev].slice(0, 50));
          setToast({ message: "Test case saved.", type: "success" });
        } else {
          setToast({ message: res.data?.error || "Failed to save test case.", type: "error" });
        }
      } catch (e) {
        setToast({ message: e?.response?.data?.error || e.message || "Failed to save test case.", type: "error" });
      }
    };

    create();
  };

  if (loading) {
    return <div className="text-white p-4">Loading target...</div>;
  }

  if (error) {
    return <div className="text-white p-4 bg-red-600/30 rounded">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="container mx-auto max-w-7xl">
        {/* Target display */}
        <div className="mb-5">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="text-blue-400 font-bold text-xl">⌁</div>
                  <div>
                    <div className="text-lg md:text-xl font-bold">{target?.title || "Program"}</div>
                    <div className="text-gray-400 text-sm mt-1 break-all">
                      Base URL: {baseUrl || "—"}
                    </div>
                    {targetScopeHint ? (
                      <div className="text-gray-400 text-sm mt-1">
                        Scope hint: {targetScopeHint}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setResponse(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition disabled:opacity-50 text-sm"
                  disabled={sendLoading}
                >
                  Clear Response
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBuilderState({
                      method: "GET",
                      endpoint: "",
                      fullUrlPreview: "",
                      headers: [{ id: "h1", key: "", value: "", enabled: false }],
                      queryParams: [{ id: "q1", key: "", value: "", enabled: false }],
                      bodyType: "json",
                      bodyRaw: "{\n  \"example\": \"__PAYLOAD__\"\n}",
                      bodyFields: [{ id: "b1", key: "", value: "", enabled: false }],
                      timeoutMs: 20000,
                      maxResponseBytes: 2000000,
                    });
                    setResponse(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition disabled:opacity-50 text-sm"
                  disabled={sendLoading}
                >
                  New Request
                </button>
              </div>
            </div>
            <p className="text-gray-400 text-xs md:text-sm mt-3">
              This panel sends requests through a safe server-side proxy (internal/localhost calls are blocked).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Left: Request builder */}
          <div className="lg:col-span-7">
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-blue-400 font-bold">⟠</div>
                  <div className="text-lg font-bold">Request Builder</div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-gray-400 text-xs md:text-sm">Insert Payload Into:</div>
                  <select
                    value={activeInsertTarget}
                    onChange={(e) => setActiveInsertTarget(e.target.value)}
                    className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="body">Body</option>
                    <option value="query">Query Params</option>
                    <option value="header">Header</option>
                    <option value="url">URL</option>
                  </select>
                </div>
              </div>

              <div className="p-4 md:p-5">
                <RequestBuilder
                  value={builderState}
                  onChange={setBuilderState}
                  sendLoading={sendLoading}
                  onSend={handleSend}
                  onValidateJsonError={setJsonFormatError}
                  highlightedField={highlightedField}
                />

                {jsonFormatError ? (
                  <div className="mt-3 text-red-300 text-sm">{jsonFormatError}</div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right: Response viewer */}
          <div className="lg:col-span-5" ref={responseViewerRef}>
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex items-center gap-2">
                <div className="text-green-400 font-bold">⟢</div>
                <div className="text-lg font-bold">Response Viewer</div>
              </div>
              <div className="p-4 md:p-5">
                <div className="mb-4">
                  <ResponseAnalyzer issues={analyzedIssues} />
                </div>

                {response ? (
                  <div className="mb-4 rounded-lg border border-gray-600 bg-gray-900/40 p-3 space-y-2">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="text-sm font-semibold text-yellow-200">💣 Found something suspicious?</div>
                        <div className="text-xs text-gray-300 mt-1">
                          Based on the analyzer signals, you can report this finding with evidence prefilled.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/bug-submit/${submissionId}`)}
                        disabled={sendLoading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Report This Finding
                      </button>
                    </div>
                  </div>
                ) : null}
                <ResponseViewer response={response} />
              </div>
            </div>

            <div className="mt-4">
              <HistoryPanel
                history={requestHistory}
                testCases={testCases}
                onLoadHistory={handleLoadHistory}
                onLoadTestCase={(tc) => {
                  if (!tc?.request) return;
                  const r = tc.request;
                  setBuilderState((prev) => ({
                    ...prev,
                    method: r.method || "GET",
                    endpoint: r.url || "",
                    fullUrlPreview: r.url || "",
                    headers: (r.headers || []).map((h, i) => ({ id: "h" + i, key: h.key, value: h.value, enabled: h.enabled })),
                    queryParams: (r.queryParams || []).map((q, i) => ({ id: "q" + i, key: q.key, value: q.value, enabled: q.enabled })),
                    bodyType: r.bodyType || "raw",
                    bodyRaw: r.bodyRaw || "",
                    bodyFields: (r.bodyFields || []).map((f, i) => ({ id: "b" + i, key: f.key, value: f.value, enabled: f.enabled })),
                    timeoutMs: r.timeoutMs || 20000,
                    maxResponseBytes: r.maxResponseBytes || 2000000,
                  }));
                  setToast({ message: "Loaded saved test case.", type: "success" });
                }}
                onSaveTestCase={handleSaveTestCase}
                onDeleteTestCase={async (tcId) => {
                  try {
                    const res = await API.delete(`/api/testing/http/test-cases/${tcId}`);
                    if (res.data?.success) setTestCases((prev) => prev.filter((x) => x.id !== tcId));
                    else setToast({ message: res.data?.error || "Failed to delete test case.", type: "error" });
                  } catch (e) {
                    setToast({ message: e?.response?.data?.error || e.message || "Failed to delete test case.", type: "error" });
                  }
                }}
                onDeleteHistoryItem={async (hId) => {
                  try {
                    const res = await API.delete(`/api/testing/http/history/${hId}`);
                    if (res.data?.success) setRequestHistory((prev) => prev.filter((x) => x.id !== hId));
                    else setToast({ message: res.data?.error || "Failed to delete history item.", type: "error" });
                  } catch (e) {
                    setToast({ message: e?.response?.data?.error || e.message || "Failed to delete history item.", type: "error" });
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Payload library */}
        <div className="mt-6">
          <PayloadPanel
            onInsert={handlePayloadClick}
            onUseAndSend={handlePayloadAndSend}
            lastUsedPayload={lastUsedPayload}
          />
        </div>
      </div>

      {toast ? (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={3500} />
      ) : null}
    </div>
  );
};

export default TestingPanel;

