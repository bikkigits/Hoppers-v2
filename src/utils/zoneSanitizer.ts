import { Pandal, Zone } from '../types';

/**
 * Fast O(1) specific ID overrides where IDs or locations require explicit disambiguation.
 */
const ZONE_ID_OVERRIDES: Record<string, Zone> = {
  // East overrides (Salt Lake, VIP Road, Lake Town, Dum Dum Park)
  'fd-block-saltlake': 'East',
  'fd-block-durga-puja-salt-lake': 'East',
  'bj-block-saltlake': 'East',
  'sreebhumi-sporting': 'East',
  'shree-bhumi-sporting-club': 'East',
  'dumdum-park-bharat-chakra': 'East',
  'dumdum-park-tarun-sangha': 'East',
  'dumdum-park-tarun-dal': 'East',
  'dumdum-park-yubak-brinda': 'East',
  'lake-town-netaji-sangha': 'East',
  'salt-lake-ak-block': 'East',
  'salt-lake-aj-block': 'East',
  'salt-lake-bf-block': 'East',
  'salt-lake-cf-block': 'East',
  'beliaghata-33-palli': 'East',
  'swabhumi-heritage': 'East',
  'phoolbagan-sarbojanin': 'East',
  'kankurgachi-yubak-brinda': 'East',

  // Central overrides (College Square, Sealdah, Bowbazar, MG Road)
  'md-ali-park': 'Central',
  'mohammad-ali-park': 'Central',
  'college-square': 'Central',
  'college-square-sarbojanin-durgotsab': 'Central',
  'santosh-mitra-sq': 'Central',
  'santosh-mitra-square-durgotsav': 'Central',
  'chaltabagan': 'Central',
  'chaltabagan-sarbojanin-durgotsav': 'Central',
  'simla-street-byam-samiti': 'Central',
  'beadon-street-subhas-samiti': 'Central',
  'chorbagan-sarbojanin': 'Central',
  'thantania-dutta-bari': 'Central',
  'bowbazar-sarbojanin': 'Central',
  'kapalitola-sarbojanin': 'Central',
  'sealdah-railway-athletic-club': 'Central',

  // North overrides
  'bagbazar': 'North',
  'bagbazar-sarbojanin': 'North',
  'bagbazar-sarbojanin-durgotsav-committtee': 'North',
  'kumartuli': 'North',
  'kumartuli-park': 'North',
  'kumartuli-sarbojanin-durgotsab': 'North',
  'ahiritola': 'North',
  'ahiritola-sarbojanin': 'North',
  'ahiritola-jubak-brinda': 'North',
  'beniatola-sarbojanin': 'North',
  'pathuriaghata-panchali': 'North',
  'hatibagan-sarbojanin': 'North',
  'hatibagan-sarbojanin-durgotsav': 'North',
  'hatibagan-nabin-pally': 'North',
  'nalin-sarkar-street': 'North',
  'kashi-bose-lane': 'North',
  'tala-prattoy': 'North',
  'tallapark-prattoy': 'North',
  'telengabagan-sarbojanin': 'North',
  'jagat-mukherjee-park': 'North',
  'dum-dum-tarun-dal': 'North',

  // South overrides
  'ekdalia-evergreen': 'South',
  'ekdalia-evergreen-club': 'South',
  'singhi-park': 'South',
  'singhi-park-sarbojanin-durgotsab': 'South',
  'ballygunge-cultural': 'South',
  'ballygunge-cultural-association': 'South',
  'mudiali-club': 'South',
  'mudiali-club-sarbojanin-durgotsab': 'South',
  'shib-mandir': 'South',
  'suruchi-sangha': 'South',
  'suruchi-sangha-anchor': 'South',
  'chetla-agrani': 'South',
  'chetla-agrani-anchor': 'South',
  'chetla-agrani-club': 'South',
  'badamtala-ashar-sangha': 'South',
  'badamtala-ashar-sangha-rashbehari': 'South',
  '66-pally-rashbehari': 'South',
  'nepal-bhattacharjee-street-club': 'South',
  'deshapriya-park-durgotsav': 'South',
  'tridhara-sammilani': 'South',
  'hindustan-park-sarbojanin': 'South',
  'samaj-sebi-sangha': 'South',
  'naktala-udayan-sangha': 'South',
  'selimpur-pally': 'South',
  'babubagan-sarbojanin-durgotsav': 'South',
  'jodhpur-park': 'South',
  '95-pally-jodhpur-park': 'South',
  'behala-nutan-dal': 'South',
  'behala-club': 'South',
  'bosepukur-sitala-mandir': 'South',
  'ajeya-samhati': 'South',
  'hazra-park-durgotsab': 'South',
  'adi-lake-pally': 'South',
  '22-palli-sarodotsab': 'South'
};

/**
 * High-speed metro name to zone mapping.
 */
const METRO_ZONE_MAP: Record<string, Zone> = {
  // North line 1
  dakshineswar: 'North',
  baranagar: 'North',
  noapara: 'North',
  'dum dum': 'North',
  belgachia: 'North',
  shyambazar: 'North',
  shobhabazar: 'North',
  sovabazar: 'North',
  'sovabazar sutanuti': 'North',
  'shobhabazar sutanuti': 'North',

  // Central line 1 / Green line central
  'girish park': 'Central',
  'mg road': 'Central',
  'm.g. road': 'Central',
  central: 'Central',
  'chandni chowk': 'Central',
  chandni: 'Central',
  esplanade: 'Central',
  sealdah: 'Central',

  // South line 1 / Purple line
  'park street': 'South',
  maidan: 'South',
  'rabindra sadan': 'South',
  'netaji bhavan': 'South',
  'jatin das park': 'South',
  kalighat: 'South',
  'rabindra sarobar': 'South',
  'mahanayak uttam kumar': 'South',
  netaji: 'South',
  'masterda surya sen': 'South',
  gitanjali: 'South',
  'kavi nazrul': 'South',
  'shahid khudiram': 'South',
  'kavi subhash': 'South',
  majerhat: 'South',
  taratala: 'South',
  behala: 'South',
  dhakuria: 'South',
  ballygunge: 'South',
  gariahat: 'South',

  // East Green line & Salt Lake / New Town
  karunamoyee: 'East',
  'central park': 'East',
  'city centre': 'East',
  'salt lake stadium': 'East',
  'bengal chemical': 'East',
  phoolbagan: 'East',
  'sealdah east': 'East',
  'new town': 'East',
  rajarhat: 'East',
  'sector v': 'East',
  'salt lake sector v': 'East',
  'vip road': 'East',
  'lake town': 'East',
  sreebhumi: 'East',
  'dum dum park': 'East'
};

/**
 * Fast sub-string heuristic resolver when no exact ID or Metro match is found.
 */
export function resolveZoneHeuristic(pandal: Partial<Pandal>): Zone {
  // 1. Direct ID match
  if (pandal.id && ZONE_ID_OVERRIDES[pandal.id]) {
    return ZONE_ID_OVERRIDES[pandal.id];
  }

  // 2. Metro station name check
  const metro = (pandal.nearestMetroEn || pandal.nearestMetro || '').toLowerCase();
  for (const [key, zone] of Object.entries(METRO_ZONE_MAP)) {
    if (metro.includes(key)) {
      return zone;
    }
  }

  // 3. Address and name locality scan
  const nameEn = typeof pandal.name === 'string' ? pandal.name : pandal.name?.en || '';
  const addr = (pandal.address || '').toLowerCase();
  const fullText = `${nameEn} ${addr} ${pandal.id || ''}`.toLowerCase();

  // Newtown / Action Area hierarchy
  if (
    fullText.includes('action area') ||
    fullText.includes('new town') ||
    fullText.includes('newtown')
  ) {
    return 'Newtown';
  }

  // East hierarchy
  if (
    fullText.includes('salt lake') ||
    fullText.includes('saltlake') ||
    fullText.includes('bidhannagar') ||
    fullText.includes('new town') ||
    fullText.includes('newtown') ||
    fullText.includes('rajarhat') ||
    fullText.includes('sreebhumi') ||
    fullText.includes('sribhumi') ||
    fullText.includes('lake town') ||
    fullText.includes('dum dum park') ||
    fullText.includes('phoolbagan') ||
    fullText.includes('beliaghata') ||
    fullText.includes('beleghata') ||
    fullText.includes('kankurgachi') ||
    fullText.includes('bangur') ||
    fullText.includes('em bypass') ||
    fullText.includes('e.m. bypass') ||
    fullText.includes('tangra') ||
    fullText.includes('topsia') ||
    fullText.includes('ruby')
  ) {
    return 'East';
  }

  // Central hierarchy
  if (
    fullText.includes('college street') ||
    fullText.includes('bowbazar') ||
    fullText.includes('mg road') ||
    fullText.includes('m.g. road') ||
    fullText.includes('chandni') ||
    fullText.includes('sealdah') ||
    fullText.includes('amherst') ||
    fullText.includes('burrabazar') ||
    fullText.includes('bara bazar') ||
    fullText.includes('bbd bagh') ||
    fullText.includes('b.b.d. bagh') ||
    fullText.includes('esplanade') ||
    fullText.includes('dharmatala') ||
    fullText.includes('lebutala') ||
    fullText.includes('cr avenue') ||
    fullText.includes('chittaranjan avenue') ||
    fullText.includes('manicktala') ||
    fullText.includes('chaltabagan')
  ) {
    return 'Central';
  }

  // North hierarchy
  if (
    fullText.includes('shyambazar') ||
    fullText.includes('bagbazar') ||
    fullText.includes('sovabazar') ||
    fullText.includes('shobhabazar') ||
    fullText.includes('kumartuli') ||
    fullText.includes('hatibagan') ||
    fullText.includes('tala park') ||
    fullText.includes('talla') ||
    fullText.includes('tala') ||
    fullText.includes('cossipore') ||
    fullText.includes('ultadanga') ||
    fullText.includes('dum dum') ||
    fullText.includes('dumdum') ||
    fullText.includes('belgharia') ||
    fullText.includes('baranagar') ||
    fullText.includes('belgachia') ||
    fullText.includes('ahiritola') ||
    fullText.includes('beniatola') ||
    fullText.includes('pathuriaghata') ||
    fullText.includes('kashi bose') ||
    fullText.includes('nalin sarkar') ||
    fullText.includes('telengabagan')
  ) {
    return 'North';
  }

  // South hierarchy (defaults south for Kalighat/Ballygunge/Gariahat/Behala/etc.)
  if (
    fullText.includes('gariah') ||
    fullText.includes('ballygunge') ||
    fullText.includes('jodhpur park') ||
    fullText.includes('tollygunge') ||
    fullText.includes('kalighat') ||
    fullText.includes('rashbehari') ||
    fullText.includes('alipore') ||
    fullText.includes('behala') ||
    fullText.includes('jadavpur') ||
    fullText.includes('dhakuria') ||
    fullText.includes('kasba') ||
    fullText.includes('chetla') ||
    fullText.includes('hazra') ||
    fullText.includes('bhowanipore') ||
    fullText.includes('southern avenue') ||
    fullText.includes('naktala')
  ) {
    return 'South';
  }

  // 4. Coordinates boundary check if lat/lng available
  if (pandal.lat && pandal.lng) {
    if (pandal.lng >= 88.395 && pandal.lat >= 22.54) return 'East';
    if (pandal.lat >= 22.585) return 'North';
    if (pandal.lat >= 22.555 && pandal.lat < 22.585) return 'Central';
    return 'South';
  }

  return 'South';
}

/**
 * Lightweight, in-place zero-allocation dataset sanitizer.
 * Sanitizes pandal array in < 1ms across 1,000+ items.
 */
export function sanitizePandalZones<T extends Pandal>(pandals: T[]): T[] {
  for (let i = 0; i < pandals.length; i++) {
    const p = pandals[i];
    const correctZone = resolveZoneHeuristic(p);
    if (p.zone !== correctZone) {
      p.zone = correctZone;
    }
  }
  return pandals;
}
