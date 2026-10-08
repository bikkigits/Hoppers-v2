#!/usr/bin/env node
/**
 * Hoppers 2026 PWA - Civic Utilities & Parking POI GeoJSON Generator
 * Extracts 10,492 civic utilities and 400 parking spots from public/hoppers_master.db
 * Generates public/Hoppers_2026_POIs.geojson
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = process.cwd();
const DB_PATH = path.join(ROOT_DIR, 'public', 'hoppers_master.db');
const OUTPUT_FILE = path.join(ROOT_DIR, 'public', 'Hoppers_2026_POIs.geojson');

console.log('🚀 Extracting Civic Utilities & Parking Spots from SQLite master database...');
console.log(`Database: ${DB_PATH}`);

// Execute Python helper to extract data cleanly from sqlite3
const pythonExtractionScript = `
import sqlite3, json, sys

con = sqlite3.connect('${DB_PATH.replace(/\\/g, '/')}')
cur = con.cursor()

# 1. Civic utilities
cur.execute('SELECT id, name, category, lat, lng, address FROM civic_utilities;')
util_rows = cur.fetchall()

# 2. Parking spots
cur.execute('SELECT id, name, type, lat, lng, capacity, fee_type FROM parking_spots;')
park_rows = cur.fetchall()

data = {
    'utilities': [
        {
            'id': r[0],
            'name': r[1],
            'category': r[2],
            'lat': float(r[3]),
            'lng': float(r[4]),
            'address': r[5] or ''
        } for r in util_rows
    ],
    'parking': [
        {
            'id': r[0],
            'name': r[1],
            'type': r[2],
            'lat': float(r[3]),
            'lng': float(r[4]),
            'capacity': int(r[5]) if r[5] is not None else 0,
            'fee_type': r[6] or ''
        } for r in park_rows
    ]
}

sys.stdout.write(json.dumps(data))
`;

let extractedRaw;
try {
  extractedRaw = execSync(`python3 -c "${pythonExtractionScript.replace(/"/g, '\\"')}"`, {
    maxBuffer: 50 * 1024 * 1024,
    encoding: 'utf-8',
  });
} catch (err) {
  console.error('Error extracting SQLite database:', err);
  process.exit(1);
}

const dbData = JSON.parse(extractedRaw);
console.log(`✅ Extracted ${dbData.utilities.length} civic utilities and ${dbData.parking.length} parking spots.`);

const features = [];

// Convert Civic Utilities
for (const u of dbData.utilities) {
  if (isNaN(u.lat) || isNaN(u.lng)) continue;

  // Normalize category for frontend filters:
  // 'toilet' -> 'toilets'
  // 'helpdesk' -> 'police' (contains Kolkata Police Booths & Medical First-Aid posts)
  // 'hospital' -> 'hospital'
  // 'food' -> 'food'
  // 'atm' -> 'atm'
  let normalizedCategory = u.category;
  if (u.category === 'toilet') normalizedCategory = 'toilets';
  if (u.category === 'helpdesk') normalizedCategory = 'police';

  features.push({
    type: 'Feature',
    id: u.id,
    geometry: {
      type: 'Point',
      coordinates: [Number(u.lng.toFixed(6)), Number(u.lat.toFixed(6))],
    },
    properties: {
      id: u.id,
      name: u.name,
      category: normalizedCategory,
      raw_category: u.category,
      address: u.address,
      type: 'utility',
    },
  });
}

// Convert Parking Spots
for (const p of dbData.parking) {
  if (isNaN(p.lat) || isNaN(p.lng)) continue;

  features.push({
    type: 'Feature',
    id: p.id,
    geometry: {
      type: 'Point',
      coordinates: [Number(p.lng.toFixed(6)), Number(p.lat.toFixed(6))],
    },
    properties: {
      id: p.id,
      name: p.name,
      category: 'parking',
      parking_type: p.type,
      capacity: p.capacity,
      fee_type: p.fee_type,
      address: `${p.type} • Capacity: ${p.capacity} vehicles • ${p.fee_type}`,
      type: 'parking',
    },
  });
}

const geojson = {
  type: 'FeatureCollection',
  metadata: {
    totalFeatures: features.length,
    civicUtilitiesCount: dbData.utilities.length,
    parkingSpotsCount: dbData.parking.length,
    generatedAt: new Date().toISOString(),
  },
  features,
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(geojson));
const stats = fs.statSync(OUTPUT_FILE);
console.log(`🎉 Successfully wrote ${features.length} POI features to ${OUTPUT_FILE} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
