import { MetroStation, RouteResult, Pandal, MetroLine, LocalizedString } from '../types';
import { METRO_STATIONS, PANDALS_DATA } from '../data/mockData';

interface GraphEdge {
  to: string;
  weight: number; // in minutes
  type: 'metro' | 'interchange' | 'bypass';
  line?: MetroLine;
  descriptionEn: string;
  descriptionBn: string;
  descriptionHi: string;
}

interface AdjacencyList {
  [stationId: string]: GraphEdge[];
}

// Build adjacency graph for all 5 lines, physical interchanges, and Pujo bypasses
function buildMetroGraph(): AdjacencyList {
  const graph: AdjacencyList = {};

  const ensureNode = (id: string) => {
    if (!graph[id]) graph[id] = [];
  };

  const addBiEdge = (
    u: string,
    v: string,
    weight: number,
    type: 'metro' | 'interchange' | 'bypass',
    line?: MetroLine,
    descEn?: string,
    descBn?: string,
    descHi?: string
  ) => {
    ensureNode(u);
    ensureNode(v);
    graph[u].push({
      to: v,
      weight,
      type,
      line,
      descriptionEn: descEn || '',
      descriptionBn: descBn || '',
      descriptionHi: descHi || '',
    });
    graph[v].push({
      to: u,
      weight,
      type,
      line,
      descriptionEn: descEn || '',
      descriptionBn: descBn || '',
      descriptionHi: descHi || '',
    });
  };

  // 1. Blue Line (Dakshineswar to Kavi Subhash)
  const blueStations = METRO_STATIONS.filter((s) => s.lines.includes('blue')).sort(
    (a, b) => (a.orderBlue ?? 999) - (b.orderBlue ?? 999)
  );
  for (let i = 0; i < blueStations.length - 1; i++) {
    addBiEdge(
      blueStations[i].id,
      blueStations[i + 1].id,
      2.5,
      'metro',
      'blue',
      'Blue Line (Line 1)',
      'ব্লু লাইন ১',
      'ब्लू लाइन 1'
    );
  }

  // 2. Green Line West (Howrah Maidan to Esplanade)
  const greenWestStations = ['howrah-maidan', 'howrah-station-metro', 'mahakaran', 'esplanade'];
  for (let i = 0; i < greenWestStations.length - 1; i++) {
    addBiEdge(
      greenWestStations[i],
      greenWestStations[i + 1],
      2.5,
      'metro',
      'green',
      'Green Line (Underwater Tunnel)',
      'গ্রীন লাইন ২ (গঙ্গার নিচের টানেল)',
      'ग्रीन लाइन 2 (हुगली नदी सुरंग)'
    );
  }

  // 3. Green Line East (Sealdah to Sector V)
  const greenEastStations = [
    'sealdah-metro',
    'phoolbagan',
    'salt-lake-stadium',
    'bengal-chemical',
    'city-centre',
    'central-park',
    'karunamoyee',
    'sector-v',
  ];
  for (let i = 0; i < greenEastStations.length - 1; i++) {
    addBiEdge(
      greenEastStations[i],
      greenEastStations[i + 1],
      2.5,
      'metro',
      'green',
      'Green Line East',
      'গ্রীন লাইন ২ (সল্টলেক করিডোর)',
      'ग्रीन लाइन 2 (सॉल्ट लेक)'
    );
  }

  // 4. Orange Line (Line 6: Kavi Subhash to Hemanta Mukhopadhyay / Ruby)
  const orangeStations = METRO_STATIONS.filter((s) => s.lines.includes('orange')).sort(
    (a, b) => (a.orderOrange ?? 999) - (b.orderOrange ?? 999)
  );
  for (let i = 0; i < orangeStations.length - 1; i++) {
    addBiEdge(
      orangeStations[i].id,
      orangeStations[i + 1].id,
      2.5,
      'metro',
      'orange',
      'Orange Line (Line 6)',
      'অরেঞ্জ লাইন ৬',
      'ऑरेंज लाइन 6'
    );
  }

  // 5. Purple Line (Line 3: Joka to Majerhat)
  const purpleStations = METRO_STATIONS.filter((s) => s.lines.includes('purple')).sort(
    (a, b) => (a.orderPurple ?? 999) - (b.orderPurple ?? 999)
  );
  for (let i = 0; i < purpleStations.length - 1; i++) {
    addBiEdge(
      purpleStations[i].id,
      purpleStations[i + 1].id,
      2.5,
      'metro',
      'purple',
      'Purple Line (Line 3)',
      'পার্পল লাইন ৩',
      'पर्पल लाइन 3'
    );
  }

  // 6. Yellow Line (Line 4: Noapara to Jai Hind Airport)
  const yellowStations = METRO_STATIONS.filter((s) => s.lines.includes('yellow')).sort(
    (a, b) => (a.orderYellow ?? 999) - (b.orderYellow ?? 999)
  );
  for (let i = 0; i < yellowStations.length - 1; i++) {
    addBiEdge(
      yellowStations[i].id,
      yellowStations[i + 1].id,
      2.5,
      'metro',
      'yellow',
      'Yellow Line (Line 4)',
      'হলুদ লাইন ৪',
      'येलो लाइन 4'
    );
  }

  // ==========================================
  // PHYSICAL INTERCHANGES (Inside stations, ~5 min transfer buffer)
  // ==========================================
  // Esplanade, Kavi Subhash, and Noapara are direct internal interchanges.
  // Esplanade: Blue Line ↔ Green Line West
  // Kavi Subhash: Blue Line ↔ Orange Line 6
  // Noapara: Blue Line ↔ Yellow Line 4

  // ==========================================
  // PUJO GROUND REALITY PROTOCOL (Gap-Bridging Smart Bypasses)
  // ==========================================
  // 1. Green Line East (Sealdah) to Blue Line (Central): ~1.2 km Walk or 5-min Auto/E-Rickshaw
  addBiEdge(
    'sealdah-metro',
    'central',
    10,
    'bypass',
    undefined,
    'Pujo Smart Bypass: 1.2 km Walk (15m) or 5-min Auto/E-rickshaw between Sealdah and Central',
    'পুজো স্মার্ট বাইপাস: শিয়ালদহ ও সেন্ট্রালের মধ্যে ১.২ কিমি হাঁটা বা ৫ মিনিটের অটো',
    'पूजा स्मार्ट बाईपास: सियालदह और सेंट्रल के बीच 1.2 किमी पैदल या 5-मिनट ऑटो'
  );

  // 2. Green Line East (Sealdah) to Blue Line (MG Road): ~1.4 km
  addBiEdge(
    'sealdah-metro',
    'mg-road',
    11,
    'bypass',
    undefined,
    'Pujo Smart Bypass: 1.4 km Walk or 7-min Auto along Amherst Street to MG Road',
    'পুজো স্মার্ট বাইপাস: আমহার্স্ট স্ট্রিট ধরে এমজি রোড অভিমুখী ৭ মিনিটের অটো',
    'पूजा स्मार्ट बाईपास: आमहर्स्ट स्ट्रीट से एमजी रोड हेतु 7 मिनट ऑटो'
  );

  // 3. Green Line West (Esplanade) to Green Line East (Sealdah): ~2.1 km
  addBiEdge(
    'esplanade',
    'sealdah-metro',
    12,
    'bypass',
    undefined,
    'Pujo Smart Bypass: 10-min Shared Auto / Taxi via Bowbazar connecting Esplanade & Sealdah',
    'পুজো স্মার্ট বাইপাস: এসপ্ল্যানেড ও শিয়ালদহের মাঝে বউবাজার হয়ে ১০ মিনিটের অটো বা ট্যাক্সি',
    'पूजा स्मार्ट बाईपास: एस्प्लेनेड और सियालदह के बीच 10 मिनट ऑटो/टैक्सी'
  );

  // 4. Purple Line (Majerhat) to Blue Line (Kalighat): ~3.2 km
  addBiEdge(
    'majerhat',
    'kalighat',
    14,
    'bypass',
    undefined,
    'Pujo Smart Bypass: 12-min Auto / Mini-Bus via Chetla Central Road connecting Majerhat to Kalighat',
    'পুজো স্মার্ট বাইপাস: চেতলা রোড দিয়ে মাঝেরহাট থেকে কালীঘাট ১২ মিনিটের অটো সংযোগ',
    'पूजा स्मार्ट बाईपास: चेतला रोड से माझेरहाट से कालीघाट हेतु 12 मिनट ऑटो'
  );

  // 5. Purple Line (Taratala) to Blue Line (Rabindra Sarobar): ~3.5 km
  addBiEdge(
    'taratala',
    'rabindra-sarobar',
    15,
    'bypass',
    undefined,
    'Pujo Smart Bypass: 15-min Auto along Tollygunge Circular Road connecting Taratala to Rabindra Sarobar',
    'পুজো স্মার্ট বাইপাস: টালিগঞ্জ সার্কুলার রোড ধরে তারাতলা থেকে রবীন্দ্র সরোবর ১৫ মিনিটের অটো সংযোগ',
    'पूजा स्मार्ट बाईपास: टॉलीगंज सर्कुलर रोड से तारातला से रवींद्र सरोवर 15 मिनट ऑटो'
  );

  return graph;
}

const METRO_GRAPH = buildMetroGraph();

// Dijkstra's Shortest Path Algorithm
export function calculateMetroRoute(fromId: string, toId: string): RouteResult | null {
  const fromStation = METRO_STATIONS.find((s) => s.id === fromId);
  const toStation = METRO_STATIONS.find((s) => s.id === toId);

  if (!fromStation || !toStation || fromStation.id === toStation.id) {
    return null;
  }

  // Priority queue / distances map
  const dist: { [node: string]: number } = {};
  const prev: { [node: string]: { node: string; edge: GraphEdge } | null } = {};
  const unvisited = new Set<string>();

  METRO_STATIONS.forEach((s) => {
    dist[s.id] = Infinity;
    prev[s.id] = null;
    unvisited.add(s.id);
  });

  dist[fromId] = 0;

  while (unvisited.size > 0) {
    // Find node with minimum distance
    let current: string | null = null;
    let minDist = Infinity;

    for (const node of unvisited) {
      if (dist[node] < minDist) {
        minDist = dist[node];
        current = node;
      }
    }

    if (!current || minDist === Infinity) break;
    if (current === toId) break; // Destination reached!

    unvisited.delete(current);

    const neighbors = METRO_GRAPH[current] || [];
    for (const edge of neighbors) {
      if (!unvisited.has(edge.to)) continue;

      // Add a 5-minute transfer buffer if switching lines at an interchange
      let penalty = 0;
      const prevStep = prev[current];
      if (prevStep && prevStep.edge.line && edge.line && prevStep.edge.line !== edge.line) {
        penalty = 5; // 5-minute transfer buffer at interchange hubs
      }

      const alt = dist[current] + edge.weight + penalty;
      if (alt < dist[edge.to]) {
        dist[edge.to] = alt;
        prev[edge.to] = { node: current, edge };
      }
    }
  }

  if (dist[toId] === Infinity) {
    return null; // No route found
  }

  // Reconstruct path
  const pathStationIds: string[] = [];
  const edgesUsed: GraphEdge[] = [];
  let curr: string | null = toId;

  while (curr) {
    pathStationIds.unshift(curr);
    const stepInfo: { node: string; edge: GraphEdge } | null = prev[curr];
    if (stepInfo) {
      edgesUsed.unshift(stepInfo.edge);
      curr = stepInfo.node;
    } else {
      curr = null;
    }
  }

  const stationsList: MetroStation[] = pathStationIds
    .map((id) => METRO_STATIONS.find((s) => s.id === id)!)
    .filter(Boolean);

  // Analyze lines used
  const linesUsed = new Set<MetroLine>();
  let hasBypass = false;
  let bypassDesc: LocalizedString | undefined;

  edgesUsed.forEach((e) => {
    if (e.line) linesUsed.add(e.line);
    if (e.type === 'bypass') {
      hasBypass = true;
      bypassDesc = {
        en: e.descriptionEn,
        bn: e.descriptionBn,
        hi: e.descriptionHi,
      };
    }
  });

  const isDirect = linesUsed.size === 1 && !hasBypass;
  const dominantLine: MetroLine | 'interchange' = isDirect
    ? Array.from(linesUsed)[0]
    : 'interchange';

  // Generate step-by-step instructions
  const steps: RouteResult['steps'] = [];
  let currentLine: MetroLine | undefined = undefined;
  let legStartStation = stationsList[0];
  let legHopCount = 0;

  for (let i = 0; i < edgesUsed.length; i++) {
    const edge = edgesUsed[i];
    const stationFrom = stationsList[i];
    const stationTo = stationsList[i + 1];

    if (edge.type === 'bypass') {
      // Flush previous train leg if any
      if (legHopCount > 0 && currentLine) {
        steps.push({
          instruction: {
            en: `Board ${getLineNameEn(currentLine)} from ${legStartStation.name.en}`,
            bn: `${legStartStation.name.bn} থেকে ${getLineNameBn(currentLine)}-এ উঠুন`,
            hi: `${legStartStation.name.hi} से ${getLineNameHi(currentLine)} में सवार हों`,
          },
          subtext: {
            en: `Ride ${legHopCount} stations to ${stationFrom.name.en}`,
            bn: `${stationFrom.name.bn} পর্যন্ত ${legHopCount} টি স্টেশন ভ্রমণ করুন`,
            hi: `${stationFrom.name.hi} तक ${legHopCount} स्टेशन जाएं`,
          },
          lineBadge: currentLine,
        });
        legHopCount = 0;
      }

      // Add bypass step
      steps.push({
        instruction: {
          en: 'Pujo Ground Reality Bypass Link',
          bn: 'পুজো গ্রাউন্ড রিয়ালিটি বাইপাস সংযোগ',
          hi: 'पूजा ग्राउंड रियलिटी बाईपास लिंक',
        },
        subtext: {
          en: edge.descriptionEn,
          bn: edge.descriptionBn,
          hi: edge.descriptionHi,
        },
        lineBadge: 'bypass',
      });

      legStartStation = stationTo;
      currentLine = undefined;
    } else {
      // Metro edge
      if (!currentLine) {
        currentLine = edge.line;
        legStartStation = stationFrom;
        legHopCount = 1;
      } else if (currentLine === edge.line) {
        legHopCount++;
      } else {
        // Line change!
        steps.push({
          instruction: {
            en: `Board ${getLineNameEn(currentLine)} at ${legStartStation.name.en}`,
            bn: `${legStartStation.name.bn} থেকে ${getLineNameBn(currentLine)}-এ উঠুন`,
            hi: `${legStartStation.name.hi} से ${getLineNameHi(currentLine)} में चढ़ें`,
          },
          subtext: {
            en: `Ride ${legHopCount} stations to ${stationFrom.name.en} Interchange (~5 mins buffer)`,
            bn: `${stationFrom.name.bn} ইন্টারচেঞ্জ পর্যন্ত ${legHopCount} টি স্টেশন যান (~৫ মিনিট বাফার)`,
            hi: `${stationFrom.name.hi} इंटरचेंज तक ${legHopCount} स्टेशन यात्रा करें (~5 मिनट बफर)`,
          },
          lineBadge: currentLine,
        });

        // Start new leg
        currentLine = edge.line;
        legStartStation = stationFrom;
        legHopCount = 1;
      }
    }
  }

  // Final train leg flush
  if (legHopCount > 0 && currentLine) {
    steps.push({
      instruction: {
        en: `Board ${getLineNameEn(currentLine)} from ${legStartStation.name.en}`,
        bn: `${legStartStation.name.bn} থেকে ${getLineNameBn(currentLine)}-এ উঠুন`,
        hi: `${legStartStation.name.hi} से ${getLineNameHi(currentLine)} में चढ़ें`,
      },
      subtext: {
        en: `Ride ${legHopCount} stations towards destination`,
        bn: `গন্তব্য অভিমুখী ${legHopCount} টি স্টেশন অতিক্রম করুন`,
        hi: `मंजिल की ओर ${legHopCount} स्टेशन जाएं`,
      },
      lineBadge: currentLine,
    });
  }

  // Final arrival step
  steps.push({
    instruction: {
      en: `Alight at destination: ${toStation.name.en}`,
      bn: `গন্তব্য স্টেশনে নামুন: ${toStation.name.bn}`,
      hi: `गंतव्य स्टेशन पर उतरें: ${toStation.name.hi}`,
    },
    subtext: toStation.exitGates[0]
      ? {
          en: `Recommended Exit: ${toStation.exitGates[0].gate} -> ${toStation.exitGates[0].destination.en}`,
          bn: `প্রস্তাবিত গেট: ${toStation.exitGates[0].gate} -> ${toStation.exitGates[0].destination.bn}`,
          hi: `सुझाया गया गेट: ${toStation.exitGates[0].gate} -> ${toStation.exitGates[0].destination.hi}`,
        }
      : undefined,
    lineBadge: toStation.lines[0] || 'blue',
  });

  // Destination connecting pandals
  const destinationPandals: Pandal[] = PANDALS_DATA.filter((pandal) =>
    toStation.connectingPandals.includes(pandal.id)
  );

  const totalMinutes = Math.max(4, Math.round(dist[toId]));
  const stationsCount = Math.max(1, stationsList.length - 1);

  return {
    fromStation,
    toStation,
    isDirect,
    line: dominantLine,
    stationsCount,
    estimatedMinutes: totalMinutes,
    steps,
    hasBypass,
    bypassNote: bypassDesc,
    exitGateAdvice: toStation.exitGates,
    destinationPandals,
    stationsList,
  };
}

function getLineNameEn(line: MetroLine): string {
  switch (line) {
    case 'blue':
      return 'Blue Line (Line 1)';
    case 'green':
      return 'Green Line (Line 2)';
    case 'orange':
      return 'Orange Line (Line 6)';
    case 'purple':
      return 'Purple Line (Line 3)';
    case 'yellow':
      return 'Yellow Line (Line 4)';
  }
}

function getLineNameBn(line: MetroLine): string {
  switch (line) {
    case 'blue':
      return 'ব্লু লাইন ১ (উত্তর-দক্ষিণ)';
    case 'green':
      return 'গ্রীন লাইন ২ (ইস্ট-ওয়েস্ট)';
    case 'orange':
      return 'অরেঞ্জ লাইন ৬ (বাইপাস)';
    case 'purple':
      return 'পার্পল লাইন ৩ (জোকা-মাঝেরহাট)';
    case 'yellow':
      return 'হলুদ লাইন ৪ (বিমানবন্দর)';
  }
}

function getLineNameHi(line: MetroLine): string {
  switch (line) {
    case 'blue':
      return 'ब्लू लाइन 1';
    case 'green':
      return 'ग्रीन लाइन 2';
    case 'orange':
      return 'ऑरेंज लाइन 6';
    case 'purple':
      return 'पर्पल लाइन 3';
    case 'yellow':
      return 'येलो लाइन 4';
  }
}

export function getLineColor(line: MetroLine | 'interchange' | 'bypass'): string {
  switch (line) {
    case 'blue':
      return 'bg-blue-600 text-blue-100 border-blue-400';
    case 'green':
      return 'bg-emerald-600 text-emerald-100 border-emerald-400';
    case 'orange':
      return 'bg-amber-600 text-amber-100 border-amber-400';
    case 'purple':
      return 'bg-purple-600 text-purple-100 border-purple-400';
    case 'yellow':
      return 'bg-yellow-500 text-slate-950 border-yellow-300';
    case 'bypass':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    case 'interchange':
    default:
      return 'bg-gradient-to-r from-blue-600 via-emerald-600 to-amber-600 text-white border-amber-400';
  }
}
