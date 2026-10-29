import React, { useState, useRef } from 'react';
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
  Edit2,
  Calendar,
  Settings,
  Plus,
} from 'lucide-react';
import { Tournament, Team, Match } from '../types';
import { tournamentApi, teamsApi, fixturesApi } from '../api';
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

export const AdminPanel: React.FC<AdminPanelProps> = ({
  tournament,
  teams,
  matches,
  onRefresh,
  onSelectMatchToScore,
}) => {
  // Banner state
  const [bannerUrl, setBannerUrl] = useState<string>(tournament.banner_url || '');
  const [bannerLoading, setBannerLoading] = useState(false);
  const [bannerSuccess, setBannerSuccess] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Fixture settings state
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

  // Team delete state
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const [isDeleteFixturesOpen, setIsDeleteFixturesOpen] = useState(false);

  // Registration lock state
  const [regOpen, setRegOpen] = useState(tournament.registration_open);

  const playableMatches = matches.filter((m) => !m.is_bye);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBannerLoading(true);
      const dataUrl = await processImageFile(file, 1200, 400, 0.85);
      setBannerUrl(dataUrl);

      // Save immediately to backend
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

  const handleDeleteFixtures = async () => {
    if (
      !window.confirm(
        'Are you sure you want to DELETE ALL FIXTURES? All scheduled matches and match scores will be wiped, and team registration will reopen.',
      )
    ) {
      return;
    }

    try {
      setFixturesLoading(true);
      setFixturesError(null);
      await fixturesApi.delete();
      setFixturesMsg('All fixtures have been deleted. Registration is reopened.');
      setTimeout(() => setFixturesMsg(null), 4000);
      onRefresh();
    } catch (err: any) {
      setFixturesError(err.response?.data?.message || 'Failed to delete fixtures.');
    } finally {
      setFixturesLoading(false);
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    if (
      !window.confirm(
        `Are you sure you want to DELETE team "${team.team_name}" (${team.registration_number})?`,
      )
    ) {
      return;
    }

    try {
      setDeletingTeamId(team.id);
      await teamsApi.delete(team.id);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cannot delete team while fixtures exist. Delete fixtures first.');
    } finally {
      setDeletingTeamId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Admin Panel Header */}
      <div className="bg-gradient-to-r from-wood-950 via-wood-900 to-wood-950 text-wood-50 rounded-3xl p-6 sm:p-8 border-4 border-amber-600/40 shadow-board flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            Tournament Management Console
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-ivory-50 tracking-tight">
            Administrator Panel
          </h2>
          <p className="text-xs sm:text-sm text-wood-300 mt-1">
            Configure banners, put/delete fixtures, manage registered teams, and control the championship.
          </p>
        </div>

        {/* Registration Toggle Status */}
        <div className="bg-wood-800/80 p-3 rounded-2xl border border-wood-700 flex items-center gap-3">
          <div>
            <div className="text-xs font-bold text-ivory-100">
              Registration Window
            </div>
            <div className="text-[11px] text-wood-300">
              {regOpen ? 'Accepting Entries' : 'Closed / Locked'}
            </div>
          </div>
          <button
            onClick={handleToggleRegistration}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
              regOpen
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {regOpen ? 'Close Registration' : 'Open Registration'}
          </button>
        </div>
      </div>

      {/* 1. TOURNAMENT BANNER UPLOAD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-wood-300 shadow-board space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-black text-charcoal-900">
                Tournament Banner
              </h3>
              <p className="text-xs text-wood-600">
                This banner is prominently showcased on the Fixtures &amp; Bracket page.
              </p>
            </div>
          </div>

          {bannerSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Banner Updated!
            </span>
          )}
        </div>

        {/* Live Banner Preview */}
        <div className="w-full h-40 sm:h-52 rounded-2xl overflow-hidden border-2 border-wood-300 bg-wood-50 relative flex items-center justify-center shadow-inner">
          {bannerUrl ? (
            <>
              <img
                src={bannerUrl}
                alt="Banner preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveBanner}
                className="absolute top-3 right-3 p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </>
          ) : (
            <div className="text-center p-6 text-wood-500">
              <ImageIcon className="w-10 h-10 mx-auto mb-1 opacity-50" />
              <p className="text-xs font-semibold">No custom banner uploaded</p>
              <p className="text-[11px] text-wood-400">
                Upload a tournament header graphic or select a preset below
              </p>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{bannerLoading ? 'Uploading...' : 'Upload Banner from Computer'}</span>
          </button>

          <span className="text-xs text-wood-500">Or use a preset:</span>
          {PRESET_TOURNAMENT_BANNERS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleSelectPresetBanner(preset.url)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-wood-300 hover:border-amber-500 bg-ivory-50 text-charcoal-800 transition"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. FIXTURES MANAGEMENT (PUT FIXES & DELETE FIXES) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-wood-300 shadow-board space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-wood-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-black text-charcoal-900">
                Fixtures &amp; Scheduling Engine
              </h3>
              <p className="text-xs text-wood-600">
                Generate knockout brackets or round-robin league schedules across Board 1 and Board 2.
              </p>
            </div>
          </div>

          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-wood-100 text-wood-800 border border-wood-200">
            {playableMatches.length} {playableMatches.length === 1 ? 'Match' : 'Matches'} Scheduled
          </span>
        </div>

        {fixturesMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{fixturesMsg}</span>
          </div>
        )}

        {fixturesError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{fixturesError}</span>
          </div>
        )}

        {/* Fixture options form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">
              Tournament Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs font-semibold outline-none focus:border-amber-500 bg-ivory-50/50 cursor-pointer"
            >
              <option value="SINGLE_ELIMINATION">Single Elimination (Knockout)</option>
              <option value="ROUND_ROBIN">Round Robin League</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">
              Match Duration (Minutes)
            </label>
            <input
              type="number"
              min={5}
              max={120}
              value={matchDuration}
              onChange={(e) => setMatchDuration(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-xs font-semibold outline-none focus:border-amber-500 bg-ivory-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">
              Rest Interval (Minutes)
            </label>
            <input
              type="number"
              min={0}
              max={60}
              value={interval}
              onChange={(e) => setInterval(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-xs font-semibold outline-none focus:border-amber-500 bg-ivory-50/50"
            />
          </div>
        </div>

        {format === 'SINGLE_ELIMINATION' && (
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-charcoal-800">
            <input
              type="checkbox"
              checked={thirdPlace}
              onChange={(e) => setThirdPlace(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded"
            />
            <span>Include 3rd-Place Playoff match between semifinal losers</span>
          </label>
        )}

        {/* Buttons: Put Fixtures & Delete Fixtures */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-wood-100">
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
            disabled={fixturesLoading}
            onClick={handlePutFixtures}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-amber-600 hover:bg-amber-500 shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Layers className="w-4 h-4" />
            <span>{fixturesLoading ? 'Scheduling...' : 'Put / Generate Fixtures'}</span>
          </button>
        </div>
      </div>

      {/* 3. TEAMS LIST & DELETION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-wood-300 shadow-board space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-wood-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-black text-charcoal-900">
                Registered Teams List
              </h3>
              <p className="text-xs text-wood-600">
                Manage registered 2-player teams or delete invalid registrations.
              </p>
            </div>
          </div>

          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            {teams.length} {teams.length === 1 ? 'Team' : 'Teams'}
          </span>
        </div>

        {teams.length > 0 ? (
          <div className="divide-y divide-wood-100">
            {teams.map((team) => {
              const playersInfo = getTeamPlayers(team);

              return (
                <div
                  key={team.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-ivory-50/60 px-3 rounded-2xl transition"
                >
                  <div className="flex items-center gap-3">
                    {/* Team Logo */}
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-wood-300 bg-white shrink-0 flex items-center justify-center shadow-sm">
                      {team.logo_url ? (
                        <img
                          src={team.logo_url}
                          alt={team.team_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-amber-600"></div>
                      )}
                    </div>

                    {/* Team Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-charcoal-900">
                          {team.team_name}
                        </span>
                        <span className="font-mono text-[11px] font-bold px-2 py-0.2 bg-wood-100 text-wood-700 rounded">
                          {team.registration_number}
                        </span>
                      </div>

                      {team.tagline && (
                        <p className="text-[11px] text-amber-700 italic font-medium">
                          "{team.tagline}"
                        </p>
                      )}

                      <p className="text-xs text-wood-600 mt-0.5">
                        <strong>Players:</strong> {playersInfo.both}
                      </p>
                    </div>
                  </div>

                  {/* Delete Team Button */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      disabled={deletingTeamId === team.id}
                      onClick={() => handleDeleteTeam(team)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition disabled:opacity-50"
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
          <div className="text-center py-8 text-wood-500 text-xs">
            No teams registered yet.
          </div>
        )}
      </div>

      {/* 4. ACTIVE MATCHES QUICK SCORING */}
      {playableMatches.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-wood-300 shadow-board space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-wood-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-black text-charcoal-900">
                  Live Match Scoring &amp; Court Controls
                </h3>
                <p className="text-xs text-wood-600">
                  Click any match to record live scores or finalize the winner.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {playableMatches.slice(0, 6).map((match) => (
              <div
                key={match.id}
                onClick={() => onSelectMatchToScore(match)}
                className="p-3.5 rounded-2xl border-2 border-wood-200 hover:border-amber-500 bg-ivory-50/50 cursor-pointer transition shadow-sm hover:shadow"
              >
                <div className="flex justify-between items-center text-xs mb-2 text-wood-500">
                  <span className="font-bold text-charcoal-800">
                    M#{match.match_number} &bull; {match.round_name}
                  </span>
                  <span className="px-2 py-0.2 rounded bg-wood-200 text-wood-800 text-[10px] font-semibold">
                    Board {match.board_number}
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between font-bold text-charcoal-900">
                    <span className="truncate">{match.team_a?.team_name || 'TBD'}</span>
                    <span className="font-mono">{match.score_a}</span>
                  </div>
                  <div className="flex justify-between font-bold text-charcoal-900">
                    <span className="truncate">{match.team_b?.team_name || 'TBD'}</span>
                    <span className="font-mono">{match.score_b}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Delete Fixtures Modal */}
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
    </div>
  );
};

