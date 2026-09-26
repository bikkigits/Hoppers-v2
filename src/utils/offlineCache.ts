/**
 * Offline Map & Pandal Data Caching Strategy for Hoppers Companion
 * 
 * Pre-caches OpenStreetMap tiles for key Kolkata Puja clusters (North, South, Central, Salt Lake, Howrah)
 * and verifies cache persistence across service workers and IndexedDB/CacheStorage.
 */

export const OSM_TILE_CACHE_NAME = 'osm-map-tiles-cache';
export const API_CACHE_NAME = 'api-data-cache';

// Convert lat/lng/zoom to OpenStreetMap tile X/Y indices
export function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number; z: number } {
  const n = Math.pow(2, zoom);
  const radLat = (lat * Math.PI) / 180;
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(((1 - Math.log(Math.tan(radLat) + 1 / Math.cos(radLat)) / Math.PI) / 2) * n);
  return { x, y, z: zoom };
}

export function tileToUrl(x: number, y: number, z: number, subdomain = 'a'): string {
  return `https://${subdomain}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
}

// Bounding boxes covering Greater Kolkata & all major Puja zones
const KOLKATA_PUJA_BOUNDS = [
  // Greater Kolkata Core (Zoom 11-13)
  { minLat: 22.46, maxLat: 22.65, minLng: 88.30, maxLng: 88.45, zooms: [11, 12, 13] },
  // North Kolkata Heritage Circuit (Bagbazar, Sovabazar, Kumartuli, Ahiritola)
  { minLat: 22.585, maxLat: 22.615, minLng: 88.35, maxLng: 88.38, zooms: [14, 15] },
  // Central Kolkata (College Square, Md Ali Park, Sealdah, Esplanade)
  { minLat: 22.555, maxLat: 22.585, minLng: 88.345, maxLng: 88.375, zooms: [14, 15] },
  // South Kolkata Iconic Hubs (Ekdalia, Singhi Park, Maddox Square, Mudiali, Suruchi)
  { minLat: 22.505, maxLat: 22.545, minLng: 88.335, maxLng: 88.375, zooms: [14, 15] },
  // East & Salt Lake / FD / BJ Block Corridor
  { minLat: 22.56, maxLat: 22.60, minLng: 88.40, maxLng: 88.43, zooms: [14, 15] },
];

export interface OfflineCacheStats {
  isSupported: boolean;
  cachedTilesCount: number;
  isReady: boolean;
  estimatedSizeMB: string;
}

/**
 * Get count and status of cached map tiles in CacheStorage
 */
export async function getOfflineCacheStats(): Promise<OfflineCacheStats> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return { isSupported: false, cachedTilesCount: 0, isReady: false, estimatedSizeMB: '0.0' };
  }

  try {
    const cache = await caches.open(OSM_TILE_CACHE_NAME);
    const keys = await cache.keys();
    const count = keys.length;
    // Average OSM tile size is ~18KB
    const estMb = ((count * 18) / 1024).toFixed(1);

    return {
      isSupported: true,
      cachedTilesCount: count,
      isReady: count >= 50,
      estimatedSizeMB: estMb,
    };
  } catch (err) {
    console.warn('Failed to inspect offline tile cache:', err);
    return { isSupported: true, cachedTilesCount: 0, isReady: false, estimatedSizeMB: '0.0' };
  }
}

/**
 * Pre-caches essential Kolkata map tiles for offline festival survival
 */
export async function precacheKolkataPujaTiles(
  onProgress?: (cached: number, total: number, percentage: number) => void
): Promise<{ success: boolean; cachedCount: number }> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return { success: false, cachedCount: 0 };
  }

  try {
    const tileUrls = new Set<string>();
    const subdomains = ['a', 'b', 'c'];
    let subIdx = 0;

    // Generate unique tile URLs across all defined bounding boxes
    for (const bound of KOLKATA_PUJA_BOUNDS) {
      for (const zoom of bound.zooms) {
        const p1 = latLngToTile(bound.maxLat, bound.minLng, zoom);
        const p2 = latLngToTile(bound.minLat, bound.maxLng, zoom);

        const minX = Math.min(p1.x, p2.x);
        const maxX = Math.max(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y);
        const maxY = Math.max(p1.y, p2.y);

        for (let x = minX; x <= maxX; x++) {
          for (let y = minY; y <= maxY; y++) {
            const sub = subdomains[subIdx % subdomains.length];
            subIdx++;
            tileUrls.add(tileToUrl(x, y, zoom, sub));
          }
        }
      }
    }

    const urlList = Array.from(tileUrls);
    const total = urlList.length;
    const cache = await caches.open(OSM_TILE_CACHE_NAME);

    let completed = 0;
    const batchSize = 12;

    for (let i = 0; i < total; i += batchSize) {
      const batch = urlList.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map(async (url) => {
          try {
            // Check if already in cache
            const existing = await cache.match(url);
            if (!existing) {
              const res = await fetch(url, { mode: 'cors' });
              if (res.ok) {
                await cache.put(url, res);
              }
            }
          } catch {
            // Continue on network timeout/throttle
          } finally {
            completed++;
            if (onProgress) {
              const pct = Math.round((completed / total) * 100);
              onProgress(completed, total, pct);
            }
          }
        })
      );
    }

    const stats = await getOfflineCacheStats();
    return { success: true, cachedCount: stats.cachedTilesCount };
  } catch (error) {
    console.error('Error precaching Kolkata Puja map tiles:', error);
    return { success: false, cachedCount: 0 };
  }
}

/**
 * Cache an arbitrary tile response automatically when requested by Leaflet
 */
export async function cacheTileRequest(url: string, response: Response): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const cache = await caches.open(OSM_TILE_CACHE_NAME);
    await cache.put(url, response.clone());
  } catch (e) {
    // Ignore quota warnings
  }
}

/**
 * Clear offline map tiles to reclaim storage
 */
export async function clearOfflineTileCache(): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;
  try {
    return await caches.delete(OSM_TILE_CACHE_NAME);
  } catch {
    return false;
  }
}
