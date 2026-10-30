import React, { useState, useEffect } from 'react';
import {
  Shield,
  Layers,
  Users,
  UserPlus,
  Lock,
  LogOut,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useTournamentData } from './hooks/useTournamentData';
import { RegistrationForm } from './components/RegistrationForm';
import { TeamsList } from './components/TeamsList';
import { BracketView } from './components/BracketView';
import { ScoreModal } from './components/ScoreModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { DeleteFixturesModal } from './components/DeleteFixturesModal';
import { AdminPanel } from './components/AdminPanel';
import { Match, Team } from './types';

export const App: React.FC = () => {
  // When users open the app, 3 buttons: register, teams, fixtures
  const [activeTab, setActiveTab] = useState<'register' | 'teams' | 'fixtures' | 'admin'>('register');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isDeleteFixturesModalOpen, setIsDeleteFixturesModalOpen] = useState<boolean>(false);
  const [selectedMatchToScore, setSelectedMatchToScore] = useState<Match | null>(null);

  // Tournament Data Hook
  const {
    dashboard,
    teams,
    matches,
    leaderboard,
    loading,
    error,
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
    setActiveTab('register');
  };

  const handleRegistrationSuccess = (newTeam: Team) => {
    refreshAll();
  };

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

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-600 mb-2" />
        <p className="text-xs text-stone-600 font-medium">Loading Carrom Arena...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col selection:bg-amber-500/20">
      {/* Top Bar with Admin switch */}
      <div className="max-w-6xl mx-auto w-full px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
          <span className="text-xs font-black tracking-wider uppercase text-stone-800">
            Carrom Arena
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              {activeTab === 'admin' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 transition shadow-sm"
                >
                  View Public Mode
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition shadow-sm"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-stone-200 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-stone-800 px-2.5 py-1 rounded-lg hover:bg-stone-200 transition"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Top 3 Buttons on Plain Background (Register, Teams, Fixtures) */}
      {activeTab !== 'admin' && (
        <div className="max-w-6xl mx-auto w-full px-4 pt-2 pb-6">
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 max-w-[150px] py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition cursor-pointer text-center ${
                activeTab === 'register'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 shadow-sm'
              }`}
            >
              Register
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('teams')}
              className={`flex-1 max-w-[150px] py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition cursor-pointer text-center ${
                activeTab === 'teams'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 shadow-sm'
              }`}
            >
              Teams
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('fixtures')}
              className={`flex-1 max-w-[150px] py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition cursor-pointer text-center ${
                activeTab === 'fixtures'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 shadow-sm'
              }`}
            >
              Fixtures
            </button>
          </div>
        </div>
      )}

      {/* Error alert if any connection issue */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 mb-4 w-full">
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={refreshAll}
              className="text-xs font-bold underline hover:text-amber-950 shrink-0"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Form / Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pb-12">
        {/* TAB 1: REGISTER */}
        {activeTab === 'register' && (
          <RegistrationForm
            tournament={tournament}
            onSuccess={handleRegistrationSuccess}
            onNavigate={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* TAB 2: TEAMS */}
        {activeTab === 'teams' && (
          <TeamsList
            teams={teams}
            tournament={tournament}
            isAdmin={isAdmin}
            onNavigate={(tab) => setActiveTab(tab as any)}
            onRefresh={refreshAll}
          />
        )}

        {/* TAB 3: FIXTURES */}
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

        {/* ADMIN CONSOLE */}
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
          setActiveTab('admin');
          refreshAll();
        }}
      />

      <DeleteFixturesModal
        isOpen={isDeleteFixturesModalOpen}
        onClose={() => setIsDeleteFixturesModalOpen(false)}
        onSuccess={refreshAll}
        matchesCount={matches.length}
      />
    </div>
  );
};

export default App;
