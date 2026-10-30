import React, { useState } from 'react';
import { Settings, X, Check, AlertCircle } from 'lucide-react';
import { Tournament, ScoringRule } from '../types';
import { tournamentApi } from '../api';

interface AdminSettingsModalProps {
  isOpen: boolean;
  tournament: Tournament;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  tournament,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(tournament.name);
  const [registrationOpen, setRegistrationOpen] = useState(
    tournament.registration_open,
  );
  const [teamSize, setTeamSize] = useState(tournament.team_size || 2);
  const [scoringRule, setScoringRule] = useState<ScoringRule>(
    tournament.scoring_rule || 'HIGHER_SCORE',
  );
  const [targetScore, setTargetScore] = useState(
    tournament.target_score || 25,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      // Update registration settings
      await tournamentApi.updateRegistration({
        registration_open: registrationOpen,
        team_size: teamSize,
      });

      // Update tournament general settings
      await tournamentApi.updateTournament({
        name: name.trim(),
        scoring_rule: scoringRule,
        target_score: targetScore,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to save tournament settings.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full border border-wood-300 shadow-2xl relative animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-wood-400 hover:text-wood-700 rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-md bg-wood-100 text-wood-800 flex items-center justify-center mb-3">
          <Settings className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-charcoal-900 mb-1">
          Tournament Settings
        </h3>
        <p className="text-xs text-wood-600 mb-5">
          Configure registration status, team requirements, and scoring format.
        </p>

        {error && (
          <div className="mb-4 p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Tournament Name */}
          <div>
            <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">
              Tournament Title
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-xs sm:text-sm font-semibold outline-none focus:border-amber-500 bg-ivory-50/50"
            />
          </div>

          {/* Registration Open Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-ivory-50 rounded-md border border-wood-200">
            <div>
              <div className="text-xs font-bold text-charcoal-900">
                Team Registration
              </div>
              <div className="text-[11px] text-wood-500">
                Allow employees to register teams via LAN
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRegistrationOpen(!registrationOpen)}
              className={`w-12 h-7 rounded-full transition p-1 flex items-center ${
                registrationOpen ? 'bg-emerald-600 justify-end' : 'bg-wood-300 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-md"></span>
            </button>
          </div>

          {/* Team Size */}
          <div>
            <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1 flex justify-between">
              <span>Required Players Per Team</span>
              <span className="text-amber-700">{teamSize} Players</span>
            </label>
            <input
              type="number"
              min={1}
              max={6}
              value={teamSize}
              onChange={(e) => setTeamSize(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-sm font-semibold outline-none focus:border-amber-500 bg-ivory-50/50"
            />
            <p className="text-[11px] text-wood-500 mt-1">
              Standard carrom doubles requires 2 players (Captain + 1 partner).
            </p>
          </div>

          {/* Scoring Rule */}
          <div>
            <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1.5">
              Match Scoring Rule
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScoringRule('HIGHER_SCORE')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition ${
                  scoringRule === 'HIGHER_SCORE'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm'
                    : 'border-wood-200 bg-white text-wood-700'
                }`}
              >
                Higher Score Wins
              </button>
              <button
                type="button"
                onClick={() => setScoringRule('TARGET_SCORE')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition ${
                  scoringRule === 'TARGET_SCORE'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm'
                    : 'border-wood-200 bg-white text-wood-700'
                }`}
              >
                Target Score Wins
              </button>
            </div>
          </div>

          {scoringRule === 'TARGET_SCORE' && (
            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">
                Target Score (Points)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={targetScore}
                onChange={(e) => setTargetScore(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-sm font-semibold outline-none focus:border-amber-500 bg-ivory-50/50"
              />
            </div>
          )}

          <div className="pt-4 border-t border-wood-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-wood-100 hover:bg-wood-200 text-wood-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition shadow-sm disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

