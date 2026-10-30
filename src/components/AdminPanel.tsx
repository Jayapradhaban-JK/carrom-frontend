import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Layers,
  Upload,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Users,
  Image as ImageIcon,
  Calendar,
  Plus,
  Search,
  Filter,
  RefreshCw,
  UserPlus,
  UserCheck,
  Crown,
  Clock,
  Timer,
  X,
  Maximize2,
} from 'lucide-react';
import { Tournament, Team, Match, TournamentUser } from '../types';
import { tournamentApi, teamsApi, fixturesApi, usersApi } from '../api';
import { processImageFile, PRESET_TOURNAMENT_BANNERS } from '../utils/imageUpload';
import { getTeamPlayers } from '../utils/teamUtils';
import { DeleteFixturesModal } from './DeleteFixturesModal';

interface AdminPanelProps {
  tournament: Tournament;
  teams: Team[];
  matches: Match[];
  onRefresh: () => void;
  onSelectMatchToScore: (match: Match) => void;
}

export type AdminTab = 'teams' | 'fixtures' | 'users';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  tournament,
  teams,
  matches,
  onRefresh,
  onSelectMatchToScore,
}) => {
  // Top 3 Admin Tabs requested: "registration teams", "fixtes making", "users"
  const [adminTab, setAdminTab] = useState<AdminTab>('teams');

  // --- TAB 1: REGISTRATION TEAMS STATE ---
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const [regOpen, setRegOpen] = useState(tournament.registration_open);
  const [teamSearch, setTeamSearch] = useState('');

  // Countdown deadline state
  const initialDeadline = tournament.settings?.registration_deadline
    ? new Date(tournament.settings.registration_deadline).toISOString().slice(0, 16)
    : '';
  const [deadlineInput, setDeadlineInput] = useState<string>(initialDeadline);
  const [deadlineSaving, setDeadlineSaving] = useState(false);
  const [deadlineMsg, setDeadlineMsg] = useState<string | null>(null);

  // Team logo popup preview
  const [selectedLogoTeam, setSelectedLogoTeam] = useState<Team | null>(null);

  // Sync bannerUrl when tournament updates
  useEffect(() => {
    setBannerUrl(tournament.banner_url || '');
  }, [tournament.banner_url]);

  // Keyboard accessibility: Close logo popup on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedLogoTeam(null);
      }
    };
    if (selectedLogoTeam) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLogoTeam]);

  // --- TAB 2: FIXTURES MAKING STATE ---
  const [bannerUrl, setBannerUrl] = useState<string>(tournament.banner_url || '');
  const [bannerLoading, setBannerLoading] = useState(false);
  const [bannerSuccess, setBannerSuccess] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const [format, setFormat] = useState<'SINGLE_ELIMINATION' | 'ROUND_ROBIN'>(
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
  const [fixturesLoading, setFixturesLoading] = useState(false);
  const [fixturesMsg, setFixturesMsg] = useState<string | null>(null);
  const [fixturesError, setFixturesError] = useState<string | null>(null);
  const [isDeleteFixturesOpen, setIsDeleteFixturesOpen] = useState(false);

  // --- TAB 3: USERS STATE ---
  const [usersList, setUsersList] = useState<TournamentUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'available' | 'registered'>('all');

  // Add Single User
  const [userName, setUserName] = useState('');
  const [userEmpId, setUserEmpId] = useState('');
  const [userDept, setUserDept] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userAddLoading, setUserAddLoading] = useState(false);
  const [userAddMsg, setUserAddMsg] = useState<string | null>(null);
  const [userAddError, setUserAddError] = useState<string | null>(null);

  // Bulk Add Users
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkNamesText, setBulkNamesText] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  const playableMatches = matches.filter((m) => !m.is_bye);

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await usersApi.getAll();
      setUsersList(res.users || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // --- TEAM ACTIONS ---
  const handleToggleRegistration = async () => {
    try {
      const next = !regOpen;
      setRegOpen(next);
      await tournamentApi.updateRegistration({ registration_open: next });
      onRefresh();
    } catch (err: any) {
      alert('Failed to update registration status.');
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    if (
      !window.confirm(
        `Are you sure you want to DELETE team "${team.team_name}" (${team.registration_number})? This will free its players back into the available users pool.`,
      )
    ) {
      return;
    }

    try {
      setDeletingTeamId(team.id);
      await teamsApi.delete(team.id);
      onRefresh();
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cannot delete team while fixtures exist. Delete fixtures first.');
    } finally {
      setDeletingTeamId(null);
    }
  };

  const handleSaveDeadline = async () => {
    if (!deadlineInput) {
      alert('Please choose a deadline date and time.');
      return;
    }
    try {
      setDeadlineSaving(true);
      const iso = new Date(deadlineInput).toISOString();
      await tournamentApi.updateSettings({
        registration_deadline: iso,
        registration_countdown: iso,
        countdown_enabled: true,
      });
      setDeadlineMsg('Registration countdown timer set! Users will see only the countdown screen until it completes.');
      setTimeout(() => setDeadlineMsg(null), 4000);
      onRefresh();
    } catch (err: any) {
      alert('Failed to save countdown deadline.');
    } finally {
      setDeadlineSaving(false);
    }
  };

  const handleClearDeadline = async () => {
    try {
      setDeadlineSaving(true);
      await tournamentApi.updateSettings({
        registration_deadline: null,
        registration_countdown: null,
        countdown_enabled: false,
      });
      setDeadlineInput('');
      setDeadlineMsg('Countdown cleared! Registration is unlocked immediately.');
      setTimeout(() => setDeadlineMsg(null), 3000);
      onRefresh();
    } catch (err: any) {
      alert('Failed to clear countdown deadline.');
    } finally {
      setDeadlineSaving(false);
    }
  };

  const setPresetDeadline = (minutesFromNow: number) => {
    const target = new Date(Date.now() + minutesFromNow * 60 * 1000);
    const offset = target.getTimezoneOffset() * 60000;
    const local = new Date(target.getTime() - offset).toISOString().slice(0, 16);
    setDeadlineInput(local);
  };

  // --- FIXTURES ACTIONS ---
  const handlePutFixtures = async () => {
    if (teams.length < 2) {
      setFixturesError('At least 2 registered teams are required to put fixtures.');
      return;
    }

    try {
      setFixturesLoading(true);
      setFixturesError(null);
      await fixturesApi.generate({
        format,
        match_duration_minutes: matchDuration,
        interval_minutes: interval,
        third_place_playoff: thirdPlace,
        force: true,
      });

      setFixturesMsg('Fixtures generated and scheduled successfully!');
      setTimeout(() => setFixturesMsg(null), 4000);
      onRefresh();
    } catch (err: any) {
      setFixturesError(err.response?.data?.message || 'Failed to put fixtures.');
    } finally {
      setFixturesLoading(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBannerLoading(true);
      const dataUrl = await processImageFile(file, 1200, 400, 0.85);
      setBannerUrl(dataUrl);

      await tournamentApi.updateTournament({ banner_url: dataUrl });
      setBannerSuccess(true);
      setTimeout(() => setBannerSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to upload banner.');
    } finally {
      setBannerLoading(false);
    }
  };

  const handleSelectPresetBanner = async (url: string) => {
    try {
      setBannerLoading(true);
      setBannerUrl(url);
      await tournamentApi.updateTournament({ banner_url: url });
      setBannerSuccess(true);
      setTimeout(() => setBannerSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      alert('Failed to update banner.');
    } finally {
      setBannerLoading(false);
    }
  };

  const handleRemoveBanner = async () => {
    try {
      setBannerLoading(true);
      setBannerUrl('');
      await tournamentApi.updateTournament({ banner_url: '' });
      onRefresh();
    } catch (err: any) {
      alert('Failed to remove banner.');
    } finally {
      setBannerLoading(false);
    }
  };

  const renderBannerCard = () => (
    <div className="bg-white rounded-lg p-6 sm:p-7 border border-stone-300 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wide">
              Tournament Championship Banner
            </h3>
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Official banner displayed prominently across the portal (Register, Teams, and Fixtures).
          </p>
        </div>

        {bannerSuccess && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-md flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Banner Updated!
          </span>
        )}
      </div>

      <div className="w-full h-40 sm:h-52 rounded-lg overflow-hidden border border-stone-300 bg-stone-900 relative flex items-center justify-center shadow-inner">
        {bannerUrl ? (
          <>
            <img
              src={bannerUrl}
              alt="Banner preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-4">
              <span className="text-white text-xs font-bold drop-shadow">
                Live Public Banner Preview
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemoveBanner}
              className="absolute top-3 right-3 px-2.5 py-1.5 bg-black/75 hover:bg-rose-600 text-white rounded-md text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
              title="Remove banner"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </>
        ) : (
          <div className="text-center p-6 text-stone-400">
            <ImageIcon className="w-10 h-10 mx-auto mb-2 text-stone-500 opacity-60" />
            <p className="text-xs font-bold text-stone-300">No Custom Banner Uploaded</p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Upload a landscape banner image to feature across the public portal.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <input
          type="file"
          ref={bannerFileInputRef}
          accept="image/*"
          onChange={handleBannerUpload}
          className="hidden"
        />
        <button
          type="button"
          disabled={bannerLoading}
          onClick={() => bannerFileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition disabled:opacity-50 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{bannerLoading ? 'Uploading Banner...' : 'Upload Banner'}</span>
        </button>

        <span className="text-xs text-stone-400 ml-2 font-medium">Or choose a preset:</span>
        {PRESET_TOURNAMENT_BANNERS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handleSelectPresetBanner(preset.url)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-md border border-stone-300 hover:border-amber-500 bg-stone-50 hover:bg-amber-50 text-stone-800 transition cursor-pointer"
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );

  // --- USERS ACTIONS ---
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserAddMsg(null);
    setUserAddError(null);

    const clean = userName.trim();
    if (!clean) {
      setUserAddError('User name is required.');
      return;
    }

    try {
      setUserAddLoading(true);
      await usersApi.create({
        name: clean,
        employee_id: userEmpId.trim() || undefined,
        department: userDept.trim() || undefined,
        email: userEmail.trim() || undefined,
      });

      setUserAddMsg(`User "${clean}" added successfully!`);
      setUserName('');
      setUserEmpId('');
      setUserDept('');
      setUserEmail('');
      setTimeout(() => setUserAddMsg(null), 3000);
      loadUsers();
    } catch (err: any) {
      setUserAddError(err.response?.data?.message || 'Failed to add user. Name may already exist.');
    } finally {
      setUserAddLoading(false);
    }
  };

  const handleBulkAddUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserAddMsg(null);
    setUserAddError(null);

    const names = bulkNamesText
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) {
      setUserAddError('Please enter at least one name.');
      return;
    }

    try {
      setBulkLoading(true);
      const res = await usersApi.bulkCreate(names);
      setUserAddMsg(
        `Added ${res.createdCount} new user(s)${res.skippedCount > 0 ? ` (${res.skippedCount} already existed)` : ''}!`,
      );
      setBulkNamesText('');
      setTimeout(() => setUserAddMsg(null), 4000);
      loadUsers();
    } catch (err: any) {
      setUserAddError(err.response?.data?.message || 'Failed to bulk add users.');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDeleteUser = async (user: TournamentUser) => {
    if (user.is_registered) {
      alert(
        `Cannot delete "${user.name}" because they are registered in team "${user.registered_team?.team_name}". Please delete the team first.`,
      );
      return;
    }

    if (!window.confirm(`Are you sure you want to remove "${user.name}" from tournament users?`)) {
      return;
    }

    try {
      await usersApi.delete(user.id);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // Filtered teams
  const filteredTeams = teams.filter((t) => {
    if (!teamSearch.trim()) return true;
    const term = teamSearch.toLowerCase();
    return (
      t.team_name.toLowerCase().includes(term) ||
      t.registration_number.toLowerCase().includes(term) ||
      t.captain_name.toLowerCase().includes(term)
    );
  });

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    if (userFilter === 'available' && u.is_registered) return false;
    if (userFilter === 'registered' && !u.is_registered) return false;
    if (!usersSearch.trim()) return true;
    const term = usersSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      (u.employee_id && u.employee_id.toLowerCase().includes(term)) ||
      (u.department && u.department.toLowerCase().includes(term))
    );
  });

  const availableCount = usersList.filter((u) => !u.is_registered).length;
  const registeredCount = usersList.filter((u) => u.is_registered).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 3 ADMIN TABS: registration teams, fixtes making, users */}
      <div className="flex items-center justify-center gap-2 border-b border-stone-200 pb-4">
        <button
          type="button"
          onClick={() => setAdminTab('teams')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-extrabold transition shadow-sm ${
            adminTab === 'teams'
              ? 'bg-amber-600 text-white shadow-amber-600/30'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registration Teams ({teams.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('fixtures')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-extrabold transition shadow-sm ${
            adminTab === 'fixtures'
              ? 'bg-amber-600 text-white shadow-amber-600/30'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Fixtures Making ({playableMatches.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAdminTab('users');
            loadUsers();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-extrabold transition shadow-sm ${
            adminTab === 'users'
              ? 'bg-amber-600 text-white shadow-amber-600/30'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Users ({usersList.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REGISTRATION TEAMS */}
      {/* ========================================================================= */}
      {adminTab === 'teams' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border border-stone-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  Talent Takeaways Infotech PVT LTD
                </span>
                <span className="text-[10px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded">
                  Event: 05-11-2026
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Registration Teams
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Manage registered 2-player teams. Deleting a team frees its players back into the users pool.
              </p>
            </div>

            {/* Registration toggle */}
            <div className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-md border border-stone-300">
              <span className="text-xs font-bold text-stone-700">
                Window: {regOpen ? 'Open' : 'Closed'}
              </span>
              <button
                type="button"
                onClick={handleToggleRegistration}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition shadow-sm text-white ${
                  regOpen
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {regOpen ? 'Close Registration' : 'Open Registration'}
              </button>
            </div>
          </div>

          {/* Registration Countdown & Deadline Control */}
          <div className="bg-white rounded-lg p-6 border border-stone-300 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-black text-stone-900 uppercase tracking-wide">
                    Registration Countdown Timer
                  </h3>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Participants will see <strong>ONLY the countdown screen</strong> until this timer completes.
                </p>
              </div>

              {tournament.settings?.registration_deadline && (
                <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full flex items-center gap-1.5 animate-fadeIn">
                  <Timer className="w-3.5 h-3.5 text-amber-700" />
                  <span>
                    Opens at:{' '}
                    {new Date(tournament.settings.registration_deadline).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </span>
              )}
            </div>

            {deadlineMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{deadlineMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-5">
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  Countdown Target (Date &amp; Time)
                </label>
                <input
                  type="datetime-local"
                  value={deadlineInput}
                  onChange={(e) => setDeadlineInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-stone-50 outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div className="md:col-span-7 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-stone-500 font-semibold">Presets:</span>
                <button
                  type="button"
                  onClick={() => setPresetDeadline(2)}
                  className="px-2.5 py-1.5 rounded-xl border border-stone-300 hover:border-amber-500 text-xs bg-stone-50 text-stone-800 font-medium transition"
                >
                  +2 Mins
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDeadline(5)}
                  className="px-2.5 py-1.5 rounded-xl border border-stone-300 hover:border-amber-500 text-xs bg-stone-50 text-stone-800 font-medium transition"
                >
                  +5 Mins
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDeadline(15)}
                  className="px-2.5 py-1.5 rounded-xl border border-stone-300 hover:border-amber-500 text-xs bg-stone-50 text-stone-800 font-medium transition"
                >
                  +15 Mins
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDeadline(30)}
                  className="px-2.5 py-1.5 rounded-xl border border-stone-300 hover:border-amber-500 text-xs bg-stone-50 text-stone-800 font-medium transition"
                >
                  +30 Mins
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDeadline(60)}
                  className="px-2.5 py-1.5 rounded-xl border border-stone-300 hover:border-amber-500 text-xs bg-stone-50 text-stone-800 font-medium transition"
                >
                  +1 Hour
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDeadline(1440)}
                  className="px-2.5 py-1.5 rounded-xl border border-stone-300 hover:border-amber-500 text-xs bg-stone-50 text-stone-800 font-medium transition"
                >
                  +24 Hours
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <button
                type="button"
                disabled={deadlineSaving || !tournament.settings?.registration_deadline}
                onClick={handleClearDeadline}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 transition disabled:opacity-40"
              >
                Clear / Open Registration Now
              </button>

              <button
                type="button"
                disabled={deadlineSaving || !deadlineInput}
                onClick={handleSaveDeadline}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition disabled:opacity-50"
              >
                <Clock className="w-4 h-4" />
                <span>{deadlineSaving ? 'Starting...' : 'Start Countdown'}</span>
              </button>
            </div>
          </div>

          {/* Tournament Championship Banner (Upload & Management) */}
          {renderBannerCard()}

          {/* Teams Search */}
          <div className="relative max-w-md">
            <input
              type="text"
              value={teamSearch}
              onChange={(e) => setTeamSearch(e.target.value)}
              placeholder="Search team name, registration number, captain..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>

          {/* Teams List */}
          <div className="bg-white rounded-lg p-6 border border-stone-300 shadow-sm space-y-3">
            {filteredTeams.length > 0 ? (
              <div className="divide-y divide-stone-100">
                {filteredTeams.map((team) => {
                  const playersInfo = getTeamPlayers(team);

                  return (
                    <div
                      key={team.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 px-3 rounded-md transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => setSelectedLogoTeam(team)}
                          className="w-12 h-12 rounded-lg overflow-hidden border border-stone-300 bg-white shrink-0 flex items-center justify-center shadow-xs cursor-pointer hover:border-amber-500 hover:ring-2 hover:ring-amber-500/30 transition group relative"
                          title="Click to view team logo"
                        >
                          {team.logo_url ? (
                            <img
                              src={team.logo_url}
                              alt={team.team_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-amber-800 bg-amber-50 text-xs">
                              {team.team_name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <Maximize2 className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm sm:text-base text-stone-900">
                              {team.team_name}
                            </span>
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-stone-100 text-stone-700 rounded">
                              {team.registration_number}
                            </span>
                          </div>

                          {team.tagline && (
                            <p className="text-[11px] text-amber-700 italic font-medium">
                              "{team.tagline}"
                            </p>
                          )}

                          <p className="text-xs text-stone-600 mt-0.5">
                            <strong>Players:</strong> {playersInfo.both}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          disabled={deletingTeamId === team.id}
                          onClick={() => handleDeleteTeam(team)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{deletingTeamId === team.id ? 'Deleting...' : 'Delete Team'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-stone-500 text-xs">
                {teams.length === 0
                  ? 'No teams registered yet. Users can register using the Register button.'
                  : 'No teams match your search.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FIXTURES MAKING */}
      {/* ========================================================================= */}
      {adminTab === 'fixtures' && (
        <div className="space-y-6">
          {/* Fixtures Generator Card */}
          <div className="bg-white rounded-lg p-6 sm:p-8 border border-stone-300 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  Fixtures Making
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                  Generate knockout tournament brackets or round-robin schedules across Board 1 &amp; Board 2.
                </p>
              </div>

              <span className="text-xs font-extrabold px-3 py-1 rounded bg-stone-100 text-stone-800 border border-stone-200">
                {playableMatches.length} Matches Scheduled
              </span>
            </div>

            {fixturesMsg && (
              <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{fixturesMsg}</span>
              </div>
            )}

            {fixturesError && (
              <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{fixturesError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold outline-none focus:border-amber-500 bg-stone-50 cursor-pointer"
                >
                  <option value="SINGLE_ELIMINATION">Single Elimination (Knockout)</option>
                  <option value="ROUND_ROBIN">Round Robin League</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                  Match Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={matchDuration}
                  onChange={(e) => setMatchDuration(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-semibold outline-none focus:border-amber-500 bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                  Rest Interval (Minutes)
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={interval}
                  onChange={(e) => setInterval(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-semibold outline-none focus:border-amber-500 bg-stone-50"
                />
              </div>
            </div>

            {format === 'SINGLE_ELIMINATION' && (
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
                <input
                  type="checkbox"
                  checked={thirdPlace}
                  onChange={(e) => setThirdPlace(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span>Include 3rd-Place Playoff match between semifinal losers</span>
              </label>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                disabled={fixturesLoading || matches.length === 0}
                onClick={() => setIsDeleteFixturesOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All Fixtures</span>
              </button>

              <button
                type="button"
                disabled={fixturesLoading || teams.length < 2}
                onClick={handlePutFixtures}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-amber-600 hover:bg-amber-500 shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Layers className="w-4 h-4" />
                <span>{fixturesLoading ? 'Scheduling...' : 'Put / Generate Fixtures'}</span>
              </button>
            </div>
          </div>

          {/* Active Matches / Quick Score Card */}
          {playableMatches.length > 0 && (
            <div className="bg-white rounded-lg p-6 sm:p-8 border border-stone-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="text-lg font-black text-stone-900">
                    Live Fixtures &amp; Scoring
                  </h3>
                  <p className="text-xs text-stone-600">
                    Click any match below to enter scores or advance the winner.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {playableMatches.map((match) => (
                  <div
                    key={match.id}
                    onClick={() => onSelectMatchToScore(match)}
                    className="p-3.5 rounded-md border border-stone-200 hover:border-amber-500 bg-stone-50/60 cursor-pointer transition shadow-sm hover:shadow"
                  >
                    <div className="flex justify-between items-center text-xs mb-2 text-stone-500">
                      <span className="font-bold text-stone-800">
                        M#{match.match_number} &bull; {match.round_name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-800 text-[10px] font-semibold">
                        Board {match.board_number}
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between font-bold text-stone-900">
                        <span className="truncate">{match.team_a?.team_name || 'TBD'}</span>
                        <span className="font-mono">{match.score_a}</span>
                      </div>
                      <div className="flex justify-between font-bold text-stone-900">
                        <span className="truncate">{match.team_b?.team_name || 'TBD'}</span>
                        <span className="font-mono">{match.score_b}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tournament Banner Card */}
          {renderBannerCard()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: USERS (WHERE ADMIN PUTS THE USERS) */}
      {/* ========================================================================= */}
      {adminTab === 'users' && (
        <div className="space-y-6">
          {/* Header & Stats */}
          <div className="bg-white rounded-lg p-6 border border-stone-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Tournament Users Pool
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Put users here. When participants register their teams, they can only select from these users without duplication.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-md bg-stone-100 border border-stone-200 text-center">
                <span className="block text-[10px] text-stone-500 font-bold uppercase">Total</span>
                <span className="text-sm font-extrabold text-stone-900">{usersList.length}</span>
              </div>
              <div className="px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-center">
                <span className="block text-[10px] text-emerald-700 font-bold uppercase">Available</span>
                <span className="text-sm font-extrabold text-emerald-800">{availableCount}</span>
              </div>
              <div className="px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200 text-center">
                <span className="block text-[10px] text-amber-700 font-bold uppercase">In Teams</span>
                <span className="text-sm font-extrabold text-amber-800">{registeredCount}</span>
              </div>
            </div>
          </div>

          {/* Add Users Form Card */}
          <div className="bg-white rounded-lg p-6 border border-stone-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-600" />
                <span>{bulkMode ? 'Bulk Add Users (Paste Names)' : 'Add Single User'}</span>
              </h3>

              <button
                type="button"
                onClick={() => {
                  setBulkMode(!bulkMode);
                  setUserAddMsg(null);
                  setUserAddError(null);
                }}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 underline"
              >
                {bulkMode ? 'Switch to Single User Form' : 'Switch to Bulk Add (Paste List)'}
              </button>
            </div>

            {userAddMsg && (
              <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{userAddMsg}</span>
              </div>
            )}

            {userAddError && (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{userAddError}</span>
              </div>
            )}

            {!bulkMode ? (
              /* Single User Form */
              <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                    User Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2 rounded-md border border-stone-300 text-xs sm:text-sm bg-stone-50 outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                    Employee ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={userEmpId}
                    onChange={(e) => setUserEmpId(e.target.value)}
                    placeholder="e.g. EMP102"
                    className="w-full px-3.5 py-2 rounded-md border border-stone-300 text-xs sm:text-sm bg-stone-50 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                    Department (Optional)
                  </label>
                  <input
                    type="text"
                    value={userDept}
                    onChange={(e) => setUserDept(e.target.value)}
                    placeholder="e.g. Product / IT"
                    className="w-full px-3.5 py-2 rounded-md border border-stone-300 text-xs sm:text-sm bg-stone-50 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={userAddLoading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-md text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{userAddLoading ? 'Adding...' : 'Add User to Pool'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Bulk Paste Form */
              <form onSubmit={handleBulkAddUsers} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                    Paste Names (One name per line or separated by commas)
                  </label>
                  <textarea
                    rows={4}
                    value={bulkNamesText}
                    onChange={(e) => setBulkNamesText(e.target.value)}
                    placeholder={"Rahul Sharma\nPriya Patel\nAlex Wong\nDavid Miller\nKavita Singh"}
                    className="w-full p-3 rounded-md border border-stone-300 text-xs sm:text-sm bg-stone-50 outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setBulkNamesText(
                        'Aarav Sharma\nRohan Verma\nAnanya Iyer\nVikram Malhotra\nPooja Nair\nKunal Sen\nNeha Joshi\nSiddharth Rao',
                      )
                    }
                    className="text-xs text-stone-500 hover:text-amber-700 underline"
                  >
                    Fill 8 Sample Names
                  </button>

                  <button
                    type="submit"
                    disabled={bulkLoading}
                    className="flex items-center gap-2 px-5 py-2 rounded-md text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{bulkLoading ? 'Adding Users...' : 'Add All Users'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Users List & Filter */}
          <div className="bg-white rounded-lg p-6 border border-stone-300 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 sm:max-w-xs">
                <input
                  type="text"
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  placeholder="Search user name or ID..."
                  className="w-full pl-9 pr-4 py-2 rounded-md border border-stone-300 text-xs sm:text-sm bg-stone-50 outline-none focus:border-amber-500"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-md text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setUserFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    userFilter === 'all'
                      ? 'bg-white text-stone-900 shadow-sm font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  All ({usersList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserFilter('available')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    userFilter === 'available'
                      ? 'bg-white text-emerald-800 shadow-sm font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Available ({availableCount})
                </button>
                <button
                  type="button"
                  onClick={() => setUserFilter('registered')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    userFilter === 'registered'
                      ? 'bg-white text-amber-800 shadow-sm font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  In Team ({registeredCount})
                </button>
              </div>
            </div>

            {/* Users Table */}
            {filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">User Name</th>
                      <th className="py-2.5 px-3">Employee ID / Dept</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredUsers.map((user, idx) => (
                      <tr key={user.id} className="hover:bg-stone-50/80 transition">
                        <td className="py-3 px-3 text-stone-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-3 font-bold text-stone-900">
                          {user.name}
                        </td>
                        <td className="py-3 px-3 text-stone-600">
                          {user.employee_id && (
                            <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded mr-1">
                              {user.employee_id}
                            </span>
                          )}
                          {user.department && <span>{user.department}</span>}
                          {!user.employee_id && !user.department && (
                            <span className="text-stone-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {user.is_registered ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              {user.is_captain && <Crown className="w-3 h-3 text-amber-700" />}
                              <span>
                                In {user.registered_team?.team_name || 'Team'} (
                                {user.registered_team?.registration_number})
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Available</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-stone-500 text-xs">
                {usersList.length === 0
                  ? 'No users added yet. Use the form above to add eligible users.'
                  : 'No users match your search/filter.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fixtures Delete Confirmation Modal */}
      <DeleteFixturesModal
        isOpen={isDeleteFixturesOpen}
        onClose={() => setIsDeleteFixturesOpen(false)}
        onSuccess={() => {
          onRefresh();
          setFixturesMsg('All fixtures deleted successfully! Registration has been reopened.');
          setTimeout(() => setFixturesMsg(null), 4000);
        }}
        matchesCount={matches.length}
      />

      {/* Team Logo Preview Popup Modal */}
      {selectedLogoTeam && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedLogoTeam(null)}
        >
          <div
            className="bg-white rounded-lg border-2 border-stone-300 shadow-2xl max-w-sm sm:max-w-md w-full overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  {selectedLogoTeam.registration_number}
                </span>
                <h3 className="font-black text-base text-stone-900 truncate">
                  {selectedLogoTeam.team_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogoTeam(null)}
                className="p-1.5 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Large Image Display */}
            <div className="p-6 bg-stone-100/70 flex flex-col items-center justify-center">
              <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-lg bg-white border-2 border-stone-300 shadow-md overflow-hidden flex items-center justify-center p-2 relative">
                {selectedLogoTeam.logo_url ? (
                  <img
                    src={selectedLogoTeam.logo_url}
                    alt={`${selectedLogoTeam.team_name} Logo`}
                    className="w-full h-full object-contain rounded-md"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50 text-amber-900 rounded-md">
                    <span className="text-6xl font-black mb-2">
                      {selectedLogoTeam.team_name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Default Team Crest
                    </span>
                  </div>
                )}
              </div>

              {/* Team Tagline */}
              {selectedLogoTeam.tagline && (
                <p className="mt-4 text-xs sm:text-sm text-amber-900 font-semibold italic text-center px-4 bg-amber-50 py-1.5 rounded-md border border-amber-200 w-full">
                  "{selectedLogoTeam.tagline}"
                </p>
              )}
            </div>

            {/* Modal Footer: Team Details & Close */}
            <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 text-xs">
              <div className="text-stone-600 truncate">
                <span className="font-bold text-stone-900">Captain:</span>{" "}
                <span className="font-semibold text-stone-800">
                  {selectedLogoTeam.captain_name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogoTeam(null)}
                className="px-4 py-1.5 rounded-md text-xs font-bold bg-stone-800 hover:bg-stone-700 text-white transition shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
