import React from "react";
import { Trophy, Award, Medal, TrendingUp, Sparkles } from "lucide-react";
import { StandingsRow, Tournament, Team } from "../types";

interface StandingsTableProps {
  standings: StandingsRow[];
  tournament: Tournament;
  champion?: Team | null;
  runnerUp?: Team | null;
  thirdPlace?: Team | null;
  progressPercent: number;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  standings,
  tournament,
  champion,
  runnerUp,
  thirdPlace,
  progressPercent,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Champion Podium if Completed */}
      {champion && (
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 rounded-lg p-6 sm:p-8 text-charcoal-950 shadow-2xl border-4 border-amber-300 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-white/90 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-md border-2 border-amber-400">
            <Trophy className="w-9 h-9" />
          </div>

          <span className="inline-block uppercase tracking-widest text-xs font-black bg-charcoal-950 text-amber-300 px-3 py-1 rounded-full mb-2">
            Round Robin Champion
          </span>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-charcoal-950 mb-1">
            {champion.team_name}
          </h2>
          <p className="text-sm font-bold text-charcoal-900 mb-4">
            Captain: {champion.captain_name} &bull; Reg:{" "}
            {champion.registration_number}
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-xs font-extrabold">
            {runnerUp && (
              <span className="bg-white/80 px-3 py-1.5 rounded-xl border border-charcoal-900/10 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-slate-500" />
                2nd Place: {runnerUp.team_name}
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

      {/* Progress Bar */}
      <div className="bg-white rounded-md p-4 border border-wood-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-charcoal-900">
            Tournament Completion:
          </span>
          <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
            {progressPercent}%
          </span>
        </div>

        <div className="w-full sm:w-64 bg-wood-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-amber-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Standings Table Card */}
      <div className="bg-white rounded-lg border border-wood-300 shadow-board overflow-hidden">
        <div className="p-5 bg-wood-900 text-wood-50 flex items-center justify-between border-b border-wood-700">
          <div>
            <h3 className="font-bold text-base text-ivory-50">
              League Standings
            </h3>
            <p className="text-xs text-wood-300">
              Ranked by Points &gt; Score Difference &gt; Points For
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-wood-800 text-amber-300 border border-wood-700">
            2 pts / win
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-wood-50/80 text-wood-800 uppercase text-[11px] font-bold tracking-wider border-b border-wood-200">
              <tr>
                <th className="py-3 px-4 text-center">Pos</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-3 text-center">P</th>
                <th className="py-3 px-3 text-center">W</th>
                <th className="py-3 px-3 text-center">L</th>
                <th className="py-3 px-3 text-center">PF</th>
                <th className="py-3 px-3 text-center">PA</th>
                <th className="py-3 px-3 text-center">DIFF</th>
                <th className="py-3 px-4 text-center font-extrabold text-charcoal-900">
                  PTS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-100 font-medium text-charcoal-900">
              {standings.map((row) => {
                const isGold = row.position === 1;
                const isSilver = row.position === 2;
                const isBronze = row.position === 3;

                return (
                  <tr
                    key={row.team_id}
                    className={`hover:bg-ivory-50/70 transition ${
                      isGold
                        ? "bg-amber-50/40 font-semibold"
                        : isSilver
                          ? "bg-slate-50/50"
                          : isBronze
                            ? "bg-orange-50/30"
                            : ""
                    }`}
                  >
                    {/* Position */}
                    <td className="py-3.5 px-4 text-center">
                      {isGold ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-charcoal-950 font-black text-xs shadow-sm">
                          1
                        </span>
                      ) : isSilver ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-charcoal-900 font-black text-xs">
                          2
                        </span>
                      ) : isBronze ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/60 text-white font-black text-xs">
                          3
                        </span>
                      ) : (
                        <span className="font-mono text-wood-600">
                          {row.position}
                        </span>
                      )}
                    </td>

                    {/* Team */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-bold text-charcoal-950 flex items-center gap-1.5">
                          <span>{row.team_name}</span>
                          <span className="text-[10px] text-wood-400 font-mono">
                            ({row.registration_number})
                          </span>
                        </div>
                        <div className="text-[11px] text-wood-600 font-medium">
                          👥 {row.players_summary || `Capt: ${row.captain_name}`}
                        </div>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="py-3.5 px-3 text-center font-mono">
                      {row.played}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-emerald-700 font-bold">
                      {row.won}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-rose-700">
                      {row.lost}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-wood-600">
                      {row.points_for}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-wood-600">
                      {row.points_against}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold">
                      <span
                        className={
                          row.score_diff > 0
                            ? "text-emerald-600"
                            : row.score_diff < 0
                              ? "text-rose-600"
                              : "text-wood-600"
                        }
                      >
                        {row.score_diff > 0
                          ? `+${row.score_diff}`
                          : row.score_diff}
                      </span>
                    </td>

                    {/* Points */}
                    <td className="py-3.5 px-4 text-center font-black text-base font-mono text-amber-700 bg-amber-500/10">
                      {row.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
