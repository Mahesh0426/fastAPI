import { useState } from "react";
import { Trash2, Loader2, MoreVertical } from "lucide-react";
import { deletePost, errorMessage } from "../api";

const formatTime = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
};

export default function PostCard({ post, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this post?",
    );

    if (!isConfirmed) return;

    setDeleting(true);
    setError("");

    try {
      await deletePost(post.id);
      onDeleted?.(post.id);
    } catch (err) {
      setError(errorMessage(err));
      setDeleting(false);
    }
  };

  const initial = post.email?.[0]?.toUpperCase() || "?";
  const isVideo = post.file_type === "video";

  return (
    <article className="group relative w-72 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center text-sm font-semibold text-white shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {post.email}
            </p>
            <p className="text-xs text-slate-400">
              {formatTime(post.created_at)}
            </p>
          </div>
        </div>

        {post.is_owner && (
          <div className="relative">
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                disabled={deleting}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                title="Post options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 disabled:opacity-50 transition"
                >
                  {deleting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  Delete
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  disabled={deleting}
                  className="px-2.5 py-1 rounded-lg text-xs bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media */}
      <div className="relative bg-black aspect-square">
        {isVideo ? (
          <video
            src={post.url}
            controls
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={post.url}
            alt={post.caption || "post image"}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 py-3">
          <p className="text-sm text-slate-200 break-words">{post.caption}</p>
        </div>
      )}

      {error && <div className="px-4 pb-3 text-xs text-red-300">{error}</div>}
    </article>
  );
}
