import axios from "axios";
import {
    AlertCircle,
    ChevronRight,
    Crown,
    Loader2,
    Shield,
    Star,
    X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

const API = "http://localhost:8080/api";
const TOURNAMENT_ID = 1;

const ROLE_STYLE = {
  BATSMAN: { label: "BAT", bg: "bg-sky-500/20", text: "text-sky-300" },
  BOWLER: { label: "BOWL", bg: "bg-emerald-500/20", text: "text-emerald-300" },
  ALLROUNDER: { label: "ALL", bg: "bg-violet-500/20", text: "text-violet-300" },
  WICKETKEEPER: { label: "WK", bg: "bg-amber-500/20", text: "text-amber-300" },
};

// ── Team Detail Modal ──────────────────────────────────────────────────────────
const TeamDetailModal = ({ team, onClose }) => {
  const overlayRef = useRef(null);
  const players = team?.players ?? [];
  const xi = players.slice(0, 11);
  const bench = players.slice(11);

  const PlayerRow = ({ player, index }) => {
    const rs = ROLE_STYLE[player.role] ?? ROLE_STYLE.ALLROUNDER;
    const total =
      player.battingRating + player.bowlingRating + player.fieldingRating;
    return (
      <div className="flex items-center gap-4 px-5 py-3 border-b border-white/5 last:border-0 group hover:bg-white/[0.03] transition-all">
        <span className="w-6 text-[10px] font-black text-white/20 text-right shrink-0">
          {index + 1}
        </span>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold uppercase tracking-wide text-white truncate">
              {player.name}
            </span>
            {player.isCaptain && (
              <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest bg-primary/20 text-primary border border-primary/30 px-2 py-0.5">
                <Crown size={8} /> C
              </span>
            )}
            {player.isViceCaptain && (
              <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest bg-white/10 text-white/60 border border-white/10 px-2 py-0.5">
                <Shield size={8} /> VC
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span
              className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm ${rs.bg} ${rs.text}`}
            >
              {rs.label}
            </span>
            <span className="text-[9px] text-white/30 font-black">
              BAT <span className="text-white/60">{player.battingRating}</span>
            </span>
            <span className="text-[9px] text-white/30 font-black">
              BOWL <span className="text-white/60">{player.bowlingRating}</span>
            </span>
            <span className="text-[9px] text-white/30 font-black">
              FLD <span className="text-white/60">{player.fieldingRating}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Star size={10} className="text-primary/60" />
          <span className="text-[11px] font-black text-white/70">{total}</span>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="relative h-full w-full max-w-md bg-neutral-900 border-l border-white/10 flex flex-col shadow-2xl overflow-hidden animate-[slideIn_0.2s_ease-out]"
        style={{ animation: "slideIn 0.2s ease-out" }}
      >
        <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity:0 } to { transform: translateX(0); opacity:1 } }`}</style>

        {/* Header */}
        <div className="px-6 py-6 border-b border-white/10 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">
                TID-{team.id}
              </div>
              <h2 className="text-2xl font-black uppercase tracking-wide text-white leading-tight">
                {team.name}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mt-2">
                {players.length} player{players.length !== 1 ? "s" : ""} in
                squad
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-1 w-9 h-9 flex items-center justify-center rounded border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {players.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-center gap-4">
              <div className="text-4xl">🌫️</div>
              <div className="text-white/30 text-[11px] font-black uppercase tracking-widest">
                No players drafted yet
              </div>
            </div>
          ) : (
            <>
              {/* Playing XI */}
              <div>
                <div className="px-5 py-3 bg-neutral-800/60 border-b border-white/5 sticky top-0 z-10 flex items-center gap-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">
                    Playing XI
                  </span>
                  <span className="text-[9px] text-white/30 font-black">
                    {Math.min(xi.length, 11)} players
                  </span>
                </div>
                {xi.map((p, i) => (
                  <PlayerRow key={p.id} player={p} index={i} />
                ))}
              </div>

              {/* Bench */}
              {bench.length > 0 && (
                <div>
                  <div className="px-5 py-3 bg-neutral-800/60 border-b border-white/5 sticky top-0 z-10 flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                      Bench
                    </span>
                    <span className="text-[9px] text-white/30 font-black">
                      {bench.length} players
                    </span>
                  </div>
                  {bench.map((p, i) => (
                    <PlayerRow key={p.id} player={p} index={xi.length + i} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const TeamsPage = () => {
  const { isAdmin } = useAuth();
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [squadLoading, setSquadLoading] = useState(false);

  const flash = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const fetchTeams = useCallback(async () => {
    try {
      const r = await axios.get(`${API}/teams`);
      setTeams(r.data);
    } catch {
      flash("err", "Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const addTeam = async () => {
    const name = newTeamName.trim();
    if (!name) return flash("err", "Enter a team name first");
    setAdding(true);
    try {
      const r = await axios.post(`${API}/tournaments/${TOURNAMENT_ID}/teams`, {
        teamName: name,
      });
      setTeams((prev) => [...prev, { id: r.data.id, name: r.data.name }]);
      setNewTeamName("");
      flash("ok", `✓ Team "${r.data.name}" added`);
    } catch (e) {
      flash("err", e.response?.data?.error || "Could not add team");
    } finally {
      setAdding(false);
    }
  };

  const deleteTeam = async (id, name) => {
    if (
      !window.confirm(
        `Delete team "${name}"?\nThis may affect draft assignments and fixtures.`,
      )
    )
      return;
    try {
      await axios.delete(`${API}/teams/${id}`);
      setTeams((prev) => prev.filter((t) => t.id !== id));
      flash("ok", `✓ "${name}" removed`);
    } catch (e) {
      const msg = e.response?.data?.error || "Could not delete team.";
      flash("err", msg);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") addTeam();
  };

  const handleTeamClick = async (id) => {
    setSquadLoading(true);
    setSelectedTeam({ id, players: [] });
    try {
      const r = await axios.get(`${API}/teams/${id}/squad`);
      setSelectedTeam(r.data);
    } catch {
      flash("err", "Could not load team details.");
      setSelectedTeam(null);
    } finally {
      setSquadLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 font-space text-white pt-24 pb-20 px-6 sm:px-12">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-16">
          <h1 className="text-4xl sm:text-7xl font-black uppercase tracking-tighter italic text-white mb-4">
            Teams
          </h1>
          <p className="text-cyan-500 font-black uppercase tracking-widest text-xs">
            {teams.length} team{teams.length !== 1 ? "s" : ""} registered in
            tournament
          </p>
        </div>

        {/* Toast */}
        {msg && (
          <div
            className={`mb-8 px-6 py-4 text-[11px] font-black uppercase tracking-widest border transition-all duration-300 ${
              msg.type === "ok"
                ? "border-green-500/30 text-green-400 bg-green-500/5"
                : "border-cyan-500/30 text-cyan-400 bg-cyan-500/5"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Admin Only: Add Team Section */}
        {isAdmin && (
          <div className="mb-12 pb-12 border-b border-white/10">
            <h2 className="text-xl font-black uppercase tracking-wider mb-6">
              Create New Team
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Team Name (e.g. Phoenix Blasters)"
                className="flex-1 bg-neutral-900 border border-white/10 px-4 py-3 text-white font-black uppercase text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-500"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                onKeyDown={handleKey}
              />
              <button
                onClick={addTeam}
                disabled={adding}
                className="px-8 py-3 bg-cyan-500 text-black font-black uppercase tracking-widest text-sm hover:bg-white transition-all disabled:opacity-50"
              >
                {adding ? "Registering..." : "Add Team"}
              </button>
            </div>
          </div>
        )}

        {/* Teams Grid */}
        {loading ? (
          <div className="py-20 text-center text-white/20 uppercase tracking-widest font-black animate-pulse">
            Fetching teams...
          </div>
        ) : teams.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-4xl mb-4">🌫️</div>
            <div className="text-white/30 uppercase tracking-widest font-black">
              No teams found
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((t) => (
              <div
                key={t.id}
                onClick={() => handleTeamClick(t.id)}
                className="p-6 border border-white/10 bg-neutral-900 rounded-lg group hover:border-cyan-500 hover:bg-neutral-800 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block italic">
                      TID-{t.id}
                    </span>
                    <h3 className="text-lg font-black uppercase tracking-wide">
                      {t.name}
                    </h3>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!t.hasFixtures) deleteTeam(t.id, t.name);
                      }}
                      disabled={t.hasFixtures}
                      className={`ml-4 w-8 h-8 flex items-center justify-center rounded transition-all text-sm font-black ${
                        t.hasFixtures
                          ? "bg-black/20 text-white/10 cursor-not-allowed"
                          : "bg-black/40 hover:bg-red-900/40 text-white/20 hover:text-red-400"
                      }`}
                      title={
                        t.hasFixtures
                          ? "Delete all fixtures involving this team first"
                          : "Delete Team"
                      }
                    >
                      ✕
                    </button>
                  )}
                </div>
                {t.hasFixtures && (
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-amber-400/70">
                    <AlertCircle size={12} />
                    Has fixtures
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-white/50 font-black">
                    View Squad
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-white/30 group-hover:text-cyan-500 transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Detail Drawer */}
      {selectedTeam &&
        (squadLoading ? (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm">
            <div className="h-full w-full max-w-md bg-neutral-900 border-l border-white/10 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-cyan-500" />
            </div>
          </div>
        ) : (
          <TeamDetailModal
            team={selectedTeam}
            onClose={() => setSelectedTeam(null)}
          />
        ))}
    </div>
  );
};

export default TeamsPage;
