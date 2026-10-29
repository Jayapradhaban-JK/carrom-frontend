import React, { useState } from 'react';
import {
  Layers,
  X,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Tournament, TournamentFormat } from '../types';
import { fixturesApi } from '../api';

interface AdminFixturesModalProps {
  isOpen: boolean;
  tournament: Tournament;
  teamsCount: number;
  matchesCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminFixturesModal: React.FC<AdminFixturesModalProps> = ({
  isOpen,
  tournament,
  teamsCount,
  matchesCount,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [format, setFormat] = useState<TournamentFormat>(
    tournament.format || 'SINGLE_ELIMINATION',
  );
  const [matchDuration, setMatchDuration] = useState<number>(
    tournament.match_duration_minutes || 20,
  );
  const [interval, setInterval] = useState<number>(
    tournament.interval_minutes || 5,
  );
  const [thirdPlace, setThirdPlace] = useState<boolean>(
    Boolean(tournament.third_place_playoff),
  );
  const [confirmReplace, setConfirmReplace] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasExistingMatches = matchesCount > 0;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (teamsCount < 2) {
      setError('At least 2 registered teams are required to generate fixtures.');
      return;
    }

    if (hasExistingMatches && !confirmReplace) {
      setError(
        'Please check the confirmation box below to replace the existing fixtures and schedule.',
      );
      return;
    }

    try {
      setLoading(true);
      await fixturesApi.generate({
        format,
        match_duration_minutes: matchDuration,
        interval_minutes: interval,
        third_place_playoff: thirdPlace,
        force: hasExistingMatches,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate fixtures.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        'Are you sure you want to completely RESET all tournament fixtures, matches, and scores? Team registrations will be kept and reopened.',
      )
    ) {
      return;
    }

    try {
      setResetLoading(true);
      setError(null);
      await fixturesApi.reset({ reopen_registration: true });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset fixtures.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-wood-300 shadow-2xl relative animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-wood-400 hover:text-wood-700 rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
          <Layers className="w-4 h-4 text-amber-600" />
          <span>Tournament Administration</span>
        </div>
        <h3 className="text-2xl font-black text-charcoal-900 mb-1">
          Fixture Generation
        </h3>
        <p className="text-xs text-wood-600 mb-5">
          Schedule matches across Board 1 and Board 2 with automated bye resolution and conflict checks.
        </p>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-xs font-bold text-charcoal-800 uppercase mb-2">
              Tournament Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('SINGLE_ELIMINATION')}
                className={`p-3 rounded-2xl border-2 text-left transition ${
                  format === 'SINGLE_ELIMINATION'
                    ? 'border-amber-600 bg-amber-50/50 shadow-sm'
                    : 'border-wood-200 hover:border-wood-300 bg-white'
                }`}
              >
                <div className="font-extrabold text-xs sm:text-sm text-charcoal-900">
                  Single Elimination
                </div>
                <div className="text-[11px] text-wood-500 mt-0.5">
                  Knockout bracket with byes &amp; champion finale
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('ROUND_ROBIN')}
                className={`p-3 rounded-2xl border-2 text-left transition ${
                  format === 'ROUND_ROBIN'
                    ? 'border-amber-600 bg-amber-50/50 shadow-sm'
                    : 'border-wood-200 hover:border-wood-300 bg-white'
                }`}
              >
                <div className="font-extrabold text-xs sm:text-sm text-charcoal-900">
                  Round Robin
                </div>
                <div className="text-[11px] text-wood-500 mt-0.5">
                  Every team plays every other team once
                </div>
              </button>
            </div>
          </div>

          {/* Time & Durations */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">
                Match Duration (Mins)
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={matchDuration}
                onChange={(e) => setMatchDuration(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-sm font-semibold outline-none focus:border-amber-500 bg-ivory-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">
                Slot Interval (Mins)
              </label>
              <input
                type="number"
                min={0}
                max={60}
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-sm font-semibold outline-none focus:border-amber-500 bg-ivory-50/50"
              />
            </div>
          </div>

          {/* Number of boards notification */}
          <div className="p-3 bg-wood-50 rounded-2xl border border-wood-200 text-xs text-wood-700 flex items-center justify-between">
            <span className="font-semibold">Number of Courts / Boards:</span>
            <span className="font-bold text-charcoal-900 bg-white px-2 py-0.5 rounded border border-wood-300">
              Fixed at 2 Boards
            </span>
          </div>

          {/* 3rd place toggle (knockout only) */}
          {format === 'SINGLE_ELIMINATION' && (
            <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-wood-200 bg-ivory-50/40 cursor-pointer">
              <input
                type="checkbox"
                checked={thirdPlace}
                onChange={(e) => setThirdPlace(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-wood-300 focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-charcoal-800">
                Include 3rd-Place Playoff between semifinal losers
              </span>
            </label>
          )}

          {/* Existing matches warning */}
          {hasExistingMatches && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 space-y-2">
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Existing Fixtures Found ({matchesCount} matches)</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Regenerating will replace all current matches and reset recorded scores.
              </p>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={confirmReplace}
                  onChange={(e) => setConfirmReplace(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span className="text-xs font-bold text-amber-950">
                  I confirm replacing current fixtures
                </span>
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-wood-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            {hasExistingMatches && (
              <button
                type="button"
                onClick={handleReset}
                disabled={resetLoading}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-700 transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Fixtures</span>
              </button>
            )}

            <button
              type="submit"
              disabled={loading || (hasExistingMatches && !confirmReplace)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-amber-600 hover:bg-amber-500 transition shadow-md disabled:opacity-50 ml-auto flex items-center justify-center gap-1.5"
            >
              <Layers className="w-4 h-4" />
              <span>{loading ? 'Generating...' : 'Generate Fixtures Now'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

