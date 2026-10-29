import React from 'react';
import { Shield, ShieldAlert, Wifi, RefreshCw, Trophy, Users, Calendar, BarChart3, UserPlus, Home } from 'lucide-react';
import { TournamentStatus } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tournamentName: string;
  tournamentStatus: TournamentStatus;
  teamsCount: number;
  matchesCount: number;
  isAdmin: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  isLiveConnected: boolean;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  tournamentName,
  tournamentStatus,
  teamsCount,
  matchesCount,
  isAdmin,
  onOpenLogin,
  onLogout,
  isLiveConnected,
  onRefresh,
}) => {
  const getStatusBadge = () => {
    switch (tournamentStatus) {
      case 'REGISTRATION_OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Registration Open
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            In Progress
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            <Trophy className="w-3 h-3 text-purple-600" />
            Tournament Completed
          </span>
        );
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'register', label: 'Register Team', icon: UserPlus },
    { id: 'teams', label: 'Teams', count: teamsCount, icon: Users },
    { id: 'schedule', label: 'Matches & Boards', count: matchesCount, icon: Calendar },
    { id: 'leaderboard', label: 'Standings & Bracket', icon: BarChart3 },
  ];

  return (
    <header className="bg-wood-900 border-b-4 border-wood-700 shadow-xl sticky top-0 z-40">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-11 h-11 rounded-xl bg-wood-800 border-2 border-amber-500/60 shadow-md flex items-center justify-center p-1 relative overflow-hidden group">
            {/* Wooden board decorative styling */}
            <div className="w-full h-full bg-ivory-100 rounded-lg flex items-center justify-center relative border border-wood-400">
              <div className="w-6 h-6 rounded-full border-2 border-wood-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-queen-600"></div>
              </div>
              <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-charcoal-900"></div>
              <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-charcoal-900"></div>
              <div className="absolute bottom-0.5 left-0.5 w-1 h-1 rounded-full bg-charcoal-900"></div>
              <div className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-charcoal-900"></div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ivory-50 flex items-center gap-2">
                Carrom Arena
              </h1>
              {getStatusBadge()}
            </div>
            <p className="text-xs text-wood-200 font-medium">
              {tournamentName}
            </p>
          </div>
        </div>

        {/* Status Indicators & Admin Button */}
        <div className="flex items-center gap-3">
          {/* LAN Real-time Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isLiveConnected
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
            }`}
            title={isLiveConnected ? 'Connected via real-time LAN push (SSE)' : 'Operating via polling LAN sync'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}
            ></span>
            <span className="hidden sm:inline">
              {isLiveConnected ? 'Live LAN Sync' : 'LAN Polling'}
            </span>
          </div>

          {/* Quick manual refresh */}
          <button
            onClick={onRefresh}
            className="p-1.5 text-wood-300 hover:text-white bg-wood-800/80 hover:bg-wood-700 border border-wood-700 rounded-lg transition"
            title="Refresh latest tournament data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Admin Mode Badge & Button */}
          {isAdmin ? (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-1 pr-2">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-500 text-charcoal-950 uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" /> Admin
              </span>
              <button
                onClick={onLogout}
                className="text-xs text-wood-300 hover:text-white font-medium underline-offset-2 hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 text-xs font-semibold bg-wood-800 hover:bg-wood-700 text-amber-400 border border-amber-500/40 px-3 py-1.5 rounded-lg transition shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Bar / Tabs */}
      <div className="bg-wood-950/90 border-t border-wood-800 px-4 sm:px-6 lg:px-8">
        <nav className="max-w-7xl mx-auto flex space-x-1 sm:space-x-4 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-wood-200 hover:text-white hover:bg-wood-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-wood-300'}`} />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold ${
                      isActive
                        ? 'bg-amber-800 text-amber-100'
                        : 'bg-wood-800 text-wood-200 border border-wood-700'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

