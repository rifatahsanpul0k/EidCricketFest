import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ADMIN_ACTIONS,
  ADMIN_ACTION_BUTTONS,
  ADMIN_DASHBOARD,
  ADMIN_EMPTY_STATES,
  ADMIN_ERROR_MESSAGES,
  ADMIN_STATS,
  API_ENDPOINTS,
  BRANDING,
  MATCH_STATUS,
  MATCH_STATUS_DISPLAY,
} from "../config/constants";
import {
  THEME,
  cn,
  getButtonClass,
  getCardClass,
  getGridClass,
  getStatusStyle,
} from "../config/theme";
import { useAuth } from "../hooks/useAuth";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [stats, setStats] = useState({
    teams: 0,
    players: 0,
    matches: 0,
    liveMatches: 0,
  });
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [teamsRes, playersRes, matchesRes] = await Promise.all([
        axios.get(API_ENDPOINTS.TEAMS),
        axios.get(API_ENDPOINTS.PLAYERS),
        axios.get(API_ENDPOINTS.MATCHES),
      ]);

      console.log("Teams Response:", teamsRes.data);
      console.log("Players Response:", playersRes.data);
      console.log("Matches Response:", matchesRes.data);

      // Handle teams (array)
      const teamsData = Array.isArray(teamsRes.data) ? teamsRes.data : [];

      // Handle players (paginated response with 'content' field)
      let playersCount = 0;
      if (playersRes.data?.totalElements !== undefined) {
        // Use totalElements from paginated response for accurate count
        playersCount = playersRes.data.totalElements;
      } else if (playersRes.data?.content) {
        playersCount = playersRes.data.content.length;
      } else if (Array.isArray(playersRes.data)) {
        playersCount = playersRes.data.length;
      }

      // Handle matches (array)
      const matchesData = Array.isArray(matchesRes.data) ? matchesRes.data : [];

      const liveCount = matchesData.filter(
        (m) => m.status === MATCH_STATUS.LIVE,
      ).length;

      setStats({
        teams: teamsData.length,
        players: playersCount,
        matches: matchesData.length,
        liveMatches: liveCount,
      });

      setMatches(matchesData);
      console.log("Dashboard stats updated:", {
        teams: teamsData.length,
        players: playersCount,
        matches: matchesData.length,
        liveMatches: liveCount,
      });
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err.message);
      console.error("Error details:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load dashboard data. Please check your backend connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn("w-full bg-neutral-950 min-h-screen font-space text-white")}
    >
      {/* ── Fixed Header with Navigation ────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-neutral-950/95 backdrop-blur-md">
        <div
          className={cn(
            "flex justify-between items-center px-6 md:px-12 py-4",
            THEME.layout.maxWidth,
            "mx-auto w-full",
          )}
        >
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center group-hover:rotate-12 transition-transform">
              <span className="text-black font-black text-xl">E</span>
            </div>
            <div>
              <div
                className={cn("text-white font-black uppercase tracking-[2px]")}
              >
                {BRANDING.FULL}
              </div>
              <div
                className={cn(
                  THEME.colors.accent.light,
                  "text-[8px] font-black uppercase tracking-[1.5px]",
                )}
              >
                {ADMIN_DASHBOARD.MODE_LABEL}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className={cn(
              "px-4 py-2 bg-white/10 border",
              THEME.colors.border.normal,
              "text-white text-[10px] font-black uppercase tracking-[2px] rounded hover:bg-white/20 transition-all",
            )}
          >
            {ADMIN_DASHBOARD.LOGOUT_BTN}
          </button>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <div className={cn(THEME.layout.headerHeight, "px-6 md:px-12 py-20")}>
        <div className={THEME.layout.maxWidth + " mx-auto"}>
          {/* Error Banner */}
          {error && (
            <div
              className={cn(
                "mb-8 border rounded-lg p-4",
                getStatusStyle("warning").bg,
                "border-red-500/40",
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p
                    className={cn(
                      getStatusStyle("warning").text,
                      "text-sm font-bold mb-1",
                    )}
                  >
                    {ADMIN_ERROR_MESSAGES.CONNECTION_ERROR}
                  </p>
                  <p className="text-red-200/70 text-[12px]">{error}</p>
                </div>
                <button
                  onClick={fetchDashboardData}
                  className={getButtonClass("danger")}
                >
                  {ADMIN_ACTION_BUTTONS.RETRY}
                </button>
              </div>
            </div>
          )}

          {/* Page Title */}
          <div
            className={cn(
              "mb-16 pb-8 flex justify-between items-end",
              THEME.colors.border.light,
              "border-b",
            )}
          >
            <div>
              <h1 className={cn(THEME.typography.hero, "text-white mb-2")}>
                {ADMIN_DASHBOARD.PAGE_TITLE.split(" ")[0]}
                <span className={cn("text-" + THEME.colors.accent.primary)}>
                  {ADMIN_DASHBOARD.PAGE_TITLE.split(" ")[1]}
                </span>
              </h1>
              <p
                className={cn(
                  "text-" + THEME.colors.accent.light,
                  THEME.typography.label,
                )}
              >
                {ADMIN_DASHBOARD.PAGE_SUBTITLE}
              </p>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className={cn(getButtonClass("ghost"), "disabled:opacity-50")}
            >
              {loading
                ? ADMIN_DASHBOARD.LOADING_TEXT
                : ADMIN_DASHBOARD.REFRESH_BTN}
            </button>
          </div>

          {/* ── Stats Cards ───────────────────────────────────────── */}
          <div className={cn(getGridClass("stats"), "mb-16")}>
            {[
              { label: ADMIN_STATS.TEAMS, value: stats.teams },
              { label: ADMIN_STATS.PLAYERS, value: stats.players },
              { label: ADMIN_STATS.MATCHES, value: stats.matches },
              {
                label: ADMIN_STATS.LIVE_NOW,
                value: stats.liveMatches,
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={cn(
                  "border rounded-lg p-6 transition-all",
                  loading
                    ? cn(
                        THEME.colors.border.light,
                        "bg-neutral-900/50 opacity-60",
                      )
                    : cn(
                        THEME.colors.border.normal,
                        "bg-neutral-900 hover:border-cyan-500",
                      ),
                )}
              >
                <div className="text-4xl font-black mb-2">
                  {loading ? "..." : stat.value}
                </div>
                <div
                  className={cn(THEME.typography.labelSmall, "text-white/50")}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* ── Admin Actions Grid ────────────────────────────────── */}
          <div className="mb-16">
            <h2
              className={cn(THEME.typography.sectionHeader, "text-white mb-8")}
            >
              {ADMIN_DASHBOARD.SECTION_MANAGEMENT}
            </h2>
            <div className={getGridClass("cards")}>
              {ADMIN_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(action.route)}
                  className={cn(getCardClass(), "text-left group")}
                >
                  <h3
                    className={cn(THEME.typography.cardTitle, "mb-2 text-sm")}
                  >
                    {action.label}
                  </h3>
                  <p
                    className={cn(
                      THEME.typography.labelSmall,
                      "text-white/50 leading-relaxed",
                    )}
                  >
                    {action.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* ── Match Management Section ──────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className={cn(THEME.typography.sectionHeader, "text-white")}>
                {ADMIN_DASHBOARD.SECTION_FIXTURES}
              </h2>
              {stats.liveMatches > 0 && (
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded",
                    getStatusStyle("live").bg,
                    "border",
                    getStatusStyle("live").border,
                  )}
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span
                    className={cn(
                      getStatusStyle("live").text,
                      THEME.typography.labelSmall,
                    )}
                  >
                    {stats.liveMatches}{" "}
                    {MATCH_STATUS_DISPLAY[MATCH_STATUS.LIVE].label}
                  </span>
                </div>
              )}
            </div>

            {loading ? (
              <div
                className={cn(
                  "border p-8 rounded-lg text-center",
                  THEME.colors.border.normal,
                  "text-white/40",
                )}
              >
                <div className="mb-2">
                  {ADMIN_ERROR_MESSAGES.LOADING_MATCHES}
                </div>
                <div className="text-[10px]">
                  {ADMIN_ERROR_MESSAGES.FETCHING_DATA}
                </div>
              </div>
            ) : error ? (
              <div
                className={cn(
                  "border p-8 rounded-lg text-center",
                  THEME.colors.border.normal,
                  "text-white/40",
                )}
              >
                <div className="mb-2">
                  {ADMIN_ERROR_MESSAGES.UNABLE_TO_LOAD_MATCHES}
                </div>
                <div className="text-[10px]">
                  {error}. {ADMIN_ERROR_MESSAGES.RETRY_INSTRUCTION}
                </div>
              </div>
            ) : matches.length === 0 ? (
              <div
                className={cn(
                  "p-8 rounded-lg text-center",
                  THEME.colors.border.normal,
                  "bg-neutral-900 text-white/40",
                  "border",
                )}
              >
                <div className="mb-2 text-lg">
                  {ADMIN_EMPTY_STATES.NO_MATCHES}
                </div>
                <div className="text-[10px] mb-4">
                  {ADMIN_EMPTY_STATES.NO_MATCHES_SUBTITLE}
                </div>
                <button
                  onClick={() => navigate("/admin/fixtures")}
                  className={getButtonClass("ghost")}
                >
                  {ADMIN_EMPTY_STATES.CREATE_FIXTURES_BTN}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    onClick={() => navigate("/admin/score")}
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer transition-all",
                      match.status === MATCH_STATUS.LIVE
                        ? cn(
                            "border-red-500/40 bg-red-500/5 hover:border-red-500/60",
                          )
                        : match.status === MATCH_STATUS.COMPLETED
                          ? cn(
                              THEME.colors.border.light,
                              "bg-neutral-900/50 opacity-60 hover:opacity-70",
                            )
                          : cn(
                              THEME.colors.border.normal,
                              "bg-neutral-900 hover:border-cyan-500",
                            ),
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div
                          className={cn(
                            THEME.typography.labelSmall,
                            "text-white/50 mb-2",
                          )}
                        >
                          {match.status === MATCH_STATUS.LIVE
                            ? MATCH_STATUS_DISPLAY[MATCH_STATUS.LIVE].label
                            : "Match #" + match.id}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black uppercase text-sm md:text-base text-white">
                            {match.team1}
                          </span>
                          <span className="text-white/30 text-xs">vs</span>
                          <span className="font-black uppercase text-sm md:text-base text-white">
                            {match.team2}
                          </span>
                        </div>
                        <div className="text-white/40 text-[9px] mt-1">
                          {new Date(match.date).toLocaleString()}
                        </div>
                      </div>

                      <div className="text-right">
                        {match.status === MATCH_STATUS.LIVE && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/admin/score");
                            }}
                            className={getButtonClass("primary")}
                          >
                            {ADMIN_ACTION_BUTTONS.UPDATE_SCORE}
                          </button>
                        )}
                        {match.status === MATCH_STATUS.SCHEDULED && (
                          <span
                            className={cn(
                              THEME.colors.border.normal,
                              "border text-white/50 text-[9px] px-3 py-1 font-black uppercase tracking-[1px] rounded",
                            )}
                          >
                            {MATCH_STATUS_DISPLAY[MATCH_STATUS.SCHEDULED].label}
                          </span>
                        )}
                        {match.status === MATCH_STATUS.COMPLETED && (
                          <span
                            className={cn(
                              THEME.colors.border.light,
                              "border text-white/40 text-[9px] px-3 py-1 font-black uppercase tracking-[1px] rounded",
                            )}
                          >
                            {MATCH_STATUS_DISPLAY[MATCH_STATUS.COMPLETED].label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
