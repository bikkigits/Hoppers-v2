import { MetroStation } from '../types';
import { METRO_STATIONS } from './metroStations';

export interface MetroLine {
  id: string;
  code: 'blue' | 'green' | 'purple' | 'orange' | 'yellow';
  number: number;
  name: { en: string; bn: string; hi: string };
  terminals: { en: string; bn: string; hi: string };
  color: string;
  glowColor: string;
  stations: MetroStation[];
  coordinates: [number, number][];
}

export interface MetroInterchangeInfo {
  stationId: string;
  name: { en: string; bn: string; hi: string };
  lines: ('blue' | 'green' | 'purple' | 'orange' | 'yellow')[];
  description: { en: string; bn: string; hi: string };
  lat: number;
  lng: number;
}

// 1. Line 1: Blue Line (North-South)
const line1Stations = METRO_STATIONS
  .filter((s) => s.orderBlue !== undefined)
  .sort((a, b) => (a.orderBlue ?? 0) - (b.orderBlue ?? 0));

// 2. Line 2: Green Line (East-West)
const line2Stations = METRO_STATIONS
  .filter((s) => s.orderGreen !== undefined)
  .sort((a, b) => (a.orderGreen ?? 0) - (b.orderGreen ?? 0));

// 3. Line 3: Purple Line (Joka - Majerhat)
const line3Stations = METRO_STATIONS
  .filter((s) => s.orderPurple !== undefined)
  .sort((a, b) => (a.orderPurple ?? 0) - (b.orderPurple ?? 0));

// 4. Line 6: Orange Line (Kavi Subhash - Beleghata / Ruby)
const line6Stations = METRO_STATIONS
  .filter((s) => s.orderOrange !== undefined)
  .sort((a, b) => (a.orderOrange ?? 0) - (b.orderOrange ?? 0));

// 5. Line 4: Yellow Line (Noapara - Airport)
const line4Stations = METRO_STATIONS
  .filter((s) => s.orderYellow !== undefined)
  .sort((a, b) => (a.orderYellow ?? 0) - (b.orderYellow ?? 0));

export const METRO_LINES: MetroLine[] = [
  {
    id: 'line-1-blue',
    code: 'blue',
    number: 1,
    name: {
      en: 'Line 1 · Blue Line (North-South)',
      bn: 'লাইন ১ · নীল লাইন (উত্তর-দক্ষিণ)',
      hi: 'लाइन 1 · ब्लू लाइन (उत्तर-दक्षिण)',
    },
    terminals: {
      en: 'Dakshineswar ↔ Kavi Subhash',
      bn: 'দক্ষিণেশ্বর ↔ কবি সুভাষ',
      hi: 'दक्षिणेश्वर ↔ कवि सुभाष',
    },
    color: '#2563EB',
    glowColor: '#93C5FD',
    stations: line1Stations,
    coordinates: line1Stations.map((s) => [s.lat, s.lng]),
  },
  {
    id: 'line-2-green',
    code: 'green',
    number: 2,
    name: {
      en: 'Line 2 · Green Line (East-West)',
      bn: 'লাইন ২ · সবুজ লাইন (পূর্ব-পশ্চিম)',
      hi: 'लाइन 2 · ग्रीन लाइन (पूर्व-पश्चिम)',
    },
    terminals: {
      en: 'Howrah Maidan ↔ Salt Lake Sector V',
      bn: 'হাওড়া ময়দান ↔ সল্টলেক সেক্টর ৫',
      hi: 'हावड़ा मैदान ↔ सॉल्ट लेक सेक्टर 5',
    },
    color: '#10B981',
    glowColor: '#6EE7B7',
    stations: line2Stations,
    coordinates: line2Stations.map((s) => [s.lat, s.lng]),
  },
  {
    id: 'line-3-purple',
    code: 'purple',
    number: 3,
    name: {
      en: 'Line 3 · Purple Line (Joka-Majerhat)',
      bn: 'লাইন ৩ · বেগুনি লাইন (জোকা-মাঝেরহাট)',
      hi: 'लाइन 3 · पर्पल लाइन (जोका-माझेरहाट)',
    },
    terminals: {
      en: 'Joka ↔ Majerhat',
      bn: 'জোকা ↔ মাঝেরহাট',
      hi: 'जोका ↔ माझेरहाट',
    },
    color: '#9333EA',
    glowColor: '#D8B4FE',
    stations: line3Stations,
    coordinates: line3Stations.map((s) => [s.lat, s.lng]),
  },
  {
    id: 'line-6-orange',
    code: 'orange',
    number: 6,
    name: {
      en: 'Line 6 · Orange Line (EM Bypass)',
      bn: 'লাইন ৬ · কমলা লাইন (ইএম বাইপাস)',
      hi: 'लाइन 6 · ऑरेंज लाइन (ईएम बाईपास)',
    },
    terminals: {
      en: 'Kavi Subhash ↔ Beleghata (Ruby)',
      bn: 'কবি সুভাষ ↔ বেলেঘাটা (রুবি)',
      hi: 'कवि सुभाष ↔ बेलेघाटा (रूबी)',
    },
    color: '#F97316',
    glowColor: '#FDBA74',
    stations: line6Stations,
    coordinates: line6Stations.map((s) => [s.lat, s.lng]),
  },
  {
    id: 'line-4-yellow',
    code: 'yellow',
    number: 4,
    name: {
      en: 'Line 4 · Yellow Line (Airport Link)',
      bn: 'লাইন ৪ · হলুদ লাইন (বিমানবন্দর সংযোগ)',
      hi: 'लाइन 4 · येलो लाइन (एयरपोर्ट लिंक)',
    },
    terminals: {
      en: 'Noapara ↔ Jai Hind (Airport)',
      bn: 'নোয়াপাড়া ↔ জয় হিন্দ (বিমানবন্দর)',
      hi: 'नोआपाड़ा ↔ जय हिन्द (एयरपोर्ट)',
    },
    color: '#EAB308',
    glowColor: '#FDE047',
    stations: line4Stations,
    coordinates: line4Stations.map((s) => [s.lat, s.lng]),
  },
];

export const METRO_INTERCHANGES: MetroInterchangeInfo[] = [
  {
    stationId: 'esplanade',
    name: { en: 'Esplanade Interchange', bn: 'এসপ্ল্যানেড ইন্টারচেঞ্জ', hi: 'एस्प्लेनेड इंटरचेंज' },
    lines: ['blue', 'green'],
    description: {
      en: 'Transfer between Line 1 (Blue) and Line 2 (Green East-West). Connects North/South Kolkata with Howrah Railway Terminus & Sealdah/Salt Lake.',
      bn: 'লাইন ১ (নীল) এবং লাইন ২ (সবুজ) এর মধ্যে বদল। উত্তর/দক্ষিণ কলকাতার সাথে হাওড়া স্টেশন ও সল্টলেকের সংযোগ।',
      hi: 'लाइन 1 (ब्लू) और लाइन 2 (ग्रीन) के बीच इंटरचेंज। उत्तर/दक्षिण कोलकाता को हावड़ा व सॉल्ट लेक से जोड़ता है।',
    },
    lat: 22.5645,
    lng: 88.3516,
  },
  {
    stationId: 'noapara',
    name: { en: 'Noapara Interchange', bn: 'নোয়াপাড়া ইন্টারচেঞ্জ', hi: 'नोआपाड़ा इंटरचेंज' },
    lines: ['blue', 'yellow'],
    description: {
      en: 'Transfer between Line 1 (Blue) and Line 4 (Yellow Airport Line). Direct transit to NSCBI Airport (Jai Hind).',
      bn: 'লাইন ১ (নীল) এবং লাইন ৪ (হলুদ বিমানবন্দর লাইন) এর মধ্যে বদল। নেতাজি সুভাষচন্দ্র বসু বিমানবন্দরের সরাসরি সংযোগ।',
      hi: 'लाइन 1 (ब्लू) और लाइन 4 (येलो एयरपोर्ट लाइन) के बीच इंटरचेंज। नेताजी सुभाष चंद्र बोस एयरपोर्ट हेतु सीधा मार्ग।',
    },
    lat: 22.6385,
    lng: 88.381,
  },
  {
    stationId: 'kavi-subhash',
    name: { en: 'Kavi Subhash Interchange (New Garia)', bn: 'কবি সুভাষ ইন্টারচেঞ্জ (নিউ গড়িয়া)', hi: 'कवि सुभाष इंटरचेंज (न्यू गड़िया)' },
    lines: ['blue', 'orange'],
    description: {
      en: 'Transfer between Line 1 (Blue) and Line 6 (Orange EM Bypass Line). Seamless gateway between South Kolkata and Ruby / Science City.',
      bn: 'লাইন ১ (নীল) এবং লাইন ৬ (কমলা ইএম বাইপাস লাইন) এর মধ্যে বদল। রুবি ও সায়েন্স সিটির সংযোগ।',
      hi: 'लाइन 1 (ब्लू) और लाइन 6 (ऑरेंज ईएम बाईपास लाइन) के बीच इंटरचेंज। रूबी व साइंस सिटी का मुख्य द्वार।',
    },
    lat: 22.4735,
    lng: 88.397,
  },
  {
    stationId: 'sector-v',
    name: { en: 'Salt Lake Sector V', bn: 'সল্টলেক সেক্টর ৫', hi: 'सॉल्ट लेक सेक्टर 5' },
    lines: ['green', 'orange'],
    description: {
      en: 'Major IT Corridor Junction: Line 2 (Green) and future Line 6 (Orange). Direct access to Salt Lake pandals & tech park.',
      bn: 'সল্টলেক আইটি হাব: লাইন ২ (সবুজ) ও লাইন ৬ (কমলা) সংযোগ। সল্টলেকের প্রধান পুজো মণ্ডপ।',
      hi: 'सॉल्ट लेक आईटी हब: लाइन 2 (ग्रीन) व लाइन 6 (ऑरेंज) इंटरचेंज। सॉल्ट लेक पूजा पंडाल क्षेत्र।',
    },
    lat: 22.5802,
    lng: 88.4374,
  },
  {
    stationId: 'howrah-station-metro',
    name: { en: 'Howrah Station Metro & Rail Terminal', bn: 'হাওড়া স্টেশন মেট্রো ও রেল টার্মিনাস', hi: 'हावड़ा स्टेशन मेट्रो व रेल टर्मिनस' },
    lines: ['green'],
    description: {
      en: 'Multi-Modal Hub: Line 2 (Green Underwater Metro) ⇄ Indian Railways Eastern/South-Eastern Terminus ⇄ Hooghly River Ferry.',
      bn: 'মাল্টি-মোডাল হাব: আন্ডারওয়াটার মেট্রো ⇄ ভারতীয় রেল ⇄ হুগলি নদী ফেরি সার্ভিস।',
      hi: 'मल्टी-मॉडल हब: ग्रीन अंडरवाटर मेट्रो ⇄ भारतीय रेलवे ⇄ हुगली नदी फेरी।',
    },
    lat: 22.584,
    lng: 88.3424,
  },
  {
    stationId: 'sealdah-metro',
    name: { en: 'Sealdah Station Metro & Rail Terminal', bn: 'শিয়ালদহ স্টেশন মেট্রো ও রেল টার্মিনাস', hi: 'सियालदह स्टेशन मेट्रो व रेल टर्मिनस' },
    lines: ['green'],
    description: {
      en: 'Line 2 (Green) ⇄ Sealdah Suburban & Long-Distance Rail Terminus.',
      bn: 'লাইন ২ (সবুজ) ⇄ শিয়ালদহ শহরতলি ও দূরপাল্লার ট্রেন টার্মিনাস।',
      hi: 'लाइन 2 (ग्रीन) ⇄ सियालदह लोकल व लंबी दूरी की ट्रेनें।',
    },
    lat: 22.567,
    lng: 88.3718,
  },
  {
    stationId: 'majerhat',
    name: { en: 'Majerhat Interchange', bn: 'মাঝেরহাট ইন্টারচেঞ্জ', hi: 'माझेरहाट इंटरचेंज' },
    lines: ['purple'],
    description: {
      en: 'Line 3 (Purple) ⇄ Sealdah South / Circular Railway Majerhat Junction.',
      bn: 'লাইন ৩ (বেগুনি) ⇄ শিয়ালদহ দক্ষিণ শাখা ও চক্ররেল মাঝেরহাট জংশন।',
      hi: 'लाइन 3 (पर्पल) ⇄ सियालदह दक्षिण व चक्ररेल माझेरहाट जंक्शन।',
    },
    lat: 22.5185,
    lng: 88.326,
  },
];

export function getLineColor(lineCode: string): string {
  switch (lineCode) {
    case 'blue':
      return '#2563EB';
    case 'green':
      return '#10B981';
    case 'purple':
      return '#9333EA';
    case 'orange':
      return '#F97316';
    case 'yellow':
      return '#EAB308';
    default:
      return '#2563EB';
  }
}
