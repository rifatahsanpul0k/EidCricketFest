# EID Cricket Fest - Universal Theme Guidelines

## Overview

This document defines the universal design theme for the EID Cricket Fest application. All public-facing pages should follow these guidelines to ensure visual consistency.

## Color Palette

### Primary Colors

- **Primary (ECF Red)**: `#E51A1A` / `text-primary` / `bg-primary`
  - Use for: Live indicators, primary actions, emphasis
  - Hover state: `#C41515` / `primary-hover`

### Background

- **Main Background**: Solid black `bg-black` / `#000000`
  - ❌ DO NOT use gradient backgrounds on main containers
  - ❌ DO NOT use `bg-neutral-900`, `bg-slate-900`, or similar variations

### Neutrals

- **White with opacity**: `white/10`, `white/20`, `white/40`, `white/60`, etc.
  - Use for: Borders, subtle backgrounds, secondary text
- **Pure white**: `text-white` for primary text

## Readability Rules ⚠️

### ✅ Good Contrast Combinations

- White text (`text-white`) on black background (`bg-black`)
- White text on primary red background (`text-white` on `bg-primary`)
- Primary red text on black background (`text-primary` on `bg-black`)
- White/60 text on black background for secondary info
- White text on dark semi-transparent backgrounds (`text-white` on `bg-black/50`)

### ❌ Avoid These (Poor Readability)

- Colored text on colored backgrounds (e.g., `text-blue-300` on `bg-blue-900/30`)
- Yellow/amber text on dark backgrounds (`text-yellow-400` on `bg-black`)
- Multiple colored accents in same section (blue, purple, orange together)
- Text with opacity less than 40% for important content
- Blue/slate backgrounds with blue text

### Text Color Usage

- **Primary Content**: Always use `text-white` (100% white)
- **Secondary Content**: Use `text-white/60` (60% opacity)
- **Labels/Metadata**: Use `ecf-label` class or `text-white/40`
- **Emphasis/Live Status**: Use `text-primary` (ECF Red)
- **Never use**: Blue, purple, orange, yellow for body text

## Typography

### Font Family

- **Primary**: Space Grotesk (`font-space`)
  - Always use across all pages

### Text Styling

- **Uppercase**: Use uppercase for headings, labels, buttons (`uppercase`)
- **Font Weights**:
  - Labels: `font-black` (900)
  - Headings: `font-black` (900)
  - Body: `font-light` (300) or `font-normal` (400)

### Letter Spacing

- Ultra-wide labels: `tracking-ultra` (6px)
- Wide labels: `tracking-widest` or `tracking-wide-md`
- Tight headings: `tracking-tight`

## Components (ECF Classes)

### Navigation

**Landing Page (No back button needed):**

```jsx
<nav className="ecf-nav flex justify-center items-center">
  <div className="text-center text-white text-base font-bold uppercase leading-normal tracking-wide-lg">
    ECF • 2024
  </div>
</nav>
```

**Other Pages (With back navigation):**

```jsx
<nav className="ecf-nav flex items-center gap-4">
  {/* Back button - functional */}
  <button
    onClick={() => navigate("/previous-page")}
    className="text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
  >
    ← Back
  </button>

  {/* Center branding */}
  <div className="flex-1 text-center text-white text-base font-bold uppercase leading-normal tracking-wide-lg">
    ECF • 2024
  </div>

  {/* Spacer for balance */}
  <div className="w-16"></div>
</nav>
```

**Key Principles:**

- ✅ Only include functional elements (no decorative icons)
- ✅ Clean, minimal design
- ✅ Clear back navigation with text label
- ✅ Centered branding
- ❌ No unused decorative shapes or icons

### Cards

```jsx
<div className="ecf-card">{/* Content */}</div>;

{
  /* For live matches */
}
<div className="ecf-card ecf-match-live">{/* Live match content */}</div>;

{
  /* For scheduled matches */
}
<div className="ecf-card ecf-match-scheduled">
  {/* Scheduled match content */}
</div>;
```

### Buttons

```jsx
{
  /* Primary action button */
}
<button className="ecf-btn-primary">Action</button>;

{
  /* Secondary/outline button */
}
<button className="ecf-btn-outline">Action</button>;
```

### Labels

```jsx
<div className="ecf-label">Small Label</div>
```

### Headings

```jsx
<h1 className="ecf-heading-1">Main Heading</h1>
```

## Status Indicators

### Match Status

- **Live**: `text-primary animate-pulse` with "● LIVE" text
- **Scheduled/Upcoming**: `text-white/60` with "UPCOMING" text
- **Completed**: `text-white/40` with "COMPLETED" text

## Design Principles

### ✅ DO

- Use solid black backgrounds (`bg-black`)
- Use the `ecf-` prefixed component classes
- Use primary red color for live/active states
- Keep navigation minimal and consistent
- Use subtle white/opacity for borders and backgrounds
- Use uppercase typography for emphasis
- Use wide letter spacing for labels

### ❌ DON'T

- Use gradient backgrounds (except in specific hero sections)
- Use blue accent colors (`text-blue-*`, `bg-blue-*`, `border-blue-*`)
- Use emojis in navigation or button text
- Use `bg-neutral-900`, `bg-slate-900` or similar colored backgrounds
- Mix different navigation styles between pages
- Use rounded buttons with custom colors inconsistent with theme
- Create buttons that navigate to non-existent routes
- Use multi-colored accent panels (orange, purple, blue together)

## Button & Navigation Best Practices

### Button Text

- ✅ Use: "Watch Live", "View Details", "Match Summary"
- ❌ Avoid: "🔴 LIVE SCORE", "📋 Schedule" (no emojis in buttons)
- Keep button text clear and action-oriented
- Use `ecf-btn-primary` for main actions
- Use `ecf-btn-outline` for secondary actions

### Route Validation

All navigation buttons must link to valid routes defined in App.jsx:

- `/` - Landing page
- `/schedule` - Schedule/fixtures page
- `/match/:id/live` - Live match score
- `/match/:id/details` - Match details page
- `/team/:id` - Team detail page

Verify routes exist before implementing navigation buttons.

## Page Structure Template

```jsx
import { useNavigate } from "react-router-dom";

const PageName = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full relative bg-black min-h-screen font-space overflow-x-hidden">
      {/* Navigation - Use ecf-nav */}
      <nav className="ecf-nav flex justify-between items-center">
        {/* ... navigation content ... */}
      </nav>

      {/* Page Content */}
      <section className="w-full max-w-6xl mx-auto px-4 md:px-8 py-12">
        {/* Page Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="text-white/40 text-[10px] font-black uppercase tracking-ultra mb-3">
            Section Label
          </div>
          <h1 className="text-white text-5xl md:text-6xl font-black uppercase tracking-wide-md mb-4">
            Page Title
          </h1>
          <p className="text-white/60 text-sm font-light leading-relaxed tracking-wide-sm max-w-md">
            Description text
          </p>
        </div>

        {/* Main content using ecf-card components */}
      </section>
    </div>
  );
};

export default PageName;
```

## Admin Pages Exception

Admin panel pages (with `AdminLayout`) may use different styling:

- Can use `ecf-gradient-bg` for admin sections
- Can use different navigation patterns
- Admin pages are not public-facing so have more flexibility

## Migration Checklist

When updating a page to match the theme:

- [ ] Change background from gradient to solid black
- [ ] Replace blue accents with primary red or white/opacity
- [ ] Update navigation to use `ecf-nav` pattern
- [ ] Remove or minimize emoji usage
- [ ] Use `ecf-card`, `ecf-btn-primary`, `ecf-btn-outline` classes
- [ ] Use `ecf-label` for small labels
- [ ] Ensure uppercase typography for headings/labels
- [ ] Use consistent letter spacing (tracking)
- [ ] Replace custom colored cards with `ecf-card`
- [ ] Test for visual consistency with LandingPage

## Reference Implementation

The **LandingPage.jsx** is the reference implementation for this theme. When in doubt, refer to its styling patterns.
