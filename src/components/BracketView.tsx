import React from 'react';
import { Trophy, Award, CheckCircle2, Star, Sparkles } from 'lucide-react';
import { Match, Team, Tournament } from '../types';

interface BracketViewProps {
  matches: Match[];
  tournament: Tournament;
  champion?: Team | null;
  runnerUp?: Team | null;
  thirdPlace?: Team | null;
  onSelectMatch?: (match: Match) => void;
}

export const BracketView: React.FC<BracketViewProps> = ({
  matches,
  tournament,
  champion,
  runnerUp,
  thirdPlace,
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
    <div className="space-y-8 animate-fadeIn">
      {/* Champion Podium Banner if tournament has champion */}
      {champion && (
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-charcoal-950 shadow-2xl border-4 border-amber-300 text-center relative overflow-hidden">
          <div className="absolute top-2 left-6 text-amber-200/40 pointer-events-none">
            <Sparkles className="w-16 h-16" />
          </div>
          <div className="absolute bottom-2 right-6 text-amber-200/40 pointer-events-none">
            <Sparkles className="w-16 h-16" />
          </div>

          <div className="w-16 h-16 rounded-full bg-white/90 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-md border-2 border-amber-400">
            <Trophy className="w-9 h-9" />
          </div>

          <span className="inline-block uppercase tracking-widest text-xs font-black bg-charcoal-950 text-amber-300 px-3 py-1 rounded-full mb-2">
            Tournament Champion
          </span>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-charcoal-950 mb-1">
            {champion.team_name}
          </h2>
          <p className="text-sm font-bold text-charcoal-900 mb-4">
            Captain: {champion.captain_name} &bull; Reg: {champion.registration_number}
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-xs font-extrabold">
            {runnerUp && (
              <span className="bg-white/80 px-3 py-1.5 rounded-xl border border-charcoal-900/10 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-slate-500" />
                Runner-Up: {runnerUp.team_name}
              </span>
            )}
            {thirdPlace && (
              <span className="bg-white/80 px-3 py-1.5 rounded-xl border border-charcoal-900/10 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-800" />
                3rd Place: {thirdPlace.team_name}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bracket Rounds Flow */}
      {sortedRoundNumbers.length > 0 ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-wood-300 shadow-board overflow-x-auto">
          <div className="min-w-[700px] flex items-stretch justify-start gap-8">
            {sortedRoundNumbers.map((roundNum) => {
              const matchesInRound = roundsMap.get(roundNum) || [];
              const roundTitle = matchesInRound[0]?.round_name || `Round ${roundNum}`;

              return (
                <div key={roundNum} className="flex-1 min-w-[240px] flex flex-col">
                  {/* Round Header */}
                  <div className="bg-wood-800 text-wood-50 px-4 py-2.5 rounded-xl text-center font-bold text-xs sm:text-sm uppercase tracking-wider mb-4 border border-wood-600 shadow-sm">
                    {roundTitle}
                  </div>

                  {/* Matches Column */}
                  <div className="flex-1 flex flex-col justify-around gap-6 py-2">
                    {matchesInRound.map((match) => {
                      const isCompleted = match.status === 'COMPLETED';
                      const isBye = match.is_bye;
                      const isWinnerA = isCompleted && match.winner_team_id === match.team_a_id;
                      const isWinnerB = isCompleted && match.winner_team_id === match.team_b_id;

                      return (
                        <div
                          key={match.id}
                          onClick={() => onSelectMatch && onSelectMatch(match)}
                          className={`bg-wood-50/70 rounded-2xl border-2 p-3.5 shadow-sm transition relative ${
                            match.status === 'IN_PROGRESS'
                              ? 'border-rose-400 bg-rose-50/30 ring-2 ring-rose-300/50'
                              : isCompleted
                              ? 'border-wood-300 hover:border-amber-500'
                              : 'border-wood-200'
                          } ${onSelectMatch ? 'cursor-pointer hover:shadow-md' : ''}`}
                        >
                          <div className="flex items-center justify-between text-[11px] text-wood-500 mb-2 font-medium">
                            <span>M#{match.match_number}</span>
                            <span className="font-semibold text-wood-700">
                              Board {match.board_number}
                            </span>
                          </div>

                          {isBye ? (
                            <div className="bg-amber-100/60 rounded-xl p-2.5 border border-amber-300/80 text-center">
                              <span className="inline-block px-2 py-0.5 rounded bg-amber-500 text-wood-950 font-black text-[10px] uppercase mb-1">
                                First Round BYE
                              </span>
                              <p className="font-bold text-xs text-charcoal-900 truncate">
                                {match.winner_team?.team_name || match.team_a?.team_name || 'Team'}
                              </p>
                              <p className="text-[10px] text-wood-600 mt-0.5">
                                Automatically advances to next round
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1.5 bg-white rounded-xl p-2.5 border border-wood-200">
                              {/* Team A */}
                              <div
                                className={`flex items-center justify-between text-xs p-1 rounded ${
                                  isWinnerA ? 'bg-amber-100 font-bold text-amber-950' : 'text-charcoal-800'
                                }`}
                              >
                                <span className="truncate mr-2">
                                  {match.team_a?.team_name || (
                                    <span className="text-wood-400 italic">TBD</span>
                                  )}
                                </span>
                                <span className="font-mono font-extrabold px-1.5 py-0.2 bg-wood-100 rounded text-charcoal-900">
                                  {match.score_a}
                                </span>
                              </div>

                              <div className="h-px bg-wood-100"></div>

                              {/* Team B */}
                              <div
                                className={`flex items-center justify-between text-xs p-1 rounded ${
                                  isWinnerB ? 'bg-amber-100 font-bold text-amber-950' : 'text-charcoal-800'
                                }`}
                              >
                                <span className="truncate mr-2">
                                  {match.team_b?.team_name || (
                                    <span className="text-wood-400 italic">TBD</span>
                                  )}
                                </span>
                                <span className="font-mono font-extrabold px-1.5 py-0.2 bg-wood-100 rounded text-charcoal-900">
                                  {match.score_b}
                                </span>
                              </div>
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
              <span className="inline-block uppercase tracking-wider text-[11px] font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full mb-2">
                🥉 3rd Place Playoff
              </span>
              <div
                onClick={() => onSelectMatch && onSelectMatch(thirdPlaceMatch)}
                className="bg-ivory-50 rounded-2xl border-2 border-wood-300 p-4 shadow-sm text-left cursor-pointer hover:border-amber-500 transition"
              >
                <div className="flex justify-between items-center text-xs mb-2 text-wood-600">
                  <span>Match #{thirdPlaceMatch.match_number}</span>
                  <span>Board {thirdPlaceMatch.board_number}</span>
                </div>
                <div className="space-y-1.5 bg-white rounded-xl p-2.5 border border-wood-200 text-xs">
                  <div className="flex justify-between">
                    <span>{thirdPlaceMatch.team_a?.team_name || 'Semifinal 1 Loser'}</span>
                    <span className="font-mono font-bold">{thirdPlaceMatch.score_a}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{thirdPlaceMatch.team_b?.team_name || 'Semifinal 2 Loser'}</span>
                    <span className="font-mono font-bold">{thirdPlaceMatch.score_b}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 border-2 border-dashed border-wood-300 text-center max-w-md mx-auto">
          <p className="text-sm text-wood-600">
            Bracket will be generated as soon as tournament fixtures are created.
          </p>
        </div>
      )}
    </div>
  );
};

