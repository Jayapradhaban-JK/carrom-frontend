import React from 'react';
import { Trophy, Award, CheckCircle2, Star, Sparkles, Image as ImageIcon, Flame, Trash2, Layers } from 'lucide-react';
import { Match, Team, Tournament } from '../types';
import { getTeamPlayers } from '../utils/teamUtils';

interface BracketViewProps {
  matches: Match[];
  tournament: Tournament;
  champion?: Team | null;
  runnerUp?: Team | null;
  thirdPlace?: Team | null;
  isAdmin?: boolean;
  onDeleteFixtures?: () => void;
  onSelectMatch?: (match: Match) => void;
}

export const BracketView: React.FC<BracketViewProps> = ({
  matches,
  tournament,
  champion,
  runnerUp,
  thirdPlace,
  isAdmin,
  onDeleteFixtures,
  onSelectMatch,
}) => {
  // Filter out 3rd place match from standard tree rounds
  const treeMatches = matches.filter((m) => !m.is_third_place);
  const thirdPlaceMatch = matches.find((m) => m.is_third_place);

  // Group matches by round_number
  const roundsMap = new Map<number, Match[]>();
  for (const m of treeMatches) {
    const list = roundsMap.get(m.round_number) || [];
    list.push(m);
    roundsMap.set(m.round_number, list);
  }

  const sortedRoundNumbers = Array.from(roundsMap.keys()).sort((a, b) => a - b);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. TOURNAMENT BANNER */}
      {tournament.banner_url ? (
        <div className="w-full h-44 sm:h-64 rounded-lg overflow-hidden shadow-board border-2 border-wood-700 relative group">
          <img
            src={tournament.banner_url}
            alt="Tournament Banner"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-wood-950/90 via-wood-900/40 to-transparent flex flex-col justify-end p-5 sm:p-8">
            <span className="text-amber-400 font-bold uppercase tracking-widest text-[11px] flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Official Championship Banner
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-ivory-50 tracking-tight">
              {tournament.name}
            </h2>
          </div>
        </div>
      ) : (
        /* Default Carrom Banner if no custom banner uploaded */
        <div className="bg-gradient-to-r from-wood-900 via-wood-800 to-wood-900 rounded-lg p-6 sm:p-8 border-2 border-wood-700 shadow-board relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-amber-400 font-bold uppercase tracking-widest text-[11px] flex items-center gap-1.5 mb-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              Tournament Fixtures &amp; Connected Bracket
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-ivory-50 tracking-tight mb-2">
              {tournament.name}
            </h2>
            <p className="text-xs sm:text-sm text-wood-200">
              Interactive knockout architecture. Follow teams advancing from preliminary rounds to the championship final!
            </p>
          </div>
        </div>
      )}

      {/* 2. CHAMPION BANNER PODIUM */}
      {champion && (
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 rounded-lg p-6 sm:p-8 text-charcoal-950 shadow-2xl border-2 border-amber-300 text-center relative overflow-hidden animate-scaleIn">
          <div className="w-20 h-20 rounded-full bg-white/95 text-amber-600 p-1.5 flex items-center justify-center mx-auto mb-3 shadow-lg border-2 border-amber-400">
            {champion.logo_url ? (
              <img
                src={champion.logo_url}
                alt={champion.team_name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <Trophy className="w-10 h-10" />
            )}
          </div>

          <span className="inline-block uppercase tracking-widest text-xs font-black bg-charcoal-950 text-amber-300 px-3 py-1 rounded mb-2">
            Tournament Champion
          </span>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-charcoal-950 mb-1">
            {champion.team_name}
          </h2>

          {champion.tagline && (
            <p className="text-xs sm:text-sm font-semibold italic text-charcoal-900 mb-2">
              "{champion.tagline}"
            </p>
          )}

          <p className="text-xs font-bold text-charcoal-800 mb-4">
            Captain: {champion.captain_name} &bull; Reg #{champion.registration_number}
          </p>

          <div className="flex flex-wrap justify-center gap-3 text-xs font-extrabold">
            {runnerUp && (
              <span className="bg-white/85 px-3 py-1.5 rounded-md border border-charcoal-900/10 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-slate-500" />
                Runner-Up: {runnerUp.team_name}
              </span>
            )}
            {thirdPlace && (
              <span className="bg-white/85 px-3 py-1.5 rounded-md border border-charcoal-900/10 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-800" />
                3rd Place: {thirdPlace.team_name}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3. CONNECTING ARCHITECTURE BRACKET TREE */}
      {sortedRoundNumbers.length > 0 ? (
        <div className="bg-white rounded-lg p-5 sm:p-8 border border-stone-300 shadow-board overflow-x-auto">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-wood-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
              <h3 className="font-extrabold text-sm sm:text-base text-charcoal-900 uppercase tracking-wide">
                Knockout Tree Architecture
              </h3>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && matches.length > 0 && onDeleteFixtures && (
                <button
                  type="button"
                  onClick={onDeleteFixtures}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition"
                  title="Delete all fixtures"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete All Fixtures</span>
                </button>
              )}
              <span className="text-xs text-wood-500 font-medium hidden sm:inline">
                Connected match paths lead to final &rarr;
              </span>
            </div>
          </div>

          <div className="min-w-[850px] flex items-stretch justify-between gap-10 py-4">
            {sortedRoundNumbers.map((roundNum, roundIdx) => {
              const matchesInRound = roundsMap.get(roundNum) || [];
              const roundTitle = matchesInRound[0]?.round_name || `Round ${roundNum}`;
              const isLastRound = roundIdx === sortedRoundNumbers.length - 1;

              return (
                <div key={roundNum} className="flex-1 min-w-[260px] flex flex-col relative">
                  {/* Round Header Column Pill */}
                  <div className="bg-wood-800 text-wood-50 px-4 py-2.5 rounded-md text-center font-extrabold text-xs sm:text-sm uppercase tracking-wider mb-6 border border-wood-600 shadow-sm">
                    {roundTitle}
                  </div>

                  {/* Matches list for this round */}
                  <div className="flex-1 flex flex-col justify-around gap-8 py-2 relative">
                    {matchesInRound.map((match, matchIdx) => {
                      const isCompleted = match.status === 'COMPLETED';
                      const isBye = match.is_bye;
                      const isWinnerA = isCompleted && match.winner_team_id === match.team_a_id;
                      const isWinnerB = isCompleted && match.winner_team_id === match.team_b_id;

                      const teamAPlayers = getTeamPlayers(match.team_a);
                      const teamBPlayers = getTeamPlayers(match.team_b);
                      const byePlayers = getTeamPlayers(match.winner_team || match.team_a);

                      return (
                        <div key={match.id} className="relative flex items-center">
                          {/* Match Card Container */}
                          <div
                            onClick={() => onSelectMatch && onSelectMatch(match)}
                            className={`w-full bg-wood-50/80 rounded-md border-2 p-3.5 shadow-sm transition relative z-10 ${
                              match.status === 'IN_PROGRESS'
                                ? 'border-rose-400 bg-rose-50/40 ring-2 ring-rose-400/50'
                                : isCompleted
                                ? 'border-wood-300 hover:border-amber-500'
                                : 'border-wood-200'
                            } ${onSelectMatch ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' : ''}`}
                          >
                            <div className="flex items-center justify-between text-[11px] text-wood-500 mb-2 font-medium">
                              <span className="font-bold text-wood-700">
                                Match #{match.match_number}
                              </span>
                              <span className="px-2 py-0.2 rounded-full bg-wood-200 text-wood-800 text-[10px] font-semibold">
                                Board {match.board_number}
                              </span>
                            </div>

                            {isBye ? (
                              <div className="bg-amber-100/70 rounded-md p-2.5 border border-amber-300 text-center">
                                <span className="inline-block px-2 py-0.5 rounded bg-amber-500 text-wood-950 font-black text-[10px] uppercase mb-1">
                                  First Round BYE
                                </span>
                                <div className="flex items-center justify-center gap-2 mt-1">
                                  {match.winner_team?.logo_url && (
                                    <img
                                      src={match.winner_team.logo_url}
                                      alt=""
                                      className="w-5 h-5 rounded-full object-cover"
                                    />
                                  )}
                                  <p className="font-bold text-xs text-charcoal-900 truncate">
                                    {match.winner_team?.team_name ||
                                      match.team_a?.team_name ||
                                      'Team'}
                                  </p>
                                </div>
                                <p className="text-[10px] text-amber-950 font-semibold truncate mt-0.5">
                                  👥 {byePlayers.both}
                                </p>
                                <p className="text-[10px] text-wood-600 mt-0.5">
                                  Advances automatically to next round &rarr;
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2 bg-white rounded-md p-2.5 border border-wood-200">
                                {/* Team A Box */}
                                <div
                                  className={`flex items-center justify-between p-1.5 rounded transition ${
                                    isWinnerA
                                      ? 'bg-amber-100/90 font-extrabold text-amber-950 border border-amber-300'
                                      : 'text-charcoal-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    {match.team_a?.logo_url ? (
                                      <img
                                        src={match.team_a.logo_url}
                                        alt=""
                                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-wood-300"
                                      />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-charcoal-900 shrink-0"></div>
                                    )}
                                    <div className="truncate">
                                      <div className="text-xs font-bold truncate">
                                        {match.team_a?.team_name || (
                                          <span className="text-wood-400 italic font-normal">
                                            TBD
                                          </span>
                                        )}
                                      </div>
                                      {match.team_a && (
                                        <div className="text-[10px] text-wood-600 font-semibold truncate">
                                          👥 {teamAPlayers.both}
                                        </div>
                                      )}
                                      {match.team_a?.tagline && (
                                        <div className="text-[9px] text-wood-400 truncate italic">
                                          "{match.team_a.tagline}"
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <span className="font-mono font-black text-sm px-2 py-0.5 bg-wood-100 rounded text-charcoal-900 ml-2">
                                    {match.score_a}
                                  </span>
                                </div>

                                <div className="h-px bg-wood-100"></div>

                                {/* Team B Box */}
                                <div
                                  className={`flex items-center justify-between p-1.5 rounded transition ${
                                    isWinnerB
                                      ? 'bg-amber-100/90 font-extrabold text-amber-950 border border-amber-300'
                                      : 'text-charcoal-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    {match.team_b?.logo_url ? (
                                      <img
                                        src={match.team_b.logo_url}
                                        alt=""
                                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-wood-300"
                                      />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-wood-200 border border-charcoal-800 shrink-0"></div>
                                    )}
                                    <div className="truncate">
                                      <div className="text-xs font-bold truncate">
                                        {match.team_b?.team_name || (
                                          <span className="text-wood-400 italic font-normal">
                                            TBD
                                          </span>
                                        )}
                                      </div>
                                      {match.team_b && (
                                        <div className="text-[10px] text-wood-600 font-semibold truncate">
                                          👥 {teamBPlayers.both}
                                        </div>
                                      )}
                                      {match.team_b?.tagline && (
                                        <div className="text-[9px] text-wood-400 truncate italic">
                                          "{match.team_b.tagline}"
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <span className="font-mono font-black text-sm px-2 py-0.5 bg-wood-100 rounded text-charcoal-900 ml-2">
                                    {match.score_b}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Architectural Connecting Line to Next Round */}
                          {!isLastRound && (
                            <div className="hidden sm:block absolute -right-10 top-1/2 w-10 h-0.5 bg-wood-300">
                              <div
                                className={`w-2 h-2 rounded-full absolute right-0 -top-[3px] ${
                                  isCompleted ? 'bg-amber-500' : 'bg-wood-300'
                                }`}
                              ></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3rd Place Match Card */}
          {thirdPlaceMatch && (
            <div className="mt-8 pt-6 border-t border-wood-200 max-w-sm mx-auto text-center">
              <span className="inline-block uppercase tracking-wider text-[11px] font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded mb-2">
                🥉 3rd Place Playoff
              </span>
              <div
                onClick={() => onSelectMatch && onSelectMatch(thirdPlaceMatch)}
                className="bg-ivory-50 rounded-md border-2 border-stone-300 p-4 shadow-sm text-left cursor-pointer hover:border-amber-500 transition"
              >
                <div className="flex justify-between items-center text-xs mb-2 text-wood-600">
                  <span>Match #{thirdPlaceMatch.match_number}</span>
                  <span>Board {thirdPlaceMatch.board_number}</span>
                </div>
                <div className="space-y-1.5 bg-white rounded-md p-2.5 border border-stone-200 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold truncate">
                      {thirdPlaceMatch.team_a?.team_name || 'Semifinal 1 Loser'}
                    </span>
                    <span className="font-mono font-bold bg-wood-100 px-2 py-0.5 rounded">
                      {thirdPlaceMatch.score_a}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold truncate">
                      {thirdPlaceMatch.team_b?.team_name || 'Semifinal 2 Loser'}
                    </span>
                    <span className="font-mono font-bold bg-wood-100 px-2 py-0.5 rounded">
                      {thirdPlaceMatch.score_b}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-10 sm:p-14 border-2 border-dashed border-stone-300 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-md bg-amber-500/10 border border-amber-300 flex items-center justify-center mx-auto mb-3.5 text-amber-700">
            <Layers className="w-7 h-7" />
          </div>
          <h4 className="font-black text-lg text-charcoal-900 mb-1.5">
            Fixtures Not Generated Yet
          </h4>
          <p className="text-xs sm:text-sm text-wood-600 leading-relaxed max-w-md mx-auto">
            Once team registrations close, the administrator will put the tournament fixtures here in a connected knockout bracket.
          </p>
        </div>
      )}
    </div>
  );
};
