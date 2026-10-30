export type TournamentFormat = "SINGLE_ELIMINATION" | "ROUND_ROBIN";
export type TournamentStatus =
  | "REGISTRATION_OPEN"
  | "IN_PROGRESS"
  | "COMPLETED";
export type ScoringRule = "HIGHER_SCORE" | "TARGET_SCORE";
export type MatchStatus =
  | "SCHEDULED"
  | "READY"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface Tournament {
  id: string;
  name: string;
  format: TournamentFormat;
  status: TournamentStatus;
  registration_open: boolean;
  team_size: number;
  match_duration_minutes: number;
  interval_minutes: number;
  start_time: string;
  third_place_playoff: boolean;
  scoring_rule: ScoringRule;
  target_score: number;
  banner_url?: string | null;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  team_id: string;
  player_name: string;
  is_captain: boolean;
  is_substitute: boolean;
  created_at: string;
}

export interface Team {
  id: string;
  tournament_id: string;
  registration_number: string;
  team_name: string;
  normalized_team_name: string;
  captain_name: string;
  contact_number?: string | null;
  logo_url?: string | null;
  tagline?: string | null;
  status: string;
  players: Player[];
  created_at: string;
  updated_at: string;
}

export interface MatchEvent {
  id: string;
  match_id: string;
  event_type: string;
  details: Record<string, any>;
  created_at: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  round_number: number;
  round_name: string;
  match_number: number;
  board_number: number;
  team_a_id?: string | null;
  team_a?: Team | null;
  team_b_id?: string | null;
  team_b?: Team | null;
  winner_team_id?: string | null;
  winner_team?: Team | null;
  score_a: number;
  score_b: number;
  status: MatchStatus;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  next_match_id?: string | null;
  next_match_slot?: "A" | "B" | null;
  is_bye: boolean;
  is_third_place: boolean;
  notes?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  events?: MatchEvent[];
  created_at: string;
  updated_at: string;
}

export interface BoardStatusInfo {
  board_number: number;
  status: "Available" | "Upcoming" | "In Progress";
  current_match?: Match | null;
}

export interface DashboardSummary {
  tournament: Tournament;
  stats: {
    total_teams: number;
    total_players: number;
    total_matches: number;
    completed_matches: number;
    in_progress_matches: number;
    upcoming_matches: number;
  };
  boards: {
    board_1: BoardStatusInfo;
    board_2: BoardStatusInfo;
  };
}

export interface StandingsRow {
  position: number;
  team_id: string;
  team_name: string;
  captain_name: string;
  players_summary?: string;
  registration_number: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  points_for: number;
  points_against: number;
  score_diff: number;
}

export interface LeaderboardData {
  tournament: Tournament;
  format: TournamentFormat;
  progress: {
    total: number;
    completed: number;
    percentage: number;
  };
  champion?: Team | null;
  runnerUp?: Team | null;
  thirdPlace?: Team | null;
  standings: StandingsRow[];
  recentResults: Match[];
  upcomingMatches: Match[];
}

export interface AdminUser {
  id: string;
  username: string;
  role: string;
}

export interface TournamentUser {
  id: string;
  name: string;
  normalized_name: string;
  employee_id?: string;
  department?: string;
  email?: string;
  created_at: string;
  is_registered: boolean;
  registered_team?: {
    id: string;
    team_name: string;
    registration_number: string;
  } | null;
  is_captain?: boolean;
}

