import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

const API = "http://localhost:8080/api";
const TOURNAMENT_ID = 1;

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[9px] font-black uppercase tracking-[4px] text-white/50">
      {label}
    </label>
    {children}
  </div>
);

const Input = ({
  value,
  onChange,
  type = "text",
  placeholder = "",
  min,
  max,
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    min={min}
    max={max}
    className="bg-slate-900 border border-white/20 text-white text-sm font-bold px-3 py-2.5 focus:outline-none focus:border-white transition-colors placeholder:text-white/30 placeholder:font-normal w-full"
  />
);

const Select = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={onChange}
    className="bg-slate-900 border border-white/20 text-white text-sm font-bold uppercase px-3 py-2.5 focus:outline-none focus:border-white transition-colors w-full"
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

const TournamentSettingsPage = () => {
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    name: "",
    seasonYear: "",
    maxOvers: 10,
    rounds: 1,
    powerplayOvers: 6,
    maxBowlerOvers: 4,
    maxTeamSize: 11,
    rulesText: "",
  });
  const [savedSettings, setSavedSettings] = useState(false);

  const [msg, setMsg] = useState(null);

  const flash = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    try {
      const tRes = await axios.get(`${API}/tournaments/${TOURNAMENT_ID}`);
      const t = tRes.data;
      setSettings({
        name: t.name || "",
        seasonYear: t.seasonYear || new Date().getFullYear(),
        maxOvers: t.maxOvers || 10,
        rounds: t.rounds || 1,
        powerplayOvers: t.powerplayOvers || 6,
        maxBowlerOvers: t.maxBowlerOvers || 4,
        maxTeamSize: t.maxTeamSize || 11,
        rulesText: t.rulesText || "",
      });
    } catch {
      flash("err", "Failed to load data");
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const saveSettings = async () => {
    try {
      await axios.patch(`${API}/tournaments/${TOURNAMENT_ID}`, settings);
      setSavedSettings(true);
      setTimeout(() => setSavedSettings(false), 2500);
      flash("ok", "✓ Tournament settings saved");
    } catch {
      flash("err", "Could not save settings");
    }
  };

  return (
    <AdminLayout>
      <div className="w-full bg-black min-h-screen font-space text-white">
        {/* Header */}
        <div className="border-b border-white/10 px-8 py-8 flex items-end justify-between">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[5px] text-white/30 mb-2">
              Eid Cricket Fest · Admin
            </div>
            <h1 className="text-3xl font-black uppercase tracking-[3px]">
              Tournament Settings
            </h1>
          </div>
          <button
            onClick={() => navigate("/admin/fixtures")}
            className="border border-white/20 px-5 py-2.5 text-xs font-black uppercase tracking-[2px] text-white/50 hover:text-white hover:border-white transition-colors"
          >
            Manage Fixtures ↗
          </button>
        </div>

        {/* Toast */}
        {msg && (
          <div
            className={`mx-8 mt-5 px-5 py-3 text-xs font-bold uppercase tracking-widest border ${
              msg.type === "ok"
                ? "border-green-500/50 text-green-400 bg-green-500/10"
                : "border-red-500/50 text-red-400 bg-red-500/10"
            }`}
          >
            {msg.text}
          </div>
        )}

        <div className="px-8 py-8 flex flex-col gap-8 max-w-5xl">
          {/* Tournament Rules */}
          <Section
            title="Tournament Rules"
            subtitle="Overs, rounds, powerplay, squad size and custom rules"
            action={
              <button
                onClick={saveSettings}
                className={`px-5 py-2 text-xs font-black uppercase tracking-[2px] transition-all border ${
                  savedSettings
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-black border-white hover:bg-white/90"
                }`}
              >
                {savedSettings ? "✓ Saved" : "Save Rules"}
              </button>
            }
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <Field label="Tournament Name">
                <Input
                  value={settings.name}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, name: e.target.value }))
                  }
                  placeholder="Eid Cricket Fest"
                />
              </Field>
              <Field label="Season Year">
                <Input
                  type="number"
                  value={settings.seasonYear}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, seasonYear: e.target.value }))
                  }
                  min={2020}
                  max={2050}
                />
              </Field>
              <Field label="Overs Per Innings">
                <Input
                  type="number"
                  value={settings.maxOvers}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, maxOvers: e.target.value }))
                  }
                  min={1}
                  max={50}
                />
              </Field>
              <Field label="Rounds (× each matchup)">
                <Input
                  type="number"
                  value={settings.rounds}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, rounds: e.target.value }))
                  }
                  min={1}
                  max={5}
                />
              </Field>
              <Field label="Powerplay Overs">
                <Input
                  type="number"
                  value={settings.powerplayOvers}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      powerplayOvers: e.target.value,
                    }))
                  }
                  min={1}
                  max={20}
                />
              </Field>
              <Field label="Max Overs Per Bowler">
                <Input
                  type="number"
                  value={settings.maxBowlerOvers}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      maxBowlerOvers: e.target.value,
                    }))
                  }
                  min={1}
                  max={20}
                />
              </Field>
              <Field label="Max Team Size">
                <Input
                  type="number"
                  value={settings.maxTeamSize}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, maxTeamSize: e.target.value }))
                  }
                  min={7}
                  max={15}
                />
              </Field>
            </div>
            <Field label="Tournament Rules (displayed to public)">
              <textarea
                value={settings.rulesText}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, rulesText: e.target.value }))
                }
                rows={5}
                placeholder="e.g. No bouncer rule, Super Over for tied matches…"
                className="bg-slate-900 border border-white/20 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-white transition-colors placeholder:text-white/30 placeholder:font-normal w-full resize-none"
              />
            </Field>
          </Section>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              {
                label: "Manage Players",
                sub: "Add / edit player abilities",
                path: "/admin/players",
              },
              {
                label: "Manage Teams",
                sub: "Add / remove tournament teams",
                path: "/admin/teams",
              },
              {
                label: "Manage Fixtures",
                sub: "Create & schedule matches",
                path: "/admin/fixtures",
              },
              {
                label: "Player Draft",
                sub: "Assign players to teams",
                path: "/admin/draft",
              },
            ].map((l) => (
              <button
                key={l.path}
                onClick={() => navigate(l.path)}
                className="border border-black/10 px-5 py-4 text-left hover:bg-black hover:text-white hover:border-black transition-all group"
              >
                <div className="text-xs font-black uppercase tracking-[2px] transition-colors">
                  {l.label} ↗
                </div>
                <div className="text-[9px] text-black/30 uppercase tracking-widest mt-1 group-hover:text-white/50 transition-colors">
                  {l.sub}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TournamentSettingsPage;
