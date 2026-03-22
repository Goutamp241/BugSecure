import React, { useState } from "react";

const EnhancedFileUpload = ({ onFilesChange, acceptedTypes }) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (newFiles) => {
    const processedFiles = await Promise.all(
      newFiles.map(async (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({
              file: file,
              name: file.name,
              type: getFileType(file.name),
              mimeType: file.type,
              size: file.size,
              content: event.target.result,
            });
          };
          reader.onerror = () => {
            resolve({
              file: file,
              name: file.name,
              type: getFileType(file.name),
              mimeType: file.type,
              size: file.size,
              content: null,
              error: "Failed to read file",
            });
          };

          // Read as data URL for images, text for code/docs, or base64 for others
          if (file.type.startsWith("image/")) {
            reader.readAsDataURL(file);
          } else if (
            file.type.startsWith("text/") ||
            file.name.endsWith(".js") ||
            file.name.endsWith(".java") ||
            file.name.endsWith(".py") ||
            file.name.endsWith(".cpp") ||
            file.name.endsWith(".c") ||
            file.name.endsWith(".cs") ||
            file.name.endsWith(".php") ||
            file.name.endsWith(".rb") ||
            file.name.endsWith(".go") ||
            file.name.endsWith(".ts") ||
            file.name.endsWith(".jsx") ||
            file.name.endsWith(".tsx") ||
            file.name.endsWith(".html") ||
            file.name.endsWith(".css")
          ) {
            reader.readAsText(file);
          } else {
            // For PDFs and other binary files, read as data URL
            reader.readAsDataURL(file);
          }
        });
      })
    );

    const updatedFiles = [...files, ...processedFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const getFileType = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    const codeExtensions = [
      "js",
      "java",
      "py",
      "cpp",
      "c",
      "cs",
      "php",
      "rb",
      "go",
      "ts",
      "jsx",
      "tsx",
      "html",
      "css",
    ];
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "svg", "webp"];
    const docExtensions = ["pdf", "doc", "docx", "txt"];

    if (codeExtensions.includes(extension)) return "CODE";
    if (imageExtensions.includes(extension)) return "IMAGE";
    if (docExtensions.includes(extension)) return "DOCUMENT";
    return "OTHER";
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "CODE":
        return "💻";
      case "IMAGE":
        return "🖼️";
      case "DOCUMENT":
        return "📄";
      default:
        return "📎";
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-4 md:p-6 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-600 bg-gray-700/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes || "*"}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center w-full"
        >
          <svg
            className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mb-3 md:mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-gray-300 mb-2 text-sm md:text-base">
            Drag and drop files here, or click to select
          </p>
          <p className="text-gray-400 text-xs md:text-sm px-2">
            Supports: Code files, PDFs, Documents, Images
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-base md:text-lg font-semibold text-gray-300 mb-2">
            Selected Files ({files.length})
          </h3>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-700 p-2 md:p-3 rounded-lg border border-gray-600"
            >
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <span className="text-xl md:text-2xl">{getFileIcon(file.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate text-sm md:text-base">{file.name}</p>
                  <p className="text-gray-400 text-xs md:text-sm">
                    {file.type} • {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="ml-2 md:ml-4 text-red-400 hover:text-red-300 transition flex-shrink-0"
                aria-label="Remove file"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedFileUpload;

