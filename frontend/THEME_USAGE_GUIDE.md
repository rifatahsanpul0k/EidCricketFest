# 🎨 ECF Cricket Fest Theme - Usage Guide

## Overview

The theme configuration is centralized in `src/config/theme.js` for consistent styling across the entire application.

## Installation & Import

### Basic Import

```javascript
import { THEME } from "../config/theme";
```

### Import Utilities

```javascript
import {
  THEME,
  cn,
  getButtonClass,
  getCardClass,
  getStatusStyle,
  getGridClass,
} from "../config/theme";
```

---

## Usage Examples

### 1. Using Color Palette

```javascript
// In className
<div className={`bg-${THEME.colors.bg.primary} text-${THEME.colors.text.primary}`}>

// Better - use the actual Tailwind class string
<div className="bg-neutral-950 text-white">
```

### 2. Using Pre-built Components

#### Button Variants

```javascript
// Primary Button
<button className={THEME.components.buttonPrimary}>
  Click Me
</button>

// Using utility function
import { getButtonClass } from "../config/theme";
<button className={getButtonClass("primary")}>Primary</button>
<button className={getButtonClass("secondary")}>Secondary</button>
<button className={getButtonClass("danger")}>Delete</button>
```

#### Cards

```javascript
import { getCardClass } from "../config/theme";

<div className={getCardClass()}>
  Card content
</div>

// With custom classes
<div className={getCardClass("hover:scale-105")}>
  Enhanced card
</div>
```

#### Grid Layouts

```javascript
import { getGridClass } from "../config/theme";

// Card grid (3 columns on desktop)
<div className={getGridClass("cards")}>
  {items.map(item => <Card key={item.id} />)}
</div>

// Stats grid (4 columns)
<div className={getGridClass("stats")}>
  {stats.map(stat => <StatCard key={stat.id} />)}
</div>

// Teams grid (4 columns)
<div className={getGridClass("teams")}>
  {teams.map(team => <TeamCard key={team.id} />)}
</div>
```

### 3. Using Typography

```javascript
// Hero Title
<h1 className={THEME.typography.hero}>
  Your Title
</h1>

// Section Header
<h2 className={THEME.typography.sectionHeader}>
  Section Title
</h2>

// Label Text
<span className={THEME.typography.label}>
  Metadata
</span>
```

### 4. Status Badges

```javascript
import { getStatusStyle } from "../config/theme";

const statusStyle = getStatusStyle("live"); // or "success", "warning", "info"

<div className={`bg-${statusStyle.bg} text-${statusStyle.text} border ${statusStyle.border} px-2 py-1 rounded`}>
  LIVE
</div>

// Or directly in JSX
<span className={`${THEME.colors.status.live.bg} ${THEME.colors.status.live.text} ${THEME.colors.status.live.border} border px-2 py-1 rounded`}>
  🔴 LIVE
</span>
```

### 5. Custom Class Combination

```javascript
import { cn } from "../config/theme";

const customClass = cn(
  THEME.components.card,
  "hover:scale-105",
  "cursor-pointer",
);

<div className={customClass}>Enhanced card with scale effect</div>;
```

---

## Complete Page Example

```javascript
import {
  THEME,
  getButtonClass,
  getCardClass,
  getGridClass,
} from "../config/theme";

const MyPage = () => {
  return (
    <div
      className={`w-full bg-${THEME.colors.bg.primary} ${THEME.layout.minHeight}`}
    >
      {/* Header */}
      <div className={THEME.components.section}>
        <div className={THEME.layout.maxWidth}>
          <h1 className={THEME.typography.hero}>
            My
            <span className={`text-${THEME.colors.accent.primary}`}>Page</span>
          </h1>
          <p
            className={`text-${THEME.colors.accent.light} ${THEME.typography.label}`}
          >
            Subtitle
          </p>
          <button className={getButtonClass("primary")}>Get Started</button>
        </div>
      </div>

      {/* Content */}
      <div className={THEME.components.sectionBordered}>
        <div className={THEME.layout.maxWidth}>
          <h2 className={THEME.typography.sectionHeader}>Features</h2>
          <div className={getGridClass("cards")}>
            {features.map((feature) => (
              <div key={feature.id} className={getCardClass()}>
                <h3 className={THEME.typography.cardTitle}>{feature.title}</h3>
                <p className={`text-${THEME.colors.text.secondary}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## Theme Structure

### Colors

- **Backgrounds**: Primary (neutral-950), Secondary (neutral-900), Light (neutral-800)
- **Text**: Primary (white), Secondary (white/60), Muted (white/40)
- **Accent**: Primary (cyan-500), Light (cyan-400)
- **Status**: Live, Success, Warning, Info styles

### Typography

- **Hero**: 6xl/7xl, black, uppercase, italic
- **SectionHeader**: 3xl, black, uppercase, italic
- **Label**: 10px, black, uppercase, tracking-widest

### Components

- **Buttons**: Primary, Secondary, Small, Ghost, Danger
- **Cards**: With hover effects and cyan border transition
- **Grids**: Pre-configured for cards (3), stats (4), teams (4)
- **Sections**: Padded containers with optional borders

---

## Best Practices

1. **Always import from `src/config/theme.js`**

   ```javascript
   import { THEME } from "../config/theme";
   ```

2. **Use utility functions for DRY code**

   ```javascript
   // ✅ Good
   className={getButtonClass("primary")}

   // ❌ Avoid
   className="px-8 py-3 bg-cyan-500 text-black..."
   ```

3. **Use `cn()` for combining classes**

   ```javascript
   // ✅ Good
   className={cn(THEME.components.card, customClass)}

   // ❌ Avoid
   className={`${THEME.components.card} ${customClass}`}
   ```

4. **Keep theme consistent across pages**
   - Always use THEME for colors
   - Use pre-built components
   - Don't hardcode color values

5. **Extend theme when needed**
   - Add new colors to THEME.colors
   - Create new component classes
   - Add utility functions for repetitive patterns

---

## File Location

`/frontend/src/config/theme.js`

## When to Update Theme

- Adding new brand colors
- Creating new component patterns
- Establishing new typography styles
- Adding status or state colors
