import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Users,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Heart,
  Trash2,
} from 'lucide-react';
import { useTournamentData } from './hooks/useTournamentData';
import { LanShareBanner } from './components/LanShareBanner';
import { Navbar } from './components/Navbar';
import { RegistrationForm } from './components/RegistrationForm';
import { TeamsList } from './components/TeamsList';
import { BracketView } from './components/BracketView';
import { ScoreModal } from './components/ScoreModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { DeleteFixturesModal } from './components/DeleteFixturesModal';
import { AdminPanel } from './components/AdminPanel';
import { Match, Team } from './types';

export const App: React.FC = () => {
  // Default tab for registering users is 'fixtures' ("see fitxes")
  const [activeTab, setActiveTab] = useState<string>('fixtures');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isDeleteFixturesModalOpen, setIsDeleteFixturesModalOpen] = useState<boolean>(false);
  const [selectedMatchToScore, setSelectedMatchToScore] = useState<Match | null>(
    null,
  );

  // Tournament Data Hook
  const {
    dashboard,
    teams,
    matches,
    leaderboard,
    loading,
    error,
    isLiveConnected,
    refreshAll,
  } = useTournamentData();

  // Check admin token on mount
  useEffect(() => {
    const token = localStorage.getItem('carrom_admin_token');
    setIsAdmin(Boolean(token));

    const handleUnauthorized = () => {
      setIsAdmin(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('carrom_admin_token');
    localStorage.removeItem('carrom_admin_user');
    setIsAdmin(false);
    if (activeTab === 'admin') {
      setActiveTab('fixtures');
    }
  };

  const handleRegistrationSuccess = (newTeam: Team) => {
    refreshAll();
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-ivory-100 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-wood-800 border-2 border-amber-500/60 p-2 shadow-2xl flex items-center justify-center animate-bounce mb-4">
          <div className="w-full h-full bg-ivory-50 rounded-lg flex items-center justify-center border border-wood-400">
            <div className="w-5 h-5 rounded-full border-2 border-wood-600 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-queen-600"></div>
            </div>
          </div>
        </div>
        <h2 className="text-xl font-black text-charcoal-900 tracking-tight">
          Carrom Arena
        </h2>
        <p className="text-xs text-wood-600 mt-1 flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
          Connecting to tournament host...
        </p>
      </div>
    );
  }

  const tournament = dashboard?.tournament || {
    id: 'default',
    name: 'Office Carrom Championship',
    format: 'SINGLE_ELIMINATION',
    status: 'REGISTRATION_OPEN',
    registration_open: true,
    team_size: 2,
    match_duration_minutes: 20,
    interval_minutes: 5,
    start_time: new Date().toISOString(),
    third_place_playoff: false,
    scoring_rule: 'HIGHER_SCORE',
    target_score: 25,
    banner_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const playableMatches = matches.filter((m) => !m.is_bye);

  return (
    <div className="min-h-screen flex flex-col bg-ivory-100 text-charcoal-900 selection:bg-amber-500/30 selection:text-amber-950">
      {/* Office LAN Sharing Banner */}
      <LanShareBanner />

      {/* Main Top Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tournamentName={tournament.name}
        tournamentStatus={tournament.status}
        teamsCount={teams.length}
        matchesCount={playableMatches.length}
        isAdmin={isAdmin}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        isLiveConnected={isLiveConnected}
        onRefresh={refreshAll}
      />

      {/* Error alert banner if any connection issues */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={refreshAll}
              className="text-xs font-bold underline hover:text-amber-950 shrink-0"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Primary Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* 1. SEE FIXTURES TAB (DEFAULT FOR REGISTERED USERS) */}
        {activeTab === 'fixtures' && (
          <BracketView
            matches={matches}
            tournament={tournament}
            champion={leaderboard?.champion}
            runnerUp={leaderboard?.runnerUp}
            thirdPlace={leaderboard?.thirdPlace}
            isAdmin={isAdmin}
            onDeleteFixtures={() => setIsDeleteFixturesModalOpen(true)}
            onSelectMatch={isAdmin ? (m) => setSelectedMatchToScore(m) : undefined}
          />
        )}

        {/* 2. REGISTER TEAM TAB */}
        {activeTab === 'register' && (
          <RegistrationForm
            tournament={tournament}
            onSuccess={handleRegistrationSuccess}
            onNavigate={setActiveTab}
          />
        )}

        {/* 3. TEAMS LIST TAB */}
        {activeTab === 'teams' && (
          <TeamsList
            teams={teams}
            tournament={tournament}
            isAdmin={isAdmin}
            onNavigate={setActiveTab}
            onRefresh={refreshAll}
          />
        )}

        {/* 4. ADMIN PANEL TAB (ADMIN-ONLY) */}
        {activeTab === 'admin' && isAdmin && (
          <AdminPanel
            tournament={tournament}
            teams={teams}
            matches={matches}
            onRefresh={refreshAll}
            onSelectMatchToScore={(m) => setSelectedMatchToScore(m)}
          />
        )}
      </main>

      {/* Modals */}
      <ScoreModal
        match={selectedMatchToScore}
        tournament={tournament}
        onClose={() => setSelectedMatchToScore(null)}
        onSuccess={refreshAll}
      />

      <AdminLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          setIsAdmin(true);
          refreshAll();
        }}
      />

      <DeleteFixturesModal
        isOpen={isDeleteFixturesModalOpen}
        onClose={() => setIsDeleteFixturesModalOpen(false)}
        onSuccess={refreshAll}
        matchesCount={matches.length}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-wood-200 bg-white/70 py-6 text-center text-xs text-wood-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-queen-600 inline-block"></span>
            <span className="font-bold text-charcoal-900">Carrom Arena</span> &bull; Office Carrom Championship
          </div>

          <div className="flex items-center gap-1 text-[11px] text-wood-400">
            <span>Runs locally on Office LAN &bull; Synchronized via PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
