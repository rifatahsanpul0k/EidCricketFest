import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

const ROLE_LABEL = {
  BATSMAN: "BAT",
  BOWLER: "BOWL",
  ALL_ROUNDER: "AR",
  WICKETKEEPER: "WK",
};

// ── small helpers ────────────────────────────────────────────────────────────
const PlayerSelector = ({ label, players, value, onChange, sortKey }) => {
  const sorted = [...players].sort(
    (a, b) => (b[sortKey] || 0) - (a[sortKey] || 0),
  );
  return (
    <div className="flex flex-col gap-1.5">
      <span className="ecf-label">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-black border border-white/20 text-white text-xs font-bold uppercase tracking-wide px-3 py-2.5 focus:outline-none focus:border-white transition-colors appearance-none"
      >
        <option value="">— select —</option>
        {sorted.map((p) => (
          <option key={p.id} value={p.id} className="bg-black">
            {p.name} [{ROLE_LABEL[p.role] || p.role}]
          </option>
        ))}
      </select>
    </div>
  );
};

const RunBtn = ({ runs, onClick }) => (
  <button
    onClick={onClick}
    className="relative border border-white/10 flex items-center justify-center font-black text-3xl md:text-4xl transition-all duration-150 hover:bg-white hover:text-black hover:border-white active:scale-95 select-none aspect-square w-full text-white bg-white/5"
  >
    {runs}
  </button>
);

const ExtraBtn = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="border border-white/10 px-4 py-3 text-[10px] font-black uppercase tracking-[2px] transition-all hover:bg-white hover:text-black hover:border-white active:scale-95 text-white bg-white/5"
  >
    {label}
  </button>
);

// ── Main component ───────────────────────────────────────────────────────────
const LiveScorerConsole = () => {
  const { id } = useParams();
  const matchId = id || 1;

  const [score, setScore] = useState({
    totalRuns: 0,
    totalWickets: 0,
    overs: "0.0",
  });
  const [ctx, setCtx] = useState({
    team1Name: "",
    team2Name: "",
    team1: [],
    team2: [],
  });
  const [personnel, setPersonnel] = useState({
    striker: null,
    nonStriker: null,
    bowler: null,
  });
  const [modal, setModal] = useState("setup"); // 'setup' | 'wicket' | 'newbowler' | null
  const [sel, setSel] = useState({
    striker: "",
    nonStriker: "",
    bowler: "",
    newBatter: "",
    newBowler: "",
  });
  const [lastBall, setLastBall] = useState(null);
  const [ballLog, setBallLog] = useState([]); // current over balls

  // ── fetchers ──────────────────────────────────────────────────────────────
  const fetchScore = useCallback(async () => {
    try {
      const r = await axios.get(
        `http://localhost:8080/api/matches/${matchId}/scoreboard`,
      );
      setScore({
        totalRuns: r.data.totalRuns || 0,
        totalWickets: r.data.totalWickets || 0,
        overs: r.data.overs || "0.0",
      });
      return r.data.overs || "0.0";
    } catch {
      return null;
    }
  }, [matchId]);

  const fetchCtx = useCallback(async () => {
    try {
      const r = await axios.get(
        `http://localhost:8080/api/matches/${matchId}/context`,
      );
      setCtx({
        team1Name: r.data.team1Name || "Team 1",
        team2Name: r.data.team2Name || "Team 2",
        team1: r.data.team1 || [],
        team2: r.data.team2 || [],
      });
    } catch {}
  }, [matchId]);

  useEffect(() => {
    fetchScore();
    fetchCtx();
  }, [fetchScore, fetchCtx]);

  // ── find helpers ──────────────────────────────────────────────────────────
  const findInTeam = (team, pid) => team.find((p) => p.id === Number(pid));

  // ── record delivery ───────────────────────────────────────────────────────
  const record = async (runs, extraType = "NONE", isWicket = false) => {
    if (!personnel.striker || !personnel.nonStriker || !personnel.bowler) {
      alert("Setup personnel first.");
      return;
    }
    const extraTypes = ["WIDE", "NO_BALL", "BYE", "LEG_BYE"];
    const isExtra = extraTypes.includes(extraType);
    try {
      await axios.post(
        `http://localhost:8080/api/matches/${matchId}/deliveries`,
        {
          runsOffBat: runs,
          extras: isExtra ? 1 : 0,
          extraType: extraType,
          isWicket,
          strikerId: personnel.striker.id,
          nonStrikerId: personnel.nonStriker.id,
          bowlerId: personnel.bowler.id,
        },
      );

      // Update ball log (wides/no-balls don't count as a legal delivery)
      const isLegal = extraType !== "WIDE" && extraType !== "NO_BALL";
      const ballLabel = isWicket ? "W" : isExtra ? extraType[0] : String(runs);
      const newLog = isLegal
        ? [...ballLog, ballLabel]
        : [...ballLog, ballLabel + "†"];
      setBallLog(newLog);
      setLastBall(ballLabel);

      const newOvers = await fetchScore();

      let s = { ...personnel };
      // Strike rotation on odd runs
      if ((runs === 1 || runs === 3) && !isWicket) {
        [s.striker, s.nonStriker] = [s.nonStriker, s.striker];
      }
      // End of over
      if (isLegal && newOvers?.endsWith(".0") && newLog.length >= 6) {
        [s.striker, s.nonStriker] = [s.nonStriker, s.striker];
        setBallLog([]);
        setPersonnel(s);
        setModal("newbowler");
        return;
      }
      if (isWicket) {
        setPersonnel(s);
        setModal("wicket");
        return;
      }
      setPersonnel(s);
    } catch (e) {
      alert("Failed to record: " + (e.response?.data || e.message));
    }
  };

  const undo = async () => {
    try {
      await axios.delete(
        `http://localhost:8080/api/matches/${matchId}/deliveries/latest`,
      );
      await fetchScore();
      setBallLog((prev) => prev.slice(0, -1));
    } catch {
      alert("Undo failed");
    }
  };

  // ── modal actions ─────────────────────────────────────────────────────────
  const startInnings = () => {
    const striker = findInTeam(ctx.team1, sel.striker);
    const nonStriker = findInTeam(ctx.team1, sel.nonStriker);
    const bowler = findInTeam(ctx.team2, sel.bowler);
    if (!striker || !nonStriker || !bowler)
      return alert("Select all three players.");
    if (striker.id === nonStriker.id)
      return alert("Striker and Non-Striker must be different.");
    setPersonnel({ striker, nonStriker, bowler });
    setModal(null);
  };

  const confirmNewBatter = () => {
    const batter = findInTeam(ctx.team1, sel.newBatter);
    if (!batter) return alert("Select the incoming batter.");
    setPersonnel((p) => ({ ...p, striker: batter }));
    setModal(null);
  };

  const confirmNewBowler = () => {
    const bowler = findInTeam(ctx.team2, sel.newBowler);
    if (!bowler) return alert("Select the new bowler.");
    if (bowler.id === personnel.bowler?.id)
      return alert("Cannot bowl consecutive overs.");
    setPersonnel((p) => ({ ...p, bowler }));
    setModal(null);
  };

  // ── overs display ─────────────────────────────────────────────────────────
  const overNum = score.overs.split(".")[0];
  const ballNum = score.overs.split(".")[1];

  // ── personnel rows ────────────────────────────────────────────────────────
  const batters = [...ctx.team1].sort(
    (a, b) => (b.battingRating || 0) - (a.battingRating || 0),
  );
  const bowlers = [...ctx.team2].sort(
    (a, b) => (b.bowlingRating || 0) - (a.bowlingRating || 0),
  );

  return (
    <AdminLayout>
      <div className="w-full bg-black min-h-screen font-space text-white flex flex-col select-none">
        {/* ── SCOREBOARD HEADER ───────────────────────────────────────── */}
        <header className="border-b border-white/10 px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-[5px] text-white/30">
              Live Match · ID {matchId}
            </span>
            <h1 className="text-base md:text-xl font-black uppercase tracking-widest">
              {ctx.team1Name}{" "}
              <span className="text-white/20 font-light">vs</span>{" "}
              {ctx.team2Name}
            </h1>
          </div>

          {/* Score */}
          <div className="flex items-end gap-4">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl md:text-7xl font-black leading-none tabular-nums">
                {score.totalRuns}
              </span>
              <span className="text-white/30 text-2xl font-black">/</span>
              <span className="text-2xl md:text-4xl font-black text-white/60 leading-none tabular-nums">
                {score.totalWickets}
              </span>
            </div>
            <div className="flex flex-col items-end pb-1">
              <span className="text-[9px] font-bold uppercase tracking-[4px] text-white/30">
                OVERS
              </span>
              <span className="text-xl font-black tabular-nums">
                {overNum}
                <span className="text-white/40">.{ballNum}</span>
              </span>
            </div>
          </div>

          {/* Ball log */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-white/20 uppercase tracking-[3px] mr-1">
              THIS OVER
            </span>
            {ballLog.length === 0 ? (
              <span className="text-white/10 text-xs">—</span>
            ) : (
              ballLog.map((b, i) => (
                <span
                  key={i}
                  className={`w-7 h-7 flex items-center justify-center text-[10px] font-black border ${b === "W" ? "border-red-500 text-red-400 bg-red-900/20" : b.includes("†") ? "border-yellow-500/40 text-yellow-400" : "border-black/15 text-white"}`}
                >
                  {b}
                </span>
              ))
            )}
          </div>
        </header>

        {/* ── PERSONNEL STRIP ─────────────────────────────────────────── */}
        <div className="border-b border-black/8 px-6 py-4 grid grid-cols-3 gap-4">
          {/* Striker */}
          <div className="flex flex-col gap-1 border-r border-white/5 pr-4">
            <span className="text-[8px] font-black uppercase tracking-[4px] text-white/25">
              ⚡ Striker
            </span>
            <span className="text-sm font-black uppercase truncate">
              {personnel.striker?.name || (
                <span className="text-white/20">—</span>
              )}
            </span>
            {personnel.striker && (
              <span className="text-[8px] text-white/30 uppercase">
                {ROLE_LABEL[personnel.striker.role] || ""}
              </span>
            )}
          </div>
          {/* Non Striker */}
          <div className="flex flex-col gap-1 border-r border-white/5 pr-4">
            <span className="text-[8px] font-black uppercase tracking-[4px] text-white/25">
              Non-Striker
            </span>
            <span className="text-sm font-black uppercase truncate text-white/50">
              {personnel.nonStriker?.name || (
                <span className="text-white/20">—</span>
              )}
            </span>
            {personnel.nonStriker && (
              <span className="text-[8px] text-white/20 uppercase">
                {ROLE_LABEL[personnel.nonStriker.role] || ""}
              </span>
            )}
          </div>
          {/* Bowler */}
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase tracking-[4px] text-white/25">
              🏏 Bowler
            </span>
            <span className="text-sm font-black uppercase truncate text-orange-400">
              {personnel.bowler?.name || (
                <span className="text-white/20">—</span>
              )}
            </span>
            {personnel.bowler && (
              <span className="text-[8px] text-orange-400/40 uppercase">
                {ROLE_LABEL[personnel.bowler.role] || ""}
              </span>
            )}
          </div>
        </div>

        {/* ── CONTROL PAD ─────────────────────────────────────────────── */}
        <div className="flex-1 p-4 md:p-6 max-w-3xl mx-auto w-full flex flex-col gap-4">
          {/* Runs grid */}
          <div className="grid grid-cols-6 gap-2">
            {[0, 1, 2, 3, 4, 6].map((r) => (
              <RunBtn key={r} runs={r} onClick={() => record(r)} />
            ))}
          </div>

          {/* Extras row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              ["WIDE", "WD"],
              ["NO_BALL", "NB"],
              ["BYE", "BYE"],
              ["LEG_BYE", "LB"],
            ].map(([type, label]) => (
              <ExtraBtn
                key={type}
                label={label}
                onClick={() => record(0, type)}
              />
            ))}
          </div>

          {/* Special row */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => record(0, "NONE", true)}
              className="py-5 text-xl font-black uppercase tracking-[4px] bg-white text-black hover:bg-red-600 hover:text-white transition-all duration-200 active:scale-95"
            >
              WICKET
            </button>
            <button
              onClick={undo}
              className="py-5 text-sm font-bold uppercase tracking-[3px] border border-dashed border-black/15 text-white/40 hover:border-white/60 hover:text-white/70 transition-all active:scale-95"
            >
              ← UNDO
            </button>
          </div>

          {/* Change personnel inline buttons */}
          <div className="flex gap-2 pt-2 border-t border-white/5">
            <button
              onClick={() => setModal("setup")}
              className="text-[9px] font-bold uppercase tracking-[3px] text-white/20 hover:text-white transition-colors px-3 py-2 border border-black/8 hover:border-white/40"
            >
              Change Setup
            </button>
            <button
              onClick={() => setModal("wicket")}
              className="text-[9px] font-bold uppercase tracking-[3px] text-white/20 hover:text-white transition-colors px-3 py-2 border border-black/8 hover:border-white/40"
            >
              New Batter
            </button>
            <button
              onClick={() => setModal("newbowler")}
              className="text-[9px] font-bold uppercase tracking-[3px] text-white/20 hover:text-white transition-colors px-3 py-2 border border-black/8 hover:border-white/40"
            >
              New Bowler
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MODALS                                                          */}
      {/* ════════════════════════════════════════════════════════════════ */}

      {/* Setup / Pre-match */}
      {modal === "setup" && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black border border-black/15 w-full max-w-md flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-black/8 flex justify-between items-center">
              <div>
                <h2 className="text-base font-black uppercase tracking-widest">
                  Match Setup
                </h2>
                <p className="text-[9px] text-white/30 uppercase tracking-[3px] mt-0.5">
                  Select striker · non-striker · bowler
                </p>
              </div>
              {personnel.striker && (
                <button
                  onClick={() => setModal(null)}
                  className="text-white/30 hover:text-white text-lg transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="border border-black/5 px-4 py-2 mb-1">
                <span className="text-[8px] font-bold uppercase tracking-[3px] text-white/20">
                  Batting: {ctx.team1Name}
                </span>
              </div>

              <PlayerSelector
                label="⚡ Opening Striker"
                players={batters}
                value={sel.striker}
                onChange={(v) => setSel((s) => ({ ...s, striker: v }))}
                sortKey="battingRating"
              />
              <PlayerSelector
                label="Non-Striker"
                players={batters}
                value={sel.nonStriker}
                onChange={(v) => setSel((s) => ({ ...s, nonStriker: v }))}
                sortKey="battingRating"
              />

              <div className="border border-black/5 px-4 py-2 mt-2">
                <span className="text-[8px] font-bold uppercase tracking-[3px] text-white/20">
                  Bowling: {ctx.team2Name}
                </span>
              </div>

              <PlayerSelector
                label="🏏 Opening Bowler"
                players={bowlers}
                value={sel.bowler}
                onChange={(v) => setSel((s) => ({ ...s, bowler: v }))}
                sortKey="bowlingRating"
              />

              <button
                onClick={startInnings}
                className="w-full bg-black text-white py-4 font-black text-sm uppercase tracking-[4px] hover:bg-white/90 transition-colors mt-2"
              >
                START INNINGS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wicket / New Batter */}
      {modal === "wicket" && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black border border-red-600/50 w-full max-w-sm flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-red-600/20 flex justify-between items-center">
              <div>
                <h2 className="text-base font-black uppercase tracking-widest text-red-400">
                  Wicket!
                </h2>
                <p className="text-[9px] text-white/30 uppercase tracking-[3px] mt-0.5">
                  Select incoming batter
                </p>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <PlayerSelector
                label={`Incoming Batter · ${ctx.team1Name}`}
                players={batters}
                value={sel.newBatter}
                onChange={(v) => setSel((s) => ({ ...s, newBatter: v }))}
                sortKey="battingRating"
              />
              <button
                onClick={confirmNewBatter}
                className="w-full bg-black text-white py-4 font-black text-sm uppercase tracking-[4px] hover:bg-white/90 transition-colors"
              >
                CONFIRM BATTER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End of Over / New Bowler */}
      {modal === "newbowler" && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black border border-black/15 w-full max-w-sm flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-black/8">
              <h2 className="text-base font-black uppercase tracking-widest">
                End of Over
              </h2>
              <p className="text-[9px] text-white/30 uppercase tracking-[3px] mt-0.5">
                Select new bowler · {ctx.team2Name}
              </p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <PlayerSelector
                label="New Bowler"
                players={bowlers}
                value={sel.newBowler}
                onChange={(v) => setSel((s) => ({ ...s, newBowler: v }))}
                sortKey="bowlingRating"
              />
              <button
                onClick={confirmNewBowler}
                className="w-full bg-black text-white py-4 font-black text-sm uppercase tracking-[4px] hover:bg-white/90 transition-colors"
              >
                CONFIRM BOWLER
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default LiveScorerConsole;
