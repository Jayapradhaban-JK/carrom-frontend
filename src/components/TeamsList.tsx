import React, { useState } from "react";
import {
  Users,
  User,
  Trophy,
  LayoutGrid,
  Search,
  ArrowUpDown,
  UserPlus,
  CheckCircle2,
  Copy,
  Check,
  Crown,
  MoreVertical,
  Edit2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Team, Tournament, Match } from "../types";
import { teamsApi } from "../api";
import { getTeamPlayers } from "../utils/teamUtils";

interface TeamsListProps {
  teams: Team[];
  tournament: Tournament;
  isAdmin: boolean;
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
  matches?: Match[];
}

export const TeamsList: React.FC<TeamsListProps> = ({
  teams,
  tournament,
  isAdmin,
  onNavigate,
  onRefresh,
  matches = [],
}) => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"registration" | "name">("registration");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [menuOpenTeamId, setMenuOpenTeamId] = useState<string | null>(null);

  // Admin Edit modal state
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [editCaptainName, setEditCaptainName] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Admin Delete modal state
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Stats calculation
  const totalPlayers = teams.reduce((acc, t) => acc + (t.players?.length || 2), 0);
  const matchesPlayed = matches.filter((m) => m.status === "COMPLETED").length;
  const availableBoards = tournament.settings?.boards_count || 2;

  // Filter & Sort
  const filteredTeams = teams.filter((team) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const matchesName = team.team_name.toLowerCase().includes(term);
    const matchesCaptain = team.captain_name.toLowerCase().includes(term);
    const matchesReg = team.registration_number.toLowerCase().includes(term);
    return matchesName || matchesCaptain || matchesReg;
  });

  const sortedTeams = [...filteredTeams].sort((a, b) => {
    if (sortBy === "name") {
      return a.team_name.localeCompare(b.team_name);
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const handleCopyId = (regNum: string) => {
    navigator.clipboard.writeText(regNum);
    setCopiedId(regNum);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenEdit = (team: Team) => {
    setEditingTeam(team);
    setEditTeamName(team.team_name);
    setEditCaptainName(team.captain_name);
    setEditContact(team.contact_number || "");
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;

    try {
      setEditLoading(true);
      await teamsApi.update(editingTeam.id, {
        team_name: editTeamName.trim(),
        captain_name: editCaptainName.trim(),
        contact_number: editContact.trim() || undefined,
      });

      setEditingTeam(null);
      onRefresh();
    } catch (err: any) {
      setEditError(err.response?.data?.message || "Failed to update team.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTeam) return;

    try {
      setDeleteLoading(true);
      await teamsApi.delete(deletingTeam.id);
      setDeletingTeam(null);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete team.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-fadeIn">
      {/* 1. TOP 4 STAT CARDS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Registered Teams */}
        <div className="bg-white rounded-lg p-4 sm:p-5 border border-stone-200/90 shadow-xs relative overflow-hidden flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-amber-100/80 text-amber-800 flex items-center justify-center border border-amber-200/60 shrink-0">
              <Users className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-black text-stone-900 font-mono leading-none mb-1">
                {teams.length}
              </span>
              <span className="block text-xs text-stone-500 font-semibold">
                Registered Teams
              </span>
            </div>
          </div>
          <Users className="w-14 h-14 text-amber-500/10 absolute -right-2 -bottom-2 pointer-events-none" />
        </div>

        {/* Card 2: Total Players */}
        <div className="bg-white rounded-lg p-4 sm:p-5 border border-stone-200/90 shadow-xs relative overflow-hidden flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-amber-100/80 text-amber-800 flex items-center justify-center border border-amber-200/60 shrink-0">
              <User className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-black text-stone-900 font-mono leading-none mb-1">
                {totalPlayers}
              </span>
              <span className="block text-xs text-stone-500 font-semibold">
                Total Players
              </span>
            </div>
          </div>
          <User className="w-14 h-14 text-amber-500/10 absolute -right-2 -bottom-2 pointer-events-none" />
        </div>

        {/* Card 3: Matches Played */}
        <div className="bg-white rounded-lg p-4 sm:p-5 border border-stone-200/90 shadow-xs relative overflow-hidden flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-amber-100/80 text-amber-800 flex items-center justify-center border border-amber-200/60 shrink-0">
              <Trophy className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-black text-stone-900 font-mono leading-none mb-1">
                {matchesPlayed}
              </span>
              <span className="block text-xs text-stone-500 font-semibold">
                Matches Played
              </span>
            </div>
          </div>
          <Trophy className="w-14 h-14 text-amber-500/10 absolute -right-2 -bottom-2 pointer-events-none" />
        </div>

        {/* Card 4: Available Boards */}
        <div className="bg-white rounded-lg p-4 sm:p-5 border border-stone-200/90 shadow-xs relative overflow-hidden flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-amber-100/80 text-amber-800 flex items-center justify-center border border-amber-200/60 shrink-0">
              <LayoutGrid className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-black text-stone-900 font-mono leading-none mb-1">
                {availableBoards}
              </span>
              <span className="block text-xs text-stone-500 font-semibold">
                Available Boards
              </span>
            </div>
          </div>
          <LayoutGrid className="w-14 h-14 text-amber-500/10 absolute -right-2 -bottom-2 pointer-events-none" />
        </div>
      </div>

      {/* 2. MAIN REGISTERED TEAMS CONTAINER */}
      <div className="bg-white rounded-lg p-5 sm:p-7 border border-stone-200/90 shadow-sm space-y-6">
        {/* Header with Search and Sort Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-5 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Registered Teams
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                {teams.length} {teams.length === 1 ? "Team" : "Teams"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Real-time roster of confirmed championship participants
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search team or captain..."
                className="w-full pl-9 pr-4 py-2 rounded-md border border-stone-300 text-xs sm:text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-2 rounded-md border border-stone-300 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-stone-800 outline-none cursor-pointer"
              >
                <option value="registration">Registration Order</option>
                <option value="name">Team Name (A-Z)</option>
              </select>
            </div>

            {/* Register team button */}
            {tournament.registration_open && (
              <button
                type="button"
                onClick={() => onNavigate("register")}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition shrink-0 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Team</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {sortedTeams.map((team) => {
            const playersInfo = getTeamPlayers(team);
            const isMenuOpen = menuOpenTeamId === team.id;
            const isCopied = copiedId === team.registration_number;

            return (
              <div
                key={team.id}
                className="bg-white rounded-lg border border-stone-200/90 hover:border-amber-400/80 p-5 shadow-xs transition space-y-4 flex flex-col justify-between relative"
              >
                <div className="space-y-4">
                  {/* Top Bar: Reg number pill + time + 3 dots menu */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200/70 text-[11px]">
                      {team.registration_number}
                    </span>

                    <div className="flex items-center gap-1 text-stone-400 relative">
                      <span className="text-[11px] font-medium mr-1 text-stone-500">
                        {new Date(team.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setMenuOpenTeamId(isMenuOpen ? null : team.id)
                        }
                        className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                        title="Team options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div
                          className="absolute right-0 top-7 w-36 bg-white border border-stone-200 rounded-md shadow-lg py-1 z-30 animate-fadeIn"
                          onMouseLeave={() => setMenuOpenTeamId(null)}
                        >
                          {isAdmin ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuOpenTeamId(null);
                                  handleOpenEdit(team);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-stone-700 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2 font-medium"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                                <span>Edit Team</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuOpenTeamId(null);
                                  setDeletingTeam(team);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Team</span>
                              </button>
                            </>
                          ) : (
                            <div className="px-3 py-2 text-[11px] text-stone-500">
                              Registered Team
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team Identity Row: Avatar + Name/Tagline + Registered Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                        {team.logo_url ? (
                          <img
                            src={team.logo_url}
                            alt={team.team_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-amber-800 bg-amber-50 text-base">
                            {team.team_name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-black text-stone-900 truncate">
                          {team.team_name}
                        </h3>
                        {team.tagline ? (
                          <p className="text-xs text-amber-700 italic font-semibold truncate mt-0.5">
                            "{team.tagline}"
                          </p>
                        ) : (
                          <p className="text-[11px] text-stone-400">2-Player Team</p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Registered</span>
                    </span>
                  </div>

                  {/* Team Members Section */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-stone-700 tracking-wide">
                      Team Members (2)
                    </div>

                    {/* Player 1 (Captain) */}
                    <div className="flex items-center justify-between p-2 rounded-md bg-stone-50/80 border border-stone-200/70">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-6 h-6 rounded bg-amber-100 text-amber-800 text-[11px] font-black flex items-center justify-center shrink-0 border border-amber-300">
                          P1
                        </span>
                        <span className="font-extrabold text-xs sm:text-sm text-stone-900 truncate">
                          {playersInfo.player1}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-800 bg-amber-100/90 border border-amber-200/80 px-2 py-0.5 rounded shrink-0">
                        <Crown className="w-3 h-3 text-amber-600" />
                        <span>Captain</span>
                      </span>
                    </div>

                    {/* Player 2 (Teammate) */}
                    <div className="flex items-center justify-between p-2 rounded-md bg-stone-50/80 border border-stone-200/70">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-6 h-6 rounded bg-stone-200/80 text-stone-700 text-[11px] font-black flex items-center justify-center shrink-0 border border-stone-300">
                          P2
                        </span>
                        <span className="font-extrabold text-xs sm:text-sm text-stone-900 truncate">
                          {playersInfo.player2}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded shrink-0">
                        Player
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Bar: 2 Players & Team ID with Copy */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-50 border border-stone-200 text-stone-600 text-[11px] font-semibold">
                    <Users className="w-3.5 h-3.5 text-stone-500" />
                    <span>2 Players</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopyId(team.registration_number)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-mono text-[11px] font-semibold transition cursor-pointer"
                    title="Click to copy registration ID"
                  >
                    <span>Team ID: {team.registration_number}</span>
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-stone-400" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Placeholder: "More teams will appear here" */}
          {tournament.registration_open && (
            <div className="border-2 border-dashed border-amber-200/90 bg-amber-50/20 rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[260px] space-y-3">
              <div className="w-14 h-14 rounded-lg bg-amber-100/70 text-amber-800 flex items-center justify-center border border-amber-200 shadow-xs">
                <Users className="w-7 h-7 text-amber-700" />
              </div>
              <div>
                <h4 className="text-base font-black text-stone-900 mb-0.5">
                  More teams will appear here
                </h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Register additional teams to build your tournament roster.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("register")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition cursor-pointer mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {sortedTeams.length > 0
                    ? "Register Another Team"
                    : "Register Team"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Admin Edit Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full border border-stone-300 shadow-2xl animate-scaleIn">
            <h3 className="text-xl font-bold text-stone-900 mb-1">
              Edit Team Details
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Registration #{editingTeam.registration_number}
            </p>

            {editError && (
              <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-md border border-stone-300 text-sm font-semibold outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                  Captain Name
                </label>
                <input
                  type="text"
                  required
                  value={editCaptainName}
                  onChange={(e) => setEditCaptainName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-md border border-stone-300 text-sm font-semibold outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={editContact}
                  onChange={(e) => setEditContact(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-md border border-stone-300 text-sm outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="px-4 py-2 rounded-md text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 rounded-md text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition shadow-sm disabled:opacity-60"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Delete Confirmation Modal */}
      {deletingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-sm w-full border border-stone-300 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Delete Team?
            </h3>
            <p className="text-xs text-stone-600 mb-6">
              Are you sure you want to remove{" "}
              <strong>"{deletingTeam.team_name}"</strong> (
              {deletingTeam.registration_number})? This action cannot be undone.
            </p>

            <div className="flex justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingTeam(null)}
                className="px-4 py-2 rounded-md text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-md text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm disabled:opacity-60"
              >
                {deleteLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
