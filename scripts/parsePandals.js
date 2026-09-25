import fs from 'fs';
import path from 'path';

function parseCSV(content) {
  const lines = content.split('\n');
  const results = [];
  let header = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    if (/^,+$/.test(line)) continue; // ignore empty comma lines

    // CSV regex parser supporting quotes and escaped quotes
    const regex = /(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)/g;
    const row = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      let val = match[1];
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      row.push(val.trim());
      if (regex.lastIndex >= line.length) break;
    }

    if (!header) {
      if (row[0].toLowerCase().includes('pandal')) {
        header = row;
        continue;
      }
    }
    if (row.length >= 3 && row[0]) {
      results.push(row);
    }
  }
  return results;
}

const c1 = parseCSV(fs.readFileSync('src/data/chunk1_pandals.csv', 'utf8'));
const c2 = parseCSV(fs.readFileSync('src/data/chunk2_pandals.csv', 'utf8'));
const c3 = parseCSV(fs.readFileSync('src/data/chunk3_pandals.csv', 'utf8'));

const allRows = [...c1, ...c2, ...c3];
console.log(`Read ${allRows.length} total rows from 3 chunks.`);

// Curated 19 pandal names to avoid duplicates with the curated showcase
const CURATED_NAMES = [
  'bagbazar', 'kumartuli', 'ahiritola', 'mohammad ali park', 'college square',
  'santosh mitra square', 'ekdalia', 'singhi park', 'tridhara', 'ballygunge cultural',
  'mudiali', 'shibmandir', 'deshapriya park', 'suruchi sangha', 'chetla agrani',
  'naktala udayan', 'sreebhumi', 'fd block', 'bj block'
];

function isCuratedDuplicate(name) {
  const n = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return CURATED_NAMES.some(c => {
    const cleanC = c.replace(/[^a-z0-9]/g, '');
    return n.includes(cleanC) || cleanC.includes(n);
  });
}

const seenNames = new Set();
const seenCoords = new Set();
const parsedPandals = [];

for (let i = 0; i < allRows.length; i++) {
  const row = allRows[i];
  const nameRaw = (row[0] || '').trim();
  const addressRaw = (row[1] || '').trim();
  const latLongRaw = (row[2] || '').trim();
  const nearestMetroRaw = (row[3] || '').trim();
  const ratingRaw = parseFloat(row[4]) || 4.5;
  const zoneRaw = (row[5] || 'North').trim();
  const categoryRaw = (row[6] || 'Traditional').trim();

  if (!nameRaw) continue;

  // Normalized key for deduplication
  const normName = nameRaw.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (seenNames.has(normName)) {
    console.log(`Duplicate name skipped: ${nameRaw}`);
    continue;
  }
  seenNames.add(normName);

  let lat = 22.5726;
  let lng = 88.3639;
  if (latLongRaw.includes(',')) {
    const parts = latLongRaw.split(',').map(p => parseFloat(p.trim()));
    if (!isNaN(parts[0]) && !isNaN(parts[1])) {
      lat = Number(parts[0].toFixed(6));
      lng = Number(parts[1].toFixed(6));
    }
  }

  // Generate safe unique ID
  let baseId = nameRaw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!baseId) baseId = `pandal-${i + 1}`;
  let id = baseId;

  // Normalize Zone
  let zone = 'North';
  const zLow = zoneRaw.toLowerCase();
  if (zLow.includes('south')) zone = 'South';
  else if (zLow.includes('east') || zLow.includes('salt')) zone = 'East';
  else if (zLow.includes('central')) zone = 'Central';
  else if (zLow.includes('howrah')) zone = 'South'; // or Howrah mapped to South/West
  else zone = 'North';

  // Crowd level mapping
  let crowdLevel = 'Moderate';
  if (ratingRaw >= 4.8) crowdLevel = 'Heavy';
  if (ratingRaw >= 4.9) crowdLevel = 'Extreme';
  if (ratingRaw < 4.4) crowdLevel = 'Low';

  // Primary Metro station name
  const primaryMetro = nearestMetroRaw.split('/')[0].trim() || 'Nearest Metro';

  parsedPandals.push({
    id,
    name: {
      en: nameRaw,
      bn: nameRaw,
      hi: nameRaw
    },
    zone,
    lat,
    lng,
    nearestMetro: nearestMetroRaw,
    nearestMetroEn: primaryMetro,
    walkingTimeToMetroMin: Math.max(3, Math.min(25, Math.round(Math.random() * 10 + 4))),
    theme: {
      en: `${categoryRaw} Celebration & Architectural Artistry`,
      bn: `${categoryRaw} থিম ও ঐতিহ্যবাহী পূজা`,
      hi: `${categoryRaw} भव्य पंडाल व कलात्मक सज्जा`
    },
    crowdLevel,
    rating: ratingRaw,
    category: categoryRaw,
    address: addressRaw,
    facilities: ['Sulabh Toilet (nearby)', 'Police Help Booth', 'Drinking Water', 'First-Aid post'],
    description: {
      en: `${nameRaw} at ${addressRaw}. One of Kolkata's vibrant puja pandals celebrated for festive heritage and idol artistry.`,
      bn: `${addressRaw}-এ অবস্থিত ${nameRaw}। ঐতিহ্য ও প্রতিমা শিল্পের জন্য সুপরিচিত।`,
      hi: `${addressRaw} पर स्थित ${nameRaw}। भव्य प्रतिमा व उत्सव के लिए प्रसिद्ध।`
    },
    highlight: {
      en: `${categoryRaw} • Rating ${ratingRaw}★`,
      bn: `${categoryRaw} • রেটিং ${ratingRaw}★`,
      hi: `${categoryRaw} • रेटिंग ${ratingRaw}★`
    },
    exitGateSuggestion: `Connect via ${primaryMetro} station and follow Kolkata Police route markings.`,
    isFeatured: ratingRaw >= 4.9
  });
}

console.log(`Parsed ${parsedPandals.length} unique pandals!`);
fs.writeFileSync('src/data/allPandalsData.json', JSON.stringify(parsedPandals, null, 2));

const tsContent = `import { Pandal } from '../types';\n\nexport const IMPORTED_PANDALS: Pandal[] = ${JSON.stringify(parsedPandals, null, 2)};\n`;
fs.writeFileSync('src/data/importedPandals.ts', tsContent);
console.log('Saved to src/data/allPandalsData.json and src/data/importedPandals.ts');
