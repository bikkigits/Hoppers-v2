// Path: src/data/metroLines.ts

export type MetroLineId = 'blue' | 'green' | 'purple' | 'yellow' | 'orange';

export interface MetroStation {
  id: string;
  name: string;
  lineId: MetroLineId;
  coordinates: {
    lat: number;
    lng: number;
  };
  isInterchange: boolean;
  interchangeLines?: MetroLineId[];
  nearbyPopularPandals: string[]; // Key Durga Puja attraction hubs near this station
}

export interface MetroLineConfig {
  id: MetroLineId;
  name: string;
  officialLineNumber: string;
  colorHex: string;
  textColorHex: string;
  terminals: {
    start: string;
    end: string;
  };
  description: string;
}

export const METRO_LINES_CONFIG: Record<MetroLineId, MetroLineConfig> = {
  blue: {
    id: 'blue',
    name: 'Blue Line (North-South Corridor)',
    officialLineNumber: 'Line 1',
    colorHex: '#0052cc',
    textColorHex: '#ffffff',
    terminals: {
      start: 'Dakshineswar',
      end: 'Kavi Subhash (New Garia)'
    },
    description: 'The historic spine connecting North Kolkata heritage pujas with South Kolkata powerhouse pandals.'
  },
  green: {
    id: 'green',
    name: 'Green Line (East-West Corridor & Underwater)',
    officialLineNumber: 'Line 2',
    colorHex: '#00875a',
    textColorHex: '#ffffff',
    terminals: {
      start: 'Howrah Maidan',
      end: 'Salt Lake Sector V'
    },
    description: 'Cross-river underwater link connecting Howrah hubs with Sealdah and Salt Lake IT/Puja zones.'
  },
  purple: {
    id: 'purple',
    name: 'Purple Line (Behala Corridor)',
    officialLineNumber: 'Line 3',
    colorHex: '#6554c0',
    textColorHex: '#ffffff',
    terminals: {
      start: 'Joka',
      end: 'Majerhat'
    },
    description: 'Dedicated South-West route directly serving Behala Chowrasta and Diamond Harbour Road mega pandals.'
  },
  yellow: {
    id: 'yellow',
    name: 'Yellow Line (Airport Corridor)',
    officialLineNumber: 'Line 4',
    colorHex: '#ffab00',
    textColorHex: '#172b4d',
    terminals: {
      start: 'Noapara',
      end: 'Biman Bandar (Airport)'
    },
    description: 'Direct North-Eastern transit link from Noapara interchange towards Airport and VIP Road perimeter pujas.'
  },
  orange: {
    id: 'orange',
    name: 'Orange Line (EM Bypass Corridor)',
    officialLineNumber: 'Line 6',
    colorHex: '#ff5630',
    textColorHex: '#ffffff',
    terminals: {
      start: 'Kavi Subhash',
      end: 'Hemanta Mukherjee (Ruby)'
    },
    description: 'EM Bypass link connecting Kavi Subhash terminal with Ruby, Anandapur, and Kasba crowd corridors.'
  }
};

export const METRO_STATIONS: MetroStation[] = [
  // ==================== BLUE LINE (LINE 1) ====================
  {
    id: 'bl-01',
    name: 'Dakshineswar',
    lineId: 'blue',
    coordinates: { lat: 22.6548, lng: 88.3582 },
    isInterchange: false,
    nearbyPopularPandals: ['Dakshineswar Kali Temple Puja Hub', 'Ariadaha Sarbojanin']
  },
  {
    id: 'bl-02',
    name: 'Noapara',
    lineId: 'blue',
    coordinates: { lat: 22.6394, lng: 88.3842 },
    isInterchange: true,
    interchangeLines: ['yellow'],
    nearbyPopularPandals: ['Noapara Sarbojanin', 'Baranagar Netaji Colony']
  },
  {
    id: 'bl-03',
    name: 'Dum Dum',
    lineId: 'blue',
    coordinates: { lat: 22.6215, lng: 88.3932 },
    isInterchange: false,
    nearbyPopularPandals: ['Dum Dum Park Bharat Chakra', 'Dum Dum Park Tarun Sangha', 'Dum Dum Park Tarun Dal']
  },
  {
    id: 'bl-04',
    name: 'Belgachia',
    lineId: 'blue',
    coordinates: { lat: 22.6075, lng: 88.3821 },
    isInterchange: false,
    nearbyPopularPandals: ['Belgachia Sadharan Durgotsav', 'Tala Barowari']
  },
  {
    id: 'bl-05',
    name: 'Shyambazar',
    lineId: 'blue',
    coordinates: { lat: 22.6018, lng: 88.3725 },
    isInterchange: false,
    nearbyPopularPandals: ['Bagbazar Sarbojanin', 'Shyambazar Pally Sikha', 'Kumartuli Park']
  },
  {
    id: 'bl-06',
    name: 'Sovabazar Sutanuti',
    lineId: 'blue',
    coordinates: { lat: 22.5975, lng: 88.3688 },
    isInterchange: false,
    nearbyPopularPandals: ['Sovabazar Rajbari', 'Kumartuli Sarbojanin', 'Ahiritola Sarbojanin', 'Beniatola']
  },
  {
    id: 'bl-07',
    name: 'Girish Park',
    lineId: 'blue',
    coordinates: { lat: 22.5855, lng: 88.3621 },
    isInterchange: false,
    nearbyPopularPandals: ['Kashi Bose Lane', 'Simla Vyayam Samiti', 'Vivekananda Sporting Club']
  },
  {
    id: 'bl-08',
    name: 'Mahatma Gandhi Road (MG Road)',
    lineId: 'blue',
    coordinates: { lat: 22.5802, lng: 88.3595 },
    isInterchange: false,
    nearbyPopularPandals: ['Mohammad Ali Park', 'College Square']
  },
  {
    id: 'bl-09',
    name: 'Central',
    lineId: 'blue',
    coordinates: { lat: 22.5732, lng: 88.3575 },
    isInterchange: false,
    nearbyPopularPandals: ['Bowbazar Sarbojanin', 'Santosh Mitra Square (Lebutala)']
  },
  {
    id: 'bl-10',
    name: 'Chandni Chowk',
    lineId: 'blue',
    coordinates: { lat: 22.5678, lng: 88.3548 },
    isInterchange: false,
    nearbyPopularPandals: ['Wellington Square', 'Janbazar Sarbojanin']
  },
  {
    id: 'bl-11',
    name: 'Esplanade (Line 1 Platform)',
    lineId: 'blue',
    coordinates: { lat: 22.5651, lng: 88.3515 },
    isInterchange: true,
    interchangeLines: ['green'],
    nearbyPopularPandals: ['Chaltabagan (via transit transfer)', 'New Market Puja Hub']
  },
  {
    id: 'bl-12',
    name: 'Park Street',
    lineId: 'blue',
    coordinates: { lat: 22.5532, lng: 88.3498 },
    isInterchange: false,
    nearbyPopularPandals: ['Park Circus 7-Point hub', 'Mullick Bazar association']
  },
  {
    id: 'bl-13',
    name: 'Maidan',
    lineId: 'blue',
    coordinates: { lat: 22.5452, lng: 88.3482 },
    isInterchange: false,
    nearbyPopularPandals: ['Fort William precinct', 'Victoria Memorial central concourse']
  },
  {
    id: 'bl-14',
    name: 'Rabindra Sadan',
    lineId: 'blue',
    coordinates: { lat: 22.5398, lng: 88.3465 },
    isInterchange: false,
    nearbyPopularPandals: ['Nandan Cultural Hub', 'Gokhale Road Sarbojanin']
  },
  {
    id: 'bl-15',
    name: 'Netaji Bhavan',
    lineId: 'blue',
    coordinates: { lat: 22.5342, lng: 88.3452 },
    isInterchange: false,
    nearbyPopularPandals: ['Bhawanipore 75 Pally', 'Bakul Bagan Sarbojanin', 'Chakraberia Sarbojanin']
  },
  {
    id: 'bl-16',
    name: 'Jatin Das Park',
    lineId: 'blue',
    coordinates: { lat: 22.5272, lng: 88.3472 },
    isInterchange: false,
    nearbyPopularPandals: ['Maddox Square', 'Hazra Park Durgotsab', '22 Pally']
  },
  {
    id: 'bl-17',
    name: 'Kalighat',
    lineId: 'blue',
    coordinates: { lat: 22.5185, lng: 88.3468 },
    isInterchange: false,
    nearbyPopularPandals: ['Deshapriya Park', 'Badamtala Ashar Sangha', '66 Pally', 'Mudiali Club']
  },
  {
    id: 'bl-18',
    name: 'Rabindra Sarobar',
    lineId: 'blue',
    coordinates: { lat: 22.5122, lng: 88.3461 },
    isInterchange: false,
    nearbyPopularPandals: ['Suruchi Sangha', 'Tridhara Sammilani (via Southern Ave transit)']
  },
  {
    id: 'bl-19',
    name: 'Mahanayak Uttam Kumar (Tollygunge)',
    lineId: 'blue',
    coordinates: { lat: 22.4998, lng: 88.3455 },
    isInterchange: false,
    nearbyPopularPandals: ['Haridevpur New Sporting', 'Ajay Sangha', '41 Pally Haridevpur']
  },
  {
    id: 'bl-20',
    name: 'Netaji (Kudghat)',
    lineId: 'blue',
    coordinates: { lat: 22.4905, lng: 88.3475 },
    isInterchange: false,
    nearbyPopularPandals: ['Kudghat Pragati Sangha', 'Ashok Nagar Sarbojanin']
  },
  {
    id: 'bl-21',
    name: 'Masterda Surya Sen (Bansdroni)',
    lineId: 'blue',
    coordinates: { lat: 22.4812, lng: 88.3552 },
    isInterchange: false,
    nearbyPopularPandals: ['Bansdroni Park', 'Regent Park association']
  },
  {
    id: 'bl-22',
    name: 'Gitanjali (Naktala)',
    lineId: 'blue',
    coordinates: { lat: 22.4735, lng: 88.3625 },
    isInterchange: false,
    nearbyPopularPandals: ['Naktala Udayan Sangha']
  },
  {
    id: 'bl-23',
    name: 'Kavi Nazrul (Garia Bazar)',
    lineId: 'blue',
    coordinates: { lat: 22.4665, lng: 88.3752 },
    isInterchange: false,
    nearbyPopularPandals: ['Garia Sreerampur Kalyan Samity', 'Garia Nabadurga']
  },
  {
    id: 'bl-24',
    name: 'Shahid Khudiram (Birji)',
    lineId: 'blue',
    coordinates: { lat: 22.4648, lng: 88.3892 },
    isInterchange: false,
    nearbyPopularPandals: ['Patuli Sarbojanin', 'Baishnabghata Patuli Club']
  },
  {
    id: 'bl-25',
    name: 'Kavi Subhash (New Garia)',
    lineId: 'blue',
    coordinates: { lat: 22.4678, lng: 88.3985 },
    isInterchange: true,
    interchangeLines: ['orange'],
    nearbyPopularPandals: ['Hiland Park Utsav', 'Panchasayar Durgotsab']
  },

  // ==================== GREEN LINE (LINE 2) ====================
  {
    id: 'gr-01',
    name: 'Howrah Maidan',
    lineId: 'green',
    coordinates: { lat: 22.5862, lng: 88.3245 },
    isInterchange: false,
    nearbyPopularPandals: ['Howrah Sangha Shree', 'Mallick Fatak Sarbojanin']
  },
  {
    id: 'gr-02',
    name: 'Howrah Station',
    lineId: 'green',
    coordinates: { lat: 22.5842, lng: 88.3421 },
    isInterchange: false,
    nearbyPopularPandals: ['Golabari Sarbojanin', 'Howrah Railway Complex Puja']
  },
  {
    id: 'gr-03',
    name: 'Esplanade (Line 2 Platform)',
    lineId: 'green',
    coordinates: { lat: 22.5658, lng: 88.3522 },
    isInterchange: true,
    interchangeLines: ['blue'],
    nearbyPopularPandals: ['Janbazar Durgotsav', 'College Square (connection)']
  },
  {
    id: 'gr-04',
    name: 'Sealdah',
    lineId: 'green',
    coordinates: { lat: 22.5672, lng: 88.3712 },
    isInterchange: false,
    nearbyPopularPandals: ['Santosh Mitra Square (Lebutala)', 'Jagat Mukherjee Park (via tram link)']
  },
  {
    id: 'gr-05',
    name: 'Phoolbagan',
    lineId: 'green',
    coordinates: { lat: 22.5718, lng: 88.3942 },
    isInterchange: false,
    nearbyPopularPandals: ['Beleghata 33 Pally', 'Kankurgachi Mitali Sangha']
  },
  {
    id: 'gr-06',
    name: 'Salt Lake Stadium',
    lineId: 'green',
    coordinates: { lat: 22.5728, lng: 88.4065 },
    isInterchange: false,
    nearbyPopularPandals: ['Salt Lake FD Block', 'Salt Lake AK Block']
  },
  {
    id: 'gr-07',
    name: 'Bengal Chemical',
    lineId: 'green',
    coordinates: { lat: 22.5772, lng: 88.4118 },
    isInterchange: false,
    nearbyPopularPandals: ['Salt Lake BJ Block', 'Salt Lake AJ Block']
  },
  {
    id: 'gr-08',
    name: 'City Centre (Salt Lake)',
    lineId: 'green',
    coordinates: { lat: 22.5898, lng: 88.4082 },
    isInterchange: false,
    nearbyPopularPandals: ['Salt Lake CF Block', 'Salt Lake EC Block']
  },
  {
    id: 'gr-09',
    name: 'Central Park',
    lineId: 'green',
    coordinates: { lat: 22.5885, lng: 88.4168 },
    isInterchange: false,
    nearbyPopularPandals: ['Salt Lake BF Block', 'Central Park Fairground Puja']
  },
  {
    id: 'gr-10',
    name: 'Karunamoyee',
    lineId: 'green',
    coordinates: { lat: 22.5865, lng: 88.4232 },
    isInterchange: false,
    nearbyPopularPandals: ['Salt Lake EE Block', 'Salt Lake CJ Block']
  },
  {
    id: 'gr-11',
    name: 'Salt Lake Sector V',
    lineId: 'green',
    coordinates: { lat: 22.5815, lng: 88.4312 },
    isInterchange: false,
    nearbyPopularPandals: ['Sector V Techno India Campus Hub', 'Mahishbathan Durgotsab']
  },

  // ==================== PURPLE LINE (LINE 3) ====================
  {
    id: 'pr-01',
    name: 'Joka',
    lineId: 'purple',
    coordinates: { lat: 22.4582, lng: 88.2985 },
    isInterchange: false,
    nearbyPopularPandals: ['Thakurpukur State Bank Park', 'Joka Sarbojanin']
  },
  {
    id: 'pr-02',
    name: 'Thakurpukur',
    lineId: 'purple',
    coordinates: { lat: 22.4678, lng: 88.3052 },
    isInterchange: false,
    nearbyPopularPandals: ['Thakurpukur Club 31', 'SB Park Sarbojanin']
  },
  {
    id: 'pr-03',
    name: 'Sakherbazar',
    lineId: 'purple',
    coordinates: { lat: 22.4782, lng: 88.3105 },
    isInterchange: false,
    nearbyPopularPandals: ['Barisha Club', 'Barisha Sarbojanin']
  },
  {
    id: 'pr-04',
    name: 'Behala Chowrasta',
    lineId: 'purple',
    coordinates: { lat: 22.4925, lng: 88.3155 },
    isInterchange: false,
    nearbyPopularPandals: ['Behala Club', 'Behala Nutan Dal', 'Behala Players Corner']
  },
  {
    id: 'pr-05',
    name: 'Behala Bazar',
    lineId: 'purple',
    coordinates: { lat: 22.5032, lng: 88.3188 },
    isInterchange: false,
    nearbyPopularPandals: ['Behala Buroshibtala Durgotsav', 'Friends Union Club']
  },
  {
    id: 'pr-06',
    name: 'Taratala',
    lineId: 'purple',
    coordinates: { lat: 22.5122, lng: 88.3215 },
    isInterchange: false,
    nearbyPopularPandals: ['Taratala Police Line Puja', 'New Alipore Suruchi Sangha (West access)']
  },
  {
    id: 'pr-07',
    name: 'Majerhat',
    lineId: 'purple',
    coordinates: { lat: 22.5185, lng: 88.3248 },
    isInterchange: false,
    nearbyPopularPandals: ['Alipore Sarbojanin', 'Chetla Agrani (via bridge walkway)']
  },

  // ==================== YELLOW LINE (LINE 4) ====================
  {
    id: 'yl-01',
    name: 'Noapara Junction (Line 4 Concourse)',
    lineId: 'yellow',
    coordinates: { lat: 22.6394, lng: 88.3842 },
    isInterchange: true,
    interchangeLines: ['blue'],
    nearbyPopularPandals: ['Noapara Netaji Sporting', 'Dum Dum Cantonment central']
  },
  {
    id: 'yl-02',
    name: 'Dum Dum Cantonment',
    lineId: 'yellow',
    coordinates: { lat: 22.6455, lng: 88.4012 },
    isInterchange: false,
    nearbyPopularPandals: ['Cantonment Subhas Nagar Sarbojanin', 'Rabindra Nagar Durgotsav']
  },
  {
    id: 'yl-03',
    name: 'Jessore Road',
    lineId: 'yellow',
    coordinates: { lat: 22.6482, lng: 88.4215 },
    isInterchange: false,
    nearbyPopularPandals: ['Jessore Road Tarun Dal', 'Dum Dum Airport Gate 1 association']
  },
  {
    id: 'yl-04',
    name: 'Jai Hind (Biman Bandar / Airport)',
    lineId: 'yellow',
    coordinates: { lat: 22.6515, lng: 88.4418 },
    isInterchange: false,
    nearbyPopularPandals: ['Airport 2½ Number Gate Puja', 'Birati Sarbojanin', 'Rajarhat Chinar Park access']
  },

  // ==================== ORANGE LINE (LINE 6) ====================
  {
    id: 'or-01',
    name: 'Kavi Subhash (Orange Line Concourse)',
    lineId: 'orange',
    coordinates: { lat: 22.4678, lng: 88.3985 },
    isInterchange: true,
    interchangeLines: ['blue'],
    nearbyPopularPandals: ['Hiland Park Utsav', 'New Garia Sarbojanin']
  },
  {
    id: 'or-02',
    name: 'Satyajit Ray (Hiland Park)',
    lineId: 'orange',
    coordinates: { lat: 22.4762, lng: 88.3988 },
    isInterchange: false,
    nearbyPopularPandals: ['Survey Park Durgotsab', 'Santoshpur Trikon Park']
  },
  {
    id: 'or-03',
    name: 'Jyotirindra Nandy (Mukundapur)',
    lineId: 'orange',
    coordinates: { lat: 22.4895, lng: 88.3995 },
    isInterchange: false,
    nearbyPopularPandals: ['Mukundapur Udayan Sangha', 'Ajoy Nagar Sarbojanin']
  },
  {
    id: 'or-04',
    name: 'Kavi Sukanta (Kalikapur)',
    lineId: 'orange',
    coordinates: { lat: 22.5025, lng: 88.4012 },
    isInterchange: false,
    nearbyPopularPandals: ['Santoshpur Lake Pally', 'Kalikapur Sarbojanin']
  },
  {
    id: 'or-05',
    name: 'Hemanta Mukherjee (Ruby More)',
    lineId: 'orange',
    coordinates: { lat: 22.5135, lng: 88.4025 },
    isInterchange: false,
    nearbyPopularPandals: ['Kasba Bosepukur Sitala Mandir', 'Bosepukur Parijat Club', 'Nandi Bagan']
  }
];

// Helper functions for easy querying across UI components
export const getStationsByLine = (lineId: MetroLineId): MetroStation[] => {
  return METRO_STATIONS.filter((station) => station.lineId === lineId);
};

export const getInterchangeStations = (): MetroStation[] => {
  return METRO_STATIONS.filter((station) => station.isInterchange);
};

export const getStationById = (stationId: string): MetroStation | undefined => {
  return METRO_STATIONS.find((station) => station.id === stationId);
};

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

const blueStations = METRO_STATIONS.filter((s) => s.lineId === 'blue');
const greenStations = METRO_STATIONS.filter((s) => s.lineId === 'green');
const purpleStations = METRO_STATIONS.filter((s) => s.lineId === 'purple');
const orangeStations = METRO_STATIONS.filter((s) => s.lineId === 'orange');
const yellowStations = METRO_STATIONS.filter((s) => s.lineId === 'yellow');

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
    color: '#0052cc',
    glowColor: '#93C5FD',
    stations: blueStations,
    coordinates: blueStations.map((s) => [s.coordinates.lat, s.coordinates.lng]),
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
    color: '#00875a',
    glowColor: '#6EE7B7',
    stations: greenStations,
    coordinates: greenStations.map((s) => [s.coordinates.lat, s.coordinates.lng]),
  },
  {
    id: 'line-3-purple',
    code: 'purple',
    number: 3,
    name: {
      en: 'Line 3 · Purple Line (Joka-Majerhat)',
      bn: 'লাইন ৩ · বেগুনি লাইন (জোকা-মাঝেরহাট)',
      hi: 'लाइन 3 · पर्पल लाइन (जोका-মাझेरहाट)',
    },
    terminals: {
      en: 'Joka ↔ Majerhat',
      bn: 'জোকা ↔ মাঝেরহাট',
      hi: 'जोका ↔ माझेरहाट',
    },
    color: '#6554c0',
    glowColor: '#D8B4FE',
    stations: purpleStations,
    coordinates: purpleStations.map((s) => [s.coordinates.lat, s.coordinates.lng]),
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
      en: 'Kavi Subhash ↔ Hemanta Mukherjee (Ruby)',
      bn: 'কবি সুভাষ ↔ হেমন্ত মুখোপাধ্যায় (রুবি)',
      hi: 'कवि सुभाष ↔ हेमन्त मुखोपाध्याय (रूबी)',
    },
    color: '#ff5630',
    glowColor: '#FDBA74',
    stations: orangeStations,
    coordinates: orangeStations.map((s) => [s.coordinates.lat, s.coordinates.lng]),
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
    color: '#ffab00',
    glowColor: '#FDE047',
    stations: yellowStations,
    coordinates: yellowStations.map((s) => [s.coordinates.lat, s.coordinates.lng]),
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
];

export function getLineColor(lineCode: string): string {
  switch (lineCode) {
    case 'blue':
      return '#0052cc';
    case 'green':
      return '#00875a';
    case 'purple':
      return '#6554c0';
    case 'orange':
      return '#ff5630';
    case 'yellow':
      return '#ffab00';
    default:
      return '#0052cc';
  }
}