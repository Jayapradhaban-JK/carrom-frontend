import React, { useState } from "react";
import { Shield, X, Lock, User, AlertCircle, Info } from "lucide-react";
import { authApi } from "../api";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const res = await authApi.login({ username, password });
      localStorage.setItem("carrom_admin_token", res.access_token);
      localStorage.setItem("carrom_admin_user", JSON.stringify(res.user));
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Invalid credentials. Please verify your administrator password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-wood-300 shadow-2xl relative animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-wood-400 hover:text-wood-700 rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
          <Shield className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-charcoal-900 mb-1">
          Administrator Login
        </h3>
        <p className="text-xs text-wood-600 mb-4">
          Authenticate to manage fixtures, scores, teams, and tournament
          settings.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-wood-300 text-xs sm:text-sm font-semibold outline-none focus:border-amber-500 bg-ivory-50/50"
              />
              <User className="w-4 h-4 text-wood-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-wood-300 text-xs sm:text-sm font-semibold outline-none focus:border-amber-500 bg-ivory-50/50"
              />
              <Lock className="w-4 h-4 text-wood-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="p-3 bg-wood-50 rounded-xl border border-wood-200 text-[11px] text-wood-600 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 transition shadow-sm disabled:opacity-60"
          >
            {loading ? "Authenticating..." : "Sign In as Administrator"}
          </button>
        </form>
      </div>
    </div>
  );
};
