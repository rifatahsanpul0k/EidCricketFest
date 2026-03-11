import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const MatchDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const liveRes = await axios.get(
          `https://eidcricketfest-1.onrender.com/api/matches/${id}/live-score`,
        );
        setDetails(liveRes.data);
      } catch {
        setError("Could not load match details.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading)
    return (
      <div className="bg-black min-h-screen font-space flex items-center justify-center text-white/40 uppercase tracking-widest text-sm">
        ⚙️ Loading Match...
      </div>
    );

  if (error || !details)
    return (
      <div className="bg-black min-h-screen font-space flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-6">🏏</div>
        <div className="text-2xl font-black uppercase tracking-[2px] text-white mb-3">
          No Match Found
        </div>
        <div className="text-white/60 text-sm mb-8">
          {error || "This match doesn't exist or has been removed"}
        </div>
        <button
          onClick={() => navigate("/schedule")}
          className="ecf-btn-primary"
        >
          Back to Schedule
        </button>
      </div>
    );

  return (
    <div className="w-full bg-black min-h-screen font-space text-white flex flex-col">
      {/* Navbar */}
      <nav className="w-full px-4 md:px-8 py-4 border-b border-white/10 flex justify-between items-center sticky top-0 bg-black/95 backdrop-blur z-50">
        <button
          onClick={() => navigate("/schedule")}
          className="w-10 h-10 flex justify-center items-center hover:bg-white/10 transition-colors"
        >
          <span className="text-2xl text-white hover:text-white/70">←</span>
        </button>
        <div className="flex-1 text-center">
          <div className="text-white text-[13px] font-black uppercase tracking-[4px]">
            🏏 EID CRICKET FEST
          </div>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="relative w-10 h-10 flex justify-center items-center hover:bg-white/10 transition-colors"
        >
          <span className="text-2xl text-white">⋮</span>
          {menuOpen && (
            <div className="absolute right-0 top-12 bg-black border border-white/10 shadow-2xl z-50 min-w-max">
              <button
                onClick={() => {
                  navigate("/schedule");
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-6 py-3 text-[12px] font-black text-white uppercase tracking-widest border-b border-white/10 hover:bg-white/5 transition-colors"
              >
                📋 Back to Schedule
              </button>
            </div>
          )}
        </button>
      </nav>

      {/* Header - Match Info */}
      <section className="w-full border-b border-white/10 px-4 md:px-8 py-8 flex flex-col items-center gap-6">
        <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
          <div className="text-left flex-1">
            <span className="text-white/40 text-[9px] font-black uppercase tracking-[4px] block mb-2">
              Match #{details.id}
            </span>
            <div className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white">
              {details.team1Name}
            </div>
          </div>
          <div className="text-center flex-shrink-0 px-6">
            <span className="block text-white/40 text-[12px] font-bold uppercase tracking-widest mb-2">
              vs
            </span>
            {details.status === "LIVE" && (
              <span className="block bg-primary text-white text-[10px] px-3 py-1 font-bold uppercase tracking-wider animate-pulse">
                ● LIVE
              </span>
            )}
            {details.status === "SCHEDULED" && (
              <span className="block border border-white/20 text-white/50 text-[10px] px-3 py-1 font-bold uppercase tracking-wider">
                UPCOMING
              </span>
            )}
            {details.status === "COMPLETED" && (
              <span className="block border border-green-500/50 text-green-400 text-[10px] px-3 py-1 font-bold uppercase tracking-wider">
                DONE
              </span>
            )}
          </div>
          <div className="text-right flex-1">
            <div className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white drop-shadow-lg">
              {details.team2Name}
            </div>
            <span className="text-blue-400 text-[10px] font-black uppercase tracking-[4px] block mt-2">
              {details.venue || "TBD"}
            </span>
          </div>
        </div>

        {/* Match Details Row */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg px-4 py-3 text-center">
            <div className="text-[10px] font-bold text-blue-300 uppercase tracking-[2px]">
              Format
            </div>
            <div className="text-[13px] font-black text-white mt-1">
              {details.format || "T20"}
            </div>
          </div>
          <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg px-4 py-3 text-center">
            <div className="text-[10px] font-bold text-blue-300 uppercase tracking-[2px]">
              Tournament
            </div>
            <div className="text-[13px] font-black text-white mt-1">
              {details.tournament || "ECF 2024"}
            </div>
          </div>
          <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg px-4 py-3 text-center">
            <div className="text-[10px] font-bold text-blue-300 uppercase tracking-[2px]">
              Status
            </div>
            <div className="text-[13px] font-black text-white mt-1">
              {details.status || "LIVE"}
            </div>
          </div>
          <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg px-4 py-3 text-center">
            <div className="text-[10px] font-bold text-blue-300 uppercase tracking-[2px]">
              Venue
            </div>
            <div className="text-[13px] font-black text-white mt-1">
              {details.venue || "TBD"}
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="w-full border-b border-white/10 px-4 md:px-8 sticky top-20 bg-black/95 backdrop-blur">
        <div className="max-w-6xl mx-auto flex gap-6 overflow-x-auto">
          {["Scorecard", "Commentary", "Statistics", "Squads"].map((tab) => (
            <button
              key={tab}
              className="py-4 text-[12px] font-black uppercase tracking-[3px] text-white border-b-3 border-blue-600 hover:text-blue-300 transition-colors"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <section className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Live Scorecard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Main Score Display */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Team 1 Scorecard */}
            <div className="border-3 border-blue-600 bg-gradient-to-br from-blue-950/50 to-black rounded-xl p-6 drop-shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-600/50">
                <h3 className="text-2xl font-black uppercase tracking-[3px] text-white">
                  {details.team1Name}
                </h3>
                <span className="text-[11px] font-bold text-blue-300 uppercase tracking-[2px] bg-blue-900/50 px-3 py-1 rounded">
                  BATTING
                </span>
              </div>
              <div className="mb-6">
                <div className="text-5xl font-black text-yellow-400 drop-shadow-lg mb-2">
                  {details.currentRuns || 0}/{details.currentWickets || 0}
                </div>
                <div className="text-[12px] text-white/60 uppercase tracking-widest">
                  <span className="block">
                    Overs: {details.overs || "0.0"} | Balls:{" "}
                    {parseInt(details.overs?.split(".")[0] || 0) * 6 +
                      parseInt(details.overs?.split(".")[1] || 0) || 0}
                  </span>
                  <span className="block mt-1">
                    Required Run Rate: {details.requiredRunRate || "0.00"} |
                    Current: {details.currentRunRate || "0.00"}
                  </span>
                </div>
              </div>
              <div className="bg-black/50 rounded-lg p-4 border border-blue-600/30">
                <div className="grid grid-cols-2 gap-4 text-[11px] font-bold text-white">
                  <div className="text-center">
                    <span className="block text-blue-300">BATSMEN</span>
                    <span className="text-lg font-black mt-1">-- (--b)</span>
                    <span className="text-white/50 block text-[9px] mt-1">
                      -- | --
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="block text-blue-300">PARTNERSHIP</span>
                    <span className="text-lg font-black mt-1">
                      {details.currentRuns || 0} ({details.overs || "0.0"})
                    </span>
                    <span className="text-white/50 block text-[9px] mt-1">
                      {details.currentRunRate || "0.00"} RR
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team 2 Scorecard */}
            <div className="border-3 border-orange-600 bg-gradient-to-br from-orange-950/50 to-black rounded-xl p-6 drop-shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-orange-600/50">
                <h3 className="text-2xl font-black uppercase tracking-[3px] text-white">
                  {details.team2Name}
                </h3>
                <span className="text-[11px] font-bold text-orange-300 uppercase tracking-[2px] bg-orange-900/50 px-3 py-1 rounded">
                  BOWLING
                </span>
              </div>
              <div className="mb-6">
                <div className="text-[13px] text-white/60 uppercase tracking-widest">
                  <span className="block font-black text-xl text-orange-400 mb-2">
                    Target: {details.target || 145}
                  </span>
                  <span className="block">Powerplay: 6 overs</span>
                  <span className="block">
                    Death Overs: {details.maxOvers - 4}-{details.maxOvers || 20}
                  </span>
                </div>
              </div>
              <div className="bg-black/50 rounded-lg p-4 border border-orange-600/30 space-y-3">
                <div className="text-[11px] font-bold text-white">
                  <div className="flex justify-between items-center bg-orange-900/20 px-3 py-2 rounded">
                    <span className="text-orange-300">
                      Runs Needed: {details.runsNeeded || 100}
                    </span>
                    <span className="text-orange-100">
                      {details.oversRemaining || 13} overs
                    </span>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-white">
                  <div className="flex justify-between items-center bg-orange-900/20 px-3 py-2 rounded">
                    <span className="text-orange-300">Required RR</span>
                    <span className="text-orange-100">
                      {details.requiredRunRate || "8.40"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Key Stats & Info */}
          <div className="flex flex-col gap-6">
            {/* Match Summary Card */}
            <div className="border-2 border-green-600 bg-gradient-to-br from-green-950/50 to-black rounded-xl p-5 drop-shadow-lg">
              <h4 className="text-[13px] font-black uppercase tracking-[3px] text-green-300 mb-4 pb-3 border-b border-green-600/50">
                📊 Match Summary
              </h4>
              <div className="space-y-3 text-[11px] font-bold text-white">
                <div className="flex justify-between">
                  <span className="text-white/60">Toss:</span>
                  <span className="text-green-300">
                    {details.tossWinner || "TBD"} Won
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Decision:</span>
                  <span className="text-green-300">
                    {details.tossDecision === "BAT"
                      ? "Elected to Bat"
                      : "Elected to Bowl"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-green-600/30 pt-3">
                  <span className="text-white/60">
                    Runs ({details.inning}):
                  </span>
                  <span className="text-yellow-400">
                    {details.currentRuns || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Wickets:</span>
                  <span className="text-yellow-400">
                    {details.currentWickets || 0} Down
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Events Card */}
            <div className="border-2 border-purple-600 bg-gradient-to-br from-purple-950/50 to-black rounded-xl p-5 drop-shadow-lg">
              <h4 className="text-[13px] font-black uppercase tracking-[3px] text-purple-300 mb-4 pb-3 border-b border-purple-600/50">
                🎯 Key Events
              </h4>
              <div className="space-y-2 text-[10px] font-bold text-white">
                <div className="bg-purple-900/20 px-3 py-2 rounded border-l-2 border-purple-500">
                  <span className="text-purple-300">Over 6.3:</span> Six by
                  Batter A
                </div>
                <div className="bg-purple-900/20 px-3 py-2 rounded border-l-2 border-purple-500">
                  <span className="text-purple-300">Over 5.2:</span> Wicket Down
                  (2)
                </div>
                <div className="bg-purple-900/20 px-3 py-2 rounded border-l-2 border-purple-500">
                  <span className="text-purple-300">Over 3.0:</span> Fifty for
                  Team A
                </div>
              </div>
            </div>

            {/* Player of the Match (if completed) */}
            {details.status === "COMPLETED" && (
              <div className="border-2 border-yellow-600 bg-gradient-to-br from-yellow-950/50 to-black rounded-xl p-5 drop-shadow-lg">
                <h4 className="text-[13px] font-black uppercase tracking-[3px] text-yellow-300 mb-4 pb-3 border-b border-yellow-600/50">
                  🏆 Player of Match
                </h4>
                <div className="text-center">
                  <div className="text-[13px] font-black text-yellow-300 mb-2">
                    Player X
                  </div>
                  <div className="text-[11px] text-white/60 bg-black/50 px-3 py-2 rounded">
                    42 runs off 28 balls
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MatchDetailPage;
