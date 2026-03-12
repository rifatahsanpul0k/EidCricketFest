import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const navigate = useNavigate();
  const { auth, logout, isAdmin } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-4 bg-black/90 backdrop-blur-md border-b border-white/10 font-space">
      {/* Logo / Brand */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 cursor-pointer group"
      >
        <div className="w-8 h-8 bg-white rounded flex items-center justify-center group-hover:rotate-12 transition-transform">
          <span className="text-black font-black text-lg">E</span>
        </div>
        <div className="text-white text-base font-black uppercase tracking-[2px]">
          ECF • 2024
        </div>
      </div>

      {/* Desktop Links - Only for Regular Users */}
      {!isAdmin && (
        <div className="hidden lg:flex items-center gap-8">
          {[
            { label: "Live", path: "/live-score" },
            { label: "Schedule", path: "/fixtures" },
            { label: "Teams", path: "/teams" },
            { label: "Players", path: "/players" },
          ].map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.path)}
              className="text-white/60 hover:text-white text-[11px] font-black uppercase tracking-[3px] transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {isAdmin && (
          <button
            onClick={() => navigate("/admin")}
            className="hidden md:block px-4 py-1.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-black uppercase tracking-[2px] rounded hover:bg-cyan-500/30 transition-all"
          >
            DASHBOARD
          </button>
        )}

        {auth ? (
          <div className="flex items-center gap-4 border-l border-white/10 pl-4">
            <span className="text-white/40 text-[10px] font-black uppercase hidden sm:block">
              {auth.username}
            </span>
            <button
              onClick={logout}
              className="px-4 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-[2px] rounded hover:bg-gray-200 transition-all"
            >
              LOGOUT
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/admin/login")}
            className="px-4 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-[2px] rounded hover:bg-gray-200 transition-all border border-white"
          >
            LOGIN
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
