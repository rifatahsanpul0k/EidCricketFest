/**
 * ECF Cricket Fest Theme Configuration
 * Centralized theme and design tokens for consistent styling across the application
 */

export const THEME = {
  // Color Palette
  colors: {
    // Backgrounds
    bg: {
      primary: "neutral-950", // Main background
      secondary: "neutral-900", // Cards, sections
      light: "neutral-800", // Hover states
    },

    // Text Colors
    text: {
      primary: "white", // Main text
      secondary: "white/60", // Secondary text
      muted: "white/40", // Muted text
      faint: "white/20", // Very faint
    },

    // Accent Colors
    accent: {
      primary: "cyan-500", // Main action color
      light: "cyan-400", // Text highlights
      dark: "cyan-700", // Darker accents
    },

    // Status Colors
    status: {
      live: {
        bg: "red-500/20",
        text: "red-400",
        border: "red-500/40",
      },
      success: {
        bg: "green-500/20",
        text: "green-400",
        border: "green-500/40",
      },
      warning: {
        bg: "red-500/20",
        text: "red-300",
        border: "red-500/50",
      },
      info: {
        bg: "cyan-500/5",
        text: "cyan-300",
        border: "cyan-500/40",
      },
    },

    // Borders
    border: {
      light: "border-white/5",
      normal: "border-white/10",
      medium: "border-white/20",
    },
  },

  // Typography
  typography: {
    // Hero/Page Title
    hero: "text-6xl md:text-7xl font-black uppercase italic tracking-tighter",

    // Section Headers
    sectionHeader: "text-3xl font-black uppercase italic tracking-tight",

    // Subsection Headers
    subsectionHeader: "text-xl font-black uppercase italic tracking-tight",

    // Card Titles
    cardTitle: "text-white font-black uppercase tracking-wide",

    // Labels & Small Text
    label: "text-[10px] font-black uppercase tracking-widest",
    labelSmall: "text-[9px] font-black uppercase tracking-[1px]",

    // Body Text
    body: "text-sm font-black uppercase tracking-widest",
    bodySm: "text-[11px] font-black uppercase tracking-[3px]",
  },

  // Components - Tailwind Classes
  components: {
    // Primary Button
    buttonPrimary:
      "px-8 py-3 bg-cyan-500 text-black font-black uppercase tracking-widest text-sm hover:bg-white transition-all",

    // Secondary Button
    buttonSecondary:
      "px-8 py-3 border border-white/20 text-white font-black uppercase tracking-widest text-sm hover:border-cyan-500 transition-all",

    // Small Button
    buttonSmall:
      "px-4 py-2 bg-cyan-500 text-black font-black uppercase tracking-[2px] text-[10px] rounded hover:bg-white transition-all",

    // Ghost Button (transparent)
    buttonGhost:
      "px-4 py-2 border border-cyan-500/40 text-cyan-300 font-black uppercase tracking-[2px] text-[10px] rounded hover:bg-cyan-500/20 transition-all",

    // Danger Button
    buttonDanger:
      "px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-300 font-black uppercase tracking-[2px] text-[10px] rounded hover:bg-red-500/30 transition-all",

    // Card
    card: "border border-white/10 bg-neutral-900 rounded-lg p-6 hover:border-cyan-500 hover:bg-neutral-800 transition-all",

    // Input Field
    input:
      "w-full bg-neutral-900 border border-white/20 rounded p-2 text-white text-[12px] focus:outline-none focus:border-cyan-500",

    // Section Container
    section: "relative px-6 md:px-12 py-20",

    // Section with Border
    sectionBordered: "relative px-6 md:px-12 py-20 border-b border-white/5",

    // Content Container
    container: "max-w-7xl mx-auto",

    // Grid Layouts
    gridCards: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    gridStats: "grid grid-cols-1 md:grid-cols-4 gap-6",
    gridTeams: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
  },

  // Responsive Spacing
  spacing: {
    sectionGap: "gap-16",
    cardGap: "gap-6",
    smallGap: "gap-4",
    padding: {
      page: "p-6 md:p-12",
      section: "px-6 md:px-12 py-20",
      card: "p-6",
    },
  },

  // Animations
  animations: {
    transition: "transition-all",
    hover: "hover:border-cyan-500",
  },

  // Layout Constants
  layout: {
    headerHeight: "pt-20",
    maxWidth: "max-w-7xl",
    minHeight: "min-h-screen",
  },
};

/**
 * Theme Utility Functions
 */

/**
 * Combine multiple Tailwind classes safely
 * @param {...string} classes - Classes to combine
 * @returns {string} Combined class string
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

/**
 * Get button styles by variant
 * @param {string} variant - Button variant (primary, secondary, small, ghost, danger)
 * @returns {string} Button classes
 */
export const getButtonClass = (variant = "primary") => {
  const variants = {
    primary: THEME.components.buttonPrimary,
    secondary: THEME.components.buttonSecondary,
    small: THEME.components.buttonSmall,
    ghost: THEME.components.buttonGhost,
    danger: THEME.components.buttonDanger,
  };
  return variants[variant] || variants.primary;
};

/**
 * Get card styles with optional custom classes
 * @param {string} customClasses - Additional Tailwind classes
 * @returns {string} Card classes
 */
export const getCardClass = (customClasses = "") => {
  return cn(THEME.components.card, customClasses);
};

/**
 * Get status badge styles
 * @param {string} status - Status type (live, success, warning, info)
 * @returns {object} Status styles object
 */
export const getStatusStyle = (status = "info") => {
  return THEME.colors.status[status] || THEME.colors.status.info;
};

/**
 * Get grid layout class
 * @param {string} type - Grid type (cards, stats, teams)
 * @returns {string} Grid classes
 */
export const getGridClass = (type = "cards") => {
  const grids = {
    cards: THEME.components.gridCards,
    stats: THEME.components.gridStats,
    teams: THEME.components.gridTeams,
  };
  return grids[type] || grids.cards;
};

export default THEME;
