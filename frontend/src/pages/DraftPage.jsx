import axios from "axios";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

const API = "http://localhost:8080/api";

const DraftPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafting, setDrafting] = useState(false);

  const fetchSquads = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/tournaments/1/squads`);
      setSquads(res.data.teams || []);
    } catch (err) {
      console.error("Failed to fetch squads", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSquads();
  }, [fetchSquads]);

  const runDraft = async () => {
    setDrafting(true);
    try {
      await axios.post(`${API}/tournaments/1/draft`);
      fetchSquads();
    } catch (e) {
      alert("Draft failed: " + (e.response?.data?.message || e.message));
    } finally {
      setDrafting(false);
    }
  };

  // Redirect non-admins to home
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-950 font-space text-white pt-24 pb-20 px-6 sm:px-12">
        <Navbar />
        <div className="max-w-7xl mx-auto text-center py-32">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-3xl font-black uppercase italic tracking-tight text-white mb-4">
            Admin Access Only
          </h1>
          <p className="text-cyan-500 font-black uppercase tracking-widest mb-8">
            The Draft feature is restricted to administrators
          </p>
          <button
            onClick={() => navigate("/fixtures")}
            className="px-8 py-3 bg-cyan-500 text-black font-black uppercase tracking-widest text-sm hover:bg-white transition-all"
          >
            View Fixtures
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 font-space text-white pt-24 pb-20 px-6 sm:px-12">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="text-4xl sm:text-7xl font-black uppercase tracking-tighter italic text-white mb-4">
              The Draft
            </h1>
            <p className="text-cyan-500 font-black uppercase tracking-widest text-xs">
              Automated Squad Allocation
            </p>
          </div>
          <button
            onClick={runDraft}
            disabled={drafting}
            className="px-8 py-4 bg-cyan-500 text-black font-black uppercase tracking-widest text-sm hover:bg-white transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {drafting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Drafting...
              </>
            ) : (
              <>⚡ Execute Draft</>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-cyan-500" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {squads.map((team) => (
              <div
                key={team.id}
                className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden"
              >
                <div className="p-8 bg-neutral-800/50 border-b border-white/5">
                  <h3 className="text-2xl font-black uppercase italic tracking-tight">
                    {team.name}
                  </h3>
                </div>
                <div className="p-4 space-y-1">
                  {team.players?.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-white/20 w-4">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-black uppercase text-white truncate max-w-[140px]">
                            {p.name}
                          </p>
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                            {p.primaryRole}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-cyan-500 italic">
                          {(p.battingRating || 0) + (p.bowlingRating || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!team.players || team.players.length === 0) && (
                    <div className="py-10 text-center text-[10px] font-black uppercase text-white/10 italic">
                      Empty Squad
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftPage;
