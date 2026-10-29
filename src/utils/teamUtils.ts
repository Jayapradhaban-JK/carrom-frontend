import { Team } from '../types';

export interface TeamPlayersInfo {
  player1: string;
  player2: string;
  both: string;
}

export const getTeamPlayers = (team?: Team | null): TeamPlayersInfo => {
  if (!team) {
    return {
      player1: 'TBD',
      player2: 'TBD',
      both: 'TBD',
    };
  }

  // 1. Identify Player 1 (Captain)
  const p1 =
    team.captain_name ||
    team.players?.find((p) => p.is_captain)?.player_name ||
    team.players?.[0]?.player_name ||
    'Player 1';

  // 2. Identify Player 2 (Non-captain active player or second player)
  const p2Candidate = team.players?.find(
    (p) =>
      !p.is_substitute &&
      p.player_name.trim().toLowerCase() !== p1.trim().toLowerCase(),
  );

  const p2 =
    p2Candidate?.player_name ||
    team.players?.[1]?.player_name ||
    (team.players?.[0]?.player_name !== p1 ? team.players?.[0]?.player_name : null) ||
    'Player 2';

  return {
    player1: p1,
    player2: p2,
    both: `${p1} & ${p2}`,
  };
};

