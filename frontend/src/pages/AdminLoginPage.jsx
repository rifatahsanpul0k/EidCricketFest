import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8080/api/auth/login",
        form,
      );
      login(res.data);
      const from = sessionStorage.getItem("redirectAfterLogin") || "/admin";
      sessionStorage.removeItem("redirectAfterLogin");
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-black min-h-screen font-space flex flex-col items-center justify-center p-4 text-white">
      {/* Nav */}
      <div className="fixed top-0 left-0 right-0 p-4 border-b border-white/10 bg-black/90 backdrop-blur-md flex justify-center">
        <span className="text-white text-base font-bold uppercase tracking-[3.2px]">
          ECF • 2024
        </span>
      </div>

      {/* Login Box */}
      <div className="w-full max-w-sm border border-white/10 p-8 flex flex-col gap-6 bg-black">
        <div className="flex flex-col gap-1 border-b border-white/10 pb-6">
          <h1 className="text-2xl font-black uppercase tracking-widest text-white">
            Admin Access
          </h1>
          <p className="text-white/40 text-[10px] uppercase tracking-[4px]">
            Scorer &amp; Draft Console
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white/40 text-[9px] font-bold uppercase tracking-[4px]">
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full bg-black border border-white/20 p-3 text-white text-sm font-bold tracking-wider focus:outline-none focus:border-white transition-colors placeholder:text-white/20"
              placeholder="ENTER USERNAME"
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white/40 text-[9px] font-bold uppercase tracking-[4px]">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-black border border-white/20 p-3 text-white text-sm font-bold tracking-wider focus:outline-none focus:border-white transition-colors placeholder:text-white/20"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="border border-primary/60 bg-primary/10 p-3 text-primary text-[10px] font-bold uppercase tracking-[2px]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black p-4 font-black text-sm uppercase tracking-[3px] hover:bg-white/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "VERIFYING..." : "ENTER CONSOLE"}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="text-white/30 text-[10px] font-bold uppercase tracking-[2px] hover:text-white/60 transition-colors text-center"
        >
          ← Back to Home
        </button>
      </div>

      {/* Subtle hint */}
      <p className="mt-6 text-white/20 text-[10px] uppercase tracking-widest font-bold">
        Restricted access — Authorised personnel only
      </p>
    </div>
  );
};

export default AdminLoginPage;
