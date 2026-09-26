import { Pandal, FilterType } from '../types';

export type MicroZoneId =
  | 'central'
  | 'saltlake'
  | 'rajarhat'
  | 'dumdum'
  | 'west'
  | 'behala';

interface ZoneMatchRules {
  keywords: string[];
  latMin?: number;
  latMax?: number;
  lngMin?: number;
  lngMax?: number;
}

const ZONE_RULES: Record<MicroZoneId, ZoneMatchRules> = {
  central: {
    keywords: [
      'college street',
      'bowbazar',
      'bow bazar',
      'chandni chowk',
      'chandni',
      'sealdah',
      'girish park',
      'm.g. road',
      'mg road',
      'mahatma gandhi road',
      'mohammad ali park',
      'college square',
      'santosh mitra square',
      'lebutala',
      'simla street',
      'simla',
      'chaltabagan',
      'kashi bose lane',
      'amherst street',
      'hedua',
      'burrabazar',
      'bara bazar',
      'muchipara',
      'entally',
      'central kolkata',
      'taltala',
      'creek row',
      'wellington',
      'ganesh chandra',
      'bepin behari',
      'bb ganguly',
      'lenin sarani',
      'park circus',
      'ripon street',
      'dharmatala',
      'esplanade',
      'janbazar',
      'raja subodh',
    ],
    latMin: 22.552,
    latMax: 22.588,
    lngMin: 88.345,
    lngMax: 88.375,
  },
  saltlake: {
    keywords: [
      'salt lake',
      'saltlake',
      'bidhannagar',
      'karunamoyee',
      'sector i',
      'sector ii',
      'sector iii',
      'sector iv',
      'sector v',
      'sector 1',
      'sector 2',
      'sector 3',
      'sector 4',
      'sector 5',
      'block fd',
      'fd block',
      'bj block',
      'block bj',
      'aj block',
      'ak block',
      'ec block',
      'ae block',
      'bd block',
      'cf block',
      'ah block',
      'cj block',
      'al block',
      'gd block',
      'hb block',
      'labony',
      'city centre salt lake',
      'salt lake city',
      'salt lake stadium',
      'duttabad',
      'central park salt lake',
      'swabhumi',
    ],
    latMin: 22.565,
    latMax: 22.615,
    lngMin: 88.395,
    lngMax: 88.445,
  },
  rajarhat: {
    keywords: [
      'rajarhat',
      'new town',
      'newtown',
      'chinar park',
      'eco park',
      'action area',
      'kaikhali',
      'teghoria',
      'baguiati',
      'major arterial',
      'rajarhat main',
      'akankha',
      'shapoorji',
      'city centre 2',
      'unitech',
      'derozio',
      'balaka',
      'atghara',
      'hatiara',
      'rajarhat gopalpur',
    ],
    latMin: 22.580,
    latMax: 22.650,
    lngMin: 88.435,
    lngMax: 88.520,
  },
  dumdum: {
    keywords: [
      'dum dum',
      'dumdum',
      'dum dum park',
      'nagerbazar',
      'motijheel',
      'cantonment',
      'dum dum junction',
      'gorabazar',
      'jessore road',
      'lake town',
      'sreebhumi',
      'sribhumi',
      'bangur avenue',
      'bangur',
      'belgachia',
      'belgachhia',
      'noapara',
      'clive house',
      'vip road',
      'south dum dum',
      'north dum dum',
      'seth bagan',
      'shyamnagar dum dum',
      'airport 1 no',
      'tarun sangha dum dum',
      'bharat chakra',
    ],
    latMin: 22.605,
    latMax: 22.665,
    lngMin: 88.380,
    lngMax: 88.430,
  },
  west: {
    keywords: [
      'khidderpore',
      'kidderpore',
      'alipore',
      'watgunj',
      'garden reach',
      'hastings',
      'metiabruz',
      'ekbalpore',
      'ekbalpur',
      'taratala rd',
      'bnr',
      'circular garden reach',
      'diamond harbour rd',
      'fancy market',
      'st. georges',
      'karl marx',
      'babubazar',
      'munshiganj',
      'mayurbhanj',
      'national library',
      'chetla lock gate',
    ],
    latMin: 22.515,
    latMax: 22.560,
    lngMin: 88.280,
    lngMax: 88.340,
  },
  behala: {
    keywords: [
      'behala',
      'behala chowrasta',
      'chowrasta',
      'manton',
      'behala manton',
      'parnasree',
      'parnasree pally',
      'sakher bazar',
      'sakherbazar',
      'barisha',
      'barisha club',
      'behala club',
      'thakurpukur',
      'james long sarani',
      'james long',
      'diamond harbour road behala',
      'silpara',
      'roy bahadur road',
      'roy bahadur',
      'biren roy road',
      'biren roy',
      'kadamtala behala',
      'siriti',
      'haridevpur',
      'state bank park',
      'bakultala behala',
      'blind school behala',
      'ajeya sanghati',
      '14 no bus stand',
      'behala nutan sangha',
    ],
    latMin: 22.470,
    latMax: 22.520,
    lngMin: 22.470 < 22.520 ? 88.280 : 88.280,
    lngMax: 88.345,
  },
};

/**
 * Checks if a pandal matches a specific filter type
 */
export function matchesPandalFilter(pandal: Pandal, filter: FilterType): boolean {
  if (filter === 'all') return true;

  // Utility POI filters don't match pandals directly
  if (
    filter === 'police' ||
    filter === 'toilets' ||
    filter === 'food' ||
    filter === 'railway' ||
    filter === 'ferry'
  ) {
    return false;
  }

  // Legacy North / South
  if (filter === 'north') {
    if (pandal.zone === 'North') return true;
    const text = `${pandal.name.en} ${pandal.address || ''} ${pandal.nearestMetro || ''} ${pandal.description.en}`.toLowerCase();
    return (
      text.includes('north kolkata') ||
      text.includes('bagbazar') ||
      text.includes('kumartuli') ||
      text.includes('shyambazar') ||
      text.includes('hatibagan') ||
      text.includes('tala') ||
      text.includes('ahiritola') ||
      text.includes('sovabazar') ||
      (pandal.lat >= 22.585 && pandal.lng <= 88.385 && !matchesPandalFilter(pandal, 'west'))
    );
  }

  if (filter === 'south') {
    if (pandal.zone === 'South') return true;
    const text = `${pandal.name.en} ${pandal.address || ''} ${pandal.nearestMetro || ''} ${pandal.description.en}`.toLowerCase();
    return (
      text.includes('south kolkata') ||
      text.includes('ballygunge') ||
      text.includes('gariahat') ||
      text.includes('ekdalia') ||
      text.includes('tridhara') ||
      text.includes('mudiali') ||
      text.includes('chetla') ||
      text.includes('naktala') ||
      text.includes('jodhpur park') ||
      text.includes('deshapriya') ||
      text.includes('maddox') ||
      (pandal.lat <= 22.540 && !matchesPandalFilter(pandal, 'west'))
    );
  }

  // Micro-Zones: Central, Salt Lake, Rajarhat, Dum Dum, West, Behala
  if (filter === 'central') {
    if (pandal.zone === 'Central') return true;
    return checkZoneMatch(pandal, ZONE_RULES.central);
  }

  if (filter === 'saltlake') {
    return checkZoneMatch(pandal, ZONE_RULES.saltlake);
  }

  if (filter === 'rajarhat') {
    return checkZoneMatch(pandal, ZONE_RULES.rajarhat);
  }

  if (filter === 'dumdum') {
    return checkZoneMatch(pandal, ZONE_RULES.dumdum);
  }

  if (filter === 'west') {
    return checkZoneMatch(pandal, ZONE_RULES.west);
  }

  if (filter === 'behala') {
    return checkZoneMatch(pandal, ZONE_RULES.behala);
  }

  return false;
}

function checkZoneMatch(pandal: Pandal, rule: ZoneMatchRules): boolean {
  const searchableText = `${pandal.name.en} ${pandal.name.bn} ${pandal.name.hi} ${pandal.address || ''} ${pandal.nearestMetro || ''} ${pandal.nearestMetroEn || ''} ${pandal.description.en} ${pandal.highlight.en} ${pandal.theme.en}`.toLowerCase();

  // 1. Keyword analysis across address, name, metro, description
  for (const keyword of rule.keywords) {
    if (searchableText.includes(keyword)) {
      return true;
    }
  }

  // 2. Geospatial bounding box check
  if (
    rule.latMin !== undefined &&
    rule.latMax !== undefined &&
    rule.lngMin !== undefined &&
    rule.lngMax !== undefined
  ) {
    if (
      pandal.lat >= rule.latMin &&
      pandal.lat <= rule.latMax &&
      pandal.lng >= rule.lngMin &&
      pandal.lng <= rule.lngMax
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Returns all matched zone tags for a pandal (for badge display & multifaceted search)
 */
export function getPandalMatchedZones(pandal: Pandal): string[] {
  const matched: string[] = [];
  if (matchesPandalFilter(pandal, 'north')) matched.push('North');
  if (matchesPandalFilter(pandal, 'south')) matched.push('South');
  if (matchesPandalFilter(pandal, 'central')) matched.push('Central');
  if (matchesPandalFilter(pandal, 'saltlake')) matched.push('Salt Lake');
  if (matchesPandalFilter(pandal, 'rajarhat')) matched.push('Rajarhat');
  if (matchesPandalFilter(pandal, 'dumdum')) matched.push('Dum Dum');
  if (matchesPandalFilter(pandal, 'west')) matched.push('West Kolkata');
  if (matchesPandalFilter(pandal, 'behala')) matched.push('Behala');
  return matched;
}
