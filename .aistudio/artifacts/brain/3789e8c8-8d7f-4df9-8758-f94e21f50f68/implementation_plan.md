# Implementation Plan: Ultra-Low Battery 'Power Save' Survival Mode

## 1. Why Power Save Mode is Different from the Theme Toggle

| Feature | Standard Dark/Light Theme Toggle | 🔋 Survival Power Save Mode |
| :--- | :--- | :--- |
| **Purpose** | Visual comfort & aesthetic preference | Maximum hardware battery conservation when phone is below 15% |
| **OLED Pixel Power** | Dark slate gray (`#0F172A` / `#0B0F19`) where OLED pixels remain lit | Pure true AMOLED `#000000` (physically turns off OLED subpixels) |
| **Map Rendering** | Full color or standard dark tiles | Grayscale high-contrast filtered tiles (`grayscale(100%) contrast(140%) brightness(70%)`) |
| **Animations & GPU** | Glowing neon radar sweeps, pulse rings, shimmer animations active | **All non-essential CSS keyframes & transitions disabled** (`* { animation: none !important }`) |
| **GPS & Sensor Polling** | Continuous high-accuracy GPS watch (`watchPosition`) | Throttled low-power GPS polling / on-demand location checks |
| **Crowd Sync API** | Regular background polling (every 15s) | Suspended or throttled to 90s interval to prevent wake-locks |
| **Survival HUD** | Standard multi-tab view | Condensed Emergency HUD highlighting nearest metro station, distance, and 1-tap SOS |

---

## 2. Proposed Changes & Implementation Steps

### Step 1: Power Save Context & State Management (`src/context/PowerSaveContext.tsx` or `src/hooks/usePowerSave.ts`)
- Track `isPowerSaveActive: boolean`.
- Listen for Web Battery API (`navigator.getBattery()`) if supported, with automatic low-battery (<15%) suggestion prompt.
- Persist user preference to `localStorage`.

### Step 2: Global Low-Power Styling & AMOLED Filter (`src/index.css`)
- Add `.power-save-active` utility class:
  - Background forced to pure `#000000`.
  - Disable all CSS keyframe loops (`pulse`, `spin`, `ping`, `shimmer`).
  - Grayscale & high-contrast filter applied to Leaflet map container:
    ```css
    .power-save-active .leaflet-tile-pane {
      filter: grayscale(100%) contrast(140%) brightness(65%) invert(100%) hue-rotate(180deg);
    }
    ```
  - High-contrast monochromatic marker outlines for effortless sunlight & night legibility.

### Step 3: Map Performance & Frame-Rate Optimization (`src/components/MapView.tsx`)
- When `isPowerSaveActive` is enabled:
  - Disable Leaflet zoom and tile fade animations (`fadeAnimation: false`).
  - Throttle marker re-rendering on zoom/pan events.
  - Dim non-essential background layers (e.g. decorative polyline glow effects).

### Step 4: UI Toggle & Quick Access Controls (`src/components/Header.tsx` & Floating HUD)
- Add a battery-saving toggle in the top bar / menu alongside battery indicator.
- Display a minimal, persistent Power Save status pill with one-tap toggle and quick battery level indicator.

---

## 3. Verification & Testing Plan
- Toggle Power Save Mode and verify immediate transition to pure `#000000` AMOLED styling.
- Confirm all animations cease and map tiles transition to high-contrast grayscale.
- Verify GPS location checks and background polling adjust to energy-saving mode.
- Ensure all critical survival features (SOS, Metro Router, Offline Pandals) remain 100% functional.
