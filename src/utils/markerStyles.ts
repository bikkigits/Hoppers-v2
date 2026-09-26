import L from 'leaflet';
import { MetroLine } from '../types';
import {
  MapMarkerSizeHelper,
  ZoomTier,
  StandardizedDimensions,
} from './MapMarkerSizeHelper';

export { MapMarkerSizeHelper, type ZoomTier, type StandardizedDimensions };

export type MarkerCategory =
  | 'pandal'
  | 'metro-station'
  | 'metro-interchange'
  | 'police'
  | 'helpdesk'
  | 'toilet'
  | 'railway'
  | 'food'
  | 'ferry'
  | 'medical'
  | 'pharmacy'
  | 'parking'
  | 'atm'
  | 'landmark'
  | 'hotel'
  | 'petrol'
  | 'trail-stop';

export interface MarkerStyleOptions {
  isVisited?: boolean;
  isFeatured?: boolean;
  isCommunity?: boolean;
  metroLines?: MetroLine[];
  metroColor?: string;
  stopNumber?: number;
  isTrailStart?: boolean;
  isTrailEnd?: boolean;
  customBadge?: string;
  glow?: boolean;
}

export interface ComputedMarkerStyle {
  visualSize: number;
  hitboxSize: number;
  iconSize: [number, number];
  iconAnchor: [number, number];
  popupAnchor: [number, number];
  bgColor: string;
  borderColor: string;
  borderWidth: number;
  boxShadow: string;
  iconSvg: string;
  badgeHtml: string;
  zoomTier: ZoomTier;
}

/**
 * Dynamically computes visual dimensions, touch hitbox, border width,
 * box-shadow glow, icons, and status badges based on the map's current zoom level.
 */
export function getMarkerSizeAndStyle(
  category: MarkerCategory,
  zoomLevel: number,
  options: MarkerStyleOptions = {}
): ComputedMarkerStyle {
  const {
    isVisited = false,
    isFeatured = false,
    isCommunity = false,
    metroLines = ['blue'],
    metroColor,
    stopNumber,
    isTrailStart = false,
    isTrailEnd = false,
  } = options;

  const dim = MapMarkerSizeHelper.getDimensions(zoomLevel);
  const visualSpec = MapMarkerSizeHelper.getVisualSpec(category, zoomLevel, {
    isFeatured,
    isVisited,
  });

  const zoomTier = dim.zoomTier;
  const visualSize = visualSpec.visualSize;
  const hitboxSize = dim.hitboxSize;
  const borderWidth = visualSpec.borderWidth;
  const boxShadow = visualSpec.boxShadow;

  // Base Category Color Palette
  let bgColor = '#1E293B';
  let borderColor = '#FFB300';
  let iconColor = '#FFFFFF';

  switch (category) {
    case 'pandal':
      if (isVisited) {
        bgColor = '#059669';
        borderColor = '#34D399';
        iconColor = '#FFFFFF';
      } else if (isFeatured) {
        bgColor = '#D97706';
        borderColor = '#FEF3C7';
        iconColor = '#FEF3C7';
      } else if (isCommunity) {
        bgColor = '#7C3AED';
        borderColor = '#C4B5FD';
        iconColor = '#FFFFFF';
      } else {
        bgColor = '#1E293B';
        borderColor = '#FFB300';
        iconColor = '#FFB300';
      }
      break;
    case 'police':
      bgColor = '#EF4444';
      borderColor = '#FEE2E2';
      iconColor = '#FFFFFF';
      break;
    case 'helpdesk':
      bgColor = '#F59E0B';
      borderColor = '#FEF3C7';
      iconColor = '#0F172A';
      break;
    case 'toilet':
      bgColor = '#10B981';
      borderColor = '#D1FAE5';
      iconColor = '#FFFFFF';
      break;
    case 'railway':
      bgColor = '#7C3AED';
      borderColor = '#EDE9FE';
      iconColor = '#FFFFFF';
      break;
    case 'food':
      bgColor = '#F97316';
      borderColor = '#FFEDD5';
      iconColor = '#FFFFFF';
      break;
    case 'ferry':
      bgColor = '#06B6D4';
      borderColor = '#E0F2FE';
      iconColor = '#FFFFFF';
      break;
    case 'medical':
      bgColor = '#E11D48';
      borderColor = '#FFE4E6';
      iconColor = '#FFFFFF';
      break;
    case 'pharmacy':
      bgColor = '#059669';
      borderColor = '#A7F3D0';
      iconColor = '#FFFFFF';
      break;
    case 'parking':
      bgColor = '#0284C7';
      borderColor = '#BAE6FD';
      iconColor = '#FFFFFF';
      break;
    case 'atm':
      bgColor = '#0D9488';
      borderColor = '#CCFBF1';
      iconColor = '#FFFFFF';
      break;
    case 'landmark':
      bgColor = '#CA8A04';
      borderColor = '#FEF08A';
      iconColor = '#FFFFFF';
      break;
    case 'hotel':
      bgColor = '#D97706';
      borderColor = '#FDE68A';
      iconColor = '#FFFFFF';
      break;
    case 'petrol':
      bgColor = '#DC2626';
      borderColor = '#FECACA';
      iconColor = '#FFFFFF';
      break;
    case 'trail-stop':
      bgColor = isTrailStart ? '#10B981' : isTrailEnd ? '#E11D48' : '#F59E0B';
      borderColor = '#FFFFFF';
      iconColor = '#020617';
      break;
    case 'metro-station':
      bgColor = metroColor || '#2563EB';
      borderColor = '#FFFFFF';
      iconColor = '#FFFFFF';
      break;
    case 'metro-interchange':
      bgColor = '#0F172A';
      borderColor = '#FFFFFF';
      iconColor = '#FFFFFF';
      break;
  }

  // Category SVG Icon Generation tailored to zoom tier
  let iconSvg = '';
  let badgeHtml = '';

  if (zoomTier === 'city') {
    // Micro-dots: no internal SVG needed, pure clean luminous dot
    iconSvg = '';
  } else if (zoomTier === 'neighborhood') {
    // Compact glyphs
    const iconDim = Math.max(8, visualSize - 6);
    if (category === 'pandal') {
      iconSvg = `<svg width="${iconDim}" height="${iconDim}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="22" x2="21" y2="22"/>
        <line x1="6" y1="18" x2="6" y2="11"/>
        <line x1="18" y1="18" x2="18" y2="11"/>
        <polygon points="12 2 20 7 4 7" fill="${iconColor}" fill-opacity="0.3"/>
      </svg>`;
    } else if (category === 'police') {
      iconSvg = `<svg width="${iconDim}" height="${iconDim}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    } else if (category === 'helpdesk') {
      iconSvg = `<svg width="${iconDim}" height="${iconDim}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`;
    } else if (category === 'toilet') {
      iconSvg = `<svg width="${iconDim}" height="${iconDim}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/></svg>`;
    } else if (category === 'food') {
      iconSvg = `<svg width="${iconDim}" height="${iconDim}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v20M2 6h8a4 4 0 0 1 4 4v12M6 2v4"/></svg>`;
    } else if (category === 'trail-stop' && stopNumber !== undefined) {
      iconSvg = `<span style="font-size: 10px; font-weight: 900; color: #020617; line-height: 1;">${stopNumber}</span>`;
    } else if (category === 'metro-interchange') {
      iconSvg = `<span style="font-size: 8px; font-weight: 900; color: #FFFFFF; line-height: 1;">⇄</span>`;
    }
  } else {
    // Street Level (zoom >= 16): Full detailed SVG iconography
    const iconDim = Math.max(14, visualSize - 12);

    if (category === 'pandal') {
      iconSvg = `<svg width="${iconDim}" height="${iconDim}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="22" x2="21" y2="22"/>
        <line x1="6" y1="18" x2="6" y2="11"/>
        <line x1="10" y1="18" x2="10" y2="11"/>
        <line x1="14" y1="18" x2="14" y2="11"/>
        <line x1="18" y1="18" x2="18" y2="11"/>
        <polygon points="12 2 20 7 4 7" fill="${iconColor}" fill-opacity="${isFeatured ? 0.4 : 0.25}"/>
        <line x1="2" y1="11" x2="22" y2="11"/>
      </svg>`;

      if (isVisited) {
        badgeHtml = `
          <div style="position: absolute; top: -3px; right: -3px; width: 14px; height: 14px; border-radius: 9999px; background-color: #10B981; border: 1.5px solid #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #FFFFFF; font-weight: 900; box-shadow: 0 1px 3px rgba(0,0,0,0.5);">
            ✓
          </div>
        `;
      } else if (isFeatured) {
        badgeHtml = `
          <div style="position: absolute; top: -3px; right: -3px; width: 14px; height: 14px; border-radius: 9999px; background-color: #EF4444; border: 1.5px solid #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #FFFFFF; font-weight: 900; box-shadow: 0 1px 3px rgba(0,0,0,0.5);">
            ★
          </div>
        `;
      }
    } else if (category === 'police') {
      iconSvg = `<svg width="${iconDim}" height="${iconDim}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    } else if (category === 'helpdesk') {
      iconSvg = `<svg width="${iconDim}" height="${iconDim}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24"/></svg>`;
    } else if (category === 'toilet') {
      iconSvg = `<svg width="${iconDim}" height="${iconDim}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h6a3 3 0 0 1 3 3v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a3 3 0 0 1 3-3z"/><circle cx="12" cy="3" r="1"/></svg>`;
    } else if (category === 'railway') {
      iconSvg = `<svg width="${iconDim}" height="${iconDim}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="15" rx="3"/><path d="M3 10h18"/><circle cx="8" cy="14" r="1.5" fill="#FFF"/><circle cx="16" cy="14" r="1.5" fill="#FFF"/><path d="m7 21-2 2"/><path d="m17 21 2 2"/></svg>`;
    } else if (category === 'food') {
      iconSvg = `<svg width="${iconDim}" height="${iconDim}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v20M2 6h8a4 4 0 0 1 4 4v12M6 2v4"/></svg>`;
    } else if (category === 'ferry') {
      iconSvg = `<svg width="${iconDim}" height="${iconDim}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v4"/></svg>`;
    } else if (category === 'medical') {
      iconSvg = `<svg width="${iconDim}" height="${iconDim}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`;
    } else if (category === 'pharmacy') {
      iconSvg = `<svg width="${iconDim}" height="${iconDim}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v12M6 12h12"/></svg>`;
    } else if (category === 'parking') {
      iconSvg = `<svg width="${iconDim}" height="${iconDim}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`;
    } else if (category === 'atm') {
      iconSvg = `<svg width="${iconDim}" height="${iconDim}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>`;
    } else if (category === 'landmark') {
      iconSvg = `<svg width="${iconDim}" height="${iconDim}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2 10h20L12 3z"/></svg>`;
    } else if (category === 'hotel') {
      iconSvg = `<svg width="${iconDim}" height="${iconDim}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/></svg>`;
    } else if (category === 'petrol') {
      iconSvg = `<svg width="${iconDim}" height="${iconDim}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v17M3 11h10M13 8l3 3v8a2 2 0 0 0 4 0v-7a3 3 0 0 0-3-3h-4"/></svg>`;
    } else if (category === 'trail-stop' && stopNumber !== undefined) {
      iconSvg = `<span style="font-size: 13px; font-weight: 900; color: #020617; line-height: 1;">${stopNumber}</span>`;
    } else if (category === 'metro-interchange') {
      iconSvg = `<span style="font-size: 10px; font-weight: 900; color: #FFFFFF; line-height: 1;">⇄</span>`;
    }
  }

  return {
    visualSize,
    hitboxSize,
    iconSize: dim.iconSize,
    iconAnchor: dim.iconAnchor,
    popupAnchor: dim.popupAnchor,
    bgColor,
    borderColor,
    borderWidth,
    boxShadow,
    iconSvg,
    badgeHtml,
    zoomTier,
  };
}

/**
 * Returns an optimized Leaflet L.DivIcon configured with smooth CSS transition scaling,
 * accessible tap targets, and zoom-tier specific styling with zero jumping during zoom transitions.
 */
export function createDynamicMarkerIcon(
  category: MarkerCategory,
  zoomLevel: number,
  options: MarkerStyleOptions = {}
): L.DivIcon {
  const style = getMarkerSizeAndStyle(category, zoomLevel, options);

  // Special rendering for Metro Interchange Hubs with multi-line concentric gradient
  if (category === 'metro-interchange') {
    const lines = options.metroLines || ['blue', 'green'];
    const lineColors = lines.map((l) => {
      if (l === 'blue') return '#2563EB';
      if (l === 'green') return '#10B981';
      if (l === 'orange') return '#F97316';
      if (l === 'purple') return '#9333EA';
      return '#EAB308';
    });

    const color1 = lineColors[0] || '#2563EB';
    const color2 = lineColors[1] || color1;

    const outerSize = style.visualSize;
    const padding = style.zoomTier === 'city' ? 1.5 : style.zoomTier === 'neighborhood' ? 2 : 2.5;

    const html = `
      <div style="
        width: ${style.hitboxSize}px;
        height: ${style.hitboxSize}px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: relative;
      ">
        <div style="
          width: ${outerSize}px;
          height: ${outerSize}px;
          border-radius: 50%;
          background: conic-gradient(${color1} 0deg 180deg, ${color2} 180deg 360deg);
          padding: ${padding}px;
          box-shadow: ${style.boxShadow};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        ">
          <div style="
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #0F172A;
            border: ${style.borderWidth * 0.7}px solid #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;
          ">
            ${style.iconSvg}
          </div>
        </div>
      </div>
    `;

    return L.divIcon({
      className: `dynamic-marker-interchange tier-${style.zoomTier}`,
      html,
      iconSize: style.iconSize,
      iconAnchor: style.iconAnchor,
      popupAnchor: style.popupAnchor,
    });
  }

  // General Dynamic Marker HTML Structure
  const html = `
    <div style="
      width: ${style.hitboxSize}px;
      height: ${style.hitboxSize}px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
    ">
      <div style="
        position: relative;
        width: ${style.visualSize}px;
        height: ${style.visualSize}px;
        background-color: ${style.bgColor};
        border: ${style.borderWidth}px solid ${style.borderColor};
        border-radius: 9999px;
        box-shadow: ${style.boxShadow};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      ">
        ${style.iconSvg}
        ${style.badgeHtml}
      </div>
    </div>
  `;

  return L.divIcon({
    className: `dynamic-marker-${category} tier-${style.zoomTier}`,
    html,
    iconSize: style.iconSize,
    iconAnchor: style.iconAnchor,
    popupAnchor: style.popupAnchor,
  });
}
