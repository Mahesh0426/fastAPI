import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "./AuthContext";
import Auth from "./components/Auth";
import Navbar from "./components/Navbar";
import Feed from "./components/Feed";
import UploadModal from "./components/UploadModal";

export default function App() {
  const { user, loading } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950/40 text-slate-100">
      <Navbar onUploadClick={() => setShowUpload(true)} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Feed
          refreshKey={refreshKey}
          onUploadClick={() => setShowUpload(true)}
        />
      </main>

      {/* Mount the modal only while it's open so its state resets on every open */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
