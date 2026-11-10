/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#0f172a',
    tint: '#2563eb',

    // Core surfaces
    background: '#f8fafc',
    foreground: '#0f172a',

    // Cards / elevated surfaces
    card: '#ffffff',
    cardForeground: '#0f172a',

    // Primary action color (buttons, links, active states)
    primary: '#2563eb',
    primaryForeground: '#f8fafc',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#f1f5f9',
    secondaryForeground: '#0f172a',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#f1f5f9',
    mutedForeground: '#64748b',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#7c3aed',
    accentForeground: '#f8fafc',

    // Destructive actions (delete, error states)
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#e2e8f0',
    input: '#e2e8f0',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 12,
};

export default colors;
