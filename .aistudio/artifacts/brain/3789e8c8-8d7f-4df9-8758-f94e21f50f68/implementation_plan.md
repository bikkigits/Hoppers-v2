# Implementation Plan: Map UX Refinement, Metro Transit Tracks, and Crowd Sync

Based on the end-to-end video analysis of **Hoppers (Offline Durga Puja Companion)**, this plan outlines the architectural improvements to resolve visual clutter, enhance metro transit visualization, and ensure seamless offline crowd reporting.

---

## 1. Map Density & Zoom-Adaptive Pin Clustering
### Problem
When zoomed out to city level, rendering all 724 pandals produces an overlapping carpet of icons, obscuring streets, landmarks, and zones.

### Proposed Solution
* **Grid/Distance-Based Dynamic Clustering**:
  * At zoom levels `< 14`, group closely-situated pandals into neighborhood clusters with distinctive glowing badge counts (*e.g., "Sovabazar (18)", "Gariahat (24)", "Salt Lake (15)"*).
  * Clicking a cluster smoothly zooms in and expands into individual pins.
  * Curated & Award-Winning Featured Pandals (*110 showcase pandals*) remain visible as priority hero pins.
* **Marker Size Optimization**:
  * Scale marker pin dimensions dynamically: 22px at low zoom, 32px at medium zoom, 40px at street level.

---

## 2. 5-Line Metro Transit System Overlay & Interchange Nodes
### Problem
Currently, selecting the Metro filter displays identical 32px blue circular pins that overlap heavily and fail to show which lines connect which stations.

### Proposed Solution
* **Station-to-Station Track Polylines**:
  * Render styled transit tracks connecting all stations across all 5 operational & priority lines:
    1. **Line 1 (Blue Line - North-South)**: `#2563EB` (Dakshineswar ↔ Kavi Subhash, 26 stations).
    2. **Line 2 (Green Line - East-West)**: `#10B981` (Howrah Maidan ↔ Salt Lake Sector V, 12 stations including underwater river tunnel).
    3. **Line 3 (Purple Line - Joka)**: `#9333EA` (Joka ↔ Majerhat, 7 stations).
    4. **Line 6 (Orange Line - EM Bypass)**: `#F97316` (Kavi Subhash ↔ Beleghata, 9 stations).
    5. **Line 4 (Yellow Line - Airport)**: `#EAB308` (Noapara ↔ Jai Hind Airport, 4 stations).
  * Double-layer casing (outer contrasting glow + inner core line) for crisp visibility in both Light and Dark themes.
* **Sleek Station Dots**:
  * Standard stations: Compact 14px circular nodes with line-colored border and white center.
  * **Interchange Stations**: Prominent 22px double-ring nodes with transfer icon `⇄` for **Esplanade** (Blue ↔ Green), **Noapara** (Blue ↔ Yellow), **Kavi Subhash** (Blue ↔ Orange), and **Salt Lake Sector V** (Green ↔ Orange).
  * Tapping any station or interchange opens gate-specific exit advice and immediate walking distance to nearby pujas.

---

## 3. Offline Crowd Reporting Engine with P2P/Mesh Sync & Time-Decay
### Problem
Devotees need accurate crowd wait times, but purely local `localStorage` without synchronization limits awareness across multiple visitors.

### Proposed Solution
* **Time-Decayed Freshness Weighting**:
  * Reports older than 90 minutes automatically decay.
  * Recent reports (< 20 mins) receive highest visual weighting with a pulsing `⚡ Live` indicator and timestamp countdown (*"Updated 6m ago"*).
* **BroadcastChannel & Background P2P Synchronization**:
  * Uses Web `BroadcastChannel` API and service worker sync cache for immediate multi-tab and nearby device message exchange.
  * Queues local submissions and aggregates weighted consensus scores based on on-site GPS verification tags.

---

## 4. Mobile Viewport & Theme Optimization
* **Collapsible Filter Bar**:
  * Auto-collapse secondary filter rows on drag/pan to maximize interactive map canvas on mobile devices.
* **Synchronized Light/Dark Leaflet Tiles**:
  * Synchronize base map raster tiles when switching between Dark Mode and Light Mode for optimal sunlight legibility.

---

## Verification & Testing Plan
* **Visual Verification**: Check high-zoom-out city overview for clean cluster badges with no pin overlap.
* **Transit Verification**: Test each of the 5 metro line tracks and ensure interchange nodes (Esplanade, Noapara, Kavi Subhash) display dual connections.
* **Route Verification**: Verify Trail Builder recalculation across multiple sequential stops.
* **Build Verification**: Run `compile_applet` and test in dark & light themes.
