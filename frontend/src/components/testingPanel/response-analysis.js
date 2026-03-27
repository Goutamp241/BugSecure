const toSafeString = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const toLowerSafeString = (value) => toSafeString(value).toLowerCase();

const containsAny = (text, needles) => needles.some((n) => text.includes(n));

const uniqueByTypeAndMessage = (items) => {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = `${item.type}:${item.message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
};

export const analyzeResponse = (
  responseBody,
  responseHeaders,
  statusCode,
  context = {}
) => {
  const bodyText = toSafeString(responseBody);
  const bodyLower = toLowerSafeString(responseBody);
  const headersLower = toLowerSafeString(responseHeaders);
  const urlLower = toLowerSafeString(context.url);
  const lastPayload = toSafeString(context.lastPayload);

  const findings = [];

  const hasXssSignal = containsAny(bodyLower, ["<script", "onerror=", "alert("]);
  const reflectedPayload =
    !!lastPayload &&
    bodyText.includes(lastPayload) &&
    containsAny(lastPayload.toLowerCase(), ["<script", "onerror=", "alert("]);

  if (hasXssSignal && reflectedPayload) {
    findings.push({
      type: "XSS",
      severity: "Medium",
      confidence: 88,
      message: "Possible reflected XSS detected",
      why: "Response contains XSS-like script patterns and reflects the injected payload.",
      suggestedFix:
        "Sanitize/encode untrusted input before rendering and apply strict output encoding per context.",
    });
  } else if (hasXssSignal) {
    findings.push({
      type: "XSS",
      severity: "Medium",
      confidence: 65,
      message: "Possible XSS pattern detected in response",
      why: "Response contains script execution patterns (<script>, onerror=, alert()).",
      suggestedFix:
        "Validate and encode user-controlled input. Consider CSP and output escaping in templates/components.",
    });
  }

  if (
    containsAny(bodyLower, [
      "sql syntax",
      "mysql_fetch",
      "ora-",
      "database error",
      "unexpected token near",
    ])
  ) {
    findings.push({
      type: "SQL Injection",
      severity: "High",
      confidence: 82,
      message: "Database error patterns suggest possible SQL injection surface",
      why: "Response exposes SQL/database parser error signatures.",
      suggestedFix:
        "Use parameterized queries/prepared statements and return generic errors to clients.",
    });
  }

  if (containsAny(bodyLower, ["password", "token", "api_key", "secret"])) {
    findings.push({
      type: "Sensitive Data Exposure",
      severity: "High",
      confidence: 74,
      message: "Response may expose sensitive fields",
      why: "Detected sensitive keywords in response content.",
      suggestedFix:
        "Mask/redact sensitive fields in API responses and minimize exposed data.",
    });
  }

  const protectedEndpointHint = containsAny(urlLower, [
    "/admin",
    "/auth",
    "/account",
    "/user",
    "/me",
    "/profile",
  ]);

  if (
    (statusCode === 200 && protectedEndpointHint) ||
    bodyLower.includes("unauthorized bypass")
  ) {
    findings.push({
      type: "Auth Bypass",
      severity: "Critical",
      confidence: statusCode === 200 && protectedEndpointHint ? 78 : 86,
      message: "Potential authentication/authorization bypass behavior",
      why:
        statusCode === 200 && protectedEndpointHint
          ? "Protected-looking endpoint returned 200 without explicit auth failure."
          : "Response contains explicit 'unauthorized bypass' signal.",
      suggestedFix:
        "Verify authorization checks server-side for every protected route and enforce least-privilege access control.",
    });
  }

  if (
    !headersLower.includes("content-security-policy") &&
    findings.some((f) => f.type === "XSS")
  ) {
    findings.push({
      type: "XSS",
      severity: "Medium",
      confidence: 55,
      message: "Missing CSP header may increase XSS impact",
      why: "No Content-Security-Policy header detected in response headers.",
      suggestedFix: "Set a restrictive CSP to reduce script injection impact.",
    });
  }

  return uniqueByTypeAndMessage(findings);
};

