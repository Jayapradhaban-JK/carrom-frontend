import React from 'react';
import {
  Shield,
  ShieldAlert,
  Trophy,
  Users,
  Calendar,
  Layers,
  UserPlus,
  RefreshCw,
  Sparkles,
  Sliders,
} from 'lucide-react';
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Registration Open
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            In Progress
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <Trophy className="w-3 h-3 text-purple-600" />
            Finished
          </span>
        );
      default:
        return null;
    }
  };

  // User navigation items: Focused on Register & See Fixtures
  const navItems = [
    { id: 'fixtures', label: 'See Fixtures', count: matchesCount, icon: Layers },
    { id: 'register', label: 'Register Team', icon: UserPlus },
    { id: 'teams', label: 'Teams', count: teamsCount, icon: Users },
  ];

  if (isAdmin) {
    navItems.push({
      id: 'admin',
      label: 'Admin Panel',
      count: undefined as any,
      icon: Sliders,
    });
  }

  return (
    <header className="bg-wood-900 border-b-4 border-wood-700 shadow-xl sticky top-0 z-40">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setActiveTab('fixtures')}
        >
          <div className="w-10 h-10 rounded-xl bg-wood-800 border-2 border-amber-500/60 shadow-md flex items-center justify-center p-1 relative overflow-hidden group">
            <div className="w-full h-full bg-ivory-100 rounded-lg flex items-center justify-center relative border border-wood-400">
              <div className="w-5 h-5 rounded-full border-2 border-wood-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-queen-600"></div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-ivory-50">
                Carrom Arena
              </h1>
              {getStatusBadge()}
            </div>
            <p className="text-[11px] text-wood-200 font-medium">
              {tournamentName}
            </p>
          </div>
        </div>

        {/* Status Indicators & Admin Button */}
        <div className="flex items-center gap-2.5">
          {/* LAN Real-time Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isLiveConnected
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
            }`}
            title="Real-time LAN sync active"
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

          <button
            onClick={onRefresh}
            className="p-1.5 text-wood-300 hover:text-white bg-wood-800 hover:bg-wood-700 border border-wood-700 rounded-xl transition"
            title="Refresh latest tournament data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Admin Toggle */}
          {isAdmin ? (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/40 rounded-xl p-1 pr-2.5">
              <button
                onClick={() => setActiveTab('admin')}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-500 text-charcoal-950 uppercase tracking-wider"
              >
                <Shield className="w-3 h-3" /> Admin
              </button>
              <button
                onClick={onLogout}
                className="text-xs text-wood-300 hover:text-white font-medium hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 text-xs font-bold bg-wood-800 hover:bg-wood-700 text-amber-400 border border-amber-500/40 px-3 py-1.5 rounded-xl transition shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Bar / Tabs */}
      <div className="bg-wood-950/95 border-t border-wood-800 px-4 sm:px-6 lg:px-8">
        <nav className="max-w-7xl mx-auto flex space-x-2 sm:space-x-4 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
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
