import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import EnhancedFileUpload from "./EnhancedFileUpload";
import Toast from "./Toast";
import SectionCard from "./SectionCard";
import Input from "./Input";
import Textarea from "./Textarea";
import CheckboxGroup from "./CheckboxGroup";
import { convertUSDToINR } from "../utils/currency";

const scopeRowId = () => Math.random().toString(16).slice(2);

const CreateBugBountyProgramForm = ({ onSubmissionCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [programTitle, setProgramTitle] = useState("");
  const [description, setDescription] = useState("");

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [files, setFiles] = useState([]);
  const [codeContent, setCodeContent] = useState("");

  // Scope definition
  const [inScopeTargets, setInScopeTargets] = useState([{ id: scopeRowId(), value: "" }]);
  const [outOfScopeTargets, setOutOfScopeTargets] = useState([]);

  // Allowed testing types
  const [allowedTestingTypes, setAllowedTestingTypes] = useState([]);
  // Restricted actions
  const [restrictedActions, setRestrictedActions] = useState([]);

  // Reward structure
  const [rewardLow, setRewardLow] = useState("");
  const [rewardMedium, setRewardMedium] = useState("");
  const [rewardHigh, setRewardHigh] = useState("");
  const [rewardCritical, setRewardCritical] = useState("");

  // Environment settings
  const [environment, setEnvironment] = useState("Production");
  // Duration
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Access control
  const [accessControl, setAccessControl] = useState("Public");

  // Testing credentials (optional)
  const [testingEmail, setTestingEmail] = useState("");
  const [testingPassword, setTestingPassword] = useState("");
  const [hasTestingCreds, setHasTestingCreds] = useState(false);

  // Legal agreement
  const [agreedDisclosure, setAgreedDisclosure] = useState(false);
  const [agreedNoHarm, setAgreedNoHarm] = useState(false);

  const handleFilesChange = (newFiles) => {
    setFiles(newFiles);
    // Auto-fill a few sample endpoints when files are uploaded (mocked UX).
    if (newFiles.length > 0 && inScopeTargets.filter((r) => r.value.trim()).length === 0) {
      setInScopeTargets([
        { id: scopeRowId(), value: "/api/" },
        { id: scopeRowId(), value: "/login" },
        { id: scopeRowId(), value: "/auth" },
      ]);
    }
  };

  useEffect(() => {
    // Soft example scope if website is present and scope is empty.
    if (websiteUrl && inScopeTargets.filter((r) => r.value.trim()).length === 0) {
      // Keep it quiet: only add if user has not touched scope much.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteUrl]);

  const validateUrl = (u) => {
    if (!u) return false;
    try {
      const parsed = new URL(u);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const computed = useMemo(() => {
    const inScope = inScopeTargets.map((r) => r.value.trim()).filter(Boolean);
    const outScope = outOfScopeTargets.map((t) => t.trim()).filter(Boolean);

    const parsedLow = parseFloat(rewardLow);
    const parsedMed = parseFloat(rewardMedium);
    const parsedHigh = parseFloat(rewardHigh);
    const parsedCrit = parseFloat(rewardCritical);

    const hasRewards =
      !isNaN(parsedLow) &&
      !isNaN(parsedMed) &&
      !isNaN(parsedHigh) &&
      !isNaN(parsedCrit) &&
      parsedLow >= 0 &&
      parsedMed >= 0 &&
      parsedHigh >= 0 &&
      parsedCrit > 0;

    const startOk = startDate ? !isNaN(new Date(startDate).getTime()) : false;
    const endOk = endDate ? !isNaN(new Date(endDate).getTime()) : false;
    const durationOk = startOk && endOk && new Date(endDate).getTime() >= new Date(startDate).getTime();

    const websiteOk = validateUrl(websiteUrl);
    const allowedOk = (allowedTestingTypes || []).length > 0;
    const scopeOk = inScope.length > 0;
    const legalOk = agreedDisclosure && agreedNoHarm;

    const programOk = programTitle.trim().length >= 3 && description.trim().length >= 10;

    return {
      inScope,
      outScope,
      parsed: { parsedLow, parsedMed, parsedHigh, parsedCrit },
      hasRewards,
      durationOk,
      websiteOk,
      allowedOk,
      scopeOk,
      legalOk,
      programOk,
    };
  }, [
    inScopeTargets,
    outOfScopeTargets,
    rewardLow,
    rewardMedium,
    rewardHigh,
    rewardCritical,
    startDate,
    endDate,
    websiteUrl,
    allowedTestingTypes,
    agreedDisclosure,
    agreedNoHarm,
    programTitle,
    description,
  ]);

  const canSubmit =
    computed.programOk &&
    computed.websiteOk &&
    computed.scopeOk &&
    computed.allowedOk &&
    computed.hasRewards &&
    computed.durationOk &&
    computed.legalOk &&
    !loading;

  const handleAiSuggestScope = () => {
    const hostGuess = (() => {
      try {
        return websiteUrl ? new URL(websiteUrl).hostname : "example.com";
      } catch {
        return "example.com";
      }
    })();

    setInScopeTargets([
      { id: scopeRowId(), value: `/api/` },
      { id: scopeRowId(), value: `/v1/` },
      { id: scopeRowId(), value: `/login` },
    ]);
    setOutOfScopeTargets([`// ${hostGuess}: third-party embedded resources`]);
    setToast({ message: "Scope suggestions added (mock).", type: "success" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setToast(null);

    if (!canSubmit) {
      const msg = "Please complete all required fields before submitting.";
      setError(msg);
      setToast({ message: msg, type: "error" });
      return;
    }

    setLoading(true);
    try {
      // Backward compatibility: backend currently stores a single rewardAmount.
      // We map "Critical" reward to rewardAmount because CRITICAL multiplier is 1.0.
      const payload = {
        title: programTitle.trim(),
        description: description.trim(),
        website: websiteUrl.trim(),
        codeContent: codeContent || "",
        fileName: files[0]?.name || "code.txt",
        rewardAmount: computed.parsed.parsedCrit,
        files: files.map((f) => ({
          name: f.name,
          type: f.type,
          mimeType: f.mimeType,
          content: f.content,
          size: f.size,
        })),

        // New program fields (safe to ignore until backend stores them)
        inScopeTargets: computed.inScope,
        outOfScopeTargets: computed.outScope,
        allowedTestingTypes,
        restrictedActions,
        rewardLowSeverity: computed.parsed.parsedLow,
        rewardMediumSeverity: computed.parsed.parsedMed,
        rewardHighSeverity: computed.parsed.parsedHigh,
        rewardCriticalSeverity: computed.parsed.parsedCrit,
        environmentSetting: environment,
        startDate,
        endDate,
        accessControl,
        testingEmail: hasTestingCreds ? testingEmail : null,
        testingPassword: hasTestingCreds ? testingPassword : null,
        agreedDisclosure,
        agreedNoHarm,
      };

      const res = await API.post("/api/submissions", payload);
      if (res.data.success) {
        setToast({ message: "Program created successfully.", type: "success" });
        onSubmissionCreated();
      } else {
        const msg = res.data.error || "Failed to create program.";
        setError(msg);
        setToast({ message: msg, type: "error" });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to create program. Please try again.";
      setError(errorMessage);
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const testingTypes = [
    { id: "XSS", label: "XSS", helper: "Cross-site scripting testing" },
    { id: "SQL_INJECTION", label: "SQL Injection", helper: "Database injection testing" },
    { id: "AUTH_TESTING", label: "Authentication Testing", helper: "Auth bypass / session testing" },
    { id: "API_TESTING", label: "API Testing", helper: "Endpoint discovery and auth checks" },
    { id: "FILE_UPLOAD", label: "File Upload Testing", helper: "Upload validation and execution checks" },
  ];

  const restricted = [
    { id: "NO_DDOS", label: "No DDoS", helper: "No load/traffic amplification attacks" },
    { id: "NO_DATA_DELETION", label: "No Data Deletion", helper: "No destructive actions on systems" },
    { id: "NO_SOCIAL_ENGINEERING", label: "No Social Engineering", helper: "No impersonation or coercion" },
  ];

  const rewardPreview = useMemo(() => {
    const crit = computed.parsed.parsedCrit;
    if (isNaN(crit)) return null;
    const inr = convertUSDToINR(crit);
    return { inr };
  }, [computed.parsed.parsedCrit]);

  const setScopeValue = (idx, value) => {
    setInScopeTargets((prev) => prev.map((row, i) => (i === idx ? { ...row, value } : row)));
  };

  const addScopeRow = () => {
    setInScopeTargets((prev) => [...prev, { id: scopeRowId(), value: "" }]);
  };

  const removeScopeRow = (idx) => {
    setInScopeTargets((prev) => prev.filter((_, i) => i !== idx));
  };

  const addOutOfScope = () => {
    setOutOfScopeTargets((prev) => [...prev, ""]);
  };

  const setOutOfScopeValue = (idx, value) => {
    setOutOfScopeTargets((prev) => prev.map((v, i) => (i === idx ? value : v)));
  };

  const removeOutOfScope = (idx) => {
    setOutOfScopeTargets((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-blue-400">Create Bug Bounty Program</h2>
          <p className="text-gray-400 text-sm md:text-base mt-1">
            Define scope, allowed testing types, restrictions, and rewards. Then publish for researchers.
          </p>
        </div>
      </div>

      {error && <div className="bg-red-600 text-white p-3 rounded mb-4 text-sm md:text-base">{error}</div>}

      {toast ? (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={3500}
        />
      ) : null}

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <SectionCard
            title="A. Basic Information"
            helperText="Give your program a clear title and description."
            icon={<span className="text-blue-400">◻</span>}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Program Title"
                  required
                  value={programTitle}
                  onChange={(e) => setProgramTitle(e.target.value)}
                  placeholder="e.g., XYZ Web App Security Program"
                />
              </div>
              <div className="md:pt-8">
                <p className="text-gray-400 text-sm">
                  Tip: keep it short so researchers can scan quickly.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Textarea
                label="Description"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the program, goals, and any context researchers should know."
              />
            </div>
          </SectionCard>

          <SectionCard
            title="B. Target Details"
            helperText="Provide a target website and upload program materials."
            icon={<span className="text-blue-400">⌁</span>}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Website URL"
                  required
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  helperText="Must be a valid http/https URL."
                />
              </div>
              <div className="md:pt-8">
                <p className="text-gray-400 text-sm">
                  This URL is used for researcher guidance and sandbox preview.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <EnhancedFileUpload
                onFilesChange={handleFilesChange}
                acceptedTypes=".js,.java,.py,.cpp,.c,.cs,.php,.rb,.go,.ts,.jsx,.tsx,.html,.css,.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.svg,.webp"
              />
            </div>

            <div className="mt-4">
              <Textarea
                label="Paste Code"
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                rows={7}
                placeholder="Optional: paste repository entry-point code for researchers."
                helperText="If you upload files, this becomes optional."
              />
            </div>
          </SectionCard>

          <SectionCard
            title="C. Scope Definition"
            helperText="Define what is in-scope and out-of-scope for testing."
            icon={<span className="text-blue-400">⟐</span>}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-200 font-semibold">In-Scope Targets</h3>
                  <button
                    type="button"
                    onClick={addScopeRow}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition"
                  >
                    + Add
                  </button>
                </div>

                <div className="space-y-3">
                  {inScopeTargets.map((row, idx) => (
                    <div key={row.id} className="flex gap-2">
                      <input
                        value={row.value}
                        onChange={(e) => setScopeValue(idx, e.target.value)}
                        placeholder="/api/endpoint"
                        className="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeScopeRow(idx)}
                        disabled={inScopeTargets.length <= 1}
                        className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <p className="text-gray-400 text-xs mt-3">
                  Researchers must not test outside this list.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-200 font-semibold">Out-of-Scope Targets</h3>
                  <button
                    type="button"
                    onClick={addOutOfScope}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition"
                  >
                    + Add
                  </button>
                </div>

                <div className="space-y-3">
                  {(outOfScopeTargets || []).map((t, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        value={t}
                        onChange={(e) => setOutOfScopeValue(idx, e.target.value)}
                        placeholder="/admin"
                        className="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeOutOfScope(idx)}
                        className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-semibold transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {(outOfScopeTargets || []).length === 0 ? (
                    <p className="text-gray-400 text-sm">Optional. Leave empty if everything is in-scope.</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleAiSuggestScope}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition text-sm"
              >
                AI Suggest Scope (mock)
              </button>
              <p className="text-gray-400 text-sm mt-2">
                Uses mocked logic for now.
              </p>
            </div>
          </SectionCard>

          <SectionCard
            title="D. Allowed Testing Types"
            helperText="Choose what researchers can test."
            icon={<span className="text-blue-400">✓</span>}
          >
            <CheckboxGroup
              label="Allowed Testing Types"
              options={testingTypes}
              selected={allowedTestingTypes}
              onChange={setAllowedTestingTypes}
              helperText="Select at least one."
            />
          </SectionCard>

          <SectionCard
            title="E. Restricted Actions"
            helperText="Safety and compliance restrictions."
            icon={<span className="text-blue-400">⛨</span>}
          >
            <CheckboxGroup
              label="Restricted Actions"
              options={restricted}
              selected={restrictedActions}
              onChange={setRestrictedActions}
            />
          </SectionCard>

          <SectionCard
            title="F. Reward Structure"
            helperText="Rewards by severity. Critical is used as the platform base reward."
            icon={<span className="text-blue-400">₹</span>}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Low Severity Reward (USD)"
                required
                type="number"
                value={rewardLow}
                onChange={(e) => setRewardLow(e.target.value)}
                placeholder="25"
              />
              <Input
                label="Medium Severity Reward (USD)"
                required
                type="number"
                value={rewardMedium}
                onChange={(e) => setRewardMedium(e.target.value)}
                placeholder="50"
              />
              <Input
                label="High Severity Reward (USD)"
                required
                type="number"
                value={rewardHigh}
                onChange={(e) => setRewardHigh(e.target.value)}
                placeholder="75"
              />
              <Input
                label="Critical Severity Reward (USD)"
                required
                type="number"
                value={rewardCritical}
                onChange={(e) => setRewardCritical(e.target.value)}
                placeholder="100"
                helperText={rewardPreview ? `≈ ₹${rewardPreview.inr.toFixed(2)} INR` : "Must be > 0"}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="G. Environment Settings"
            helperText="Specify where testing may occur."
            icon={<span className="text-blue-400">◎</span>}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {["Staging", "Production", "Code Only"].map((v) => (
                <label
                  key={v}
                  className={`p-4 rounded-lg border cursor-pointer transition ${
                    environment === v ? "bg-blue-600/15 border-blue-500/40" : "bg-gray-700/30 border-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="environment"
                    checked={environment === v}
                    onChange={() => setEnvironment(v)}
                    className="mr-2"
                  />
                  <span className="text-white font-semibold">{v}</span>
                </label>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="H. Program Duration"
            helperText="Start and end dates."
            icon={<span className="text-blue-400">◷</span>}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Start Date"
                  required
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Input
                  label="End Date"
                  required
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  helperText="Must be on or after Start Date."
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="I. Access Control"
            helperText="How researchers get access to the program."
            icon={<span className="text-blue-400">⌁</span>}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {["Public", "Invite Only", "Limited Researchers"].map((v) => (
                <label
                  key={v}
                  className={`p-4 rounded-lg border cursor-pointer transition ${
                    accessControl === v
                      ? "bg-blue-600/15 border-blue-500/40"
                      : "bg-gray-700/30 border-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="accessControl"
                    checked={accessControl === v}
                    onChange={() => setAccessControl(v)}
                    className="mr-2"
                  />
                  <span className="text-white font-semibold">{v}</span>
                </label>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="J. Testing Credentials (Optional)"
            helperText="Provide credentials for authenticated testing."
            icon={<span className="text-blue-400">≋</span>}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-gray-300 text-sm md:text-base">
                <input
                  type="checkbox"
                  checked={hasTestingCreds}
                  onChange={(e) => setHasTestingCreds(e.target.checked)}
                />
                Provide testing credentials
              </label>
              <p className="text-gray-400 text-sm">
                Password is optional in this release. Store it securely on the backend later.
              </p>
            </div>

            {hasTestingCreds ? (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  value={testingEmail}
                  onChange={(e) => setTestingEmail(e.target.value)}
                  type="email"
                  placeholder="researcher@example.com"
                />
                <Input
                  label="Password"
                  value={testingPassword}
                  onChange={(e) => setTestingPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                />
              </div>
            ) : null}
          </SectionCard>

          <SectionCard
            title="K. Legal Agreement"
            helperText="Required for publication."
            icon={<span className="text-blue-400">⧉</span>}
          >
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-600 bg-gray-700/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedDisclosure}
                  onChange={(e) => setAgreedDisclosure(e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <div className="text-white font-semibold">I agree to responsible disclosure policy</div>
                  <div className="text-gray-400 text-sm mt-1">
                    Report responsibly and avoid public disclosure until coordinated.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-600 bg-gray-700/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedNoHarm}
                  onChange={(e) => setAgreedNoHarm(e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <div className="text-white font-semibold">Testing must not harm real users</div>
                  <div className="text-gray-400 text-sm mt-1">
                    No destructive or disruptive testing on real user systems.
                  </div>
                </div>
              </label>
            </div>
          </SectionCard>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {loading ? "Publishing..." : "Create Bug Bounty Program"}
            </button>
            <p className="text-gray-400 text-xs mt-2">
              Note: This UI extends the submission payload. Backend support for all program fields is added gradually.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBugBountyProgramForm;

