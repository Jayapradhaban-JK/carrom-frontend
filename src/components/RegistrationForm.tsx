import React, { useState } from 'react';
import {
  UserPlus,
  Users,
  ShieldAlert,
  CheckCircle2,
  Plus,
  Trash2,
  AlertCircle,
  Phone,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { teamsApi } from '../api';
import { Tournament, Team } from '../types';

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
  const teamSize = tournament.team_size || 2;
  const teammatesNeeded = Math.max(0, teamSize - 1);

  // Form State
  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [teammates, setTeammates] = useState<string[]>(
    Array(teammatesNeeded).fill(''),
  );
  const [substitutes, setSubstitutes] = useState<string[]>([]);

  // Status & Validation State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredTeam, setRegisteredTeam] = useState<Team | null>(null);

  // Synchronize teammates array size if teamSize changes
  React.useEffect(() => {
    setTeammates((prev) => {
      const needed = Math.max(0, teamSize - 1);
      if (prev.length === needed) return prev;
      const next = [...prev];
      while (next.length < needed) next.push('');
      return next.slice(0, needed);
    });
  }, [teamSize]);

  const handleTeammateChange = (index: number, value: string) => {
    const updated = [...teammates];
    updated[index] = value;
    setTeammates(updated);
  };

  const handleAddSubstitute = () => {
    if (substitutes.length < 3) {
      setSubstitutes([...substitutes, '']);
    }
  };

  const handleSubstituteChange = (index: number, value: string) => {
    const updated = [...substitutes];
    updated[index] = value;
    setSubstitutes(updated);
  };

  const handleRemoveSubstitute = (index: number) => {
    setSubstitutes(substitutes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const cleanTeamName = teamName.trim();
    if (!cleanTeamName) {
      setError('Please provide a unique Team Name.');
      return;
    }

    const cleanCaptain = captainName.trim();
    if (!cleanCaptain) {
      setError('Please provide the Captain Name.');
      return;
    }

    const cleanTeammates = teammates.map((t) => t.trim());
    for (let i = 0; i < cleanTeammates.length; i++) {
      if (!cleanTeammates[i]) {
        setError(`Please provide a name for Player ${i + 2}.`);
        return;
      }
    }

    // Check for duplicate player names within the team
    const allPlayers = [cleanCaptain, ...cleanTeammates];
    const seenNames = new Set<string>();
    for (const name of allPlayers) {
      const lower = name.toLowerCase();
      if (seenNames.has(lower)) {
        setError(`Duplicate player name "${name}" detected. All team members must be distinct.`);
        return;
      }
      seenNames.add(lower);
    }

    // Check substitutes for duplicates
    const cleanSubs = substitutes.map((s) => s.trim()).filter(Boolean);
    const seenSubs = new Set<string>();
    for (const sub of cleanSubs) {
      const lower = sub.toLowerCase();
      if (seenNames.has(lower)) {
        setError(`Substitute "${sub}" is already listed as a core player.`);
        return;
      }
      if (seenSubs.has(lower)) {
        setError(`Duplicate substitute name "${sub}" detected.`);
        return;
      }
      seenSubs.add(lower);
    }

    try {
      setSubmitting(true);
      const newTeam = await teamsApi.register({
        team_name: cleanTeamName,
        captain_name: cleanCaptain,
        contact_number: contactNumber.trim() || undefined,
        player_names: allPlayers,
        substitutes: cleanSubs,
      });

      setRegisteredTeam(newTeam);
      onSuccess(newTeam);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(
        err.response?.data?.message ||
          'Failed to register team. Please check the details and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setTeamName('');
    setCaptainName('');
    setContactNumber('');
    setTeammates(Array(teammatesNeeded).fill(''));
    setSubstitutes([]);
    setRegisteredTeam(null);
    setError(null);
  };

  // If registration is closed
  if (!tournament.registration_open) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-wood-300 shadow-board text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-300">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-charcoal-900 mb-2">
          Registration is Closed
        </h3>
        <p className="text-sm text-wood-600 mb-6 leading-relaxed">
          The tournament administrator has locked team registration. Either fixtures are already in progress or the registration window has concluded.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => onNavigate('teams')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-wood-800 text-ivory-100 hover:bg-wood-700 transition"
          >
            View Registered Teams
          </button>
          <button
            onClick={() => onNavigate('schedule')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 text-white hover:bg-amber-500 transition shadow-sm"
          >
            View Match Schedule
          </button>
        </div>
      </div>
    );
  }

  // Registration Success View
  if (registeredTeam) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border-2 border-emerald-300 shadow-board text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
          Registration Confirmed
        </span>

        <h3 className="text-2xl font-black text-charcoal-900 mb-1">
          {registeredTeam.team_name}
        </h3>

        <div className="my-5 p-4 bg-wood-50 rounded-2xl border border-wood-200 inline-block w-full text-left">
          <div className="flex justify-between items-center pb-2 border-b border-wood-200">
            <span className="text-xs text-wood-600 font-semibold uppercase">
              Registration Number
            </span>
            <span className="text-sm font-extrabold font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
              {registeredTeam.registration_number}
            </span>
          </div>

          <div className="pt-2 text-xs text-charcoal-800 space-y-1">
            <p>
              <strong>Captain:</strong> {registeredTeam.captain_name}
            </p>
            <p>
              <strong>Players:</strong>{' '}
              {registeredTeam.players
                ?.filter((p) => !p.is_substitute)
                .map((p) => p.player_name)
                .join(', ')}
            </p>
            {registeredTeam.players?.some((p) => p.is_substitute) && (
              <p>
                <strong>Substitutes:</strong>{' '}
                {registeredTeam.players
                  ?.filter((p) => p.is_substitute)
                  .map((p) => p.player_name)
                  .join(', ')}
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-wood-500 mb-6">
          Your team is officially registered for the tournament! Keep your registration number for reference during match calls.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={handleResetForm}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-wood-100 text-wood-800 hover:bg-wood-200 transition"
          >
            Register Another Team
          </button>
          <button
            onClick={() => onNavigate('teams')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white transition shadow-sm"
          >
            <span>View All Teams</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Active Registration Form
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-wood-300 shadow-board relative overflow-hidden">
        {/* Top wood accent bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-wood-600 via-amber-600 to-wood-600"></div>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Office Carrom Championship
          </div>
          <h2 className="text-2xl font-black text-charcoal-900 tracking-tight">
            Team Registration
          </h2>
          <p className="text-xs sm:text-sm text-wood-600 mt-1">
            Register your team for the championship. Each team requires exactly{' '}
            <strong className="text-charcoal-900">{teamSize} players</strong>{' '}
            (Captain + {teammatesNeeded} {teammatesNeeded === 1 ? 'partner' : 'players'}).
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Registration Error</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Team Name */}
          <div>
            <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wide mb-1.5">
              Team Name <span className="text-queen-600">*</span>
            </label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Strike Masters, Queen Hunters, Pocket Rockets"
              className="w-full px-4 py-2.5 rounded-xl border border-wood-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm font-semibold text-charcoal-900 placeholder:text-wood-400 outline-none transition bg-ivory-50/50"
            />
            <p className="text-[11px] text-wood-500 mt-1">
              Must be unique across the tournament (case-insensitive).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Captain Name */}
            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wide mb-1.5">
                Team Captain (Player 1) <span className="text-queen-600">*</span>
              </label>
              <input
                type="text"
                required
                value={captainName}
                onChange={(e) => setCaptainName(e.target.value)}
                placeholder="Full Name of Captain"
                className="w-full px-4 py-2.5 rounded-xl border border-wood-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm font-semibold text-charcoal-900 placeholder:text-wood-400 outline-none transition bg-ivory-50/50"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                <span>Captain Phone (Optional)</span>
                <span className="text-[10px] text-wood-400 font-normal">For match alerts</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-wood-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm text-charcoal-900 placeholder:text-wood-400 outline-none transition bg-ivory-50/50"
                />
                <Phone className="w-4 h-4 text-wood-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Core Teammates */}
          <div className="pt-2 border-t border-wood-200">
            <h4 className="text-xs font-bold text-charcoal-800 uppercase tracking-wide mb-3 flex items-center justify-between">
              <span>Required Teammates ({teammatesNeeded} {teammatesNeeded === 1 ? 'Player' : 'Players'})</span>
              <span className="text-amber-700 text-xs lowercase font-normal">team size: {teamSize}</span>
            </h4>

            <div className="space-y-3">
              {teammates.map((teammate, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-medium text-wood-700 mb-1">
                    Player {idx + 2} Name <span className="text-queen-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teammate}
                    onChange={(e) => handleTeammateChange(idx, e.target.value)}
                    placeholder={`Full Name of Player ${idx + 2}`}
                    className="w-full px-4 py-2.5 rounded-xl border border-wood-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm font-semibold text-charcoal-900 placeholder:text-wood-400 outline-none transition bg-ivory-50/50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Optional Substitutes */}
          <div className="pt-2 border-t border-wood-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-charcoal-800 uppercase tracking-wide">
                  Substitute Players (Optional)
                </h4>
                <p className="text-[11px] text-wood-500">
                  Add reserves in case an active player is unavailable.
                </p>
              </div>

              {substitutes.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddSubstitute}
                  className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Sub
                </button>
              )}
            </div>

            <div className="space-y-2 mt-2">
              {substitutes.map((sub, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sub}
                    onChange={(e) => handleSubstituteChange(idx, e.target.value)}
                    placeholder={`Substitute ${idx + 1} Name`}
                    className="flex-1 px-4 py-2 rounded-xl border border-wood-300 focus:border-amber-500 text-sm text-charcoal-900 placeholder:text-wood-400 outline-none bg-ivory-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSubstitute(idx)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                    title="Remove substitute"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-2xl text-sm sm:text-base font-extrabold text-white bg-amber-600 hover:bg-amber-500 active:scale-[0.99] transition shadow-lg hover:shadow-amber-600/30 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <span>Registering Team...</span>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Submit Team Registration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

