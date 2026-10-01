import { PANDALS_DATA } from '../src/data/mockData';
import * as fs from 'fs';

function classifyPandal(pandal: any): 'North' | 'Central' | 'South' | 'East' {
  const text = `${pandal.id} ${pandal.name.en} ${pandal.name.bn} ${pandal.name.hi} ${pandal.address || ''} ${pandal.nearestMetro || ''} ${pandal.nearestMetroEn || ''} ${pandal.description?.en || ''} ${pandal.theme?.en || ''}`.toLowerCase();
  const { lat, lng } = pandal;

  // 1. East Keywords (Salt Lake, Sector I-V, Karunamoyee, Salt Lake blocks, New Town, Rajarhat, Action Area, Beliaghata, Phoolbagan, Kankurgachi / EM Bypass east)
  if (
    text.includes('salt lake') ||
    text.includes('saltlake') ||
    text.includes('bidhannagar') ||
    text.includes('karunamoyee') ||
    text.includes('central park') ||
    text.includes('city centre') ||
    text.includes('sector i') ||
    text.includes('sector ii') ||
    text.includes('sector iii') ||
    text.includes('sector v') ||
    text.includes('new town') ||
    text.includes('newtown') ||
    text.includes('rajarhat') ||
    text.includes('action area') ||
    text.includes('chinar park') ||
    text.includes('beliaghata') ||
    text.includes('beleghata') ||
    text.includes('phoolbagan') ||
    text.includes('phool bagan') ||
    text.includes('kadapara') ||
    text.includes('swabhumi') ||
    text.includes('kankurgachi') ||
    text.includes('kakurgachi') ||
    text.includes('narkeldanga') ||
    text.includes('tangra') ||
    text.includes('topsia') ||
    text.includes('science city') ||
    text.includes('e.m. bypass') ||
    text.includes('em bypass') ||
    text.includes('ruby') ||
    text.includes('anandapur') ||
    text.includes('kalikapur') ||
    text.includes('mukundapur') ||
    text.includes('ajaynagar') ||
    text.includes('patuli') && lng > 88.38 ||
    text.includes('hiland park') ||
    (lng >= 88.395 && lat >= 22.53 && lat <= 22.62)
  ) {
    // Check if it's North along VIP road / Lake Town / Dum Dum
    if (
      (text.includes('sreebhumi') || text.includes('lake town') || text.includes('bangur') || text.includes('dum dum') || text.includes('dumdum') || text.includes('vip road')) &&
      lat > 22.59
    ) {
      return 'North';
    }
    return 'East';
  }

  // 2. Central Keywords
  if (
    text.includes('college street') ||
    text.includes('college square') ||
    text.includes('bowbazar') ||
    text.includes('bow bazar') ||
    text.includes('m.g. road') ||
    text.includes('mg road') ||
    text.includes('mahatma gandhi road') ||
    text.includes('girish park') ||
    text.includes('chandni') ||
    text.includes('sealdah') ||
    text.includes('amherst') ||
    text.includes('burrabazar') ||
    text.includes('bara bazar') ||
    text.includes('b.b.d. bagh') ||
    text.includes('bbd bag') ||
    text.includes('esplanade') ||
    text.includes('dharmatala') ||
    text.includes('dharmatalla') ||
    text.includes('lenin sarani') ||
    text.includes('central metro') ||
    text.includes('jorasanko') ||
    text.includes('mohammad ali park') ||
    text.includes('md ali park') ||
    text.includes('chittaranjan') ||
    text.includes('cr avenue') ||
    text.includes('c.r. avenue') ||
    text.includes('ganesh chandra') ||
    text.includes('wellington') ||
    text.includes('subodh mallick') ||
    text.includes('entally') ||
    text.includes('taltala') ||
    text.includes('ripon street') ||
    text.includes('park circus') && lat > 22.535 ||
    text.includes('moulali') ||
    text.includes('babu bagan') === false && (lat >= 22.555 && lat <= 22.585 && lng >= 88.340 && lng <= 88.375)
  ) {
    // Specific check for Girish park / MG road vs Sovabazar / Shyambazar
    if (text.includes('sovabazar') || text.includes('kumartuli') || text.includes('bagbazar') || text.includes('hatibagan') || text.includes('ahiritola') || text.includes('tala')) {
      return 'North';
    }
    return 'Central';
  }

  // 3. North Keywords
  if (
    text.includes('shyambazar') ||
    text.includes('shambazar') ||
    text.includes('bagbazar') ||
    text.includes('baghbazar') ||
    text.includes('sovabazar') ||
    text.includes('shovabazar') ||
    text.includes('kumartuli') ||
    text.includes('kumortuli') ||
    text.includes('hatibagan') ||
    text.includes('tala') ||
    text.includes('paikpara') ||
    text.includes('belgachia') ||
    text.includes('belgachhia') ||
    text.includes('ultadanga') ||
    text.includes('dum dum') ||
    text.includes('dumdum') ||
    text.includes('cossipore') ||
    text.includes('kasba') === false && text.includes('cossipur') ||
    text.includes('belgharia') ||
    text.includes('belghoria') ||
    text.includes('baranagar') ||
    text.includes('barranagore') ||
    text.includes('sinthee') ||
    text.includes('sinthi') ||
    text.includes('dunlop') ||
    text.includes('dakshineswar') ||
    text.includes('nagerbazar') ||
    text.includes('lake town') ||
    text.includes('bangur') ||
    text.includes('kashi bose') ||
    text.includes('chaltabagan') ||
    text.includes('manicktala') ||
    text.includes('maniktala') ||
    text.includes('beadon street') ||
    text.includes('nimtala') ||
    text.includes('pathuriaghata') ||
    text.includes('jorabagan') ||
    lat >= 22.588
  ) {
    return 'North';
  }

  // 4. South Keywords & General Coordinates (lat < 22.555)
  if (
    text.includes('gariahat') ||
    text.includes('ballygunge') ||
    text.includes('ballygunj') ||
    text.includes('jodhpur park') ||
    text.includes('tollygunge') ||
    text.includes('tollygunj') ||
    text.includes('kalighat') ||
    text.includes('rashbehari') ||
    text.includes('rash behari') ||
    text.includes('alipore') ||
    text.includes('new alipore') ||
    text.includes('chetla') ||
    text.includes('behala') ||
    text.includes('jadavpur') ||
    text.includes('dhakuria') ||
    text.includes('kasba') ||
    text.includes('garia') ||
    text.includes('naktala') ||
    text.includes('bansdroni') ||
    text.includes('kudghat') ||
    text.includes('netaji nagar') ||
    text.includes('haridevpur') ||
    text.includes('thakurpukur') ||
    text.includes('parnasree') ||
    text.includes('taratala') ||
    text.includes('bhowanipore') ||
    text.includes('bhawanipur') ||
    text.includes('hazra') ||
    text.includes('deshapriya') ||
    text.includes('tridhara') ||
    text.includes('maddox') ||
    text.includes('babu bagan') ||
    text.includes('selimpur') ||
    text.includes('lake gardens') ||
    text.includes('pratapaditya') ||
    text.includes('mudiali') ||
    text.includes('badamtala') ||
    text.includes('sanghashree') ||
    text.includes('suruchi') ||
    text.includes('singhi park') ||
    text.includes('ekdalia') ||
    lat < 22.555
  ) {
    return 'South';
  }

  return 'Central';
}

const batch1 = PANDALS_DATA.slice(0, 180).map((pandal, idx) => {
  const accuratelyClassifiedZone = classifyPandal(pandal);
  return {
    ...pandal,
    zone: accuratelyClassifiedZone,
  };
});

fs.writeFileSync('/tmp/batch1_result.json', JSON.stringify(batch1, null, 2));
console.log('Processed', batch1.length, 'pandals.');
