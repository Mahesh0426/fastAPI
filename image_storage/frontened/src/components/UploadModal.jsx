import { useEffect, useMemo, useRef, useState } from "react";
import { X, UploadCloud, Loader2, ImagePlus } from "lucide-react";
import { uploadPost, errorMessage } from "../api";

// NOTE: This component does not take an `open` prop. The parent should mount
// it only when the modal should be shown (e.g. `{showUpload && <UploadModal .../>}`).
// That way, closing the modal unmounts it and we get a fresh state on next open
// without needing a reset effect that triggers cascading renders.
export default function UploadModal({ onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  // Derive the preview URL directly from `file` — no state, no setState-in-effect.
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  // Cleanup-only effect: revoke the URL when it changes or the component unmounts.
  // This effect does not call setState, so it does not trigger cascading renders.
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && !uploading) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [uploading, onClose]);

  const pickFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) {
      setError("Only image or video files are supported");
      return;
    }
    setError("");
    setFile(f);
  };

  const clearFile = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please pick a file first");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const data = await uploadPost(file, caption, setProgress);
      onUploaded?.(data);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setUploading(false);
    }
  };

  const isVideo = file?.type?.startsWith("video/");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      onClick={() => !uploading && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className=" w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <ImagePlus className="w-4 h-4 text-indigo-400" />
            New post
          </h2>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {!file ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                pickFile(e.dataTransfer.files?.[0]);
              }}
              className={`w-full flex flex-col items-center justify-center gap-3 py-12 px-4 rounded-xl border-2 border-dashed transition ${
                dragOver
                  ? "border-indigo-400 bg-indigo-500/10"
                  : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
              }`}
            >
              <UploadCloud className="w-10 h-10 text-slate-400" />
              <div className="text-center">
                <p className="text-white font-medium">
                  Click to upload, or drag and drop
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Images and videos supported
                </p>
              </div>
            </button>
          ) : (
            <div
              className={`w-full relative rounded-xl overflow-hidden bg-black transition-all duration-300 ease-out ${
                uploading ? "h-96" : "h-72 sm:h-80"
              }`}
            >
              {isVideo ? (
                <video
                  src={previewUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={clearFile}
                disabled={uploading}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white border border-white/10 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />

          <textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            maxLength={300}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-none"
          />

          {uploading && (
            <div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Uploading… {progress}%
              </p>
            </div>
          )}

          {error && (
            <div className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploading ? "Posting" : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
