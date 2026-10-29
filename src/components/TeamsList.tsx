import React, { useState } from "react";
import {
  Users,
  Search,
  ArrowUpDown,
  Star,
  UserCheck,
  Edit2,
  Trash2,
  AlertTriangle,
  UserPlus,
  ShieldAlert,
} from "lucide-react";
import { Team, Tournament } from "../types";
import { teamsApi } from "../api";

interface TeamsListProps {
  teams: Team[];
  tournament: Tournament;
  isAdmin: boolean;
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
}

export const TeamsList: React.FC<TeamsListProps> = ({
  teams,
  tournament,
  isAdmin,
  onNavigate,
  onRefresh,
}) => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"registration" | "name">("registration");

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
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Search and Sort Controls */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-wood-300 shadow-board flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-charcoal-900">
              Registered Teams
            </h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
              {teams.length} {teams.length === 1 ? "Team" : "Teams"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-wood-600 mt-0.5">
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
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-wood-300 text-xs sm:text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-ivory-50/50"
            />
            <Search className="w-4 h-4 text-wood-400 absolute left-3 top-2.5" />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-ivory-50 px-3 py-1.5 rounded-xl border border-wood-300 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-wood-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-charcoal-800 outline-none cursor-pointer"
            >
              <option value="registration">Registration Order</option>
              <option value="name">Team Name (A-Z)</option>
            </select>
          </div>

          {/* Register team button */}
          {tournament.registration_open && (
            <button
              onClick={() => onNavigate("register")}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </button>
          )}
        </div>
      </div>

      {/* Teams Grid / Cards */}
      {sortedTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedTeams.map((team) => {
            const activePlayers =
              team.players?.filter((p) => !p.is_substitute) || [];
            const subPlayers =
              team.players?.filter((p) => p.is_substitute) || [];

            return (
              <div
                key={team.id}
                className="bg-white rounded-2xl border-2 border-wood-200 hover:border-amber-500/60 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Registration # and timestamp */}
                  <div className="flex items-center justify-between text-xs text-wood-500 mb-2">
                    <span className="font-mono font-extrabold px-2.5 py-0.5 rounded-md bg-wood-100 text-wood-800 border border-wood-200">
                      {team.registration_number}
                    </span>
                    <span>
                      {new Date(team.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Team Name */}
                  <h3 className="text-lg font-black text-charcoal-900 group-hover:text-amber-700 transition">
                    {team.team_name}
                  </h3>

                  {/* Captain with Star badge */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60 w-fit my-2.5">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>Captain: {team.captain_name}</span>
                    {team.contact_number && (
                      <span className="font-normal text-wood-500 ml-1">
                        ({team.contact_number})
                      </span>
                    )}
                  </div>

                  {/* Active Players List */}
                  <div className="space-y-1.5 my-3">
                    <span className="text-[11px] font-bold text-wood-500 uppercase tracking-wide">
                      Active Lineup:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activePlayers.map((player) => (
                        <span
                          key={player.id}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-ivory-100 text-charcoal-800 border border-wood-200"
                        >
                          <UserCheck className="w-3 h-3 text-wood-500" />
                          {player.player_name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Substitutes if any */}
                  {subPlayers.length > 0 && (
                    <div className="space-y-1 pt-2 border-t border-wood-100">
                      <span className="text-[10px] font-bold text-wood-400 uppercase tracking-wide">
                        Reserves:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {subPlayers.map((sub) => (
                          <span
                            key={sub.id}
                            className="text-[11px] px-2 py-0.5 rounded bg-wood-50 text-wood-600 border border-wood-200"
                          >
                            {sub.player_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Controls */}
                {isAdmin && (
                  <div className="mt-4 pt-3 border-t border-wood-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(team)}
                      className="p-1.5 text-wood-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                      title="Edit Team"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingTeam(team)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Team"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 border-2 border-dashed border-wood-300 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-wood-100 text-wood-500 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-charcoal-900 mb-1">
            {search ? "No Matching Teams Found" : "No Teams Registered Yet"}
          </h3>
          <p className="text-xs sm:text-sm text-wood-600 mb-6">
            {search
              ? "Try adjusting your search keywords."
              : "Be the first team to enter the championship! Registration takes less than a minute."}
          </p>
          {tournament.registration_open && (
            <button
              onClick={() => onNavigate("register")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md transition"
            >
              <UserPlus className="w-4 h-4" />
              Register Team
            </button>
          )}
        </div>
      )}

      {/* Admin Edit Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-wood-300 shadow-2xl animate-scaleIn">
            <h3 className="text-xl font-bold text-charcoal-900 mb-1">
              Edit Team Details
            </h3>
            <p className="text-xs text-wood-600 mb-4">
              Registration #{editingTeam.registration_number}
            </p>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-sm font-semibold outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">
                  Captain Name
                </label>
                <input
                  type="text"
                  required
                  value={editCaptainName}
                  onChange={(e) => setEditCaptainName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-sm font-semibold outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={editContact}
                  onChange={(e) => setEditContact(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-sm outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-wood-200">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-wood-100 hover:bg-wood-200 text-wood-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition shadow-sm disabled:opacity-60"
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-wood-300 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-charcoal-900 mb-1">
              Delete Team?
            </h3>
            <p className="text-xs text-wood-600 mb-6">
              Are you sure you want to remove{" "}
              <strong>"{deletingTeam.team_name}"</strong> (
              {deletingTeam.registration_number})? This action cannot be undone.
            </p>

            <div className="flex justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingTeam(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-wood-100 hover:bg-wood-200 text-wood-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm disabled:opacity-60"
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
