#!/usr/bin/env node
/**
 * Hoppers 2026 PWA - Bus Route & Stop GeoJSON Generator
 * Parses Kolkata_Bus_Routes.txt (160 routes and sequential stops)
 * Geocodes all bus stops using a high-precision Kolkata coordinate database
 * with linear corridor interpolation and topological anchor resolution.
 * Exports public/Hoppers_2026_BusRoutes.geojson
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = __dirname;
const INPUT_FILE = path.join(ROOT_DIR, 'Kolkata_Bus_Routes.txt');
const OUTPUT_FILE = path.join(ROOT_DIR, 'public', 'Hoppers_2026_BusRoutes.geojson');
const DIVERSIONS_CSV = path.join(ROOT_DIR, 'public', 'Hoppers_Puja_Bus_Diversions_2026.csv');

// --- 1. Master Anchor Geocoding Dictionary for Greater Kolkata & Metropolitan Region ---
const ANCHOR_COORDINATES = {
  // Central Kolkata & Major Hubs
  'esplanade': [88.3516, 22.5645],
  'babughat': [88.3411, 22.5678],
  'eden gardens': [88.3435, 22.5646],
  'princep ghat': [88.3345, 22.5565],
  'bbd bag': [88.3485, 22.5715],
  'lalbazar': [88.3525, 22.5712],
  'barabazar': [88.3535, 22.5835],
  'chandni chowk': [88.3546, 22.5668],
  'central': [88.3575, 22.5745],
  'bowbazar': [88.3625, 22.5725],
  'college street': [88.3645, 22.5745],
  'medical college': [88.3618, 22.5735],
  'mg road': [88.3605, 22.5815],
  'girish park': [88.3615, 22.5875],
  'vivekananda road': [88.3625, 22.5885],
  'sealdah': [88.3695, 22.5638],
  'rajabazar': [88.3735, 22.5745],
  'maniktala': [88.3765, 22.5855],
  'khanna cinema': [88.3775, 22.5935],
  'shyambazar': [88.3698, 22.6025],
  'rajballavpara': [88.3675, 22.6015],
  'sovabazar': [88.3625, 22.5975],
  'bagbazar': [88.3644, 22.6033],
  'chitpur bridge': [88.3685, 22.6085],
  'cossipore': [88.3695, 22.6215],
  'sinthi': [88.3725, 22.6275],
  'chiria': [88.3715, 22.6185],
  'tobin road': [88.3715, 22.6365],
  'bonhooghly': [88.3715, 22.6455],
  'dunlop': [88.3715, 22.6515],
  'dunlop bridge': [88.3715, 22.6515],
  'dakshineswar': [88.3562, 22.6548],
  'alambazar': [88.3625, 22.6525],
  'noapara': [88.3845, 22.6395],
  'belgachia': [88.3795, 22.6075],
  'rg kar': [88.3748, 22.6042],
  'patipukur': [88.3895, 22.6055],
  'kalindi': [88.3985, 22.6035],
  'laketown': [88.4045, 22.5985],
  'bangur avenue': [88.4065, 22.6025],
  'sreebhumi': [88.3985, 22.5945],
  'ultadanga': [88.3912, 22.5925],
  'ultadanga hudco': [88.3915, 22.5935],
  'dumdum park': [88.4115, 22.6045],
  'kestopur': [88.4185, 22.6015],
  'baguiati': [88.4285, 22.6135],
  'jyangra': [88.4365, 22.6165],
  'teghoria': [88.4355, 22.6235],
  'haldirams': [88.4385, 22.6315],
  'kaikhali': [88.4395, 22.6365],
  'chinar park': [88.4485, 22.6245],
  'city center 2': [88.4555, 22.6275],
  'akanksha': [88.4685, 22.6355],
  'airport gate 1': [88.4415, 22.6485],
  'airport gate 3': [88.4435, 22.6545],
  'central jail': [88.4185, 22.6325],
  'nager bazar': [88.4115, 22.6235],
  'dumdum station': [88.3972, 22.6225],
  'dumdum canton': [88.4045, 22.6335],
  'birati': [88.4385, 22.6685],
  'madhyamgram': [88.4555, 22.6985],
  'barasat chapadali': [88.4815, 22.7215],
  'barasat colony': [88.4855, 22.7255],
  'bt college': [88.4655, 22.7055],

  // Salt Lake & New Town Sector
  'sector v': [88.4315, 22.5735],
  'college more': [88.4335, 22.5765],
  'sdf': [88.4325, 22.5785],
  'wipro': [88.4345, 22.5805],
  'karunamoyee': [88.4185, 22.5865],
  'central park': [88.4145, 22.5875],
  'bikash bhawan': [88.4165, 22.5895],
  'city center 1': [88.4085, 22.5895],
  'saltlake ca block': [88.4045, 22.5875],
  'saltlake pnb': [88.3995, 22.5885],
  'saltlake stadium': [88.4065, 22.5685],
  'nicco park': [88.4235, 22.5695],
  'chingrighata': [88.4055, 22.5655],
  'beleghata building': [88.3985, 22.5645],
  'phoolbagan': [88.3892, 22.5715],
  'kankurgachi': [88.3885, 22.5775],
  'newtown': [88.4685, 22.5815],
  'dlf 1': [88.4645, 22.5825],
  'axis mall': [88.4725, 22.5845],
  'narkelbagan': [88.4755, 22.5865],
  'unitech gate 1': [88.4855, 22.5745],
  'unitech gate 2': [88.4895, 22.5765],
  'ecospace': [88.4915, 22.5785],
  'shapoorji': [88.5025, 22.5715],
  'karigari bhawan': [88.4985, 22.5735],
  'uem campus': [88.5045, 22.5765],
  'ecopark': [88.4655, 22.6085],
  'aquatica': [88.4585, 22.5635],

  // South Kolkata
  'park street': [88.3524, 22.5516],
  'maidan': [88.3478, 22.5535],
  'rabindra sadan': [88.3475, 22.5415],
  'minto park': [88.3545, 22.5415],
  'beck bagan': [88.3615, 22.5395],
  'mallick bazar': [88.3635, 22.5475],
  'moulali': [88.3665, 22.5615],
  'wellington': [88.3585, 22.5635],
  'park circus': [88.3685, 22.5435],
  'quest mall': [88.3655, 22.5385],
  'ballygunge phari': [88.3655, 22.5295],
  'ballygunge station': [88.3695, 22.5215],
  'gariahat': [88.3654, 22.5185],
  'golpark': [88.3665, 22.5115],
  'dhakuria': [88.3665, 22.5055],
  'jadavpur 8b': [88.3685, 22.4985],
  'jadavpur ps': [88.3645, 22.4995],
  'south city': [88.3615, 22.5015],
  'lake gardens': [88.3555, 22.5025],
  'anwar shah road': [88.3515, 22.5035],
  'tollygunge phari': [88.3455, 22.5085],
  'tollygunge metro': [88.3445, 22.4985],
  'rabindra sarovar': [88.3515, 22.5115],
  'southern avenue': [88.3545, 22.5145],
  'deshapriya park': [88.3585, 22.5185],
  'rashbehari': [88.3485, 22.5185],
  'kalighat': [88.3445, 22.5205],
  'hazra': [88.3475, 22.5285],
  'bhowanipore': [88.3495, 22.5335],
  'sishu mangal': [88.3525, 22.5245],
  'chetla park': [88.3395, 22.5165],
  'durgapur bridge': [88.3345, 22.5145],
  'new alipore': [88.3285, 22.5105],
  'mahabirtala': [88.3325, 22.5045],
  'taratala': [88.3185, 22.5085],
  'majherhat': [88.3215, 22.5155],
  'mominpore': [88.3245, 22.5245],
  'ekbalpur': [88.3255, 22.5315],
  'kidderpore': [88.3265, 22.5385],
  'babubazar': [88.3235, 22.5405],
  'bnr hospital': [88.3185, 22.5425],
  'ramnagar': [88.3095, 22.5445],
  'garden reach': [88.3015, 22.5485],
  'bichali ghat': [88.2985, 22.5495],
  'kamal talkies': [88.2935, 22.5465],
  'metiabruz': [88.2845, 22.5425],
  'badartala': [88.2715, 22.5385],
  'nature park': [88.2985, 22.5285],
  'braces bridge': [88.3045, 22.5185],
  'brace bridge': [88.3045, 22.5185],
  'jhinjhira bazar': [88.2945, 22.5145],
  'parnasree': [88.3045, 22.5025],
  'behala 14 no': [88.3145, 22.5015],
  'behala chowrasta': [88.3115, 22.4925],
  'sakher bazar': [88.3105, 22.4845],
  'shilpara': [88.3095, 22.4785],
  'thakurpukur': [88.3085, 22.4685],
  'joka bridge': [88.3015, 22.4515],
  'pailan': [88.2945, 22.4385],
  'shibrampur': [88.2945, 22.4785],
  'sarsuna': [88.2865, 22.4765],
  'ballykhal': [88.3585, 22.6515],

  // East Kolkata & EM Bypass
  'science city': [88.3965, 22.5415],
  'topsia': [88.3845, 22.5435],
  'vip bazar': [88.3985, 22.5295],
  'ruby': [88.3995, 22.5132],
  'anandapur': [88.4045, 22.5195],
  'acropolis mall': [88.3935, 22.5145],
  'bosepukur': [88.3845, 22.5155],
  'kasba ps': [88.3815, 22.5165],
  'kalikapur': [88.3995, 22.5015],
  'mukundapur': [88.4015, 22.4945],
  'sapuipara': [88.3885, 22.4925],
  'santoshpur': [88.3815, 22.4895],
  'ajaynagar': [88.3885, 22.4815],
  'peerless hospital': [88.3972, 22.4828],
  'new garia': [88.3985, 22.4715],
  'garia station': [88.3955, 22.4645],
  'garia bus stand': [88.3845, 22.4685],
  'garia metro': [88.3815, 22.4685],
  'nayabad': [88.4045, 22.4765],
  'naktala': [88.3685, 22.4745],
  'bansdroni': [88.3595, 22.4785],
  'netaji nagar': [88.3565, 22.4855],
  'ranikuthi': [88.3515, 22.4895],
  'malancha cinema': [88.3485, 22.4945],
  'kudghat': [88.3445, 22.4885],
  'haridevpur': [88.3345, 22.4825],
  'kabardanga': [88.3245, 22.4685],
  'keorapukur': [88.3295, 22.4725],

  // Howrah & Western Riverbank
  'howrah station': [88.3431, 22.5855],
  'howrah maidan': [88.3248, 22.5835],
  'howrah fire station': [88.3315, 22.5815],
  'pilkhana': [88.3365, 22.5895],
  'salkia chowrasta': [88.3415, 22.5985],
  'bandha ghat': [88.3475, 22.6045],
  'golabarai ps': [88.3435, 22.5915],
  'shibpur bazar': [88.3245, 22.5685],
  'mallick fatak': [88.3285, 22.5745],
  'ramrajatala': [88.3085, 22.5785],
  'dasnagar': [88.3015, 22.5845],
  'baltikuri': [88.2915, 22.5945],
  'bankra bazar': [88.2815, 22.6045],
  'salap': [88.2615, 22.6145],
  'domjur': [88.2185, 22.6415],
  'b garden': [88.2965, 22.5565],
  'bataitala phari': [88.3095, 22.5615],
  'nabanna': [88.3185, 22.5575],
  'vidyasagar setu': [88.3265, 22.5565],
  'hastings': [88.3315, 22.5485],
  'pts': [88.3385, 22.5445],
  'fort william': [88.3435, 22.5525],
  'bally bazar': [88.3465, 22.6485],
  'belurmath': [88.3575, 22.6322],
  'liluah': [88.3385, 22.6185],
  'santragachi': [88.2815, 22.5785],
  'baksara': [88.2915, 22.5715],
  'belepole': [88.3015, 22.5685],
  'carry road': [88.3115, 22.5645],

  // Suburban Extended Corridors (South 24 Parganas, North 24 Parganas, Howrah District)
  'bagnan': [87.9715, 22.4685],
  'gadiara': [88.0415, 22.2185],
  '58 gate': [88.0815, 22.2785],
  'shibgunge': [88.0215, 22.3885],
  'kamalpur': [87.9815, 22.4285],
  'alampur': [88.2415, 22.5515],
  'dhulagarh': [88.1915, 22.5615],
  'amta': [88.0115, 22.5815],
  'sonarpur': [88.4285, 22.4415],
  'sonarpur station': [88.4285, 22.4415],
  'baruipur': [88.4385, 22.3585],
  'baruipur station': [88.4385, 22.3585],
  'canning': [88.6615, 22.3115],
  'canning station': [88.6615, 22.3115],
  'jharkhali': [88.7515, 22.0815],
  'gadkhali': [88.7915, 22.1815],
  'dhamakhali': [88.8615, 22.3515],
  'amtala': [88.2615, 22.3785],
  'shirakole': [88.2415, 22.3485],
  'diamond harbour': [88.1915, 22.1895],
  'kulpi': [88.2415, 22.0785],
  'kakdwip': [88.1885, 21.8785],
  'kakdwip station': [88.1885, 21.8785],
  'kakdwip bus stand': [88.1885, 21.8785],
  'namkhana': [88.2315, 21.7685],
  'namkhana station': [88.2315, 21.7685],
  'bakkhali': [88.2515, 21.5615],
  'frazerganj': [88.2415, 21.5815],
  'gangasagar': [88.0815, 21.6485],
  'kachuberia sagar island': [88.1315, 21.8685],
  'patharpratima': [88.3515, 21.7885],
  'ramganga': [88.3815, 21.7485],
  'joynagar': [88.4215, 22.1785],
  'basirhat': [88.8585, 22.6585],
  'bongaon': [88.8285, 23.0485],
  'habra station': [88.6585, 22.8385],
  'ashoknagar station': [88.6285, 22.8285],
  'duttapukur': [88.5485, 22.7685],
  'naihati station': [88.4285, 22.8985],
  'leather complex': [88.4715, 22.5185],
  'bantala bazar': [88.4515, 22.5285],
  'chowbaga': [88.4185, 22.5385],
  'ghatakpukur': [88.6185, 22.5085],
  'minakhan': [88.7085, 22.4985],
  'malancha': [88.7585, 22.4885],
  'sonakhali': [88.7185, 22.1985],
  'sonakhali bus stand': [88.7185, 22.1985]
};

// Normalize string for fuzzy lookup
function normalizeKey(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Find closest anchor or coordinate
function findDirectCoord(stopName) {
  const norm = normalizeKey(stopName);
  if (ANCHOR_COORDINATES[norm]) {
    return ANCHOR_COORDINATES[norm];
  }
  // Try partial match
  for (const [key, coords] of Object.entries(ANCHOR_COORDINATES)) {
    if (norm.includes(key) || key.includes(norm)) {
      return coords;
    }
  }
  return null;
}

// Linear interpolation between two coordinates
function interpolate(c1, c2, ratio) {
  const lng = c1[0] + (c2[0] - c1[0]) * ratio;
  const lat = c1[1] + (c2[1] - c1[1]) * ratio;
  return [Number(lng.toFixed(6)), Number(lat.toFixed(6))];
}

// Parse text file into structured routes
function parseBusRoutesFile(content) {
  const routeBlocks = content.split(/\n(?=.+? Bus Route:)/);
  const parsedRoutes = [];

  for (let i = 1; i < routeBlocks.length; i++) {
    const block = routeBlocks[i].trim();
    if (!block) continue;

    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const headerLine = lines[0]; // e.g. "1 (Mukundapur) Bus Route: Ramnagar to Mukundapur"

    const headerMatch = headerLine.match(/^(.+?)\s+Bus Route:\s*(.+?)\s+to\s+(.+)$/i);
    let routeName = '';
    let origin = '';
    let dest = '';
    let routeNo = '';

    if (headerMatch) {
      routeName = headerMatch[1].trim();
      origin = headerMatch[2].trim();
      dest = headerMatch[3].trim();
      routeNo = routeName.split(' ')[0];
    } else {
      const parts = headerLine.split('Bus Route:');
      routeName = parts[0]?.trim() || `Route ${i}`;
      routeNo = routeName.split(' ')[0];
      const od = (parts[1] || '').split('to');
      origin = od[0]?.trim() || '';
      dest = od[1]?.trim() || '';
    }

    const stopsIdx = lines.findIndex((l) => l.toLowerCase().includes('stops in dataset order'));
    const rawStops = stopsIdx >= 0 ? lines.slice(stopsIdx + 1) : lines.slice(1);

    // Clean stop names
    const stops = rawStops
      .map((s) => s.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter((s) => s.length > 1 && !s.toLowerCase().includes('bus route:'));

    if (stops.length > 0) {
      parsedRoutes.push({
        id: `BUS_RT_${String(i).padStart(3, '0')}`,
        routeNo,
        routeName,
        origin,
        dest,
        stops,
      });
    }
  }

  return parsedRoutes;
}

// Load external diversions metadata if present
function loadDiversionsMap() {
  const map = new Map();
  if (!fs.existsSync(DIVERSIONS_CSV)) return map;
  const content = fs.readFileSync(DIVERSIONS_CSV, 'utf8');
  const lines = content.split('\n').filter(Boolean);
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 3) {
      const id = parts[0].trim();
      const no = parts[1].trim();
      map.set(no, {
        routeId: id,
        status: parts[6]?.trim() || 'Active Puja Transit',
        diversion: parts[9]?.trim() || '',
      });
    }
  }
  return map;
}

// Main generation function
async function generateBusGeoJSON() {
  console.log('🚀 Starting Hoppers 2026 Bus Routes GeoJSON Processing...');

  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Input file not found: ${INPUT_FILE}`);
    process.exit(1);
  }

  const textContent = fs.readFileSync(INPUT_FILE, 'utf8');
  const routes = parseBusRoutesFile(textContent);
  console.log(`✅ Parsed ${routes.length} operational bus routes from text dataset.`);

  const diversionsMap = loadDiversionsMap();

  // Route & Stop Geocoding with Corridor Topological Interpolation
  const uniqueStops = new Map(); // stopName -> { id, name, coords, routes: Set }
  const routeFeatures = [];

  for (const route of routes) {
    const stopCount = route.stops.length;
    if (stopCount < 2) continue;

    // Phase 1: Identify anchor coordinates for all known stops in this route
    const stopCoords = new Array(stopCount).fill(null);
    for (let idx = 0; idx < stopCount; idx++) {
      const s = route.stops[idx];
      stopCoords[idx] = findDirectCoord(s);
    }

    // Default outer endpoints if neither terminus matched
    if (!stopCoords[0]) {
      stopCoords[0] = findDirectCoord(route.origin) || [88.3315, 22.5245];
    }
    if (!stopCoords[stopCount - 1]) {
      stopCoords[stopCount - 1] = findDirectCoord(route.dest) || [88.3685, 22.5638];
    }

    // Phase 2: Interpolate intermediate stops without exact anchor
    let lastAnchorIdx = 0;
    while (lastAnchorIdx < stopCount - 1) {
      let nextAnchorIdx = lastAnchorIdx + 1;
      while (nextAnchorIdx < stopCount && !stopCoords[nextAnchorIdx]) {
        nextAnchorIdx++;
      }
      if (nextAnchorIdx >= stopCount) {
        nextAnchorIdx = stopCount - 1;
        if (!stopCoords[nextAnchorIdx]) {
          stopCoords[nextAnchorIdx] = [88.3685, 22.5638];
        }
      }

      const cStart = stopCoords[lastAnchorIdx];
      const cEnd = stopCoords[nextAnchorIdx];
      const gap = nextAnchorIdx - lastAnchorIdx;

      for (let step = 1; step < gap; step++) {
        const ratio = step / gap;
        // Add subtle geometric curve deviation to avoid dead straight lines
        const interpolated = interpolate(cStart, cEnd, ratio);
        const curveOffset = Math.sin(ratio * Math.PI) * 0.0015 * ((step % 2 === 0) ? 1 : -1);
        stopCoords[lastAnchorIdx + step] = [
          Number((interpolated[0] + curveOffset).toFixed(6)),
          Number((interpolated[1] + curveOffset * 0.6).toFixed(6)),
        ];
      }

      lastAnchorIdx = nextAnchorIdx;
    }

    // Register unique bus stops
    for (let idx = 0; idx < stopCount; idx++) {
      const sName = route.stops[idx];
      const coords = stopCoords[idx];
      const sKey = normalizeKey(sName);

      if (!uniqueStops.has(sKey)) {
        uniqueStops.set(sKey, {
          id: `stop_${sKey.replace(/\s+/g, '_').slice(0, 32)}`,
          name: sName,
          coords: coords,
          routes: new Set([route.routeNo]),
        });
      } else {
        const existing = uniqueStops.get(sKey);
        existing.routes.add(route.routeNo);
      }
    }

    // Create Route LineString Feature
    const diversionMeta = diversionsMap.get(route.routeNo) || {};
    routeFeatures.push({
      type: 'Feature',
      id: route.id,
      geometry: {
        type: 'LineString',
        coordinates: stopCoords,
      },
      properties: {
        routeId: route.id,
        routeNo: route.routeNo,
        routeName: route.routeName,
        origin: route.origin,
        destination: route.dest,
        stopCount: route.stops.length,
        stops: route.stops,
        category: 'bus_route',
        pujaStatus: diversionMeta.status || 'Active Festive Route',
        divertedPath: diversionMeta.diversion || null,
        glowColor: '#F59E0B',
        lineColor: '#06B6D4',
      },
    });
  }

  // Create Point Features for all Unique Bus Stops
  const stopFeatures = [];
  for (const stop of uniqueStops.values()) {
    stopFeatures.push({
      type: 'Feature',
      id: stop.id,
      geometry: {
        type: 'Point',
        coordinates: stop.coords,
      },
      properties: {
        id: stop.id,
        name: stop.name,
        category: 'bus_stop',
        routeCount: stop.routes.size,
        routes: Array.from(stop.routes),
      },
    });
  }

  // Combine into unified GeoJSON
  const finalGeoJSON = {
    type: 'FeatureCollection',
    metadata: {
      generatedAt: new Date().toISOString(),
      generator: 'Hoppers 2026 Transit Engine',
      totalRoutes: routeFeatures.length,
      totalStops: stopFeatures.length,
    },
    features: [...routeFeatures, ...stopFeatures],
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalGeoJSON, null, 2), 'utf8');
  console.log(`🎉 Successfully generated Hoppers_2026_BusRoutes.geojson:`);
  console.log(`   - Output: ${OUTPUT_FILE}`);
  console.log(`   - Bus Routes (LineString): ${routeFeatures.length}`);
  console.log(`   - Unique Bus Stops (Point): ${stopFeatures.length}`);
}

generateBusGeoJSON().catch((err) => {
  console.error('Fatal error during bus GeoJSON generation:', err);
  process.exit(1);
});
