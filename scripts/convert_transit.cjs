const fs = require('fs');

function parseCsv(content) {
  const lines = content.trim().split('\n');
  const rows = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        parts.push(cur.trim().replace(/^"|"$/g, ''));
        cur = '';
      } else {
        cur += c;
      }
    }
    parts.push(cur.trim().replace(/^"|"$/g, ''));
    rows.push(parts);
  }
  return rows;
}

// 1. Transit Hubs
const hubsRaw = fs.readFileSync('./public/Hoppers_Transit_Hubs.csv', 'utf8');
const hubRows = parseCsv(hubsRaw);
const hubs = [];

for (let i = 1; i < hubRows.length; i++) {
  const r = hubRows[i];
  if (r.length < 9) continue;
  const type = r[2];
  let category = 'suburban_rail';
  if (type.toLowerCase().includes('ferry')) category = 'ferry';
  else if (type.toLowerCase().includes('circular')) category = 'circular_rail';

  hubs.push({
    id: r[0],
    name: r[1],
    type: r[2],
    category,
    operator: r[3],
    lat: parseFloat(r[4]),
    lng: parseFloat(r[5]),
    connectingZones: r[6],
    keyNearbyPandals: r[7],
    travelTip: r[8]
  });
}

console.log('Parsed Transit Hubs:', hubs.length);
fs.writeFileSync(
  './src/data/transitHubsData.ts',
  `import { TransitHub } from "../types";\n\nexport const TRANSIT_HUBS: TransitHub[] = ${JSON.stringify(hubs, null, 2)};\n`
);

// 2. Bus Diversions
const busRaw = fs.readFileSync('./public/Hoppers_Puja_Bus_Diversions_2026.csv', 'utf8');
const busRows = parseCsv(busRaw);
const busList = [];

for (let i = 1; i < busRows.length; i++) {
  const r = busRows[i];
  if (r.length < 13) continue;
  busList.push({
    routeId: r[0],
    routeNo: r[1],
    title: r[2],
    normalOrigin: r[3],
    normalDestination: r[4],
    totalStops: parseInt(r[5], 10) || 0,
    operationalStatus: r[6],
    terminusOrEntry: r[7],
    restrictedStops: r[8],
    divertedPath: r[9],
    applicableHours: r[10],
    connectingZones: r[11],
    policeNotificationRef: r[12]
  });
}

console.log('Parsed Bus Diversions:', busList.length);
fs.writeFileSync(
  './src/data/busDiversionsData.ts',
  `import { BusDiversion } from "../types";\n\nexport const BUS_DIVERSIONS: BusDiversion[] = ${JSON.stringify(busList, null, 2)};\n`
);
