import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SchedulePage = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/matches");
        setMatches(res.data);
      } catch {
        console.error("Error fetching matches");
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="w-full relative bg-black min-h-screen font-space overflow-x-hidden">
      {/* Top Navigation */}
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

      <section className="w-full max-w-6xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-8">
        {/* Page Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="text-white/40 text-[10px] font-black uppercase tracking-ultra mb-3">
            Tournament
          </div>
          <h1 className="text-white text-5xl md:text-6xl font-black uppercase tracking-wide-md mb-4">
            Schedule
          </h1>
          <p className="text-white/60 text-sm font-light leading-relaxed tracking-wide-sm max-w-md">
            All matches, fixtures, and tournament schedule
          </p>
        </div>

        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-white/10 pb-8">
          <div className="ecf-card text-center">
            <div className="ecf-label mb-2">Total</div>
            <div className="text-white font-black text-2xl">
              {matches.length}
            </div>
          </div>
          <div className="ecf-card text-center border-primary/30">
            <div className="ecf-label mb-2">Live</div>
            <div className="text-primary font-black text-2xl">
              {matches.filter((m) => m.status === "LIVE").length}
            </div>
          </div>
          <div className="ecf-card text-center">
            <div className="ecf-label mb-2">Upcoming</div>
            <div className="text-white font-black text-2xl">
              {matches.filter((m) => m.status === "SCHEDULED").length}
            </div>
          </div>
          <div className="ecf-card text-center">
            <div className="ecf-label mb-2">Completed</div>
            <div className="text-white font-black text-2xl">
              {matches.filter((m) => m.status === "COMPLETED").length}
            </div>
          </div>
        </div>

        {/* Matches List */}
        <div className="flex flex-col gap-6">
          <h2 className="ecf-label flex items-center gap-3">
            <span>All Matches</span>
            <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
          </h2>

          {matches.length === 0 ? (
            <div className="ecf-card min-h-[300px] flex flex-col items-center justify-center">
              <div className="text-6xl mb-4">🏏</div>
              <div className="text-white text-2xl font-black uppercase tracking-wide-md mb-2">
                No Matches Scheduled
              </div>
              <p className="text-white/60 text-sm text-center">
                Check back soon for upcoming tournament fixtures
              </p>
            </div>
          ) : (
            matches.map((match) => (
              <div
                key={match.id}
                className={`ecf-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group cursor-pointer ${
                  match.status === "LIVE"
                    ? "ecf-match-live"
                    : "ecf-match-scheduled"
                }`}
                onClick={() =>
                  navigate(
                    match.status === "LIVE"
                      ? `/match/${match.id}/live`
                      : `/match/${match.id}/details`,
                  )
                }
              >
                <div className="flex-1 flex flex-col gap-3 w-full">
                  {/* Match Header */}
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <span
                      className={`ecf-label ${
                        match.status === "LIVE"
                          ? "text-primary animate-pulse"
                          : match.status === "COMPLETED"
                            ? "text-white/40"
                            : "text-white/60"
                      }`}
                    >
                      {match.status === "LIVE"
                        ? "● LIVE"
                        : match.status === "SCHEDULED"
                          ? "UPCOMING"
                          : "COMPLETED"}
                    </span>
                    <span className="ecf-label">•</span>
                    <span className="ecf-label">Match #{match.id}</span>
                    <span className="ecf-label">•</span>
                    <span className="ecf-label">{match.stage || "LEAGUE"}</span>
                  </div>

                  {/* Teams */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                      {match.team1}
                    </h2>
                    <span className="text-white/30 font-light text-lg">VS</span>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                      {match.team2}
                    </h2>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  {match.status === "LIVE" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/match/${match.id}/live`);
                      }}
                      className="ecf-btn-primary flex-1 md:flex-none"
                    >
                      ● Watch Live
                    </button>
                  )}
                  {match.status === "SCHEDULED" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/match/${match.id}/details`);
                      }}
                      className="ecf-btn-outline flex-1 md:flex-none"
                    >
                      View Details
                    </button>
                  )}
                  {match.status === "COMPLETED" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/match/${match.id}/details`);
                      }}
                      className="ecf-btn-outline flex-1 md:flex-none"
                    >
                      Match Summary
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default SchedulePage;
