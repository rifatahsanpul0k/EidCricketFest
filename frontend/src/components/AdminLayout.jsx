import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, logout } = useAuth();
  const [matches, setMatches] = useState([]);
  const [showConsolePicker, setShowConsolePicker] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/matches")
      .then((r) => setMatches(r.data))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const handleConsoleClick = () => {
    if (matches.length === 0) return;
    if (matches.length === 1) {
      navigate(`/admin/match/${matches[0].id}/console`);
    } else {
      setShowConsolePicker((v) => !v);
    }
  };

  const isActive = (path) => location.pathname === path;
  const isConsolePath = location.pathname.includes("/console");
  const hasLive = matches.some((m) => m.status === "LIVE");

  return (
    <div className="w-full bg-neutral-900 min-h-screen font-space text-white flex flex-col">
      {/* ── Admin Navbar ─────────────────────────────────────────────── */}
      <nav className="w-full border-b border-white/10 flex items-stretch justify-between sticky top-0 bg-neutral-900/95 backdrop-blur-sm z-50 h-16">
        {/* Brand */}
        <div className="flex items-center gap-3 px-8 border-r border-white/10 shrink-0">
          <span className="text-white text-sm font-black uppercase tracking-wide-lg">
            ECF
          </span>
          <span className="text-primary text-[10px] font-black uppercase tracking-widest bg-primary/10 px-2 py-1 rounded">
            Admin
          </span>
        </div>

        {/* Nav Links */}
        <div className="flex items-stretch flex-1 overflow-x-auto">
          {/* DRAFT */}
          <button
            onClick={() => navigate("/admin/draft")}
            className={`px-8 h-full text-[11px] font-black uppercase tracking-widest border-r border-white/10 hover:bg-white/5 transition-all relative
                            ${isActive("/admin/draft") ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary" : "text-white/40"}`}
          >
            Draft
          </button>

          {/* FIXTURES */}
          <button
            onClick={() => navigate("/admin/fixtures")}
            className={`px-8 h-full text-[11px] font-black uppercase tracking-widest border-r border-white/10 hover:bg-white/5 transition-all relative
                            ${isActive("/admin/fixtures") ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary" : "text-white/40"}`}
          >
            Fixtures
          </button>

          {/* TEAMS */}
          <button
            onClick={() => navigate("/admin/teams")}
            className={`px-8 h-full text-[11px] font-black uppercase tracking-widest border-r border-white/10 hover:bg-white/5 transition-all relative
                            ${isActive("/admin/teams") ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary" : "text-white/40"}`}
          >
            Teams
          </button>

          {/* PLAYERS */}
          <button
            onClick={() => navigate("/admin/players")}
            className={`px-8 h-full text-[11px] font-black uppercase tracking-widest border-r border-white/10 hover:bg-white/5 transition-all relative
                            ${isActive("/admin/players") ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary" : "text-white/40"}`}
          >
            Players
          </button>

          {/* SETTINGS */}
          <button
            onClick={() => navigate("/admin/settings")}
            className={`px-8 h-full text-[11px] font-black uppercase tracking-widest border-r border-white/10 hover:bg-white/5 transition-all relative
                            ${isActive("/admin/settings") ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary" : "text-white/40"}`}
          >
            Settings
          </button>

          {/* CONSOLE */}
          <div className="relative">
            <button
              onClick={handleConsoleClick}
              className={`flex items-center gap-2 px-8 h-16 text-[11px] font-black uppercase tracking-widest border-r border-white/10 hover:bg-white/5 transition-all relative
                                ${isConsolePath ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary" : "text-white/40"}`}
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${hasLive ? "bg-primary animate-pulse shadow-[0_0_8px_rgba(229,26,26,0.6)]" : "bg-white/10"}`}
              />
              Console
              {matches.length > 1 && (
                <span className="text-[10px] text-white/40 ml-1">
                  {showConsolePicker ? "▲" : "▼"}
                </span>
              )}
            </button>

            {/* Match picker dropdown */}
            {showConsolePicker && matches.length > 1 && (
              <div className="absolute top-full left-0 bg-neutral-800 border border-white/10 border-t-0 min-w-[280px] shadow-2xl z-50">
                {matches.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      navigate(`/admin/match/${m.id}/console`);
                      setShowConsolePicker(false);
                    }}
                    className={`w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-all
                                            ${location.pathname.includes(`/match/${m.id}/`) ? "text-white bg-white/5" : "text-white/40"}`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-wide-sm">
                        {m.team1}{" "}
                        <span className="text-primary font-bold">VS</span>{" "}
                        {m.team2}
                      </span>
                      <span className="text-[9px] text-white/20 uppercase tracking-ultra">
                        Match #{m.id}
                      </span>
                    </div>
                    {m.status === "LIVE" && (
                      <span className="text-[9px] font-black text-primary border border-primary/30 px-2 py-0.5 animate-pulse rounded">
                        LIVE
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-6 px-8 border-l border-white/10 shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-white text-[10px] font-black uppercase tracking-widest">
              {auth?.username}
            </span>
            <span className="text-white/50 text-[9px] uppercase tracking-widest">
              {auth?.role?.replace("_", " ")}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="border border-white/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white/50 hover:border-white hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Dismiss picker backdrop */}
      {showConsolePicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowConsolePicker(false)}
        />
      )}

      {/* Page Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default AdminLayout;
