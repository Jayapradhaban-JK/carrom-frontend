import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Play,
  CheckCircle2,
  Pause,
  ArrowRightLeft,
  Filter,
  Edit3,
  AlertCircle,
  Trophy,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Match, MatchStatus, Tournament } from "../types";
import { matchesApi } from "../api";

interface ScheduleViewProps {
  matches: Match[];
  tournament: Tournament;
  isAdmin: boolean;
  onSelectMatchToScore: (match: Match) => void;
  onRefresh: () => void;
  onOpenFixturesModal: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  matches,
  tournament,
  isAdmin,
  onSelectMatchToScore,
  onRefresh,
  onOpenFixturesModal,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [boardFilter, setBoardFilter] = useState<"ALL" | 1 | 2>("ALL");

  // Move board state
  const [movingMatch, setMovingMatch] = useState<Match | null>(null);
  const [moveLoading, setMoveLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter matches
  const filteredMatches = matches.filter((m) => {
    // Hide pure byes from live board lane view (they are displayed in bracket view)
    if (m.is_bye) return false;

    if (boardFilter !== "ALL" && m.board_number !== boardFilter) return false;
    if (statusFilter !== "ALL") {
      if (statusFilter === "LIVE" && m.status !== "IN_PROGRESS") return false;
      if (
        statusFilter === "UPCOMING" &&
        m.status !== "SCHEDULED" &&
        m.status !== "READY"
      )
        return false;
      if (statusFilter === "COMPLETED" && m.status !== "COMPLETED")
        return false;
    }
    return true;
  });

  const board1Matches = filteredMatches.filter((m) => m.board_number === 1);
  const board2Matches = filteredMatches.filter((m) => m.board_number === 2);

  const handleStartMatch = async (matchId: string) => {
    try {
      setActionError(null);
      await matchesApi.start(matchId);
      onRefresh();
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to start match.");
    }
  };

  const handlePauseMatch = async (matchId: string) => {
    try {
      setActionError(null);
      await matchesApi.pause(matchId);
      onRefresh();
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to pause match.");
    }
  };

  const handleMoveBoard = async (match: Match) => {
    const targetBoard = match.board_number === 1 ? 2 : 1;
    try {
      setMoveLoading(true);
      setActionError(null);
      await matchesApi.schedule(match.id, {
        board_number: targetBoard,
      });
      setMovingMatch(null);
      onRefresh();
    } catch (err: any) {
      setActionError(
        err.response?.data?.message || "Failed to move match to other board.",
      );
    } finally {
      setMoveLoading(false);
    }
  };

  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-700 border border-rose-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Live In Progress
          </span>
        );
      case "READY":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-800 border border-emerald-300">
            Ready to Play
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-wood-100 text-wood-700 border border-wood-200">
            Scheduled
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-800 border border-purple-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-purple-600" />
            Completed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const renderMatchCard = (match: Match) => {
    const isLive = match.status === "IN_PROGRESS";
    const isCompleted = match.status === "COMPLETED";
    const isReady = match.status === "READY";
    const isScheduled = match.status === "SCHEDULED";
    const hasBothTeams = Boolean(match.team_a_id && match.team_b_id);

    return (
      <div
        key={match.id}
        className={`bg-white rounded-2xl border-2 p-4 shadow-sm transition hover:shadow-md ${
          isLive
            ? "border-rose-400 bg-rose-50/20"
            : isCompleted
              ? "border-wood-200/90"
              : isReady
                ? "border-amber-400 bg-amber-50/20"
                : "border-wood-200"
        }`}
      >
        {/* Match Header */}
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold px-2 py-0.5 rounded bg-wood-100 text-wood-800 border border-wood-200">
              Match #{match.match_number}
            </span>
            <span className="font-semibold text-charcoal-700">
              {match.round_name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {match.scheduled_start && (
              <span className="text-[11px] text-wood-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-wood-400" />
                {new Date(match.scheduled_start).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            {getStatusBadge(match.status)}
          </div>
        </div>

        {/* Team Matchup Box */}
        <div className="space-y-2 bg-ivory-50/80 rounded-xl p-3 border border-wood-200/80">
          {/* Team A */}
          <div
            className={`flex items-center justify-between p-1 rounded-lg ${
              isCompleted && match.winner_team_id === match.team_a_id
                ? "bg-amber-100/70 font-black text-amber-950"
                : ""
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <div
                className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                  match.team_a_id
                    ? "bg-charcoal-900"
                    : "bg-wood-300 border border-dashed border-wood-500"
                }`}
              ></div>
              <span className="font-bold text-sm text-charcoal-900 truncate">
                {match.team_a?.team_name || (
                  <span className="text-wood-400 italic font-normal">
                    TBD (Feeder Match)
                  </span>
                )}
              </span>
              {isCompleted && match.winner_team_id === match.team_a_id && (
                <span className="text-[10px] uppercase font-extrabold bg-amber-500 text-wood-950 px-1.5 py-0.2 rounded shrink-0">
                  Winner
                </span>
              )}
            </div>
            <span className="font-extrabold text-base text-charcoal-900 ml-2 px-2 py-0.5 bg-white rounded border border-wood-200">
              {match.score_a}
            </span>
          </div>

          <div className="h-px bg-wood-200/60"></div>

          {/* Team B */}
          <div
            className={`flex items-center justify-between p-1 rounded-lg ${
              isCompleted && match.winner_team_id === match.team_b_id
                ? "bg-amber-100/70 font-black text-amber-950"
                : ""
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <div
                className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                  match.team_b_id
                    ? "bg-wood-200 border border-charcoal-800"
                    : "bg-wood-300 border border-dashed border-wood-500"
                }`}
              ></div>
              <span className="font-bold text-sm text-charcoal-900 truncate">
                {match.team_b?.team_name || (
                  <span className="text-wood-400 italic font-normal">
                    TBD (Feeder Match)
                  </span>
                )}
              </span>
              {isCompleted && match.winner_team_id === match.team_b_id && (
                <span className="text-[10px] uppercase font-extrabold bg-amber-500 text-wood-950 px-1.5 py-0.2 rounded shrink-0">
                  Winner
                </span>
              )}
            </div>
            <span className="font-extrabold text-base text-charcoal-900 ml-2 px-2 py-0.5 bg-white rounded border border-wood-200">
              {match.score_b}
            </span>
          </div>
        </div>

        {match.notes && (
          <p className="text-[11px] text-wood-600 italic mt-2 px-1">
            Note: {match.notes}
          </p>
        )}

        {/* Action Controls */}
        <div className="mt-3 pt-2.5 border-t border-wood-100 flex flex-wrap items-center justify-between gap-2">
          {/* Admin Controls */}
          {isAdmin ? (
            <>
              <div className="flex items-center gap-1.5">
                {(isReady || isScheduled) && hasBothTeams && (
                  <button
                    onClick={() => handleStartMatch(match.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start
                  </button>
                )}

                {isLive && (
                  <button
                    onClick={() => handlePauseMatch(match.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-wood-200 hover:bg-wood-300 text-wood-800 transition"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    Pause
                  </button>
                )}

                <button
                  onClick={() => onSelectMatchToScore(match)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isCompleted ? "Edit Score" : "Score / Complete"}
                </button>
              </div>

              {/* Move Board button */}
              {!isCompleted && (
                <button
                  onClick={() => handleMoveBoard(match)}
                  disabled={moveLoading}
                  className="text-xs text-wood-600 hover:text-amber-800 flex items-center gap-1 hover:underline ml-auto"
                  title={`Move to Board ${match.board_number === 1 ? 2 : 1}`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>To Board {match.board_number === 1 ? 2 : 1}</span>
                </button>
              )}
            </>
          ) : (
            <div className="text-[11px] text-wood-500 flex items-center gap-1">
              {isLive ? (
                <span className="text-rose-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  Active on Board {match.board_number}
                </span>
              ) : isCompleted ? (
                <span className="text-purple-700 font-semibold">
                  Match Concluded
                </span>
              ) : (
                <span>Awaiting match call</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Filter Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-wood-300 shadow-board flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-charcoal-900">
            Two-Board Match Schedule
          </h2>
          <p className="text-xs sm:text-sm text-wood-600 mt-0.5">
            Sequential matches scheduled across Board 1 and Board 2
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-ivory-50 p-1 rounded-xl border border-wood-300 text-xs">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                statusFilter === "ALL"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-wood-700 hover:bg-wood-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("LIVE")}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                statusFilter === "LIVE"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-wood-700 hover:bg-wood-100"
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setStatusFilter("UPCOMING")}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                statusFilter === "UPCOMING"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-wood-700 hover:bg-wood-100"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setStatusFilter("COMPLETED")}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                statusFilter === "COMPLETED"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-wood-700 hover:bg-wood-100"
              }`}
            >
              Completed
            </button>
          </div>

          {/* Board Filter for smaller screens */}
          <div className="md:hidden flex items-center gap-1 bg-ivory-50 p-1 rounded-xl border border-wood-300 text-xs">
            <button
              onClick={() => setBoardFilter("ALL")}
              className={`px-2 py-1 rounded-lg font-semibold ${
                boardFilter === "ALL"
                  ? "bg-wood-800 text-white"
                  : "text-wood-700"
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setBoardFilter(1)}
              className={`px-2 py-1 rounded-lg font-semibold ${
                boardFilter === 1 ? "bg-wood-800 text-white" : "text-wood-700"
              }`}
            >
              Board 1
            </button>
            <button
              onClick={() => setBoardFilter(2)}
              className={`px-2 py-1 rounded-lg font-semibold ${
                boardFilter === 2 ? "bg-wood-800 text-white" : "text-wood-700"
              }`}
            >
              Board 2
            </button>
          </div>

          {/* Admin Fixtures Button */}
          {isAdmin && (
            <button
              onClick={onOpenFixturesModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-wood-800 hover:bg-wood-700 text-amber-400 border border-amber-500/30 transition shadow-sm"
            >
              <Layers className="w-3.5 h-3.5" />
              Fixtures
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Schedule Notice</p>
            <p className="text-xs text-rose-700 mt-0.5">{actionError}</p>
          </div>
        </div>
      )}

      {matches.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 border-2 border-dashed border-wood-300 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-wood-100 text-wood-500 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-charcoal-900 mb-1">
            No Fixtures Generated Yet
          </h3>
          <p className="text-xs sm:text-sm text-wood-600 mb-6">
            Once teams are registered, the tournament administrator can generate
            Single Elimination or Round Robin fixtures.
          </p>
          {isAdmin && (
            <button
              onClick={onOpenFixturesModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md transition"
            >
              <Layers className="w-4 h-4" />
              Generate Fixtures Now
            </button>
          )}
        </div>
      ) : (
        /* Two Dedicated Board Lanes: Board 1 | Board 2 */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lane 1: Board 1 */}
          <div className="space-y-4">
            <div className="bg-wood-900 text-wood-50 px-4 py-3 rounded-2xl border-2 border-wood-700 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-amber-500 text-charcoal-950 font-black text-sm flex items-center justify-center">
                  B1
                </span>
                <div>
                  <h3 className="font-bold text-base text-ivory-50">
                    Board 1 Lane
                  </h3>
                  <p className="text-[11px] text-wood-300">
                    {board1Matches.length} scheduled{" "}
                    {board1Matches.length === 1 ? "match" : "matches"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {board1Matches.length > 0 ? (
                board1Matches.map(renderMatchCard)
              ) : (
                <div className="bg-white/60 rounded-2xl p-8 border border-dashed border-wood-300 text-center text-xs text-wood-500">
                  No matches on Board 1 matching filter.
                </div>
              )}
            </div>
          </div>

          {/* Lane 2: Board 2 */}
          <div className="space-y-4">
            <div className="bg-wood-900 text-wood-50 px-4 py-3 rounded-2xl border-2 border-wood-700 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-amber-500 text-charcoal-950 font-black text-sm flex items-center justify-center">
                  B2
                </span>
                <div>
                  <h3 className="font-bold text-base text-ivory-50">
                    Board 2 Lane
                  </h3>
                  <p className="text-[11px] text-wood-300">
                    {board2Matches.length} scheduled{" "}
                    {board2Matches.length === 1 ? "match" : "matches"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {board2Matches.length > 0 ? (
                board2Matches.map(renderMatchCard)
              ) : (
                <div className="bg-white/60 rounded-2xl p-8 border border-dashed border-wood-300 text-center text-xs text-wood-500">
                  No matches on Board 2 matching filter.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
