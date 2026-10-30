import React, { useState, useEffect } from "react";
import {
  Shield,
  Layers,
  Users,
  UserPlus,
  Lock,
  LogOut,
  AlertCircle,
  RefreshCw,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useTournamentData } from "./hooks/useTournamentData";
import { RegistrationForm } from "./components/RegistrationForm";
import { TeamsList } from "./components/TeamsList";
import { BracketView } from "./components/BracketView";
import { ScoreModal } from "./components/ScoreModal";
import { AdminLoginModal } from "./components/AdminLoginModal";
import { DeleteFixturesModal } from "./components/DeleteFixturesModal";
import { AdminPanel } from "./components/AdminPanel";
import { Match, Team } from "./types";

export const App: React.FC = () => {
  // When users open the app, 3 buttons: register, teams, fixtures
  const [activeTab, setActiveTab] = useState<
    "register" | "teams" | "fixtures" | "admin"
  >("register");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isDeleteFixturesModalOpen, setIsDeleteFixturesModalOpen] =
    useState<boolean>(false);
  const [selectedMatchToScore, setSelectedMatchToScore] =
    useState<Match | null>(null);

  // Tournament Data Hook
  const { dashboard, teams, matches, leaderboard, loading, error, refreshAll } =
    useTournamentData();

  // Check admin token on mount
  useEffect(() => {
    const token = localStorage.getItem("carrom_admin_token");
    setIsAdmin(Boolean(token));

    const handleUnauthorized = () => {
      setIsAdmin(false);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("carrom_admin_token");
    localStorage.removeItem("carrom_admin_user");
    setIsAdmin(false);
    setActiveTab("register");
  };

  const handleRegistrationSuccess = (newTeam: Team) => {
    refreshAll();
  };

  const tournament = dashboard?.tournament || {
    id: "default",
    name: "Talent Takeaways Infotech PVT LTD - Carrom Tournament 2026",
    format: "SINGLE_ELIMINATION",
    status: "REGISTRATION_OPEN",
    registration_open: true,
    team_size: 2,
    match_duration_minutes: 20,
    interval_minutes: 5,
    start_time: "2026-11-05T09:00:00.000Z",
    third_place_playoff: false,
    scoring_rule: "HIGHER_SCORE",
    target_score: 25,
    banner_url: null,
    settings: {
      company_name: "Talent Takeaways Infotech PVT LTD",
      event_date: "2026-11-05",
      company_logo: "/company-logo.jpg",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-600 mb-2" />
        <p className="text-xs text-stone-600 font-medium">
          Loading Talent Takeaways Carrom Arena...
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-stone-900 flex flex-col selection:bg-amber-500/20 bg-cover bg-fixed bg-center"
      style={{
        backgroundImage: `url('/carraom-background.png')`,
      }}
    >
      {/* Top Bar with Company Branding, Logo, Event Date, & Admin switch */}
      <header className="max-w-6xl mx-auto w-full px-4 pt-4 pb-2">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2.5 border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Company Branding + Event Date */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <img
                src="/company-logo.jpg"
                alt="Talent Takeaways Infotech PVT LTD"
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-md bg-white border border-stone-300 shadow-xs p-1 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xs sm:text-sm md:text-base font-black tracking-tight text-stone-900 leading-tight">
                    Talent Takeaways Infotech PVT LTD
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-300/80 px-2 py-0.5 rounded-md shrink-0">
                    <Calendar className="w-3 h-3 text-amber-700" />
                    05-11-2026
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs font-semibold text-stone-500">
                  Carrom Championship Arena
                </p>
              </div>
            </div>
          </div>

          {/* Admin Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 shrink-0">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                {activeTab === "admin" ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="px-3 py-1.5 rounded-md text-xs font-bold bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 transition shadow-sm"
                  >
                    View Public Mode
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab("admin")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition shadow-sm"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-md text-stone-500 hover:text-rose-600 hover:bg-stone-200/80 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-md bg-stone-50 hover:bg-white border border-stone-300 shadow-xs transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Top 3 Buttons on Plain Background (Register, Teams, Fixtures) */}
      {activeTab !== "admin" && (
        <div className="max-w-6xl mx-auto w-full px-4 pt-2 pb-6">
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`flex-1 max-w-[150px] py-2.5 px-4 rounded-md text-xs sm:text-sm font-bold tracking-wider uppercase transition cursor-pointer text-center border-2 ${
                activeTab === "register"
                  ? "bg-amber-600 border-amber-700 text-white shadow-md"
                  : "bg-white/90 hover:bg-white text-stone-800 border-stone-300 shadow-sm"
              }`}
            >
              Register
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("teams")}
              className={`flex-1 max-w-[150px] py-2.5 px-4 rounded-md text-xs sm:text-sm font-bold tracking-wider uppercase transition cursor-pointer text-center border-2 ${
                activeTab === "teams"
                  ? "bg-amber-600 border-amber-700 text-white shadow-md"
                  : "bg-white/90 hover:bg-white text-stone-800 border-stone-300 shadow-sm"
              }`}
            >
              Teams
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("fixtures")}
              className={`flex-1 max-w-[150px] py-2.5 px-4 rounded-md text-xs sm:text-sm font-bold tracking-wider uppercase transition cursor-pointer text-center border-2 ${
                activeTab === "fixtures"
                  ? "bg-amber-600 border-amber-700 text-white shadow-md"
                  : "bg-white/90 hover:bg-white text-stone-800 border-stone-300 shadow-sm"
              }`}
            >
              Fixtures
            </button>
          </div>
        </div>
      )}

      {/* Official Championship Banner (Visible across public portal when uploaded by admin) */}
      {tournament.banner_url && activeTab !== "admin" && (
        <div className="max-w-6xl mx-auto w-full px-4 mb-5 animate-fadeIn">
          <div className="w-full h-44 sm:h-56 md:h-64 rounded-lg overflow-hidden border-2 border-stone-300 shadow-md relative group bg-stone-900">
            <img
              src={tournament.banner_url}
              alt="Official Championship Banner"
              className="w-full h-full object-cover group-hover:scale-102 transition duration-700"
            />
            {/* Elegant gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/30 to-transparent flex flex-col justify-end p-5 sm:p-7">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-amber-300 bg-black/60 border border-amber-500/40 px-2.5 py-0.5 rounded">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Official Championship Banner
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-stone-200 bg-black/60 px-2.5 py-0.5 rounded border border-stone-700">
                  Talent Takeaways Infotech PVT LTD
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-200 bg-black/60 px-2.5 py-0.5 rounded border border-amber-600/40">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  05-11-2026
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-sm">
                {tournament.name}
              </h2>
            </div>
          </div>
        </div>
      )}

      {/* Error alert if any connection issue */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 mb-4 w-full">
          <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
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
        {activeTab === "register" && (
          <RegistrationForm
            tournament={tournament}
            existingTeams={teams}
            onSuccess={handleRegistrationSuccess}
            onNavigate={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* TAB 2: TEAMS */}
        {activeTab === "teams" && (
          <TeamsList
            teams={teams}
            matches={matches}
            tournament={tournament}
            isAdmin={isAdmin}
            onNavigate={(tab) => setActiveTab(tab as any)}
            onRefresh={refreshAll}
          />
        )}

        {/* TAB 3: FIXTURES */}
        {activeTab === "fixtures" && (
          <BracketView
            matches={matches}
            tournament={tournament}
            champion={leaderboard?.champion}
            runnerUp={leaderboard?.runnerUp}
            thirdPlace={leaderboard?.thirdPlace}
            isAdmin={isAdmin}
            onDeleteFixtures={() => setIsDeleteFixturesModalOpen(true)}
            onSelectMatch={
              isAdmin ? (m) => setSelectedMatchToScore(m) : undefined
            }
          />
        )}

        {/* ADMIN CONSOLE */}
        {activeTab === "admin" && isAdmin && (
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
          setActiveTab("admin");
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
