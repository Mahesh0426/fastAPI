import { ImageIcon, LogOut, Plus } from "lucide-react";
import { useAuth } from "../AuthContext";

export default function Navbar({ onUploadClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold leading-tight">Frame</h1>
            <p className="text-xs text-slate-400 leading-tight hidden sm:block">
              Share what you see
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 pl-3 ml-1 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center text-xs font-semibold text-white">
              {user?.email?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-white leading-tight max-w-[160px] truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
