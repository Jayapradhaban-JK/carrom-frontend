import React, { useState, useEffect, useRef } from 'react';
import {
  UserPlus,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  Quote,
  Users,
  RefreshCw,
  Search,
  Crown,
  X,
  Lock,
  Clock,
  Timer,
  Calendar,
} from 'lucide-react';
import { teamsApi, usersApi } from '../api';
import { Tournament, Team, TournamentUser } from '../types';
import { processImageFile } from '../utils/imageUpload';

interface RegistrationFormProps {
  tournament: Tournament;
  existingTeams?: Team[];
  onSuccess: (team: Team) => void;
  onNavigate: (tab: string) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  tournament,
  existingTeams = [],
  onSuccess,
  onNavigate,
}) => {
  // Form state
  const [teamName, setTeamName] = useState('');
  const [tagline, setTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState<string>('');

  // Chosen Player IDs
  const [player1UserId, setPlayer1UserId] = useState<string>('');
  const [player2UserId, setPlayer2UserId] = useState<string>('');

  // Users Pool State
  const [usersList, setUsersList] = useState<TournamentUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [usersSearch, setUsersSearch] = useState<string>('');
  const [userTab, setUserTab] = useState<'available' | 'chosen' | 'all'>('available');

  // Status & Validation State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredTeam, setRegisteredTeam] = useState<Team | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await usersApi.getAll();
      setUsersList(res.users || []);
    } catch (err: any) {
      console.error('Failed to load eligible users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Live Countdown State
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    const countdownTargetStr =
      tournament.settings?.registration_countdown ||
      tournament.settings?.registration_deadline;

    if (!countdownTargetStr) {
      setTimeLeft(null);
      return;
    }

    const calculate = () => {
      const now = Date.now();
      const target = new Date(countdownTargetStr).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [tournament.settings?.registration_countdown, tournament.settings?.registration_deadline]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await processImageFile(file, 300, 300, 0.75, 50000);
      setLogoUrl(dataUrl);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to process selected image file.');
    }
  };

  // Assign user to slot
  const handleAssignUser = (user: TournamentUser, targetSlot?: 1 | 2) => {
    setError(null);
    if (user.is_registered) return;

    if (targetSlot === 1) {
      if (player2UserId === user.id) setPlayer2UserId('');
      setPlayer1UserId(user.id);
      return;
    }
    if (targetSlot === 2) {
      if (player1UserId === user.id) setPlayer1UserId('');
      setPlayer2UserId(user.id);
      return;
    }

    // Auto-fill empty slot
    if (!player1UserId) {
      if (player2UserId === user.id) setPlayer2UserId('');
      setPlayer1UserId(user.id);
    } else if (!player2UserId && player1UserId !== user.id) {
      setPlayer2UserId(user.id);
    } else if (player1UserId === user.id) {
      setPlayer1UserId('');
    } else if (player2UserId === user.id) {
      setPlayer2UserId('');
    } else {
      setPlayer2UserId(user.id);
    }
  };

  const handleRemoveSlot = (slot: 1 | 2) => {
    if (slot === 1) setPlayer1UserId('');
    if (slot === 2) setPlayer2UserId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTeam = teamName.trim();
    const cleanTagline = tagline.trim();

    if (timeLeft?.isExpired) {
      setError('Registration deadline has passed. Team registrations are now closed.');
      return;
    }

    if (!cleanTeam) {
      setError('Please enter a unique Team Name.');
      return;
    }

    if (isTeamNameDuplicate) {
      setError(`A team named "${cleanTeam}" is already registered. Please choose a different name.`);
      return;
    }

    if (!player1UserId) {
      setError('Please select Player 1 (Captain) from the users list on the side.');
      return;
    }

    if (!player2UserId) {
      setError('Please select Player 2 from the users list on the side.');
      return;
    }

    if (player1UserId === player2UserId) {
      setError('Player 1 and Player 2 cannot be the same user.');
      return;
    }

    const p1 = usersList.find((u) => u.id === player1UserId);
    const p2 = usersList.find((u) => u.id === player2UserId);

    if (!p1 || !p2) {
      setError('Selected users are invalid or no longer found.');
      return;
    }

    if (p1.is_registered) {
      setError(`User "${p1.name}" is already registered in team "${p1.registered_team?.team_name || 'another team'}".`);
      return;
    }

    if (p2.is_registered) {
      setError(`User "${p2.name}" is already registered in team "${p2.registered_team?.team_name || 'another team'}".`);
      return;
    }

    try {
      setSubmitting(true);
      const newTeam = await teamsApi.register({
        team_name: cleanTeam,
        captain_name: p1.name,
        player_names: [p1.name, p2.name],
        player_user_ids: [p1.id, p2.id],
        logo_url: logoUrl || undefined,
        tagline: cleanTagline || undefined,
      });

      setRegisteredTeam(newTeam);
      onSuccess(newTeam);
      loadUsers();
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(
        err.response?.data?.message ||
          'Failed to register team. A team with this name might already exist or a player is already assigned.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setTeamName('');
    setPlayer1UserId('');
    setPlayer2UserId('');
    setTagline('');
    setLogoUrl('');
    setRegisteredTeam(null);
    setError(null);
    loadUsers();
  };

  // If registration is closed
  if (!tournament.registration_open) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-lg p-8 border-2 border-stone-300 shadow-sm text-center">
        <div className="w-14 h-14 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-black text-stone-900 mb-2">
          Registration is Closed
        </h3>
        <p className="text-sm text-stone-600 mb-6 leading-relaxed">
          The tournament administrator has locked team registration. Fixtures are generated or the tournament is currently underway.
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('fixtures')}
            className="px-5 py-2.5 rounded-md text-sm font-bold bg-amber-600 text-white hover:bg-amber-500 transition shadow-sm"
          >
            See Fixtures &amp; Bracket
          </button>
          <button
            type="button"
            onClick={() => onNavigate('teams')}
            className="px-5 py-2.5 rounded-md text-sm font-semibold bg-stone-800 text-white hover:bg-stone-700 transition"
          >
            View Teams
          </button>
        </div>
      </div>
    );
  }

  // If Countdown is Active -> Show ONLY the Countdown Screen!
  if (timeLeft && !timeLeft.isExpired) {
    const targetDateStr =
      tournament.settings?.registration_countdown ||
      tournament.settings?.registration_deadline;

    return (
      <div className="max-w-xl mx-auto py-8 sm:py-12 animate-fadeIn text-center">
        <div className="bg-white rounded-lg p-8 sm:p-10 border-2 border-stone-300 shadow-sm relative">
          <div className="w-14 h-14 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <Clock className="w-7 h-7 animate-pulse text-amber-600" />
          </div>

          <span className="inline-block px-3 py-1 rounded text-xs font-black tracking-wider uppercase bg-amber-100 text-amber-800 mb-2">
            Talent Takeaways Infotech PVT LTD
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mb-1">
            Carrom Championship 2026
          </h2>

          <div className="flex items-center justify-center gap-1.5 mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-md">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              Tournament Date: 5th November 2026 (05-11-2026)
            </span>
          </div>

          <p className="text-xs sm:text-sm text-stone-500 mb-8 max-w-sm mx-auto">
            Team registration is locked until the countdown completes. The registration form will unlock automatically.
          </p>

          {/* Big Countdown Display */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6">
            {timeLeft.days > 0 && (
              <>
                <div className="bg-stone-50 px-4 py-3 sm:px-5 sm:py-4 rounded-md border border-stone-300 min-w-[70px] shadow-sm">
                  <span className="block text-2xl sm:text-3xl font-black text-stone-900 font-mono">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] font-bold text-stone-500 uppercase mt-0.5">Days</span>
                </div>
                <span className="text-2xl font-black text-amber-600">:</span>
              </>
            )}

            <div className="bg-stone-50 px-4 py-3 sm:px-5 sm:py-4 rounded-md border border-stone-300 min-w-[70px] shadow-sm">
              <span className="block text-2xl sm:text-3xl font-black text-stone-900 font-mono">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="block text-[10px] font-bold text-stone-500 uppercase mt-0.5">Hours</span>
            </div>

            <span className="text-2xl font-black text-amber-600">:</span>

            <div className="bg-stone-50 px-4 py-3 sm:px-5 sm:py-4 rounded-md border border-stone-300 min-w-[70px] shadow-sm">
              <span className="block text-2xl sm:text-3xl font-black text-stone-900 font-mono">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="block text-[10px] font-bold text-stone-500 uppercase mt-0.5">Mins</span>
            </div>

            <span className="text-2xl font-black text-amber-600">:</span>

            <div className="bg-amber-50 px-4 py-3 sm:px-5 sm:py-4 rounded-md border border-amber-300 min-w-[70px] shadow-sm">
              <span className="block text-2xl sm:text-3xl font-black text-amber-700 font-mono">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="block text-[10px] font-bold text-amber-700 uppercase mt-0.5">Secs</span>
            </div>
          </div>

          {targetDateStr && (
            <p className="text-xs text-stone-500">
              Registration unlocks at:{' '}
              <strong className="text-stone-800">
                {new Date(targetDateStr).toLocaleString([], {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </strong>
            </p>
          )}

          <div className="mt-8 pt-6 border-t border-stone-200 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('teams')}
              className="px-4 py-2 rounded-md text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 transition"
            >
              View Registered Teams
            </button>
            <button
              type="button"
              onClick={() => onNavigate('fixtures')}
              className="px-4 py-2 rounded-md text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 transition"
            >
              View Fixtures
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Registration Success Confirmation
  if (registeredTeam) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-lg p-8 border-2 border-emerald-400 shadow-sm text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-emerald-400 p-1 bg-emerald-50 flex items-center justify-center shadow-sm">
          {registeredTeam.logo_url ? (
            <img
              src={registeredTeam.logo_url}
              alt={registeredTeam.team_name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          )}
        </div>

        <span className="inline-block px-3 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
          Team Registered Successfully!
        </span>

        <h3 className="text-2xl sm:text-3xl font-black text-stone-900 mb-1">
          {registeredTeam.team_name}
        </h3>

        {registeredTeam.tagline && (
          <p className="text-xs text-amber-700 italic font-semibold mb-4">
            "{registeredTeam.tagline}"
          </p>
        )}

        <div className="my-5 p-4 bg-stone-50 rounded-md border border-stone-300 inline-block w-full text-left">
          <div className="flex justify-between items-center pb-2 border-b border-stone-200">
            <span className="text-xs text-stone-600 font-semibold uppercase">
              Registration Number
            </span>
            <span className="text-sm font-extrabold font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
              {registeredTeam.registration_number}
            </span>
          </div>

          <div className="pt-3 text-xs text-stone-800 space-y-1">
            <p>
              <strong>Player 1 (Captain):</strong> {registeredTeam.captain_name}
            </p>
            <p>
              <strong>Player 2:</strong>{' '}
              {registeredTeam.players?.find((p) => !p.is_captain)?.player_name ||
                registeredTeam.players?.[1]?.player_name ||
                'Teammate'}
            </p>
          </div>
        </div>

        <p className="text-xs text-stone-500 mb-6">
          Your 2-player team is locked in. Click below to view all registered teams or check the fixtures bracket.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            type="button"
            onClick={handleResetForm}
            className="px-5 py-2.5 rounded-md text-xs sm:text-sm font-semibold bg-stone-100 text-stone-800 hover:bg-stone-200 transition"
          >
            Register Another Team
          </button>
          <button
            type="button"
            onClick={() => onNavigate('teams')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white transition shadow-sm"
          >
            <span>View Teams</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Selected player user objects
  const player1User = usersList.find((u) => u.id === player1UserId);
  const player2User = usersList.find((u) => u.id === player2UserId);

  // Available vs registered
  const availableUsers = usersList.filter((u) => !u.is_registered);
  const registeredUsers = usersList.filter((u) => u.is_registered);

  // Filtered users for side directory
  const filteredUsers = usersList.filter((u) => {
    if (userTab === 'available' && u.is_registered) return false;
    if (userTab === 'chosen' && !u.is_registered) return false;
    if (!usersSearch.trim()) return true;
    const term = usersSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      (u.employee_id && u.employee_id.toLowerCase().includes(term)) ||
      (u.department && u.department.toLowerCase().includes(term)) ||
      (u.registered_team?.team_name && u.registered_team.team_name.toLowerCase().includes(term))
    );
  });

  const normalizedInputName = teamName.trim().toLowerCase().replace(/\s+/g, ' ');
  const isTeamNameDuplicate = Boolean(
    normalizedInputName &&
      existingTeams.some(
        (t) =>
          (t.normalized_team_name || t.team_name.trim().toLowerCase().replace(/\s+/g, ' ')) ===
          normalizedInputName,
      ),
  );

  return (
    <div className="animate-fadeIn">
      {/* Side-by-Side 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: TEAM REGISTRATION FORM (lg:col-span-7) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 bg-white rounded-lg p-6 sm:p-7 border-2 border-stone-200/90 shadow-sm space-y-5">
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
              <div className="inline-flex items-center gap-1.5 text-amber-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                2-Player Team Registration
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-md">
                <Calendar className="w-3 h-3 text-amber-700" />
                Event: 05-11-2026
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Register Your Team
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Enter your team details and select players from the Users Pool on the right.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Registration Error</p>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Team Name */}
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                <span>Team Name <span className="text-rose-600">*</span></span>
                {teamName.trim() && !isTeamNameDuplicate && (
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Name available
                  </span>
                )}
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Strike Kings, Red Queens, Board Masters"
                className={`w-full px-4 py-2.5 rounded-md border text-sm font-semibold text-stone-900 placeholder:text-stone-400 outline-none transition ${
                  isTeamNameDuplicate
                    ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500 ring-2 ring-rose-200'
                    : 'border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-stone-50/50'
                }`}
              />
              {isTeamNameDuplicate && (
                <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  A team named "{teamName.trim()}" is already registered. Please choose a different team name.
                </p>
              )}
            </div>

            {/* 2. Selected Roster Slots (Player 1 Captain & Player 2) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800 uppercase tracking-wide">
                <span>Selected Players (2 Persons)</span>
                <span className="text-[11px] text-amber-700 font-semibold normal-case">
                  {(player1UserId ? 1 : 0) + (player2UserId ? 1 : 0)} of 2 chosen
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Slot 1: Player 1 (Captain) */}
                <div
                  className={`p-3.5 rounded-md border-2 transition ${
                    player1User
                      ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                      : 'border-dashed border-stone-300 bg-stone-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1 uppercase">
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                      Player 1 (Captain)
                    </span>
                    {player1User && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(1)}
                        className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-white transition"
                        title="Remove Player 1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {player1User ? (
                    <div>
                      <p className="font-extrabold text-sm text-stone-900">{player1User.name}</p>
                      <p className="text-[11px] text-stone-500">
                        {player1User.employee_id ? `ID: ${player1User.employee_id}` : ''}
                        {player1User.department ? ` • ${player1User.department}` : ''}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400 italic py-2">
                      Click <strong>+ Captain</strong> on any available user on the right
                    </p>
                  )}
                </div>

                {/* Slot 2: Player 2 */}
                <div
                  className={`p-3.5 rounded-md border-2 transition ${
                    player2User
                      ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                      : 'border-dashed border-stone-300 bg-stone-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1 uppercase">
                      <Users className="w-3.5 h-3.5 text-stone-500" />
                      Player 2
                    </span>
                    {player2User && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(2)}
                        className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-white transition"
                        title="Remove Player 2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {player2User ? (
                    <div>
                      <p className="font-extrabold text-sm text-stone-900">{player2User.name}</p>
                      <p className="text-[11px] text-stone-500">
                        {player2User.employee_id ? `ID: ${player2User.employee_id}` : ''}
                        {player2User.department ? ` • ${player2User.department}` : ''}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400 italic py-2">
                      Click <strong>+ Player 2</strong> on any available user on the right
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Team Tagline */}
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                <span>Team Tagline / Slogan</span>
                <span className="text-[10px] text-stone-500 font-normal">Optional</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Pocketing wins, one coin at a time"
                  className="w-full pl-9 pr-4 py-2.5 rounded-md border border-stone-300 focus:border-amber-500 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition bg-stone-50/50"
                />
                <Quote className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* 4. Team Logo */}
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                <span>Team Logo / Avatar</span>
                <span className="text-[10px] text-stone-500 font-normal">Optional</span>
              </label>

              <div className="flex items-center gap-3.5 p-3.5 bg-stone-50 rounded-md border border-stone-300">
                <div className="w-14 h-14 rounded-md bg-white border border-stone-300 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-stone-400" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-md text-xs font-bold bg-stone-800 hover:bg-stone-700 text-white transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                    </button>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setLogoUrl('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="px-2.5 py-1.5 rounded-md text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-500">
                    Upload PNG, JPG, or SVG (Max 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Submit Registration Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  submitting ||
                  !player1UserId ||
                  !player2UserId ||
                  isTeamNameDuplicate ||
                  Boolean(timeLeft?.isExpired)
                }
                className="w-full py-3 px-6 rounded-md text-sm sm:text-base font-extrabold text-white bg-amber-600 hover:bg-amber-500 active:scale-[0.99] transition shadow-md hover:shadow-amber-600/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <span>Registering 2-Player Team...</span>
                ) : timeLeft?.isExpired ? (
                  <span>Registration Closed (Deadline Expired)</span>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Register Team</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: TOURNAMENT USERS POOL DIRECTORY (lg:col-span-5) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-white rounded-lg p-5 sm:p-6 border-2 border-stone-200/90 shadow-sm space-y-4 lg:sticky lg:top-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wide">
                Users Directory
              </h3>
            </div>

            <button
              type="button"
              onClick={loadUsers}
              className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 font-medium"
              title="Refresh users pool"
            >
              <RefreshCw className={`w-3 h-3 ${loadingUsers ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Sub-Tabs: Available vs In Team vs All */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-md text-xs font-semibold border border-stone-200">
            <button
              type="button"
              onClick={() => setUserTab('available')}
              className={`flex-1 py-1.5 rounded transition text-center ${
                userTab === 'available'
                  ? 'bg-white text-emerald-800 shadow-sm font-bold border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🟢 Available ({availableUsers.length})
            </button>
            <button
              type="button"
              onClick={() => setUserTab('chosen')}
              className={`flex-1 py-1.5 rounded transition text-center ${
                userTab === 'chosen'
                  ? 'bg-white text-amber-900 shadow-sm font-bold border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🔒 In Team ({registeredUsers.length})
            </button>
            <button
              type="button"
              onClick={() => setUserTab('all')}
              className={`px-2.5 py-1.5 rounded transition text-center ${
                userTab === 'all'
                  ? 'bg-white text-stone-900 shadow-sm font-bold border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({usersList.length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              value={usersSearch}
              onChange={(e) => setUsersSearch(e.target.value)}
              placeholder="Search by name, ID, team..."
              className="w-full pl-8 pr-3 py-2 rounded-md border border-stone-300 text-xs bg-stone-50 outline-none focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Instruction hint */}
          <p className="text-[11px] text-stone-500 italic">
            Click <strong>+ Captain</strong> or <strong>+ Player 2</strong> on an available person to select them.
          </p>

          {/* Scrollable List of User Cards */}
          <div className="max-h-[460px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const isP1 = user.id === player1UserId;
                const isP2 = user.id === player2UserId;
                const isSelectedInCurrent = isP1 || isP2;
                const isAlreadyInTeam = user.is_registered;

                return (
                  <div
                    key={user.id}
                    className={`p-2.5 rounded-md border transition flex items-center justify-between gap-2 ${
                      isSelectedInCurrent
                        ? 'bg-amber-100/90 border-amber-400 shadow-sm'
                        : isAlreadyInTeam
                        ? 'bg-stone-50 border-stone-200 opacity-60'
                        : 'bg-white border-stone-200 hover:border-amber-400 hover:bg-amber-50/30 shadow-sm'
                    }`}
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                          isP1
                            ? 'bg-amber-600 text-white'
                            : isP2
                            ? 'bg-stone-800 text-white'
                            : isAlreadyInTeam
                            ? 'bg-stone-300 text-stone-600'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {isP1 ? '👑' : user.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-[10px] text-stone-500 truncate">
                          {user.employee_id ? `ID: ${user.employee_id}` : ''}
                          {user.department ? ` • ${user.department}` : ''}
                          {isAlreadyInTeam && user.registered_team && (
                            <span className="text-amber-800 font-semibold block truncate">
                              Team: {user.registered_team.team_name}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isAlreadyInTeam ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-stone-500 bg-stone-200 px-2 py-1 rounded">
                          <Lock className="w-3 h-3" />
                          <span>In Team</span>
                        </span>
                      ) : isSelectedInCurrent ? (
                        <button
                          type="button"
                          onClick={() => handleAssignUser(user)}
                          className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-md border border-rose-200 transition"
                        >
                          <X className="w-3 h-3" />
                          <span>Deselect</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAssignUser(user, 1)}
                            className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition"
                            title="Assign as Player 1 (Captain)"
                          >
                            + Captain
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAssignUser(user, 2)}
                            className="px-2 py-1 rounded-md text-[10px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition"
                            title="Assign as Player 2"
                          >
                            + Player 2
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-stone-400 text-xs">
                {usersList.length === 0
                  ? 'No users added to the tournament pool yet.'
                  : 'No users match your search or filter.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
