import React, { useState } from "react";
import API from "../services/api";
import EnhancedFileUpload from "./EnhancedFileUpload";

const CodeSubmissionForm = ({ onSubmissionCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileName: "",
    codeContent: "",
    rewardAmount: "",
    website: "",
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFilesChange = (newFiles) => {
    setFiles(newFiles);
    // Set primary file for backward compatibility
    if (newFiles.length > 0) {
      const primaryFile = newFiles[0];
      setFormData({
        ...formData,
        fileName: primaryFile.name,
        codeContent: primaryFile.content || "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate that either files are uploaded or code is pasted
      if (files.length === 0 && !formData.codeContent) {
        setError("Please either upload files or paste code content");
        setLoading(false);
        return;
      }

      // Validate reward amount
      const rewardAmount = parseFloat(formData.rewardAmount);
      if (isNaN(rewardAmount) || rewardAmount <= 0) {
        setError("Reward amount must be greater than 0");
        setLoading(false);
        return;
      }

      const submissionData = {
        title: formData.title,
        description: formData.description || "",
        fileName: formData.fileName || files[0]?.name || "",
        codeContent: formData.codeContent || "",
        rewardAmount: rewardAmount,
        website: formData.website || "",
        files: files.map((f) => ({
          name: f.name,
          type: f.type,
          mimeType: f.mimeType,
          content: f.content,
          size: f.size,
        })),
      };

      const res = await API.post("/api/submissions", submissionData);
      if (res.data.success) {
        // Reset form
        setFormData({
          title: "",
          description: "",
          fileName: "",
          codeContent: "",
          rewardAmount: "",
          website: "",
        });
        setFiles([]);
        onSubmissionCreated();
      } else {
        setError(res.data.error || "Failed to create submission");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to create submission. Please try again.";
      setError(errorMessage);
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-blue-400">
        Create New Submission
      </h2>
      {error && (
        <div className="bg-red-600 text-white p-3 rounded mb-4 text-sm md:text-base">{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-300 text-sm md:text-base">Title</label>
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
            Upload Files (Code, PDF, Documents, Images)
          </label>
          <EnhancedFileUpload
            onFilesChange={handleFilesChange}
            acceptedTypes=".js,.java,.py,.cpp,.c,.cs,.php,.rb,.go,.ts,.jsx,.tsx,.html,.css,.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.svg,.webp"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-300 text-sm md:text-base">
            Or Paste Code Content
          </label>
          <textarea
            name="codeContent"
            value={formData.codeContent}
            onChange={handleChange}
            className="w-full p-2 md:p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 font-mono text-xs md:text-sm"
            rows="8"
            placeholder="Paste your code here... (optional if files are uploaded)"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-300 text-sm md:text-base">
            Website URL (Optional)
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full p-2 md:p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            placeholder="https://example.com"
          />
          <p className="text-gray-400 text-xs md:text-sm mt-1">
            Provide a website URL for researchers to test (e.g., https://example.com)
          </p>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-300 text-sm md:text-base">
            Reward Amount (USD)
          </label>
          <input
            type="number"
            name="rewardAmount"
            value={formData.rewardAmount}
            onChange={handleChange}
            className="w-full p-2 md:p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            min="0"
            step="0.01"
            required
          />
          {formData.rewardAmount && !isNaN(parseFloat(formData.rewardAmount)) && (
            <p className="text-gray-400 text-xs md:text-sm mt-2">
              ≈ ₹{(parseFloat(formData.rewardAmount) * 83).toFixed(2)} INR
              <span className="text-xs text-gray-500 ml-2">(Rate: 1 USD = ₹83 INR)</span>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 md:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition disabled:opacity-50 text-sm md:text-base"
        >
          {loading ? "Creating..." : "Create Submission"}
        </button>
      </form>
    </div>
  );
};

export default CodeSubmissionForm;

