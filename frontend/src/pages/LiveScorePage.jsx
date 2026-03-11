import axios from "axios";
import { BarChart3, Loader2, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const API = "http://localhost:8080/api";

const LiveScorePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [allMatches, setAllMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("scorecard");

  // Fetch all matches
  const fetchAllMatches = async () => {
    try {
      const res = await axios.get(`${API}/matches`);
      setAllMatches(res.data || []);
    } catch (err) {
      console.error("Error fetching matches:", err);
    }
  };

  // Fetch individual match details
  const fetchMatchDetails = async (matchId) => {
    try {
      const matchRes = await axios.get(`${API}/matches/${matchId}/live-score`);
      const scorecardRes = await axios
        .get(`${API}/matches/${matchId}/scorecard`)
        .catch(() => null);

      setSelectedMatch(matchRes.data);
      if (scorecardRes) {
        setScorecard(scorecardRes.data);
      }
    } catch (err) {
      console.error("Error fetching match details:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAllMatches();
    setLoading(false);

    const interval = setInterval(() => {
      fetchAllMatches();
      if (id) {
        fetchMatchDetails(id);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchMatchDetails(id);
    }
  }, [id]);

  // If viewing a specific match
  if (id && selectedMatch) {
    return (
      <div className="min-h-screen bg-neutral-950 font-space text-white pt-24 pb-20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          {/* Back Button */}
          <button
            onClick={() => navigate("/live-score")}
            className="mb-8 inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-black uppercase tracking-widest text-[10px] transition-colors"
          >
            ← Back to Live Matches
          </button>

          {/* Match Header */}
          <div className="mb-12 border-b border-white/10 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl sm:text-6xl font-black uppercase italic tracking-tight text-white">
                {selectedMatch.team1} vs {selectedMatch.team2}
              </h1>
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded ${
                  selectedMatch.status === "LIVE"
                    ? "bg-red-500/20 text-red-400 animate-pulse"
                    : "bg-white/5 text-white/70"
                }`}
              >
                {selectedMatch.status}
              </span>
            </div>
            <p className="text-cyan-500 font-black uppercase tracking-widest text-xs">
              Match {selectedMatch.matchNumber || 1} • Round{" "}
              {selectedMatch.round || 1}
            </p>
          </div>

          {/* Live Score Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Team 1 Score */}
            <div className="border border-white/10 bg-neutral-900 rounded-lg p-8">
              <h2 className="text-2xl font-black uppercase italic mb-6">
                {selectedMatch.team1}
              </h2>
              <div className="space-y-4">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-black text-cyan-400">
                    {selectedMatch.team1Runs || 0}
                  </span>
                  <span className="text-white/50 font-black">
                    /{selectedMatch.team1Wickets || 0}
                  </span>
                </div>
                <div className="text-[10px] text-white/50 font-black uppercase tracking-widest">
                  {selectedMatch.team1Overs || "0.0"} Overs
                </div>
              </div>
            </div>

            {/* Team 2 Score */}
            <div className="border border-white/10 bg-neutral-900 rounded-lg p-8">
              <h2 className="text-2xl font-black uppercase italic mb-6">
                {selectedMatch.team2}
              </h2>
              <div className="space-y-4">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-black text-cyan-400">
                    {selectedMatch.team2Runs || 0}
                  </span>
                  <span className="text-white/50 font-black">
                    /{selectedMatch.team2Wickets || 0}
                  </span>
                </div>
                <div className="text-[10px] text-white/50 font-black uppercase tracking-widest">
                  {selectedMatch.team2Overs || "0.0"} Overs
                </div>
              </div>
            </div>
          </div>

          {/* Match Result / Status */}
          {selectedMatch.result && (
            <div className="mb-12 border border-cyan-500/30 bg-cyan-500/5 rounded-lg p-6">
              <p className="text-cyan-400 font-black uppercase tracking-widest text-[10px] mb-2">
                Match Result
              </p>
              <p className="text-white font-black uppercase tracking-wide">
                {selectedMatch.result}
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-white/10 mb-8 flex gap-4">
            <button
              onClick={() => setActiveTab("scorecard")}
              className={`pb-4 px-2 font-black uppercase tracking-widest text-[10px] border-b-2 transition-colors ${
                activeTab === "scorecard"
                  ? "border-cyan-500 text-cyan-400"
                  : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              <BarChart3 className="inline mr-2" size={14} />
              Scorecard
            </button>
            <button
              onClick={() => setActiveTab("commentary")}
              className={`pb-4 px-2 font-black uppercase tracking-widest text-[10px] border-b-2 transition-colors ${
                activeTab === "commentary"
                  ? "border-cyan-500 text-cyan-400"
                  : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              <MessageCircle className="inline mr-2" size={14} />
              Commentary
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "scorecard" && scorecard && (
            <div className="space-y-8">
              <div className="text-white/50 font-black text-[10px] uppercase tracking-widest">
                Scorecard details loading...
              </div>
            </div>
          )}

          {activeTab === "commentary" && (
            <div className="text-white/50 font-black text-[10px] uppercase tracking-widest">
              Commentary updates coming soon...
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show all live matches
  return (
    <div className="min-h-screen bg-neutral-950 font-space text-white pt-24 pb-20 px-6 sm:px-12">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-16">
          <h1 className="text-4xl sm:text-7xl font-black uppercase tracking-tighter italic text-white mb-4">
            Live Matches
          </h1>
          <p className="text-cyan-500 font-black uppercase tracking-widest text-xs">
            {allMatches.filter((m) => m.status === "LIVE").length} live •{" "}
            {allMatches.filter((m) => m.status === "SCHEDULED").length}{" "}
            scheduled
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="animate-spin text-cyan-500" size={48} />
          </div>
        ) : allMatches.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-6xl mb-6">📭</div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white mb-2">
              No Matches Yet
            </h2>
            <p className="text-white/50 font-black uppercase tracking-widest text-[10px]">
              Check back soon for tournament matches
            </p>
          </div>
        ) : (
          <>
            {/* Live Matches Section */}
            {allMatches.filter((m) => m.status === "LIVE").length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-black uppercase italic tracking-tight text-white mb-8">
                  🔴 Live Now
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allMatches
                    .filter((m) => m.status === "LIVE")
                    .map((match) => (
                      <button
                        key={match.id}
                        onClick={() => navigate(`/live-score/${match.id}`)}
                        className="p-6 border-2 border-red-500/50 bg-red-500/5 rounded-lg text-left hover:border-cyan-500 hover:bg-neutral-900 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-red-400 animate-pulse">
                            ● LIVE
                          </span>
                          <span className="text-[10px] font-black text-white/50">
                            Match {match.matchNumber || 1}
                          </span>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-black uppercase">
                              {match.team1}
                            </span>
                            <span className="text-cyan-400 font-black">
                              {match.team1Runs || 0}/{match.team1Wickets || 0}
                            </span>
                          </div>
                          <div className="text-center text-white/30 font-black text-[10px]">
                            VS
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white font-black uppercase">
                              {match.team2}
                            </span>
                            <span className="text-cyan-400 font-black">
                              {match.team2Runs || 0}/{match.team2Wickets || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-end text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="font-black text-[10px] uppercase">
                            View Score →
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Scheduled Matches Section */}
            {allMatches.filter((m) => m.status === "SCHEDULED").length > 0 && (
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight text-white mb-8">
                  ⏱ Upcoming
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allMatches
                    .filter((m) => m.status === "SCHEDULED")
                    .map((match) => (
                      <button
                        key={match.id}
                        onClick={() => navigate(`/live-score/${match.id}`)}
                        className="p-6 border border-white/10 bg-neutral-900 rounded-lg text-left hover:border-cyan-500 hover:bg-neutral-800 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                            SCHEDULED
                          </span>
                          <span className="text-[10px] font-black text-white/50">
                            Match {match.matchNumber || 1}
                          </span>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-black uppercase">
                              {match.team1 || "TBD"}
                            </span>
                            <span className="text-white/30 font-black text-[10px]">
                              -
                            </span>
                          </div>
                          <div className="text-center text-white/30 font-black text-[10px]">
                            VS
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white font-black uppercase">
                              {match.team2 || "TBD"}
                            </span>
                            <span className="text-white/30 font-black text-[10px]">
                              -
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-end text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="font-black text-[10px] uppercase">
                            View Details →
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Completed Matches Section */}
            {allMatches.filter((m) => m.status === "COMPLETED").length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-black uppercase italic tracking-tight text-white mb-8">
                  ✓ Completed
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allMatches
                    .filter((m) => m.status === "COMPLETED")
                    .map((match) => (
                      <button
                        key={match.id}
                        onClick={() => navigate(`/live-score/${match.id}`)}
                        className="p-6 border border-white/5 bg-neutral-900/50 rounded-lg text-left hover:border-white/10 hover:bg-neutral-900 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                            COMPLETED
                          </span>
                          <span className="text-[10px] font-black text-white/50">
                            Match {match.matchNumber || 1}
                          </span>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-white/70 font-black uppercase">
                              {match.team1}
                            </span>
                            <span className="text-white/50 font-black">
                              {match.team1Runs || 0}
                            </span>
                          </div>
                          <div className="text-center text-white/20 font-black text-[10px]">
                            VS
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/70 font-black uppercase">
                              {match.team2}
                            </span>
                            <span className="text-white/50 font-black">
                              {match.team2Runs || 0}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LiveScorePage;
