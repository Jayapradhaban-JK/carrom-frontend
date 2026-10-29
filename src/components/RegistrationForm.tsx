import React, { useState, useRef } from 'react';
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
} from 'lucide-react';
import { teamsApi } from '../api';
import { Tournament, Team } from '../types';
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
  // Exactly 2 players per team: Player 1 and Player 2
  const [teamName, setTeamName] = useState('');
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [tagline, setTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState<string>(PRESET_TEAM_LOGOS[0].url);

  // Status & Validation State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredTeam, setRegisteredTeam] = useState<Team | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const p1 = player1Name.trim();
    const p2 = player2Name.trim();
    const cleanTagline = tagline.trim();

    if (!cleanTeam) {
      setError('Please enter a unique Team Name.');
      return;
    }
    if (!p1) {
      setError('Please enter Player 1 Name.');
      return;
    }
    if (!p2) {
      setError('Please enter Player 2 Name.');
      return;
    }
    if (p1.toLowerCase() === p2.toLowerCase()) {
      setError('Player 1 and Player 2 must have distinct names.');
      return;
    }

    try {
      setSubmitting(true);
      const newTeam = await teamsApi.register({
        team_name: cleanTeam,
        captain_name: p1,
        player_names: [p1, p2],
        logo_url: logoUrl || undefined,
        tagline: cleanTagline || undefined,
      });

      setRegisteredTeam(newTeam);
      onSuccess(newTeam);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(
        err.response?.data?.message ||
          'Failed to register team. A team with this name might already exist.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setTeamName('');
    setPlayer1Name('');
    setPlayer2Name('');
    setTagline('');
    setLogoUrl(PRESET_TEAM_LOGOS[0].url);
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
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-wood-800 text-ivory-100 hover:bg-wood-700 transition"
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
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border-2 border-emerald-300 shadow-board text-center animate-fadeIn">
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

        <h3 className="text-2xl sm:text-3xl font-black text-charcoal-900 mb-1">
          {registeredTeam.team_name}
        </h3>

        {registeredTeam.tagline && (
          <p className="text-xs text-amber-700 italic font-semibold mb-4">
            "{registeredTeam.tagline}"
          </p>
        )}

        <div className="my-5 p-4 bg-wood-50 rounded-2xl border border-wood-200 inline-block w-full text-left">
          <div className="flex justify-between items-center pb-2 border-b border-wood-200">
            <span className="text-xs text-wood-600 font-semibold uppercase">
              Registration Number
            </span>
            <span className="text-sm font-extrabold font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
              {registeredTeam.registration_number}
            </span>
          </div>

          <div className="pt-3 text-xs text-charcoal-800 space-y-1">
            <p>
              <strong>Player 1:</strong> {registeredTeam.captain_name}
            </p>
            <p>
              <strong>Player 2:</strong>{' '}
              {registeredTeam.players?.find((p) => !p.is_captain)?.player_name ||
                registeredTeam.players?.[1]?.player_name ||
                'Teammate'}
            </p>
          </div>
        </div>

        <p className="text-xs text-wood-500 mb-6">
          Your 2-player team is locked in. Head over to the fixtures bracket to track your upcoming matches!
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={handleResetForm}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-wood-100 text-wood-800 hover:bg-wood-200 transition"
          >
            Register Another Team
          </button>
          <button
            onClick={() => onNavigate('fixtures')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white transition shadow-sm"
          >
            <span>See Fixtures</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Active 2-Player Team Registration Form
  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-wood-300 shadow-board relative overflow-hidden">
        {/* Top wood accent bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-wood-600 via-amber-600 to-wood-600"></div>

        <div className="mb-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            2-Player Team Entry
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-charcoal-900 tracking-tight">
            Register Your Team
          </h2>
          <p className="text-xs sm:text-sm text-wood-600 mt-1">
            Fill in your team details, both player names, tagline, and select or upload a team logo.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Registration Notice</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Team Name */}
          <div>
            <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wide mb-1.5">
              Team Name <span className="text-queen-600">*</span>
            </label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Strike Kings, Red Queens, Board Masters"
              className="w-full px-4 py-2.5 rounded-xl border border-wood-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm font-semibold text-charcoal-900 placeholder:text-wood-400 outline-none transition bg-ivory-50/50"
            />
          </div>

          {/* 2 & 3. Team Members (Exactly 2 Persons) */}
          <div className="bg-wood-50/70 p-4 rounded-2xl border border-wood-200 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-charcoal-900 uppercase tracking-wide">
              <Users className="w-4 h-4 text-amber-600" />
              <span>Team Members (2 Persons)</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-wood-700 mb-1">
                Player 1 (Captain) <span className="text-queen-600">*</span>
              </label>
              <input
                type="text"
                required
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="Full Name of Player 1"
                className="w-full px-4 py-2 rounded-xl border border-wood-300 focus:border-amber-500 text-sm font-semibold text-charcoal-900 placeholder:text-wood-400 outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-wood-700 mb-1">
                Player 2 <span className="text-queen-600">*</span>
              </label>
              <input
                type="text"
                required
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Full Name of Player 2"
                className="w-full px-4 py-2 rounded-xl border border-wood-300 focus:border-amber-500 text-sm font-semibold text-charcoal-900 placeholder:text-wood-400 outline-none bg-white"
              />
            </div>
          </div>

          {/* 4. Team Tagline */}
          <div>
            <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wide mb-1.5 flex items-center justify-between">
              <span>Team Tagline / Slogan</span>
              <span className="text-[10px] text-wood-500 font-normal">Optional</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Pocketing wins, one coin at a time"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-wood-300 focus:border-amber-500 text-sm text-charcoal-900 placeholder:text-wood-400 outline-none transition bg-ivory-50/50"
              />
              <Quote className="w-4 h-4 text-wood-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* 5. Team Logo (Upload or Preset) */}
          <div className="pt-1">
            <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wide mb-2">
              Team Logo / Avatar
            </label>

            <div className="flex items-center gap-4 p-3 bg-ivory-50 rounded-2xl border border-wood-200">
              {/* Preview Thumbnail */}
              <div className="w-14 h-14 rounded-2xl bg-white border-2 border-wood-300 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-wood-400" />
                )}
              </div>

              {/* Upload Button */}
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-wood-800 hover:bg-wood-700 text-ivory-50 transition shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Logo from Device</span>
                </button>
                <p className="text-[10px] text-wood-500">
                  Pick any image from your phone or choose a preset below.
                </p>
              </div>
            </div>

            {/* Quick Carrom Coin Presets */}
            <div className="flex items-center gap-2 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] text-wood-400 font-bold uppercase shrink-0">
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
                      : 'border-wood-300 hover:border-wood-500 opacity-70 hover:opacity-100'
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
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-2xl text-sm sm:text-base font-extrabold text-white bg-amber-600 hover:bg-amber-500 active:scale-[0.99] transition shadow-lg hover:shadow-amber-600/30 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
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
