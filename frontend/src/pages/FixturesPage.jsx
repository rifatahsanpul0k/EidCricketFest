import axios from "axios";
import { Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

const API = "http://localhost:8080/api";
const STAGE_ORDER = { LEAGUE: 0, SEMIFINAL: 1, FINAL: 2 };

const MatchCard = ({
  fixture,
  onStart,
  onComplete,
  onDelete,
  onConsole,
  isAdmin,
}) => (
  <div className="border border-white/5 bg-neutral-800 rounded flex flex-col group hover:border-white/20 transition-all">
    <div className="px-5 py-3 flex items-center justify-between border-b border-white/5 bg-neutral-900">
      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
        {fixture.matchLabel || `Match ${fixture.matchNumber}`}
      </span>
      <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wide text-cyan-400">
        <span
          className={`w-2 h-2 rounded-full ${fixture.status === "LIVE" ? "animate-pulse bg-cyan-500" : "bg-white/40"}`}
        />
        {fixture.status}
      </span>
    </div>
    <div className="px-5 py-5 flex flex-col gap-3">
      {["team1", "team2"].map((t, i) => (
        <div key={t} className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full flex-shrink-0 bg-cyan-500" />
          <span
            className={`text-sm font-bold uppercase tracking-wide ${fixture[t] === "TBD" ? "text-white/30 italic" : "text-white"}`}
          >
            {fixture[t]}
          </span>
          {i === 0 && (
            <span className="ml-auto text-xs font-black text-white/30">VS</span>
          )}
        </div>
      ))}
    </div>
    {isAdmin && (
      <div className="px-4 py-3 border-t border-white/5 flex gap-2 bg-black/20 text-[9px] font-black">
        {fixture.status === "SCHEDULED" && (
          <>
            <button
              onClick={() => onStart(fixture.id)}
              className="flex-1 bg-cyan-500 text-black py-2"
            >
              START
            </button>
            <button
              onClick={() => onDelete(fixture.id)}
              className="border border-red-500/50 text-red-400 px-3 py-2"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
        {fixture.status === "LIVE" && (
          <>
            <button
              onClick={() => onConsole(fixture.id)}
              className="flex-1 bg-cyan-500 text-black py-2"
            >
              CONSOLE
            </button>
            <button
              onClick={() => onComplete(fixture.id)}
              className="flex-1 border border-green-500/50 text-green-400 py-2"
            >
              DONE
            </button>
          </>
        )}
      </div>
    )}
  </div>
);

const BracketCard = ({
  fixture,
  teams,
  onStart,
  onComplete,
  onAssignTeams,
  onConsole,
  isAdmin,
}) => {
  const teamsReady = fixture.team1 !== "TBD" && fixture.team2 !== "TBD";
  const [assigning, setAssigning] = useState(false);
  const [t1, setT1] = useState(fixture.team1Id || "");
  const [t2, setT2] = useState(fixture.team2Id || "");
  return (
    <div className="border border-white/10 bg-neutral-800 rounded flex flex-col w-72 mx-auto">
      <div className="px-6 py-4 border-b border-white/10 text-[11px] font-black uppercase text-white bg-neutral-900 text-center">
        {fixture.matchLabel}
      </div>
      {["team1", "team2"].map((t, i) => (
        <div
          key={t}
          className={`px-6 py-4 flex items-center gap-4 ${i === 0 ? "border-b border-white/5" : ""}`}
        >
          <span className="w-3 h-3 rounded-full bg-cyan-500" />
          <span
            className={`font-black uppercase tracking-wide ${fixture[t] === "TBD" ? "text-white/30 italic" : "text-white text-lg"}`}
          >
            {fixture[t]}
          </span>
        </div>
      ))}
      {assigning && isAdmin && (
        <div className="p-4 bg-neutral-900 border-t border-white/10 flex flex-col gap-2">
          <select
            value={t1}
            onChange={(e) => setT1(e.target.value)}
            className="ecf-input text-[10px]"
          >
            <option value="">Team 1</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={t2}
            onChange={(e) => setT2(e.target.value)}
            className="ecf-input text-[10px]"
          >
            <option value="">Team 2</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onAssignTeams(fixture.id, Number(t1), Number(t2));
                setAssigning(false);
              }}
              className="flex-1 bg-cyan-500 text-black py-2 font-black text-[10px]"
            >
              SET
            </button>
            <button
              onClick={() => setAssigning(false)}
              className="px-3 text-white/40"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
      <div className="px-4 py-3 flex items-center gap-2 border-t border-white/5 bg-black/10">
        {isAdmin && (
          <>
            {fixture.status === "SCHEDULED" && !teamsReady && !assigning && (
              <button
                onClick={() => setAssigning(true)}
                className="flex-1 border border-cyan-500/50 text-cyan-400 py-2 text-[10px] font-black uppercase"
              >
                Assign
              </button>
            )}
            {fixture.status === "SCHEDULED" && teamsReady && (
              <button
                onClick={() => onStart(fixture.id)}
                className="flex-1 bg-cyan-500 text-black py-2 text-[10px] font-black uppercase"
              >
                Start
              </button>
            )}
            {fixture.status === "LIVE" && (
              <button
                onClick={() => onConsole(fixture.id)}
                className="flex-1 bg-cyan-500 text-black py-2 text-[10px] font-black uppercase"
              >
                Console
              </button>
            )}
          </>
        )}
        {fixture.status === "COMPLETED" && (
          <span className="text-[10px] text-green-400 font-black uppercase w-full text-center">
            Completed
          </span>
        )}
      </div>
    </div>
  );
};

const FixturesPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [fixtures, setFixtures] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    matchLabel: "",
    matchNumber: "",
    stage: "LEAGUE",
    round: "1",
    team1Id: "",
    team2Id: "",
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [fRes, tRes] = await Promise.all([
        axios.get(`${API}/matches`),
        axios.get(`${API}/teams`),
      ]);
      setFixtures(
        fRes.data.sort(
          (a, b) =>
            (STAGE_ORDER[a.stage] ?? 0) - (STAGE_ORDER[b.stage] ?? 0) ||
            (a.round || 0) - (b.round || 0) ||
            (a.matchNumber || 0) - (b.matchNumber || 0),
        ),
      );
      setTeams(tRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateFixture = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      const payload = {
        matchLabel: formData.matchLabel || `Match ${formData.matchNumber}`,
        matchNumber: Number(formData.matchNumber),
        stage: formData.stage,
        round: Number(formData.round),
        status: "SCHEDULED",
        ...(formData.team1Id && { team1Id: Number(formData.team1Id) }),
        ...(formData.team2Id && { team2Id: Number(formData.team2Id) }),
      };

      console.log("Creating fixture:", payload);

      await axios.post(`${API}/matches`, payload);

      setFormData({
        matchLabel: "",
        matchNumber: "",
        stage: "LEAGUE",
        round: "1",
        team1Id: "",
        team2Id: "",
      });
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error("Error creating fixture:", err);
      setFormError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create fixture",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/matches/${id}/status`, { status });
      fetchData();
    } catch {}
  };

  const lFixtures = fixtures.filter((f) => f.stage === "LEAGUE" || !f.stage);
  const sFixtures = fixtures.filter((f) => f.stage === "SEMIFINAL");
  const fFixture = fixtures.find((f) => f.stage === "FINAL");

  const rounds = {};
  lFixtures.forEach((f) => {
    const r = f.round || 1;
    if (!rounds[r]) rounds[r] = [];
    rounds[r].push(f);
  });
  const sortedR = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="w-full bg-neutral-950 min-h-screen text-white pt-24 px-6 md:px-12 pb-20 font-space">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tight mb-2">
              Fixtures<span className="text-cyan-500">Management</span>
            </h1>
            <p className="text-cyan-400 font-black uppercase tracking-widest text-[10px]">
              Create & Manage Tournament Matches
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className={`px-4 py-2 font-black uppercase text-[10px] tracking-[2px] rounded transition-all ${
                showForm
                  ? "bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30"
                  : "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30"
              }`}
            >
              {showForm ? "CANCEL" : "+ CREATE FIXTURE"}
            </button>
          )}
        </div>

        {/* Create Fixture Form */}
        {isAdmin && showForm && (
          <div className="border border-cyan-500/40 bg-cyan-500/5 rounded-lg p-6 mb-12">
            <h2 className="text-xl font-black uppercase tracking-tight text-cyan-400 mb-6">
              Create New Fixture
            </h2>
            {formError && (
              <div className="mb-4 p-3 border border-red-500/40 bg-red-500/10 rounded text-red-300 text-[12px]">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreateFixture} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[2px] text-white/60 block mb-2">
                    Match Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Match A1, QF001"
                    value={formData.matchLabel}
                    onChange={(e) =>
                      setFormData({ ...formData, matchLabel: e.target.value })
                    }
                    className="w-full bg-neutral-900 border border-white/20 rounded p-2 text-white text-[12px] focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[2px] text-white/60 block mb-2">
                    Match Number
                  </label>
                  <input
                    type="number"
                    placeholder="1"
                    value={formData.matchNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, matchNumber: e.target.value })
                    }
                    className="w-full bg-neutral-900 border border-white/20 rounded p-2 text-white text-[12px] focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[2px] text-white/60 block mb-2">
                    Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) =>
                      setFormData({ ...formData, stage: e.target.value })
                    }
                    className="w-full bg-neutral-900 border border-white/20 rounded p-2 text-white text-[12px] focus:outline-none focus:border-cyan-500"
                  >
                    <option value="LEAGUE">League</option>
                    <option value="SEMIFINAL">Semi-Final</option>
                    <option value="FINAL">Final</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[2px] text-white/60 block mb-2">
                    Round
                  </label>
                  <input
                    type="number"
                    value={formData.round}
                    onChange={(e) =>
                      setFormData({ ...formData, round: e.target.value })
                    }
                    className="w-full bg-neutral-900 border border-white/20 rounded p-2 text-white text-[12px] focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[2px] text-white/60 block mb-2">
                    Team 1 (Optional)
                  </label>
                  <select
                    value={formData.team1Id}
                    onChange={(e) =>
                      setFormData({ ...formData, team1Id: e.target.value })
                    }
                    className="w-full bg-neutral-900 border border-white/20 rounded p-2 text-white text-[12px] focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- TBD --</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[2px] text-white/60 block mb-2">
                    Team 2 (Optional)
                  </label>
                  <select
                    value={formData.team2Id}
                    onChange={(e) =>
                      setFormData({ ...formData, team2Id: e.target.value })
                    }
                    className="w-full bg-neutral-900 border border-white/20 rounded p-2 text-white text-[12px] focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- TBD --</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={formLoading || !formData.matchNumber}
                className="w-full bg-cyan-500 text-black p-3 font-black uppercase tracking-[2px] text-[10px] rounded hover:bg-white transition-all disabled:opacity-50"
              >
                {formLoading ? "CREATING..." : "CREATE FIXTURE"}
              </button>
            </form>
          </div>
        )}

        {/* Fixtures List */}
        {loading ? (
          <div className="py-20 text-center text-white/20 uppercase font-black">
            Loading fixtures...
          </div>
        ) : fixtures.length === 0 ? (
          <div className="border border-white/10 bg-neutral-900 rounded-lg p-12 text-center">
            <p className="text-white/40 text-[12px] uppercase tracking-widest">
              No fixtures created yet. Click "CREATE FIXTURE" to get started.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            {Object.keys(
              fixtures.reduce((acc, f) => {
                const key = `${f.stage || "LEAGUE"}-${f.round || 1}`;
                if (!acc[key]) acc[key] = [];
                acc[key].push(f);
                return acc;
              }, {}),
            )
              .sort()
              .map((key) => {
                const [stage, round] = key.split("-");
                const stageLabel =
                  stage === "SEMIFINAL"
                    ? "Semi-Finals"
                    : stage === "FINAL"
                      ? "Grand Final"
                      : `Round ${round}`;

                return (
                  <div key={key}>
                    <h2 className="text-xl font-black uppercase italic tracking-tight text-cyan-400 mb-6 pb-3 border-b border-white/10">
                      {stageLabel}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {fixtures
                        .filter(
                          (f) =>
                            (f.stage || "LEAGUE") === stage &&
                            (f.round || 1) === Number(round),
                        )
                        .map((f) => (
                          <MatchCard
                            key={f.id}
                            fixture={f}
                            onStart={(id) => handleStatus(id, "LIVE")}
                            onComplete={(id) => handleStatus(id, "COMPLETED")}
                            onDelete={async (id) => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this fixture?",
                                )
                              ) {
                                try {
                                  await axios.delete(`${API}/matches/${id}`);
                                  fetchData();
                                } catch (err) {
                                  console.error("Error deleting fixture:", err);
                                }
                              }
                            }}
                            onConsole={(id) =>
                              navigate(`/admin/match/${id}/console`)
                            }
                            isAdmin={isAdmin}
                          />
                        ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
export default FixturesPage;
