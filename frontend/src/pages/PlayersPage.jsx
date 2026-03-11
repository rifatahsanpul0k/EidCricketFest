import axios from "axios";
import { Loader2, Mail, Phone, Star, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

const API = "https://eidcricketfest-1.onrender.com/api";

const ROLES = ["BATSMAN", "BOWLER", "ALL_ROUNDER", "WICKETKEEPER"];
const ROLE_STYLE = {
  BATSMAN: { label: "BAT", bg: "bg-blue-500/20", text: "text-blue-300" },
  BOWLER: { label: "BOWL", bg: "bg-green-500/20", text: "text-green-300" },
  ALL_ROUNDER: {
    label: "ALL",
    bg: "bg-purple-500/20",
    text: "text-purple-300",
  },
  WICKETKEEPER: { label: "WK", bg: "bg-amber-500/20", text: "text-amber-300" },
};

const DEFAULT_NEW_PLAYER = {
  name: "",
  primaryRole: "BATSMAN",
  battingRating: 70,
  bowlingRating: 50,
  fieldingRating: 70,
  imageUrl: null,
};

// ── Utility: Compress image to base64 ───────────────────────────────────────────
const compressImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxWidth = 400;
        const maxHeight = 400;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Compress with quality setting
        const base64 = canvas.toDataURL("image/jpeg", 0.7);
        resolve(base64);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

// ── Player Detail Modal ──────────────────────────────────────────────────────────
const PlayerDetailModal = ({ player, onClose }) => {
  const overlayRef = useRef(null);
  const roleStyle = ROLE_STYLE[player.primaryRole] || ROLE_STYLE.ALL_ROUNDER;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="relative h-full w-full max-w-md bg-neutral-900 border-l border-white/10 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-6 border-b border-white/10 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">
                Player Profile
              </p>
              <h2 className="text-2xl font-black uppercase tracking-wide text-white leading-tight">
                {player.name}
              </h2>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${roleStyle.bg} ${roleStyle.text}`}
                >
                  {roleStyle.label}
                </span>
                {player.team?.name && player.team.name !== "Unassigned" && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                    {player.team.name}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="mt-1 w-9 h-9 flex items-center justify-center rounded border border-white/10 text-white/40 hover:text-white transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Player Image - Full Squared */}
          <div className="w-full aspect-square bg-neutral-800 flex items-center justify-center border-b border-white/10">
            {player.imageUrl ? (
              <img
                src={player.imageUrl}
                alt={player.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-white/30 text-sm font-black uppercase tracking-widest">
                No Photo Available
              </div>
            )}
          </div>

          {/* Ratings */}
          <div className="px-6 py-6 border-b border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-4">
              Performance Ratings
            </p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                    Batting
                  </span>
                  <span className="text-[10px] font-black text-cyan-400">
                    {player.battingRating}/100
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all"
                    style={{ width: `${Math.min(player.battingRating, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                    Bowling
                  </span>
                  <span className="text-[10px] font-black text-cyan-400">
                    {player.bowlingRating}/100
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all"
                    style={{ width: `${Math.min(player.bowlingRating, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                    Fielding
                  </span>
                  <span className="text-[10px] font-black text-cyan-400">
                    {player.fieldingRating}/100
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all"
                    style={{
                      width: `${Math.min(player.fieldingRating, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {(player.email || player.phone) && (
            <div className="px-6 py-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-4">
                Contact Information
              </p>
              <div className="space-y-3">
                {player.email && (
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-white/40 shrink-0" />
                    <span className="text-[10px] text-white/70 break-all">
                      {player.email}
                    </span>
                  </div>
                )}
                {player.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-white/40 shrink-0" />
                    <span className="text-[10px] text-white/70">
                      {player.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const PlayersPage = () => {
  const { isAdmin } = useAuth();
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState(DEFAULT_NEW_PLAYER);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [playerSearch, setPlayerSearch] = useState("");
  const [msg, setMsg] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerDetailLoading, setPlayerDetailLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const imageInputRef = useRef(null);

  const flash = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const fetchPlayers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/players?page=0&size=100`);
      const playersData = Array.isArray(res.data.content)
        ? res.data.content
        : res.data;
      setPlayers(playersData);
    } catch {
      flash("err", "Failed to load players");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      flash("err", "Please select a valid image file");
      return;
    }

    // Validate file size (500KB max)
    if (file.size > 524288) {
      flash("err", "Image too large. Max 500KB");
      return;
    }

    setUploadingImage(true);
    try {
      const base64 = await compressImageToBase64(file);
      setNewPlayer((p) => ({ ...p, imageUrl: base64 }));
      flash("ok", "✓ Image compressed and ready");
    } catch (error) {
      flash("err", "Failed to process image");
      console.error(error);
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const addPlayer = async () => {
    if (!newPlayer.name.trim()) return flash("err", "Enter a player name");
    setAddingPlayer(true);
    try {
      await axios.post(`${API}/players`, {
        name: newPlayer.name.trim(),
        role: newPlayer.primaryRole,
        battingRating: Number(newPlayer.battingRating),
        bowlingRating: Number(newPlayer.bowlingRating),
        fieldingRating: Number(newPlayer.fieldingRating),
        imageUrl: newPlayer.imageUrl || null,
      });

      await fetchPlayers();
      setNewPlayer(DEFAULT_NEW_PLAYER);
      flash("ok", `✓ Player "${newPlayer.name}" added`);
    } catch (e) {
      flash("err", e.response?.data?.error || "Could not add player");
    } finally {
      setAddingPlayer(false);
    }
  };

  const deletePlayer = async (playerId, playerName) => {
    if (!window.confirm(`Delete player "${playerName}"?`)) return;
    try {
      await axios.delete(`${API}/players/${playerId}`);
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
      flash("ok", `✓ "${playerName}" deleted`);
    } catch (e) {
      flash("err", e.response?.data?.error || "Could not delete player");
    }
  };

  const handlePlayerClick = async (id) => {
    setPlayerDetailLoading(true);
    try {
      const res = await axios.get(`${API}/players/${id}`);
      setSelectedPlayer(res.data);
    } catch {
      flash("err", "Could not load player details");
    } finally {
      setPlayerDetailLoading(false);
    }
  };

  const filteredPlayers = players.filter((p) =>
    p.name?.toLowerCase().includes(playerSearch.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-neutral-950 font-space text-white pt-24 pb-20 px-6 sm:px-12">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-7xl font-black uppercase tracking-tighter italic text-white mb-4">
            Players
          </h1>
          <p className="text-cyan-500 font-black uppercase tracking-widest text-xs">
            {players.length} player{players.length !== 1 ? "s" : ""} in pool
          </p>
        </div>

        {/* Toast */}
        {msg && (
          <div
            className={`mb-8 px-6 py-4 text-[11px] font-black uppercase tracking-widest border transition-all ${
              msg.type === "ok"
                ? "border-green-500/30 text-green-400 bg-green-500/5"
                : "border-cyan-500/30 text-cyan-400 bg-cyan-500/5"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Admin Only: Add Player Section */}
        {isAdmin && (
          <div className="mb-12 pb-12 border-b border-white/10">
            <h2 className="text-xl font-black uppercase tracking-wider mb-6">
              Add New Player
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Player Name"
                  className="bg-neutral-900 border border-white/10 px-4 py-3 text-white font-black uppercase text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-500"
                  value={newPlayer.name}
                  onChange={(e) =>
                    setNewPlayer((p) => ({ ...p, name: e.target.value }))
                  }
                />
                <select
                  value={newPlayer.primaryRole}
                  onChange={(e) =>
                    setNewPlayer((p) => ({ ...p, primaryRole: e.target.value }))
                  }
                  className="bg-neutral-900 border border-white/10 px-4 py-3 text-white font-black uppercase text-sm focus:outline-none focus:border-cyan-500"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Bat Rating (0-100)"
                  min="0"
                  max="100"
                  className="bg-neutral-900 border border-white/10 px-4 py-3 text-white font-black uppercase text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-500"
                  value={newPlayer.battingRating}
                  onChange={(e) =>
                    setNewPlayer((p) => ({
                      ...p,
                      battingRating: e.target.value,
                    }))
                  }
                />
                <input
                  type="number"
                  placeholder="Bowl Rating (0-100)"
                  min="0"
                  max="100"
                  className="bg-neutral-900 border border-white/10 px-4 py-3 text-white font-black uppercase text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-500"
                  value={newPlayer.bowlingRating}
                  onChange={(e) =>
                    setNewPlayer((p) => ({
                      ...p,
                      bowlingRating: e.target.value,
                    }))
                  }
                />
                <input
                  type="number"
                  placeholder="Field Rating (0-100)"
                  min="0"
                  max="100"
                  className="bg-neutral-900 border border-white/10 px-4 py-3 text-white font-black uppercase text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-500"
                  value={newPlayer.fieldingRating}
                  onChange={(e) =>
                    setNewPlayer((p) => ({
                      ...p,
                      fieldingRating: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Image Upload Section */}
              <div className="border border-white/10 rounded p-4 bg-neutral-900/50">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/70">
                    Player Photo
                  </p>
                  {newPlayer.imageUrl && (
                    <button
                      onClick={() =>
                        setNewPlayer((p) => ({ ...p, imageUrl: null }))
                      }
                      className="text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {newPlayer.imageUrl ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={newPlayer.imageUrl}
                      alt="Player preview"
                      className="w-20 h-20 rounded border border-cyan-500/30 object-cover"
                    />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-green-400 mb-2">
                        Photo Ready
                      </p>
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        className="text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full py-3 border border-cyan-500/30 border-dashed rounded text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/10 transition-all disabled:opacity-50"
                  >
                    {uploadingImage
                      ? "Compressing..."
                      : "Click to Upload Player Photo"}
                  </button>
                )}

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <p className="text-[9px] text-white/40 mt-2">
                  Max 500KB • Auto-compressed to 400x400px • Optional
                </p>
              </div>

              <button
                onClick={addPlayer}
                disabled={addingPlayer}
                className="w-full md:w-auto px-8 py-3 bg-cyan-500 text-black font-black uppercase tracking-widest text-sm hover:bg-white transition-all disabled:opacity-50"
              >
                {addingPlayer ? "Adding..." : "Add Player"}
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search players..."
            className="w-full bg-neutral-900 border border-white/10 px-4 py-3 text-white font-black uppercase text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-500"
            value={playerSearch}
            onChange={(e) => setPlayerSearch(e.target.value)}
          />
        </div>

        {/* Players List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-cyan-500" size={40} />
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🌫️</div>
            <p className="text-white/30 uppercase tracking-widest font-black">
              No players found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((p) => {
              const roleStyle =
                ROLE_STYLE[p.primaryRole] || ROLE_STYLE.ALL_ROUNDER;
              const total =
                (p.battingRating || 0) +
                (p.bowlingRating || 0) +
                (p.fieldingRating || 0);
              return (
                <div
                  key={p.id}
                  onClick={() => handlePlayerClick(p.id)}
                  className="overflow-hidden border border-white/10 bg-neutral-900 rounded-lg group hover:border-cyan-500 hover:bg-neutral-800 transition-all cursor-pointer"
                >
                  {/* Player Photo */}
                  <div className="w-full aspect-square bg-neutral-800 flex items-center justify-center border-b border-white/10">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-white/30 text-xs font-black uppercase tracking-widest">
                        No Photo
                      </div>
                    )}
                  </div>

                  {/* Player Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-black uppercase tracking-wide mb-2">
                          {p.name}
                        </h3>
                        <span
                          className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${roleStyle.bg} ${roleStyle.text}`}
                        >
                          {roleStyle.label}
                        </span>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePlayer(p.id, p.name);
                          }}
                          className="ml-4 w-8 h-8 flex items-center justify-center rounded bg-black/40 hover:bg-red-900/40 text-white/20 hover:text-red-400 transition-all text-sm font-black"
                          title="Delete Player"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-white/50 font-black">BAT</span>
                        <span className="text-cyan-400 font-black">
                          {p.battingRating}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-white/50 font-black">BOWL</span>
                        <span className="text-cyan-400 font-black">
                          {p.bowlingRating}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-white/50 font-black">FLD</span>
                        <span className="text-cyan-400 font-black">
                          {p.fieldingRating}
                        </span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-white/50 font-black">
                        Overall
                      </span>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-cyan-500" />
                        <span className="text-[11px] font-black text-cyan-400">
                          {total}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Player Detail Modal */}
      {selectedPlayer &&
        (playerDetailLoading ? (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm">
            <div className="h-full w-full max-w-md bg-neutral-900 border-l border-white/10 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-cyan-500" />
            </div>
          </div>
        ) : (
          <PlayerDetailModal
            player={selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
          />
        ))}
    </div>
  );
};

export default PlayersPage;
