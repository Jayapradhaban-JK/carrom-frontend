import { useState, useEffect, useCallback, useRef } from "react";
import {
  tournamentApi,
  teamsApi,
  matchesApi,
  leaderboardApi,
  getApiBaseUrl,
} from "../api";
import { DashboardSummary, Team, Match, LeaderboardData } from "../types";

export function useTournamentData() {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  const refreshAll = useCallback(async () => {
    try {
      const [dashData, teamsData, matchesData, leadData] = await Promise.all([
        tournamentApi.getActiveDashboard(),
        teamsApi.getAll(),
        matchesApi.getAll(),
        leaderboardApi.get(),
      ]);

      setDashboard(dashData);
      setTeams(teamsData.teams);
      setMatches(matchesData);
      setLeaderboard(leadData);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch tournament data:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error connecting to tournament server",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up Server-Sent Events (SSE) and polling fallback
  useEffect(() => {
    refreshAll();

    // Setup SSE
    const baseUrl = getApiBaseUrl();
    const sseUrl = `${baseUrl}/updates`;

    try {
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsLiveConnected(true);
      };

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          // Auto refresh on any relevant tournament event
          refreshAll();
        } catch (e) {
          refreshAll();
        }
      };

      es.onerror = () => {
        setIsLiveConnected(false);
      };
    } catch (e) {
      setIsLiveConnected(false);
    }

    // 4-second polling fallback to guarantee real-time updates even if SSE is blocked by LAN proxy/firewall
    const pollInterval = setInterval(() => {
      refreshAll();
    }, 4000);

    return () => {
      clearInterval(pollInterval);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [refreshAll]);

  return {
    dashboard,
    teams,
    matches,
    leaderboard,
    loading,
    error,
    isLiveConnected,
    refreshAll,
  };
}
