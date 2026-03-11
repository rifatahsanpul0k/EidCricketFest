import axios from "axios";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const roleLabel = (role) =>
  ({
    BATSMAN: "BAT",
    BOWLER: "BOWL",
    ALL_ROUNDER: "AR",
    WICKETKEEPER: "WK",
  })[role] || role;

const roleColor = (role) =>
  ({
    BATSMAN: "text-sky-400",
    BOWLER: "text-orange-400",
    ALL_ROUNDER: "text-violet-400",
    WICKETKEEPER: "text-emerald-400",
  })[role] || "text-white/40";

const PlayerDetailModal = ({ player, onClose }) => {
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/players/${player.playerId}`)
      .then((res) => setPlayerData(res.data))
      .catch(() => console.error("Could not load player details"))
      .finally(() => setLoading(false));
  }, [player.playerId]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-white/10 rounded-lg max-w-lg w-full max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
            {playerData?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-white/40 text-center">Loading...</div>
        ) : playerData ? (
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-white/40">
                  Role
                </span>
                <p
                  className={`text-base font-bold uppercase ${roleColor(playerData.role)}`}
                >
                  {roleLabel(playerData.role)}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-white/40">
                  Team
                </span>
                <p className="text-base font-bold text-white uppercase">
                  {playerData.team?.name || "Unassigned"}
                </p>
              </div>
            </div>

            {/* Ratings */}
            <div>
              <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-3">
                Ratings
              </span>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Batting</span>
                  <span className="font-mono text-white font-bold">
                    {playerData.battingRating}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Bowling</span>
                  <span className="font-mono text-white font-bold">
                    {playerData.bowlingRating}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Fielding</span>
                  <span className="font-mono text-white font-bold">
                    {playerData.fieldingRating}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            {playerData.stats && (
              <div>
                <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-3">
                  Statistics
                </span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Matches</span>
                    <span className="font-mono text-white font-bold">
                      {playerData.stats.matchesPlayed}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Runs</span>
                    <span className="font-mono text-white font-bold">
                      {playerData.stats.totalRuns}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Wickets</span>
                    <span className="font-mono text-white font-bold">
                      {playerData.stats.totalWickets}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-red-400 text-center">
            Failed to load player details
          </div>
        )}
      </div>
    </div>
  );
};

const TeamDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/teams/${id}/stats`)
      .then((res) => setTeam(res.data))
      .catch(() => setError("Could not load team."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="bg-black min-h-screen font-space flex items-center justify-center text-white/30 uppercase tracking-widest text-xs">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="bg-black min-h-screen font-space flex items-center justify-center text-red-400 uppercase tracking-widest text-xs">
        {error}
      </div>
    );

  const captain = team?.squad?.find((p) => p.isCaptain);
  const vc = team?.squad?.find((p) => p.isViceCaptain);

  return (
    <div className="w-full bg-black min-h-screen font-space text-white flex flex-col">
      {/* Player Detail Modal */}
      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}

      {/* Navbar */}
      <nav className="ecf-nav flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
        >
          ← Back
        </button>
        <div className="flex-1 text-center text-white text-base font-bold uppercase leading-normal tracking-wide-lg">
          ECF • 2024
        </div>
        <div className="w-16"></div>
      </nav>

      {/* Hero */}
      <section className="w-full bg-white text-black px-6 md:px-12 py-16 flex flex-col gap-6">
        <span className="text-black/30 text-[10px] uppercase tracking-[6px] font-bold">
          The Contenders
        </span>
        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tight leading-none">
          {team?.name}
        </h1>

        <div className="flex flex-wrap gap-6 mt-4">
          {captain && (
            <div className="flex flex-col gap-1">
              <span className="text-black/40 text-[9px] uppercase tracking-[4px] font-bold">
                Captain
              </span>
              <div className="flex items-center gap-2">
                <span className="bg-black text-white text-[9px] font-black px-1.5 py-0.5">
                  C
                </span>
                <span className="text-lg font-black uppercase tracking-wide">
                  {captain.playerName}
                </span>
              </div>
            </div>
          )}
          {vc && (
            <div className="flex flex-col gap-1">
              <span className="text-black/40 text-[9px] uppercase tracking-[4px] font-bold">
                Vice Captain
              </span>
              <div className="flex items-center gap-2">
                <span className="border border-black/40 text-black/60 text-[9px] font-black px-1.5 py-0.5">
                  VC
                </span>
                <span className="text-lg font-black uppercase tracking-wide">
                  {vc.playerName}
                </span>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1 ml-auto">
            <span className="text-black/40 text-[9px] uppercase tracking-[4px] font-bold">
              Squad Size
            </span>
            <span className="text-lg font-black uppercase">
              {team?.squadSize} Players
            </span>
          </div>
        </div>
      </section>

      {/* Team Stats Section */}
      <section className="w-full bg-black/50 border-y border-white/10 px-6 md:px-12 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-white text-[10px] uppercase tracking-[4px] font-bold mb-6 pb-3 border-b border-white/10">
            Team Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Matches Played */}
            <div className="flex flex-col gap-2">
              <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                Matches
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-white">
                  {team?.totalMatches || 0}
                </span>
              </div>
            </div>

            {/* Matches Won */}
            <div className="flex flex-col gap-2">
              <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                Wins
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-emerald-400">
                  {team?.matchesWon || 0}
                </span>
              </div>
            </div>

            {/* Win Rate */}
            <div className="flex flex-col gap-2">
              <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                Win Rate
              </span>
              <span className="text-3xl md:text-4xl font-black text-sky-400">
                {team?.winRate || "0.0%"}
              </span>
            </div>

            {/* Years Active */}
            <div className="flex flex-col gap-2">
              <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                Years Active
              </span>
              <span className="text-3xl md:text-4xl font-black text-violet-400">
                {team?.yearsActive || 0}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Most Loyal Player */}
      {team?.mostLoyalPlayer?.playerId && (
        <section className="w-full max-w-6xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[4px] text-white/30 pb-3 border-b border-white/10">
            Most Loyal Player
          </h2>
          <div className="bg-gradient-to-r from-white/5 to-white/2 border border-white/10 rounded-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2">
                Since {team.mostLoyalPlayer.sinceYear}
              </p>
              <h3 className="text-2xl md:text-3xl font-black uppercase text-white">
                {team.mostLoyalPlayer.playerName}
              </h3>
              <p className="text-white/60 text-sm mt-2">
                {team.mostLoyalPlayer.seasons}{" "}
                {team.mostLoyalPlayer.seasons === 1 ? "season" : "seasons"}
              </p>
            </div>
            <div className="text-right">
              <span className="text-5xl font-black text-emerald-400">
                {team.mostLoyalPlayer.seasons}
              </span>
              <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">
                Seasons
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Roster */}
      <section className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[4px] text-white/30 mb-2 pb-3 border-b border-white/10">
          Full Squad
        </h2>

        {!team?.squad || team.squad.length === 0 ? (
          <p className="text-white/20 text-xs uppercase tracking-widest text-center py-12">
            Squad not yet assigned — check back after the draft.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.squad.map((p) => (
              <button
                key={p.playerId}
                onClick={() => setSelectedPlayer(p)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-4 transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3
                      className={`font-bold uppercase tracking-wide ${
                        p.isCaptain
                          ? "text-white text-lg"
                          : "text-white/80 text-base"
                      }`}
                    >
                      {p.playerName}
                    </h3>
                    <p
                      className={`text-[10px] uppercase tracking-widest ${roleColor(p.role)}`}
                    >
                      {roleLabel(p.role)}
                    </p>
                  </div>
                  {p.isCaptain ? (
                    <span className="bg-white text-black text-[9px] font-black px-2 py-1">
                      C
                    </span>
                  ) : p.isViceCaptain ? (
                    <span className="border border-white/40 text-white/60 text-[9px] font-black px-2 py-1">
                      VC
                    </span>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-xs">Batting</span>
                    <span className="font-mono text-white/80 text-sm font-bold">
                      {p.battingRating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-xs">Bowling</span>
                    <span className="font-mono text-white/80 text-sm font-bold">
                      {p.bowlingRating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-xs">Fielding</span>
                    <span className="font-mono text-white/80 text-sm font-bold">
                      {p.fieldingRating}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-[10px] uppercase text-white/40 tracking-widest">
                    ➜ View Details
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TeamDetailPage;
