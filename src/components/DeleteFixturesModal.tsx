import React, { useState } from "react";
import { Trash2, AlertTriangle, X, CheckCircle2 } from "lucide-react";
import { fixturesApi } from "../api";

interface DeleteFixturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  matchesCount: number;
}

export const DeleteFixturesModal: React.FC<DeleteFixturesModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  matchesCount,
}) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await fixturesApi.delete();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to delete fixtures. Please check your administrator session.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full border-2 border-rose-300 shadow-2xl relative animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-wood-400 hover:text-wood-700 rounded-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <Trash2 className="w-7 h-7" />
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-charcoal-900 text-center mb-1">
          Delete All Fixtures?
        </h3>

        <p className="text-xs sm:text-sm text-wood-600 text-center mb-5 leading-relaxed">
          You are about to remove all{" "}
          <strong>{matchesCount} scheduled matches</strong>, court allocations,
          and recorded scores from the tournament.
        </p>

        <div className="p-3.5 bg-rose-50 rounded-md border border-rose-200 text-xs text-rose-800 space-y-1 mb-6">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>What happens after deletion:</span>
          </div>
          <ul className="list-disc list-inside text-[11px] text-rose-700 pl-1 space-y-0.5">
            <li>All bracket and round-robin matches are wiped.</li>
            <li>Board 1 &amp; Board 2 schedules are cleared.</li>
            <li>All registered teams will remain intact.</li>
            <li>Team registration will be automatically reopened.</li>
          </ul>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-100 border border-rose-300 text-rose-900 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-md text-xs sm:text-sm font-semibold bg-wood-100 hover:bg-wood-200 text-wood-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="w-full sm:w-auto px-5 py-2.5 rounded-md text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>{loading ? "Deleting Fixtures..." : "Yes, Delete Fixtures"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
