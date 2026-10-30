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
} from 'lucide-react';
import { teamsApi, usersApi } from '../api';
import { Tournament, Team, TournamentUser } from '../types';
import { processImageFile, PRESET_TEAM_LOGOS } from '../utils/imageUpload';

interface RegistrationFormProps {
  tournament: Tournament;
  onSuccess: (team: Team) => void;
  onNavigate: (tab: string) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  tournament,
  onSuccess,
  onNavigate,
}) => {
  // Form state
  const [teamName, setTeamName] = useState('');
  const [player1UserId, setPlayer1UserId] = useState('');
  const [player2UserId, setPlayer2UserId] = useState('');
  const [tagline, setTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState<string>(PRESET_TEAM_LOGOS[0].url);

  // Users Pool State
  const [availableUsers, setAvailableUsers] = useState<TournamentUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Status & Validation State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredTeam, setRegisteredTeam] = useState<Team | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      setUsersError(null);
      const res = await usersApi.getAll();
      setAvailableUsers(res.users || []);
    } catch (err: any) {
      console.error('Failed to load eligible users:', err);
      setUsersError('Could not fetch tournament users. Please refresh.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await processImageFile(file, 400, 400, 0.85);
      setLogoUrl(dataUrl);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to process selected image file.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTeam = teamName.trim();
    const cleanTagline = tagline.trim();

    if (!cleanTeam) {
      setError('Please enter a unique Team Name.');
      return;
    }

    if (!player1UserId) {
      setError('Please select Player 1 (Captain).');
      return;
    }

    if (!player2UserId) {
      setError('Please select Player 2.');
      return;
    }

    if (player1UserId === player2UserId) {
      setError('Player 1 and Player 2 cannot be the same user.');
      return;
    }

    const p1 = availableUsers.find((u) => u.id === player1UserId);
    const p2 = availableUsers.find((u) => u.id === player2UserId);

    if (!p1 || !p2) {
      setError('Selected users are invalid or no longer available.');
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
    setLogoUrl(PRESET_TEAM_LOGOS[0].url);
    setRegisteredTeam(null);
    setError(null);
    loadUsers();
  };

  // If registration is closed
  if (!tournament.registration_open) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-stone-200 shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-stone-900 mb-2">
          Registration is Closed
        </h3>
        <p className="text-sm text-stone-600 mb-6 leading-relaxed">
          The tournament administrator has locked team registration. Fixtures are generated or the tournament is currently underway.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => onNavigate('fixtures')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-600 text-white hover:bg-amber-500 transition shadow-sm"
          >
            See Fixtures &amp; Bracket
          </button>
          <button
            onClick={() => onNavigate('teams')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-stone-800 text-white hover:bg-stone-700 transition"
          >
            View Teams
          </button>
        </div>
      </div>
    );
  }

  // Registration Success Confirmation
  if (registeredTeam) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border-2 border-emerald-300 shadow-sm text-center animate-fadeIn">
        <div className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-emerald-300 p-1 bg-emerald-50 flex items-center justify-center shadow-md">
          {registeredTeam.logo_url ? (
            <img
              src={registeredTeam.logo_url}
              alt={registeredTeam.team_name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          )}
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
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

        <div className="my-5 p-4 bg-stone-50 rounded-2xl border border-stone-200 inline-block w-full text-left">
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
          Your 2-player team is locked in. Click below to view all registered teams or the fixtures bracket.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={handleResetForm}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-stone-100 text-stone-800 hover:bg-stone-200 transition"
          >
            Register Another Team
          </button>
          <button
            onClick={() => onNavigate('teams')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white transition shadow-sm"
          >
            <span>View Teams</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const unassignedCount = availableUsers.filter((u) => !u.is_registered).length;

  return (
    <div className="max-w-xl mx-auto animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm relative">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            2-Player Team Entry
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Register Your Team
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Select eligible players from the tournament user pool. Duplication is strictly prevented.
          </p>
        </div>

        {/* Warning if no users added yet */}
        {!loadingUsers && availableUsers.length === 0 && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">No Eligible Users Found</p>
              <p className="text-xs text-amber-800 mt-0.5">
                The tournament administrator must add users in the <strong>Admin &gt; Users</strong> tab first before teams can register.
              </p>
            </div>
          </div>
        )}

        {/* Available users info badge */}
        {!loadingUsers && availableUsers.length > 0 && (
          <div className="mb-4 flex items-center justify-between text-xs px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-amber-600" />
              Eligible Tournament Users
            </span>
            <span className="font-bold text-amber-700">
              {unassignedCount} available of {availableUsers.length} total
            </span>
          </div>
        )}

        {error && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Registration Error</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Team Name */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-1.5">
              Team Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Strike Kings, Red Queens, Board Masters"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm font-semibold text-stone-900 placeholder:text-stone-400 outline-none transition bg-stone-50/50"
            />
          </div>

          {/* 2 & 3. Select Players from Tournament Users */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-stone-900 uppercase tracking-wide">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                Select Team Members (2 Players)
              </span>
              <button
                type="button"
                onClick={loadUsers}
                className="text-[11px] text-amber-700 hover:text-amber-800 flex items-center gap-1 font-semibold"
                title="Refresh user list"
              >
                <RefreshCw className={`w-3 h-3 ${loadingUsers ? 'animate-spin' : ''}`} />
                Refresh list
              </button>
            </div>

            {/* Player 1 (Captain) Dropdown */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Player 1 (Captain) <span className="text-rose-600">*</span>
              </label>
              <select
                required
                value={player1UserId}
                onChange={(e) => setPlayer1UserId(e.target.value)}
                disabled={loadingUsers || availableUsers.length === 0}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 text-sm font-semibold text-stone-900 bg-white outline-none cursor-pointer disabled:bg-stone-100 disabled:opacity-60"
              >
                <option value="">-- Choose Player 1 (Captain) --</option>
                {availableUsers.map((u) => {
                  const isP2 = u.id === player2UserId;
                  const isAlreadyRegistered = u.is_registered;
                  const disabled = isP2 || isAlreadyRegistered;

                  let label = u.name;
                  if (u.employee_id) label += ` [ID: ${u.employee_id}]`;
                  if (u.department) label += ` - ${u.department}`;
                  if (isAlreadyRegistered) {
                    label += ` (Registered in ${u.registered_team?.team_name || 'Team'})`;
                  } else if (isP2) {
                    label += ' (Selected as Player 2)';
                  }

                  return (
                    <option key={u.id} value={u.id} disabled={disabled}>
                      {disabled ? '🚫 ' : '👤 '}
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Player 2 Dropdown */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Player 2 <span className="text-rose-600">*</span>
              </label>
              <select
                required
                value={player2UserId}
                onChange={(e) => setPlayer2UserId(e.target.value)}
                disabled={loadingUsers || availableUsers.length === 0}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 text-sm font-semibold text-stone-900 bg-white outline-none cursor-pointer disabled:bg-stone-100 disabled:opacity-60"
              >
                <option value="">-- Choose Player 2 --</option>
                {availableUsers.map((u) => {
                  const isP1 = u.id === player1UserId;
                  const isAlreadyRegistered = u.is_registered;
                  const disabled = isP1 || isAlreadyRegistered;

                  let label = u.name;
                  if (u.employee_id) label += ` [ID: ${u.employee_id}]`;
                  if (u.department) label += ` - ${u.department}`;
                  if (isAlreadyRegistered) {
                    label += ` (Registered in ${u.registered_team?.team_name || 'Team'})`;
                  } else if (isP1) {
                    label += ' (Selected as Player 1)';
                  }

                  return (
                    <option key={u.id} value={u.id} disabled={disabled}>
                      {disabled ? '🚫 ' : '👤 '}
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* 4. Team Tagline */}
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
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition bg-stone-50/50"
              />
              <Quote className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* 5. Team Logo */}
          <div className="pt-1">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-2">
              Team Logo / Avatar
            </label>

            <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="w-14 h-14 rounded-2xl bg-white border border-stone-300 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
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

              <div className="flex-1 space-y-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-white transition shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Logo from Device</span>
                </button>
                <p className="text-[10px] text-stone-500">
                  Pick any image or choose a preset below.
                </p>
              </div>
            </div>

            {/* Quick Carrom Coin Presets */}
            <div className="flex items-center gap-2 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] text-stone-400 font-bold uppercase shrink-0">
                Presets:
              </span>
              {PRESET_TEAM_LOGOS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setLogoUrl(preset.url)}
                  className={`w-8 h-8 rounded-full border-2 p-0.5 transition shrink-0 ${
                    logoUrl === preset.url
                      ? 'border-amber-600 scale-110 shadow-md ring-2 ring-amber-400/40'
                      : 'border-stone-300 hover:border-stone-500 opacity-70 hover:opacity-100'
                  }`}
                  title={preset.name}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full rounded-full"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Submit Registration Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || loadingUsers}
              className="w-full py-3.5 px-6 rounded-2xl text-sm sm:text-base font-extrabold text-white bg-amber-600 hover:bg-amber-500 active:scale-[0.99] transition shadow-md hover:shadow-amber-600/30 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <span>Registering 2-Player Team...</span>
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
    </div>
  );
};
