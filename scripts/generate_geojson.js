import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clean string and strip any entity/proprietary tags
function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/【entity-[^|]+\|canonical_name=([^】]+)】/g, '$1')
    .replace(/【[^】]+】/g, '')
    .trim();
}

function parseCSVLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

export function buildGeoJSON() {
  const jsonPath = path.resolve(__dirname, '../src/data/allPandalsData.json');
  const masterDbCsv = path.resolve(__dirname, '../Kolkata_Durga_Puja_Master_880_100Percent_Verified.csv');
  const outputPath = path.resolve(__dirname, '../public/Hoppers_2026_Pandals.geojson');

  let features = [];

  if (fs.existsSync(masterDbCsv)) {
    const raw = fs.readFileSync(masterDbCsv, 'utf-8');
    const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
    
    lines.slice(1).forEach((line, idx) => {
      const cols = parseCSVLine(line);
      if (cols.length < 5) return;
      const name = sanitizeText(cols[0]);
      const address = sanitizeText(cols[1]);
      const zone = sanitizeText(cols[2]) || 'Central';
      const theme = sanitizeText(cols[3]) || 'Traditional / Sabeki';
      const artist = sanitizeText(cols[4]) || '';
      const latLngStr = cols[5] || cols[cols.length - 1];

      let lat = 22.5726;
      let lng = 88.3639;
      if (latLngStr) {
        const parts = latLngStr.replace(/["']/g, '').split(',').map(s => parseFloat(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          lat = parts[0];
          lng = parts[1];
        }
      }

      const id = `pandal_${String(idx + 1).padStart(3, '0')}`;
      features.push({
        type: 'Feature',
        id,
        geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        properties: {
          id,
          name,
          address,
          zone,
          theme,
          artist,
          lat,
          lng,
          category: 'pandal'
        }
      });
    });
  } else if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    features = data.map((p, idx) => {
      const id = `pandal_${String(idx + 1).padStart(3, '0')}`;
      return {
        type: 'Feature',
        id,
        geometry: {
          type: 'Point',
          coordinates: [p.lng, p.lat],
        },
        properties: {
          id,
          name: sanitizeText(p.name),
          address: sanitizeText(p.address || ''),
          zone: p.zone || 'Central',
          theme: sanitizeText(p.theme || 'Traditional / Sabeki'),
          artist: sanitizeText(p.artist || ''),
          lat: p.lat,
          lng: p.lng,
          category: 'pandal',
          nearestFacilities: p.nearestFacilities || null
        }
      };
    });
  }

  const geojson = {
    type: 'FeatureCollection',
    features
  };

  fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2), 'utf-8');
  console.log(`Successfully generated ${features.length} sanitized features in ${outputPath}`);
  return geojson;
}

if (process.argv[1] && process.argv[1].endsWith('generate_geojson.js')) {
  buildGeoJSON();
}
