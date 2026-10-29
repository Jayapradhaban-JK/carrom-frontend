import { apiClient, getApiBaseUrl } from './client';
import {
  DashboardSummary,
  Team,
  Match,
  LeaderboardData,
  Tournament,
  AdminUser,
} from '../types';

export const tournamentApi = {
  getActiveDashboard: async (): Promise<DashboardSummary> => {
    const res = await apiClient.get<DashboardSummary>('/tournaments/active');
    return res.data;
  },

  updateRegistration: async (data: {
    registration_open?: boolean;
    team_size?: number;
  }): Promise<Tournament> => {
    const res = await apiClient.patch<Tournament>('/admin/registration', data);
    return res.data;
  },

  updateTournament: async (data: Partial<Tournament>): Promise<Tournament> => {
    const res = await apiClient.patch<Tournament>('/admin/tournament', data);
    return res.data;
  },

  updateSettings: async (settings: Record<string, any>): Promise<Tournament> => {
    const res = await apiClient.patch<Tournament>('/admin/settings', settings);
    return res.data;
  },
};

export const teamsApi = {
  getAll: async (search?: string, sortBy?: string): Promise<{ total: number; teams: Team[] }> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    const res = await apiClient.get<{ total: number; teams: Team[] }>(`/teams?${params.toString()}`);
    return res.data;
  },

  register: async (data: {
    team_name: string;
    captain_name: string;
    contact_number?: string;
    player_names: string[];
    substitutes?: string[];
  }): Promise<Team> => {
    const res = await apiClient.post<Team>('/teams', data);
    return res.data;
  },

  update: async (
    id: string,
    data: {
      team_name?: string;
      captain_name?: string;
      contact_number?: string;
      player_names?: string[];
      substitutes?: string[];
    },
  ): Promise<Team> => {
    const res = await apiClient.patch<Team>(`/admin/teams/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/admin/teams/${id}`);
    return res.data;
  },
};

export const fixturesApi = {
  generate: async (data: {
    format?: string;
    start_time?: string;
    match_duration_minutes?: number;
    interval_minutes?: number;
    third_place_playoff?: boolean;
    force?: boolean;
  }): Promise<any> => {
    const res = await apiClient.post('/admin/fixtures/generate', data);
    return res.data;
  },

  reset: async (data?: { reopen_registration?: boolean }): Promise<any> => {
    const res = await apiClient.post('/admin/fixtures/reset', data || {});
    return res.data;
  },
};

export const matchesApi = {
  getAll: async (filters?: { board?: number; status?: string; round?: number }): Promise<Match[]> => {
    const params = new URLSearchParams();
    if (filters?.board) params.append('board', String(filters.board));
    if (filters?.status) params.append('status', filters.status);
    if (filters?.round) params.append('round', String(filters.round));
    const res = await apiClient.get<Match[]>(`/matches?${params.toString()}`);
    return res.data;
  },

  getById: async (id: string): Promise<Match> => {
    const res = await apiClient.get<Match>(`/matches/${id}`);
    return res.data;
  },

  start: async (id: string): Promise<Match> => {
    const res = await apiClient.post<Match>(`/admin/matches/${id}/start`);
    return res.data;
  },

  updateScore: async (
    id: string,
    data: { score_a: number; score_b: number; notes?: string },
  ): Promise<Match> => {
    const res = await apiClient.patch<Match>(`/admin/matches/${id}/score`, data);
    return res.data;
  },

  complete: async (
    id: string,
    data: { winner_team_id?: string; score_a?: number; score_b?: number; notes?: string },
  ): Promise<Match> => {
    const res = await apiClient.post<Match>(`/admin/matches/${id}/complete`, data);
    return res.data;
  },

  schedule: async (
    id: string,
    data: { board_number?: number; scheduled_start?: string; scheduled_end?: string },
  ): Promise<Match> => {
    const res = await apiClient.patch<Match>(`/admin/matches/${id}/schedule`, data);
    return res.data;
  },

  pause: async (id: string): Promise<Match> => {
    const res = await apiClient.post<Match>(`/admin/matches/${id}/pause`);
    return res.data;
  },

  cancel: async (id: string): Promise<Match> => {
    const res = await apiClient.post<Match>(`/admin/matches/${id}/cancel`);
    return res.data;
  },
};

export const leaderboardApi = {
  get: async (): Promise<LeaderboardData> => {
    const res = await apiClient.get<LeaderboardData>('/leaderboard');
    return res.data;
  },
};

export const authApi = {
  login: async (credentials: { username: string; password: string }): Promise<{ access_token: string; user: AdminUser }> => {
    const res = await apiClient.post('/admin/login', credentials);
    return res.data;
  },
  logout: async (): Promise<any> => {
    const res = await apiClient.post('/admin/logout');
    return res.data;
  },
  getMe: async (): Promise<AdminUser> => {
    const res = await apiClient.get('/admin/me');
    return res.data;
  },
};

export { getApiBaseUrl };

