import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Standard Pages
import DraftPage from "./pages/DraftPage";
import FixturesPage from "./pages/FixturesPage";
import LandingPage from "./pages/LandingPage";
import LiveScorePage from "./pages/LiveScorePage";
import PlayersPage from "./pages/PlayersPage";
import TeamsPage from "./pages/TeamsPage";

// Admin / Auth
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import LiveScorerConsole from "./pages/LiveScorerConsole";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/fixtures" element={<FixturesPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/draft" element={<DraftPage />} />
        <Route path="/live-score" element={<LiveScorePage />} />
        <Route path="/live-score/:id" element={<LiveScorePage />} />
        <Route path="/login" element={<AdminLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/score"
          element={
            <ProtectedRoute>
              <LiveScorerConsole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/fixtures"
          element={
            <ProtectedRoute>
              <FixturesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teams"
          element={
            <ProtectedRoute>
              <TeamsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/players"
          element={
            <ProtectedRoute>
              <PlayersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/draft"
          element={
            <ProtectedRoute>
              <DraftPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
