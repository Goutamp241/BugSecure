import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BugSubmissionForm from "../components/BugSubmissionForm";

const LS_LAST_TEST_SESSION_KEY = "bugsecure_last_test_session_v1";

const safeJsonStringify = (v) => {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v ?? "");
  }
};

const extractEndpointPath = (urlOrPath) => {
  const raw = (urlOrPath || "").toString().trim();
  if (!raw) return "";
  if (raw.startsWith("/")) {
    return raw.split("?")[0];
  }
  try {
    const u = new URL(raw);
    return u.pathname || "/";
  } catch {
    // If not a full URL (e.g., missing scheme), fallback to best effort.
    return raw.split("?")[0];
  }
};

const severityRank = (sev) => {
  switch ((sev || "").toUpperCase()) {
    case "CRITICAL":
      return 4;
    case "HIGH":
      return 3;
    case "MEDIUM":
      return 2;
    case "LOW":
      return 1;
    default:
      return 0;
  }
};

const BugSubmissionPage = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const session = useMemo(() => {
    try {
      const raw = localStorage.getItem(LS_LAST_TEST_SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const prefill = useMemo(() => {
    if (!session) return null;
    const req = session.requestSnapshot || {};
    const res = session.responseSnapshot || {};
    const payloadUsed = session.payloadUsed || "";
    const analyzerIssues = session.analyzerIssues || [];

    const endpointPath = extractEndpointPath(req.url || req.endpoint || session.requestSnapshot?.url);
    const primaryIssue =
      (analyzerIssues || []).slice().sort((a, b) => severityRank(a?.severity) - severityRank(b?.severity)).pop() ||
      null;

    const issueType = primaryIssue?.type || "Issue";
    const issueLabel =
      issueType === "SQL Injection"
        ? "SQL Injection"
        : issueType === "Sensitive Data Exposure"
          ? "Sensitive Data Exposure"
          : issueType === "Auth Bypass"
            ? "Auth Bypass"
            : issueType === "XSS"
              ? "XSS"
              : issueType;

    const suggestedSeverity =
      primaryIssue?.severity === "Critical"
        ? "CRITICAL"
        : primaryIssue?.severity === "High"
          ? "HIGH"
          : primaryIssue?.severity === "Medium"
            ? "MEDIUM"
            : "MEDIUM";

    const generatedTitle =
      issueType === "Auth Bypass"
        ? `Auth Bypass Possible in ${endpointPath || "endpoint"}`
        : `Possible ${issueLabel} in ${endpointPath || "endpoint"}`;

    const generatedDescription = `While testing the endpoint, a payload was injected and the response triggered an analyzer signal for ${issueLabel}.`;

    const steps = [
      `Go to ${req.url || endpointPath || "the target endpoint"}`,
      `Send the payload${payloadUsed ? `: "${payloadUsed}"` : ""}.`,
      "Observe the response and follow the analyzer signals/evidence.",
    ].join("\n");

    const expectedBehavior =
      issueType === "XSS"
        ? "The application should not reflect or execute injected scripts/HTML."
        : issueType === "SQL Injection"
          ? "The application should treat inputs as data and not leak SQL/database error details."
          : issueType === "Sensitive Data Exposure"
            ? "The application should not expose secrets (tokens/passwords/api keys) in responses."
            : issueType === "Auth Bypass"
              ? "Protected endpoints should require proper authentication/authorization; access must not be bypassed."
              : "The response should not demonstrate the suspected vulnerability.";

    const actualExcerpt = (res.body || "").toString().slice(0, 1800);

    return {
      submissionId,
      targetUrl: req.url || "",
      payloadUsed,
      requestSnapshotText: safeJsonStringify(req),
      responseSnapshotText: safeJsonStringify({
        statusCode: res.statusCode,
        headers: res.headers,
        body: (res.body || "").toString().slice(0, 1800),
      }),
      analyzerIssues,
      suggestedSeverity,
      generatedTitle,
      generatedDescription,
      stepsToReproduce: steps,
      expectedBehavior,
      actualBehavior: actualExcerpt,
    };
  }, [session, submissionId]);

  if (!session || session.submissionId !== submissionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-24 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-red-600/15 border border-red-500/40 rounded-xl p-4">
            No test session found to report. Start from the Testing Panel first.
          </div>
          <button
            type="button"
            onClick={() => navigate(`/testing/${submissionId}`)}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
          >
            Back to Testing Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="container mx-auto max-w-4xl">
        <BugSubmissionForm submissionId={submissionId} prefill={prefill} />
      </div>
    </div>
  );
};

export default BugSubmissionPage;

