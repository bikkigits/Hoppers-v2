import { Language, Pandal } from '../types';
import { PANDALS_DATA, METRO_STATIONS } from '../data/mockData';
import rawMetroLines from '../data/dharmkriya_all_metro_lines.json';

export interface StationFeederEntry {
  name: string;
  slug: string;
  matchedPandal?: Pandal;
}

export interface LineStationData {
  station: string;
  stationId?: string;
  pandal_count: number;
  pandals: StationFeederEntry[];
}

export interface MetroLineFeeders {
  line: string;
  lineCode: 'blue' | 'green' | 'purple' | 'orange' | 'yellow';
  stations_count: number;
  stations: LineStationData[];
}

/**
 * Parses and cross-indexes DharmKriya Metro lines & station feeder pandals
 * with Hoppers verified PANDALS_DATA.
 */
export function getMetroLineFeeders(): MetroLineFeeders[] {
  const lineCodeMap: Record<string, 'blue' | 'green' | 'purple' | 'orange' | 'yellow'> = {
    'Blue Line': 'blue',
    'Green Line': 'green',
    'Purple Line': 'purple',
    'Orange Line': 'orange',
    'Yellow Line': 'yellow',
  };

  return (rawMetroLines as any[]).map((lineGroup) => {
    const code = lineCodeMap[lineGroup.line] || 'blue';
    const stations: LineStationData[] = (lineGroup.stations || []).map((st: any) => {
      // Find matching metro station in METRO_STATIONS
      const matchedStation = METRO_STATIONS.find(
        (ms) =>
          ms.name.en.toLowerCase() === st.station.toLowerCase() ||
          ms.id.toLowerCase() === st.station.toLowerCase().replace(/[^a-z0-9]/g, '-')
      );

      const feederPandals: StationFeederEntry[] = (st.pandals || []).map((p: any) => {
        const cleanSlug = (p.slug || '').toLowerCase().replace(/^dk_/, '').replace(/[^a-z0-9]/g, '');
        const matched = PANDALS_DATA.find((pd) => {
          if (pd.id === p.slug || pd.id === `dk_${p.slug}`) return true;
          const cleanId = pd.id.toLowerCase().replace(/^dk_/, '').replace(/[^a-z0-9]/g, '');
          if (cleanId === cleanSlug || cleanId.includes(cleanSlug) || cleanSlug.includes(cleanId)) return true;
          const cleanName = pd.name.en.toLowerCase().replace(/[^a-z0-9]/g, '');
          const searchName = (p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          return cleanName.includes(searchName) || searchName.includes(cleanName);
        });

        return {
          name: p.name,
          slug: p.slug,
          matchedPandal: matched,
        };
      });

      return {
        station: st.station,
        stationId: matchedStation?.id,
        pandal_count: st.pandal_count || feederPandals.length,
        pandals: feederPandals,
      };
    });

    return {
      line: lineGroup.line,
      lineCode: code,
      stations_count: lineGroup.stations_count || stations.length,
      stations,
    };
  });
}
