import React from 'react';
import {
  Users,
  Trophy,
  Calendar,
  Clock,
  Play,
  ArrowRight,
  Sparkles,
  Layers,
  Settings,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { DashboardSummary, Match } from '../types';

interface DashboardOverviewProps {
  summary: DashboardSummary;
  onNavigate: (tab: string) => void;
  isAdmin: boolean;
  onOpenFixturesModal: () => void;
  onOpenSettingsModal: () => void;
  onSelectMatchToScore: (match: Match) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  summary,
  onNavigate,
  isAdmin,
  onOpenFixturesModal,
  onOpenSettingsModal,
  onSelectMatchToScore,
}) => {
  const { tournament, stats, boards } = summary;

  const renderBoardCard = (boardInfo: typeof boards.board_1, boardNum: number) => {
    const isOccupied = boardInfo.status === 'In Progress';
    const isUpcoming = boardInfo.status === 'Upcoming';
    const match = boardInfo.current_match;

    return (
      <div className="bg-wood-50 rounded-2xl border-2 border-wood-300 shadow-board overflow-hidden relative group hover:border-amber-600/60 transition duration-300">
        {/* Top wood trim */}
        <div className="bg-wood-800 text-wood-100 px-5 py-3 flex items-center justify-between border-b border-wood-600">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-wood-950 flex items-center justify-center font-bold text-amber-400 text-xs border border-amber-500/40">
              B{boardNum}
            </div>
            <h3 className="font-bold text-base tracking-wide text-ivory-50">
              Carrom Board {boardNum}
            </h3>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 ${
              isOccupied
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : isUpcoming
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOccupied
                  ? 'bg-rose-400 animate-pulse'
                  : isUpcoming
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
            ></span>
            {boardInfo.status}
          </span>
        </div>

        {/* Board Surface Content */}
        <div className="p-5 flex flex-col justify-between min-h-[220px] bg-gradient-to-b from-wood-50 via-ivory-50 to-wood-100/60">
          {match ? (
            <div>
              <div className="flex items-center justify-between text-xs text-wood-700 font-medium mb-3">
                <span className="bg-wood-200/80 px-2 py-0.5 rounded font-semibold text-wood-900">
                  Match #{match.match_number} &bull; {match.round_name}
                </span>
                {match.scheduled_start && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-wood-500" />
                    {new Date(match.scheduled_start).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>

              {/* Matchup details */}
              <div className="bg-white/80 rounded-xl p-3.5 border border-wood-200/80 shadow-sm space-y-2.5">
                {/* Team A */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-charcoal-900"></div>
                    <span className="font-bold text-sm sm:text-base text-charcoal-900">
                      {match.team_a?.team_name || 'TBD'}
                    </span>
                  </div>
                  <span className="font-extrabold text-lg text-charcoal-900 px-2 py-0.5 bg-wood-100 rounded">
                    {match.score_a}
                  </span>
                </div>

                <div className="h-px bg-wood-200"></div>

                {/* Team B */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-wood-200 border border-charcoal-800"></div>
                    <span className="font-bold text-sm sm:text-base text-charcoal-900">
                      {match.team_b?.team_name || 'TBD'}
                    </span>
                  </div>
                  <span className="font-extrabold text-lg text-charcoal-900 px-2 py-0.5 bg-wood-100 rounded">
                    {match.score_b}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-wood-600">
              <div className="w-12 h-12 rounded-full bg-wood-200/80 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="font-bold text-charcoal-800 text-sm">Board is Free</p>
              <p className="text-xs text-wood-500 mt-0.5">
                Ready for the next scheduled match.
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="mt-4 pt-3 border-t border-wood-200/70 flex items-center justify-between">
            {match ? (
              <button
                onClick={() => {
                  onNavigate('schedule');
                  if (isAdmin) {
                    onSelectMatchToScore(match);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition"
              >
                {isAdmin ? 'Manage / Score Match' : 'View Match Details'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('schedule')}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold bg-wood-200 hover:bg-wood-300 text-wood-800 transition"
              >
                View Board Schedule
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-wood-900 via-wood-800 to-wood-900 text-wood-50 rounded-3xl p-6 sm:p-8 shadow-board border-4 border-wood-700 relative overflow-hidden">
        {/* Background decorative carrom circle ring */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full border-8 border-wood-700/30 pointer-events-none"></div>
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full border-4 border-amber-500/10 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Official Office Tournament
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-ivory-50 mb-2">
            Welcome to Carrom Arena
          </h2>
          <p className="text-wood-200 text-sm sm:text-base leading-relaxed mb-6">
            Two official boards, live knockout & round-robin fixtures, instant LAN phone updates, and real-time score tracking. Join the tournament or follow the action live!
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {tournament.registration_open && (
              <button
                onClick={() => onNavigate('register')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-wood-950 shadow-lg hover:shadow-amber-500/30 transition transform active:scale-95"
              >
                <Users className="w-4 h-4" />
                Register a Team
              </button>
            )}
            <button
              onClick={() => onNavigate('schedule')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-wood-800 hover:bg-wood-700 text-ivory-100 border border-wood-600 transition"
            >
              <Calendar className="w-4 h-4" />
              View Matches
            </button>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-wood-800 hover:bg-wood-700 text-amber-300 border border-amber-500/30 transition"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              View Leaderboard
            </button>
            {isAdmin && (
              <button
                onClick={onOpenFixturesModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-wood-700 hover:bg-wood-600 text-ivory-50 border border-wood-500 transition ml-auto"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                Fixtures Manager
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Key Stats Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-wood-200/80 shadow-sm hover:shadow-md transition">
          <div className="text-xs font-semibold text-wood-600 mb-1">Registered Teams</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 flex items-baseline gap-1">
            {stats.total_teams}
            <span className="text-xs font-normal text-wood-500">teams</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-wood-200/80 shadow-sm hover:shadow-md transition">
          <div className="text-xs font-semibold text-wood-600 mb-1">Total Players</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 flex items-baseline gap-1">
            {stats.total_players}
            <span className="text-xs font-normal text-wood-500">players</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-wood-200/80 shadow-sm hover:shadow-md transition">
          <div className="text-xs font-semibold text-wood-600 mb-1">Total Matches</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 flex items-baseline gap-1">
            {stats.total_matches}
            <span className="text-xs font-normal text-wood-500">games</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-wood-200/80 shadow-sm hover:shadow-md transition">
          <div className="text-xs font-semibold text-emerald-700 mb-1">Completed</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 flex items-baseline gap-1">
            {stats.completed_matches}
            <span className="text-xs font-normal text-wood-500">done</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-wood-200/80 shadow-sm hover:shadow-md transition">
          <div className="text-xs font-semibold text-rose-700 mb-1">In Progress</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 flex items-baseline gap-1">
            {stats.in_progress_matches}
            <span className="text-xs font-normal text-wood-500">live</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-wood-200/80 shadow-sm hover:shadow-md transition">
          <div className="text-xs font-semibold text-amber-700 mb-1">Upcoming</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 flex items-baseline gap-1">
            {stats.upcoming_matches}
            <span className="text-xs font-normal text-wood-500">queued</span>
          </div>
        </div>
      </div>

      {/* Two Carrom Boards Live Status Lanes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-charcoal-900">
              Live Carrom Boards
            </h3>
            <p className="text-xs sm:text-sm text-wood-600">
              Real-time court status for Board 1 and Board 2
            </p>
          </div>
          <button
            onClick={() => onNavigate('schedule')}
            className="text-xs sm:text-sm font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            Full Two-Board Lane Schedule &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderBoardCard(boards.board_1, 1)}
          {renderBoardCard(boards.board_2, 2)}
        </div>
      </div>

      {/* Tournament Settings & Admin Quick Controls */}
      <div className="bg-white rounded-2xl p-5 border border-wood-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-charcoal-900">
              Tournament Format:
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-wood-100 text-wood-800 border border-wood-300">
              {tournament.format === 'SINGLE_ELIMINATION'
                ? 'Knockout (Single Elimination)'
                : 'Round Robin'}
            </span>
          </div>
          <p className="text-xs text-wood-600">
            Team Size: <strong className="text-charcoal-900">{tournament.team_size} players</strong> &bull; Match Duration: <strong className="text-charcoal-900">{tournament.match_duration_minutes} min</strong> &bull; Interval: <strong className="text-charcoal-900">{tournament.interval_minutes} min</strong> &bull; Scoring Rule: <strong className="text-charcoal-900">{tournament.scoring_rule === 'HIGHER_SCORE' ? 'Higher Score' : `Target Score (${tournament.target_score} pts)`}</strong>
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenSettingsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-wood-100 hover:bg-wood-200 text-wood-800 border border-wood-300 transition"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
            <button
              onClick={onOpenFixturesModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition shadow-sm"
            >
              <Layers className="w-3.5 h-3.5" />
              Manage Fixtures
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

