// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// API Endpoints
export const API_ENDPOINTS = {
  TEAMS: `${API_BASE_URL}/teams`,
  PLAYERS: `${API_BASE_URL}/players`,
  MATCHES: `${API_BASE_URL}/matches`,
  MATCH_BY_ID: (id) => `${API_BASE_URL}/matches/${id}`,
  MATCH_LIVE_SCORE: (id) => `${API_BASE_URL}/matches/${id}/live-score`,
  UPDATE_MATCH_STATUS: (id) => `${API_BASE_URL}/matches/${id}/status`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  TOURNAMENT_STATS: (tournamentId) =>
    `${API_BASE_URL}/tournament-stats/${tournamentId}`,
};

// Image Upload Settings
export const MAX_IMAGE_SIZE = 524288; // 500KB in bytes
export const IMAGE_COMPRESSION_QUALITY = 0.7;
export const IMAGE_MAX_DIMENSION = 400; // pixels

// UI Settings
export const TOAST_DURATION = 3000; // milliseconds
export const MODAL_ANIMATION_DURATION = 200; // milliseconds

// Pagination
export const DEFAULT_PAGE = 0;
export const DEFAULT_PAGE_SIZE = 100;

// App Strings
export const APP_TITLE = "Eid Cricket Fest";
export const ADMIN_SECTION = "Admin";

// Landing Page Strings
export const LANDING_PAGE = {
  // Hero Section
  HERO_TAGLINE: "The Ultimate",
  HERO_MAIN: "EID\nCRICKET\nFEST",
  HERO_DESCRIPTION: "A Bi-Annual Non-Commercial Sporting\nLegacy",
  HERO_CTA: "Explore Schedule",

  // Live Matches
  NO_LIVE_MATCHES: "No Live Matches",
  NO_LIVE_DESC: "Check back later or explore the schedule for upcoming matches",
  VIEW_SCHEDULE: "View Schedule",
  LIVE_BADGE: "● LIVE RIGHT NOW",
  MATCH_HASH: "Match",

  // Match Details
  BATTING: "BATTING",
  BOWLING: "BOWLING",
  CURRENT_SCORE: "Current Score",
  OVERS: "Overs",
  RUNS_WICKETS: "Runs / Wkts",
  FORMAT: "Format",
  TOURNAMENT: "Tournament",
  VENUE: "Venue",
  INNING: "Inning",
  VS: "VS",

  // Chase Details
  CHASE_DETAILS: "CHASE DETAILS",
  TARGET: "Target:",
  NEEDED: "Needed:",
  CRR: "CRR:",
  RRR: "RRR:",
  RUNS: "runs",

  // Toss
  TOSS: "TOSS",
  TOSS_WINNER: "WINNER",
  TOSS_DECISION: "DECISION",
  ELECTED_BAT: "Elected to Bat",
  ELECTED_BOWL: "Elected to Bowl",

  // Action Buttons
  WATCH_LIVE: "● Watch Live",
  MATCH_DETAILS: "Match Details",
  VIEW_LIVE: "View Live →",
  VIEW: "View →",

  // Upcoming
  UPCOMING_MATCHES: "Upcoming Matches",
  LEAGUE: "LEAGUE",
  UPCOMING: "UPCOMING",
  VIEW_SQUAD: "View Squad →",

  // Prestige
  PRESTIGE: "Tournament Prestige",
  PRESTIGE_1: "Bi-Annual",
  PRESTIGE_1_DESC: "Tradition Since 2012",
  PRESTIGE_2: "Non-Profit",
  PRESTIGE_2_DESC: "Pure Sporting Spirit",

  // Teams
  THE_CONTENDERS: "The Contenders",

  // Tournament Stats
  LEADERBOARD: "Tournament Leaderboard",
  TOP_PERFORMERS: "Top Performers",
  MOST_RUNS: "Most Runs",
  MOST_WICKETS: "Most Wickets",
  HIGHEST_SCORE: "Highest Score",
  BEST_BOWLING: "Best Bowling",
  NO_DATA: "No data yet",
  BEST_INNING: "Best Individual Inning",
  BEST_BOWLING_PERF: "Best Bowling Performance",

  // Hall of Fame
  HALL_OF_FAME: "Lifetime Legends",
  HALL_OF_FAME_DESC: "Hall of Fame",
};

// Pages
export const PAGES = {
  PLAYERS: {
    TITLE: "Players Management",
    ADD_NEW: "Add New Player",
    ADD_NEW_DESC: "Fill in player details and abilities",
    ALL_PLAYERS: "All Players",
    DELETE_ALL: "Delete All",
    NO_PLAYERS: "No players found",
    SEARCH_PLACEHOLDER: "Search players…",
  },
};

// Default Player Avatar SVG
export const DEFAULT_AVATAR_SVG = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  path: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
};

// ─────────────────────────────────────────────────────────────────
// Match Status Enum
// ─────────────────────────────────────────────────────────────────
export const MATCH_STATUS = {
  LIVE: "LIVE",
  SCHEDULED: "SCHEDULED",
  COMPLETED: "COMPLETED",
};

// ─────────────────────────────────────────────────────────────────
// Branding
// ─────────────────────────────────────────────────────────────────
export const BRANDING = {
  NAME: "ECF",
  YEAR: "2024",
  FULL: "ECF • 2024",
  TITLE: "EID CRICKET FEST",
};

// ─────────────────────────────────────────────────────────────────
// Admin Dashboard
// ─────────────────────────────────────────────────────────────────
export const ADMIN_DASHBOARD = {
  PAGE_TITLE: "Admin Console",
  PAGE_SUBTITLE: "Tournament Management & Tournament Operations",
  SECTION_MANAGEMENT: "Management",
  SECTION_FIXTURES: "Fixtures",
  MODE_LABEL: "Admin Console",
  LOGOUT_BTN: "LOGOUT",
  REFRESH_BTN: "REFRESH",
  LOADING_TEXT: "LOADING...",
};

export const ADMIN_STATS = {
  TEAMS: "Teams",
  PLAYERS: "Players",
  MATCHES: "Matches",
  LIVE_NOW: "Live Now",
};

export const ADMIN_ACTIONS = [
  {
    label: "Player Draft",
    description: "Assign players to teams. Execute snake draft.",
    route: "/admin/draft",
  },
  {
    label: "Manage Teams",
    description: "Create, edit, and delete tournament teams.",
    route: "/admin/teams",
  },
  {
    label: "Manage Players",
    description: "Add, update, and remove player profiles.",
    route: "/admin/players",
  },
  {
    label: "Schedule Fixtures",
    description: "Create and manage match fixtures and schedule.",
    route: "/admin/fixtures",
  },
  {
    label: "Live Scorer",
    description: "Update live match scores in real-time.",
    route: "/admin/score",
  },
  {
    label: "Tournament Stats",
    description: "View tournament statistics and reports.",
    route: "/admin/stats",
  },
];

export const ADMIN_ERROR_MESSAGES = {
  CONNECTION_ERROR: "Connection Error",
  UNABLE_TO_LOAD_MATCHES: "Unable to load matches",
  RETRY_INSTRUCTION: "Click RETRY button above.",
  LOADING_MATCHES: "Loading matches...",
  FETCHING_DATA: "Fetching data from backend...",
};

export const ADMIN_EMPTY_STATES = {
  NO_MATCHES: "No matches created yet",
  NO_MATCHES_SUBTITLE:
    "Start by creating match fixtures in the Schedule Fixtures section",
  CREATE_FIXTURES_BTN: "Create Fixtures",
};

export const MATCH_STATUS_DISPLAY = {
  [MATCH_STATUS.LIVE]: {
    text: "LIVE",
    label: "LIVE",
  },
  [MATCH_STATUS.SCHEDULED]: {
    text: "Scheduled",
    label: "Scheduled",
  },
  [MATCH_STATUS.COMPLETED]: {
    text: "Completed",
    label: "Completed",
  },
};

export const ADMIN_ACTION_BUTTONS = {
  UPDATE_SCORE: "Update Score",
  RETRY: "RETRY",
  CREATE_FIXTURES: "Create Fixtures",
};
