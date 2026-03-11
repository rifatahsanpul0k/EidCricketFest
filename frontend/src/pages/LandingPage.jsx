import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_ENDPOINTS } from "../config/constants";
import { useAuth } from "../hooks/useAuth";

const LandingPage = () => {
  const navigate = useNavigate();
  const { auth, logout, isAdmin } = useAuth();
  const [teams, setTeams] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [tournamentStats, setTournamentStats] = useState(null);
  const [draftStatus, setDraftStatus] = useState("Registration Open");

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/teams")
      .then((res) => setTeams(res.data))
      .catch(() => {});

    axios
      .get("http://localhost:8080/api/matches")
      .then((res) => {
        const liveAndUpcoming = res.data
          .filter((m) => m.status === "LIVE" || m.status === "SCHEDULED")
          .slice(0, 3);

        Promise.all(
          liveAndUpcoming.map((match) =>
            axios
              .get(`http://localhost:8080/api/matches/${match.id}/live-score`)
              .then((scoreRes) => ({ ...match, ...scoreRes.data }))
              .catch(() => match),
          ),
        )
          .then((enrichedMatches) => setLiveMatches(enrichedMatches))
          .catch(() => setLiveMatches(liveAndUpcoming));
      })
      .catch(() => {});

    axios
      .get(API_ENDPOINTS.TOURNAMENT_STATS(1))
      .then((res) => setTournamentStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="w-full relative bg-neutral-950 min-h-screen font-space overflow-x-hidden pt-20">
      <Navbar />

      {/* Hero Section */}
      <div className="relative px-6 md:px-12 py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-black uppercase italic tracking-tighter text-white mb-4">
            EID<span className="text-cyan-500">CRICKET</span>FEST
          </h1>
          <p className="text-cyan-400 font-black uppercase tracking-widest text-sm mb-8">
            Tournament 2026 • All-Star Cricket Championship
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/live-score")}
              className="px-8 py-3 bg-cyan-500 text-black font-black uppercase tracking-widest text-sm hover:bg-white transition-all"
            >
              Watch Live
            </button>
            <button
              onClick={() => navigate("/fixtures")}
              className="px-8 py-3 border border-white/20 text-white font-black uppercase tracking-widest text-sm hover:border-cyan-500 transition-all"
            >
              View Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Live Matches Section */}
      {liveMatches.length > 0 && (
        <div className="relative px-6 md:px-12 py-20 border-b border-white/5">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-black uppercase italic tracking-tight text-white mb-12">
              Live & Upcoming
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {liveMatches.map((match) => (
                <div
                  key={match.id}
                  className="border border-white/10 bg-neutral-900 rounded-lg p-6 hover:border-cyan-500 transition-all cursor-pointer"
                  onClick={() => navigate(`/live-score`)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                      {match.matchLabel || `Match ${match.matchNumber}`}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                        match.status === "LIVE"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-white/5 text-white/70"
                      }`}
                    >
                      {match.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-bold">
                      {match.team1 || "TBD"}
                    </p>
                    <p className="text-white/40 text-[10px] text-center">VS</p>
                    <p className="text-white font-bold">
                      {match.team2 || "TBD"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Teams Section */}
      <div className="relative px-6 md:px-12 py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-black uppercase italic tracking-tight text-white mb-12">
            Tournament Teams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teams.slice(0, 8).map((team) => (
              <button
                key={team.id}
                onClick={() => navigate(`/teams`)}
                className="p-6 border border-white/10 bg-neutral-900 rounded-lg hover:border-cyan-500 hover:bg-neutral-800 transition-all text-left"
              >
                <p className="text-white font-black uppercase tracking-wide">
                  {team.name}
                </p>
                <p className="text-[10px] text-white/50 mt-2">View Team</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tournament Stats Section */}
      {tournamentStats && (
        <div className="relative px-6 md:px-12 py-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-black uppercase italic tracking-tight text-white mb-12">
              Tournament Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="border border-white/10 bg-neutral-900 rounded-lg p-6">
                <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-2">
                  Total Teams
                </p>
                <p className="text-4xl font-black text-cyan-500">
                  {teams.length}
                </p>
              </div>
              <div className="border border-white/10 bg-neutral-900 rounded-lg p-6">
                <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-2">
                  Matches Scheduled
                </p>
                <p className="text-4xl font-black text-cyan-500">
                  {tournamentStats?.totalMatches || 0}
                </p>
              </div>
              <div className="border border-white/10 bg-neutral-900 rounded-lg p-6">
                <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-2">
                  Live Now
                </p>
                <p className="text-4xl font-black text-cyan-500">
                  {liveMatches.filter((m) => m.status === "LIVE").length}
                </p>
              </div>
              <div className="border border-white/10 bg-neutral-900 rounded-lg p-6">
                <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-2">
                  Players in Pool
                </p>
                <p className="text-4xl font-black text-cyan-500">
                  {tournamentStats?.totalPlayers || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
