import React, { useState } from "react";
import {
  Trophy,
  X,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Match, Tournament } from "../types";
import { matchesApi } from "../api";
import { getTeamPlayers } from "../utils/teamUtils";

interface ScoreModalProps {
  match: Match | null;
  tournament: Tournament;
  onClose: () => void;
  onSuccess: () => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  match,
  tournament,
  onClose,
  onSuccess,
}) => {
  if (!match) return null;

  const [scoreA, setScoreA] = useState<number>(match.score_a || 0);
  const [scoreB, setScoreB] = useState<number>(match.score_b || 0);
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>(
    match.winner_team_id || "",
  );
  const [notes, setNotes] = useState<string>(match.notes || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teamAName = match.team_a?.team_name || "Team A";
  const teamBName = match.team_b?.team_name || "Team B";
  const teamAPlayers = getTeamPlayers(match.team_a);
  const teamBPlayers = getTeamPlayers(match.team_b);
  const isKnockout = tournament.format === "SINGLE_ELIMINATION";
  const isTargetScore = tournament.scoring_rule === "TARGET_SCORE";
  const targetScore = tournament.target_score || 25;

  // Auto-suggest winner based on score
  React.useEffect(() => {
    if (scoreA > scoreB && match.team_a_id) {
      setSelectedWinnerId(match.team_a_id);
    } else if (scoreB > scoreA && match.team_b_id) {
      setSelectedWinnerId(match.team_b_id);
    }
  }, [scoreA, scoreB, match.team_a_id, match.team_b_id]);

  const handleScoreChange = (team: "A" | "B", delta: number) => {
    if (team === "A") {
      setScoreA((prev) => Math.max(0, prev + delta));
    } else {
      setScoreB((prev) => Math.max(0, prev + delta));
    }
  };

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      setError(null);
      await matchesApi.updateScore(match.id, {
        score_a: scoreA,
        score_b: scoreB,
        notes: notes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update score.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMatch = async () => {
    // Validate tie in knockouts
    if (isKnockout && scoreA === scoreB) {
      setError(
        "Tied scores cannot be completed in Single Elimination knockout rounds. Please enter tiebreaker points or explicitly designate the winner.",
      );
      return;
    }

    let finalWinnerId = selectedWinnerId;
    if (!finalWinnerId) {
      if (scoreA > scoreB) finalWinnerId = match.team_a_id || "";
      else if (scoreB > scoreA) finalWinnerId = match.team_b_id || "";
    }

    if (!finalWinnerId) {
      setError("Please select or designate the winning team.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await matchesApi.complete(match.id, {
        winner_team_id: finalWinnerId,
        score_a: scoreA,
        score_b: scoreB,
        notes: notes.trim() || undefined,
      });

      // If this was the final match, fire celebration confetti!
      if (match.round_name === "Final") {
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to finalize match.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border-2 border-wood-300 shadow-2xl relative animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-wood-400 hover:text-wood-700 hover:bg-wood-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            <span>Match #{match.match_number}</span> &bull;{" "}
            <span>{match.round_name}</span> &bull;{" "}
            <span>Board {match.board_number}</span>
          </div>
          <h3 className="text-2xl font-black text-charcoal-900">
            Record Match Score
          </h3>
          <p className="text-xs text-wood-600 mt-1">
            Scoring Rule:{" "}
            <strong className="text-charcoal-900">
              {isTargetScore
                ? `First to ${targetScore} Points (Target Score)`
                : "Highest Score Wins"}
            </strong>
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Scoring Notice</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Scoring Grid: Team A vs Team B */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Team A Box */}
          <div
            className={`p-4 rounded-2xl border-2 transition ${
              selectedWinnerId === match.team_a_id
                ? "border-amber-500 bg-amber-50/30"
                : "border-wood-200 bg-ivory-50/50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="truncate pr-2">
                <span className="font-bold text-sm text-charcoal-900 truncate block">
                  {teamAName}
                </span>
                {match.team_a && (
                  <span className="text-[11px] text-wood-600 font-semibold truncate block">
                    👥 {teamAPlayers.both}
                  </span>
                )}
              </div>
              <div className="w-3 h-3 rounded-full bg-charcoal-900 shrink-0"></div>
            </div>

            {/* Score Display and +/- Buttons */}
            <div className="flex items-center justify-center gap-3 my-3">
              <button
                type="button"
                onClick={() => handleScoreChange("A", -1)}
                className="w-9 h-9 rounded-xl bg-wood-200 hover:bg-wood-300 text-wood-800 font-bold flex items-center justify-center transition"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="w-16 text-center font-black text-3xl text-charcoal-900 font-mono">
                {scoreA}
              </span>

              <button
                type="button"
                onClick={() => handleScoreChange("A", 1)}
                className="w-9 h-9 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center justify-center transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Carrom quick points buttons */}
            <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-wood-200/80">
              <button
                type="button"
                onClick={() => handleScoreChange("A", 1)}
                className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white border border-wood-300 hover:bg-wood-100 text-charcoal-800"
                title="Single carrom coin"
              >
                +1 Coin
              </button>
              <button
                type="button"
                onClick={() => handleScoreChange("A", 3)}
                className="px-2 py-1 rounded-md text-[11px] font-bold bg-queen-100 border border-queen-300 hover:bg-queen-200 text-queen-800"
                title="Queen with cover (+3 points)"
              >
                +3 Queen
              </button>
              <button
                type="button"
                onClick={() => setScoreA(0)}
                className="px-1.5 py-1 rounded-md text-[10px] text-wood-500 hover:text-wood-800"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Team B Box */}
          <div
            className={`p-4 rounded-2xl border-2 transition ${
              selectedWinnerId === match.team_b_id
                ? "border-amber-500 bg-amber-50/30"
                : "border-wood-200 bg-ivory-50/50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="truncate pr-2">
                <span className="font-bold text-sm text-charcoal-900 truncate block">
                  {teamBName}
                </span>
                {match.team_b && (
                  <span className="text-[11px] text-wood-600 font-semibold truncate block">
                    👥 {teamBPlayers.both}
                  </span>
                )}
              </div>
              <div className="w-3 h-3 rounded-full bg-wood-200 border border-charcoal-800 shrink-0"></div>
            </div>

            {/* Score Display and +/- Buttons */}
            <div className="flex items-center justify-center gap-3 my-3">
              <button
                type="button"
                onClick={() => handleScoreChange("B", -1)}
                className="w-9 h-9 rounded-xl bg-wood-200 hover:bg-wood-300 text-wood-800 font-bold flex items-center justify-center transition"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="w-16 text-center font-black text-3xl text-charcoal-900 font-mono">
                {scoreB}
              </span>

              <button
                type="button"
                onClick={() => handleScoreChange("B", 1)}
                className="w-9 h-9 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center justify-center transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Carrom quick points buttons */}
            <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-wood-200/80">
              <button
                type="button"
                onClick={() => handleScoreChange("B", 1)}
                className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white border border-wood-300 hover:bg-wood-100 text-charcoal-800"
                title="Single carrom coin"
              >
                +1 Coin
              </button>
              <button
                type="button"
                onClick={() => handleScoreChange("B", 3)}
                className="px-2 py-1 rounded-md text-[11px] font-bold bg-queen-100 border border-queen-300 hover:bg-queen-200 text-queen-800"
                title="Queen with cover (+3 points)"
              >
                +3 Queen
              </button>
              <button
                type="button"
                onClick={() => setScoreB(0)}
                className="px-1.5 py-1 rounded-md text-[10px] text-wood-500 hover:text-wood-800"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Winner Designation Selector */}
        <div className="mb-5 bg-wood-50 rounded-2xl p-4 border border-wood-200">
          <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Designated Match Winner</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!match.team_a_id}
              onClick={() => setSelectedWinnerId(match.team_a_id || "")}
              className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                selectedWinnerId === match.team_a_id
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-white hover:bg-wood-100 text-charcoal-800 border border-wood-300"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="truncate">{teamAName}</span>
            </button>

            <button
              type="button"
              disabled={!match.team_b_id}
              onClick={() => setSelectedWinnerId(match.team_b_id || "")}
              className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                selectedWinnerId === match.team_b_id
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-white hover:bg-wood-100 text-charcoal-800 border border-wood-300"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="truncate">{teamBName}</span>
            </button>
          </div>
        </div>

        {/* Optional Notes */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-wood-700 mb-1">
            Match Remarks / Tiebreaker Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Won by queen cover in sudden death"
            className="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-xs text-charcoal-800 outline-none focus:border-amber-500 bg-ivory-50/50"
          />
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-wood-200">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-wood-100 hover:bg-wood-200 text-wood-800 transition disabled:opacity-60"
          >
            Save In-Progress Score
          </button>

          <button
            type="button"
            onClick={handleCompleteMatch}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-md hover:shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finalize Match & Advance Winner</span>
          </button>
        </div>
      </div>
    </div>
  );
};
