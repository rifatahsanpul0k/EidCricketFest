/**
 * API Configuration
 * Centralized API endpoints and base URLs
 *
 * Set VITE_API_BASE_URL in your .env file (or Vercel env vars) to point at
 * your production backend, e.g.:
 *   VITE_API_BASE_URL=https://eid-cricket-fest.onrender.com/api
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://eidcricketfest-1.onrender.com/api";

export const API_ENDPOINTS = {
  // Teams
  TEAMS: `${API_BASE_URL}/teams`,

  // Players
  PLAYERS: `${API_BASE_URL}/players`,

  // Matches
  MATCHES: `${API_BASE_URL}/matches`,
  MATCH_BY_ID: (id) => `${API_BASE_URL}/matches/${id}`,
  MATCH_LIVE_SCORE: (id) => `${API_BASE_URL}/matches/${id}/live-score`,
  UPDATE_MATCH_STATUS: (id) => `${API_BASE_URL}/matches/${id}/status`,

  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
};

export default API_ENDPOINTS;
