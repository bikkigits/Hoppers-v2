import L from 'leaflet';
import { MetroLine } from '../types';

export type ZoomTier = 'city' | 'neighborhood' | 'street';

export interface StandardizedDimensions {
  zoomTier: ZoomTier;
  hitboxSize: number;
  iconSize: [number, number];
  iconAnchor: [number, number];
  popupAnchor: [number, number];
  tooltipAnchor: [number, number];
}

export interface MarkerDimensionSpec {
  visualSize: number;
  borderWidth: number;
  boxShadow: string;
}

/**
 * MapMarkerSizeHelper
 * Centralized utility that standardizes the `iconSize`, `iconAnchor`,
 * and visual dimensions for Leaflet markers based on the three defined zoom tiers:
 * - Tier 1: City Overview (zoom <= 12) -> 32px x 32px touch hitbox, [16, 16] anchor
 * - Tier 2: Neighborhood Level (zoom 13–15) -> 36px x 36px touch hitbox, [18, 18] anchor
 * - Tier 3: Street-Level Zoom (zoom >= 16) -> 44px x 44px touch hitbox, [22, 22] anchor
 *
 * Symmetrical anchor placement ([hitbox / 2, hitbox / 2]) prevents visual jumping
 * or coordinate drift during Leaflet zoom animations.
 */
export class MapMarkerSizeHelper {
  /**
   * Resolves the current zoom tier
   */
  public static getZoomTier(zoomLevel: number): ZoomTier {
    if (zoomLevel <= 12) return 'city';
    if (zoomLevel <= 15) return 'neighborhood';
    return 'street';
  }

  /**
   * Standardizes the iconSize and iconAnchor properties for Leaflet markers
   * based on the three defined zoom tiers.
   */
  public static getDimensions(zoomLevel: number): StandardizedDimensions {
    const tier = this.getZoomTier(zoomLevel);

    switch (tier) {
      case 'city': {
        const size = 32;
        const half = size / 2;
        return {
          zoomTier: 'city',
          hitboxSize: size,
          iconSize: [size, size],
          iconAnchor: [half, half],
          popupAnchor: [0, -half],
          tooltipAnchor: [0, -half],
        };
      }
      case 'neighborhood': {
        const size = 36;
        const half = size / 2;
        return {
          zoomTier: 'neighborhood',
          hitboxSize: size,
          iconSize: [size, size],
          iconAnchor: [half, half],
          popupAnchor: [0, -half],
          tooltipAnchor: [0, -half],
        };
      }
      case 'street':
      default: {
        const size = 44;
        const half = size / 2;
        return {
          zoomTier: 'street',
          hitboxSize: size,
          iconSize: [size, size],
          iconAnchor: [half, half],
          popupAnchor: [0, -half],
          tooltipAnchor: [0, -half],
        };
      }
    }
  }

  /**
   * Computes the visual diameter for a marker category within a zoom tier.
   */
  public static getVisualSpec(
    category: string,
    zoomLevel: number,
    options: { isFeatured?: boolean; isVisited?: boolean } = {}
  ): MarkerDimensionSpec {
    const tier = this.getZoomTier(zoomLevel);
    const { isFeatured = false, isVisited = false } = options;

    if (tier === 'city') {
      // Tier 1 (zoom <= 12): Micro-dots (6.5px–10px) with high-contrast borders & glow
      let visualSize = 7;
      let borderWidth = 1.5;

      if (category === 'metro-interchange') {
        visualSize = 9.5;
        borderWidth = 2;
      } else if (category === 'metro-station') {
        visualSize = 6.5;
        borderWidth = 1.5;
      } else if (category === 'pandal') {
        visualSize = isFeatured ? 8 : 6.5;
        borderWidth = 1.5;
      } else if (category === 'trail-stop') {
        visualSize = 9;
        borderWidth = 1.5;
      }

      return {
        visualSize,
        borderWidth,
        boxShadow: '0 0 6px rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.8)',
      };
    }

    if (tier === 'neighborhood') {
      // Tier 2 (zoom 13–15): Compact glyphs (11px–18px)
      let visualSize = 14;
      let borderWidth = 2;

      if (category === 'metro-interchange') {
        visualSize = 18;
      } else if (category === 'metro-station') {
        visualSize = 11;
      } else if (category === 'pandal') {
        visualSize = isFeatured ? 18 : isVisited ? 16 : 14;
      } else if (category === 'trail-stop') {
        visualSize = 18;
      }

      return {
        visualSize,
        borderWidth,
        boxShadow: '0 2px 8px rgba(0,0,0,0.7)',
      };
    }

    // Tier 3 (zoom >= 16): Street-Level (24px–38px) with full SVGs and elevation shadows
    let visualSize = 30;
    const borderWidth = 2.5;

    if (category === 'metro-interchange') {
      visualSize = 26;
    } else if (category === 'metro-station') {
      visualSize = 13;
    } else if (category === 'pandal') {
      visualSize = isFeatured ? 38 : isVisited ? 34 : 32;
    } else if (category === 'trail-stop') {
      visualSize = 28;
    } else if (category === 'helpdesk' || category === 'railway') {
      visualSize = 32;
    }

    return {
      visualSize,
      borderWidth,
      boxShadow: '0 4px 14px rgba(0,0,0,0.7), 0 0 10px rgba(255,255,255,0.15)',
    };
  }

  /**
   * Generates standardized Leaflet DivIcon options that guarantee anchor symmetry
   */
  public static getStandardDivIconOptions(
    html: string,
    zoomLevel: number,
    className: string
  ): L.DivIconOptions {
    const dim = this.getDimensions(zoomLevel);
    return {
      className: `${className} tier-${dim.zoomTier}`,
      html,
      iconSize: dim.iconSize,
      iconAnchor: dim.iconAnchor,
      popupAnchor: dim.popupAnchor,
    };
  }
}
