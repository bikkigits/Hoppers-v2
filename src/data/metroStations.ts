import { MetroStation } from '../types';

export const METRO_STATIONS: MetroStation[] = [
  // ==========================================
  // LINE 1 (Blue Line) - North-South (Dakshineswar ↔ Kavi Subhash)
  // ==========================================
  {
    id: 'dakshineswar',
    name: { en: 'Dakshineswar', bn: 'দক্ষিণেশ্বর', hi: 'दक्षिणेश्वर' },
    lines: ['blue'],
    orderBlue: 1,
    lat: 22.6534,
    lng: 88.3592,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Dakshineswar Kali Temple & Skywalk', bn: 'দক্ষিণেশ্বর কালী মন্দির ও স্কাইওয়াক', hi: 'दक्षिणेश्वर काली मंदिर व स्काईवॉक' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'baranagar',
    name: { en: 'Baranagar', bn: 'বরাহনগর', hi: 'बरानगर' },
    lines: ['blue'],
    orderBlue: 2,
    lat: 22.6433,
    lng: 88.3670,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'BT Road Crossing & Dunlop More', bn: 'বিটি রোড মোড় ও ডানলপ', hi: 'बीटी रोड व डनलप मोड़' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'noapara',
    name: { en: 'Noapara (Interchange)', bn: 'নোয়াপাড়া (ইন্টারচেঞ্জ)', hi: 'नोआपाड़ा (इंटरचेंज)' },
    lines: ['blue', 'yellow'],
    orderBlue: 3,
    orderYellow: 1,
    isInterchange: true,
    lat: 22.6385,
    lng: 88.3810,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Noapara Carshed & North Link', bn: 'নোয়াপাড়া কারশেড', hi: 'नोआपाड़ा कारशेड' } },
      { gate: 'Gate 2', destination: { en: 'Yellow Line Interchange to Airport', bn: 'হলুদ লাইন বিমানবন্দর সংযোগ', hi: 'येलो लाइन एयरपोर्ट इंटरचेंज' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'dum-dum',
    name: { en: 'Dum Dum', bn: 'দমদম', hi: 'दमदम' },
    lines: ['blue'],
    orderBlue: 4,
    lat: 22.6219,
    lng: 88.3934,
    exitGates: [
      { gate: 'Gate 2', destination: { en: 'VIP Road Auto Stand / Sreebhumi Bus Link', bn: 'ভিআইপি রোড অটো স্ট্যান্ড / শ্রীভূমি বাস লিঙ্ক', hi: 'वीआईपी रोड ऑटो स्टैंड / श्रीभूमि बस' } },
    ],
    connectingPandals: ['sreebhumi'],
  },
  {
    id: 'belgachia',
    name: { en: 'Belgachia', bn: 'বেলগাছিয়া', hi: 'बेलगछिया' },
    lines: ['blue'],
    orderBlue: 5,
    lat: 22.6074,
    lng: 88.3815,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Belgachia Milk Colony & Tala Bridge', bn: 'বেলগাছিয়া মিল্ক কলোনি ও টালা ব্রিজ', hi: 'बेलगछिया व ताला ब्रिज' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'shyambazar',
    name: { en: 'Shyambazar', bn: 'শ্যামবাজার', hi: 'श्यामबाजार' },
    lines: ['blue'],
    orderBlue: 6,
    lat: 22.6026,
    lng: 88.3710,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Bagbazar Street / Bagbazar Sarbojanin', bn: 'বাগবাজার স্ট্রিট / বাগবাজার সার্বজনীন', hi: 'बागबाजार स्ट्रीट / बागबाजार सार्वजनीन' } },
      { gate: 'Gate 4', destination: { en: 'Hatibagan Market & Five Point Crossing', bn: 'হাতিবাগান বাজার ও পাঁচমাথার মোড়', hi: 'हातीबागान मार्केट व पांच-माथा' } },
    ],
    connectingPandals: ['bagbazar'],
  },
  {
    id: 'sovabazar',
    name: { en: 'Shovabazar Sutanuti', bn: 'শোভাবাজার সুতানুটি', hi: 'शोभाबाजार सुतानुटी' },
    lines: ['blue'],
    orderBlue: 7,
    lat: 22.5982,
    lng: 88.3675,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Ahiritola Sarbojanin / Ferry Ghat', bn: 'আহিরীটোলা সার্বজনীন / লঞ্চ ঘাট', hi: 'आहिरीटोला सार्वजनीन / फेरी घाट' } },
      { gate: 'Gate 2', destination: { en: 'Kumartuli Park & Clay Artisans Alley', bn: 'কুমারটুলী পার্ক ও পটুয়াপাড়া', hi: 'कुमारतुली पार्क व मूर्तिकार गली' } },
    ],
    connectingPandals: ['kumartuli', 'ahiritola'],
  },
  {
    id: 'girish-park',
    name: { en: 'Girish Park', bn: 'গিরিশ পার্ক', hi: 'गिरीश पार्क' },
    lines: ['blue'],
    orderBlue: 8,
    lat: 22.5862,
    lng: 88.3619,
    exitGates: [
      { gate: 'Gate 2', destination: { en: 'Simla Bayam Samity & Ramakrishna Math', bn: 'সিমলা ব্যায়াম সমিতি ও রামকৃষ্ণ মঠ', hi: 'शिमला व्यायाम समिति' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'mg-road',
    name: { en: 'Mahatma Gandhi Road', bn: 'মহাত্মা গান্ধী রোড', hi: 'महात्मा गांधी रोड' },
    lines: ['blue'],
    orderBlue: 9,
    lat: 22.5802,
    lng: 88.3616,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Mohammad Ali Park Durga Puja', bn: 'মহম্মদ আলী পার্ক দুর্গোৎসব', hi: 'मोहम्मद अली पार्क दुर्गा पूजा' } },
      { gate: 'Gate 3', destination: { en: 'Burrabazar Wholesale Festive Market', bn: 'বড়বাজার উৎসবের কেনাকাটা', hi: 'बड़ाबाजार पूजा बाजार' } },
    ],
    connectingPandals: ['mohammad-ali-park', 'college-square'],
  },
  {
    id: 'central',
    name: { en: 'Central', bn: 'সেন্ট্রাল', hi: 'सेंट्रल' },
    lines: ['blue'],
    orderBlue: 10,
    lat: 22.5717,
    lng: 88.3601,
    exitGates: [
      { gate: 'Gate 3', destination: { en: 'College Square & Calcutta University', bn: 'কলেজ স্কয়ার ও কলকাতা বিশ্ববিদ্যালয়', hi: 'कॉलेज स्क्वायर व कलकत्ता यूनिवर्सिटी' } },
      { gate: 'Gate 4', destination: { en: 'Bowbazar Jewellery & Sealdah Link (1.2 km)', bn: 'বউবাজার ও শিয়ালদহ সংযোগ (১.২ কিমি)', hi: 'बहूबाजार व सियालदह लिंक (1.2 किमी)' } },
    ],
    connectingPandals: ['college-square'],
  },
  {
    id: 'chandni-chowk',
    name: { en: 'Chandni Chowk', bn: 'চাঁদনী চক', hi: 'चांदनी चौक' },
    lines: ['blue'],
    orderBlue: 11,
    lat: 22.5661,
    lng: 88.3551,
    exitGates: [
      { gate: 'Gate 2', destination: { en: 'Ganesh Chandra Avenue & E-market', bn: 'গণেশ চন্দ্র অ্যাভিনিউ', hi: 'गणेश चंद्र एवेन्यू' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'esplanade',
    name: { en: 'Esplanade (Interchange)', bn: 'এসপ্ল্যানেড (ইন্টারচেঞ্জ)', hi: 'एस्प्लेनेड (इंटरचेंज)' },
    lines: ['blue', 'green'],
    orderBlue: 12,
    orderGreen: 4,
    isInterchange: true,
    lat: 22.5645,
    lng: 88.3516,
    exitGates: [
      { gate: 'Blue Gate 1', destination: { en: 'New Market & Dharmatala Bus Stand', bn: 'নিউ মার্কেট ও ধর্মতলা বাস স্ট্যান্ড', hi: 'न्यू मार्केट व धर्मतला बस अड्डा' } },
      { gate: 'Green Gate 5', destination: { en: 'Underground Pedestrian Transfer to Green Line 2', bn: 'গ্রীন লাইন ২ আন্ডারগ্রাউন্ড ইন্টারচেঞ্জ', hi: 'ग्रीन लाइन 2 भूमिगत इंटरचेंज' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'park-street',
    name: { en: 'Park Street', bn: 'পার্ক স্ট্রিট', hi: 'पार्क स्ट्रीट' },
    lines: ['blue'],
    orderBlue: 13,
    lat: 22.5532,
    lng: 88.3510,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Park Street Restaurants & Flurys', bn: 'পার্ক স্ট্রিট রেস্তোরাঁ ও ফ্লুরিস', hi: 'पार्क स्ट्रीट रेस्तरां व फ्लूरिस' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'maidan',
    name: { en: 'Maidan', bn: 'ময়দান', hi: 'मैदान' },
    lines: ['blue'],
    orderBlue: 14,
    lat: 22.5457,
    lng: 88.3486,
    exitGates: [
      { gate: 'Gate 2', destination: { en: 'Victoria Memorial & Brigade Parade Ground', bn: 'ভিক্টোরিয়া মেমোরিয়াল ও ব্রিগেড', hi: 'विक्टोरिया मेमोरियल' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'rabindra-sadan',
    name: { en: 'Rabindra Sadan', bn: 'রবীন্দ্র সদন', hi: 'रवींद्र सदन' },
    lines: ['blue'],
    orderBlue: 15,
    lat: 22.5372,
    lng: 88.3458,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Nandan, Academy of Fine Arts & Exide Crossing', bn: 'নন্দন, চারুকলা একাডেমি ও এক্সাইড মোড়', hi: 'नंदन, फाइन आर्ट्स व एक्साइड क्रॉसिंग' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'netaji-bhavan',
    name: { en: 'Netaji Bhavan', bn: 'নেতাজি ভবন', hi: 'नेताजी भवन' },
    lines: ['blue'],
    orderBlue: 16,
    lat: 22.5312,
    lng: 88.3456,
    exitGates: [
      { gate: 'Gate 2', destination: { en: 'Ritchie Road / Maddox Square Puja', bn: 'রিচি রোড / ম্যাডক্স স্কয়ার পূজা', hi: 'रिची रोड / मैडॉक्स स्क्वायर पूजा' } },
    ],
    connectingPandals: ['maddox-square'],
  },
  {
    id: 'jatin-das-park',
    name: { en: 'Jatin Das Park', bn: 'যতীন দাস পার্ক', hi: 'जतीन दास पार्क' },
    lines: ['blue'],
    orderBlue: 17,
    lat: 22.5229,
    lng: 88.3468,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Hazra Crossing & Maddox Square Approach', bn: 'হাজরা মোড় ও ম্যাডক্স স্কয়ার সংযোগ', hi: 'हाजरा क्रॉसिंग' } },
    ],
    connectingPandals: ['maddox-square'],
  },
  {
    id: 'kalighat',
    name: { en: 'Kalighat', bn: 'কালীঘাট', hi: 'कालीघाट' },
    lines: ['blue'],
    orderBlue: 18,
    lat: 22.5180,
    lng: 88.3465,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Tridhara Sammilani & Rashbehari Avenue', bn: 'ত্রিধারা সম্মিলনী ও রাসবিহারী অ্যাভিনিউ', hi: 'त्रिधारा सम्मेलनी व रासबिहारी एवेन्यू' } },
      { gate: 'Gate 3', destination: { en: 'Ekdalia Evergreen & Singhi Park Auto Stand', bn: 'একডালিয়া ও সিংহী পার্ক অটো স্ট্যান্ড', hi: 'एकडालिया व सिंघी पार्क ऑटो स्टैंड' } },
      { gate: 'Gate 5', destination: { en: 'Badamtala Ashar Sangha & Kalighat Temple', bn: 'বাদামতলা আষাঢ় সংঘ ও কালীঘাট মন্দির', hi: 'बादामतला आषाढ़ संघ व काली मंदिर' } },
    ],
    connectingPandals: ['tridhara', 'ekdalia', 'singhi-park', 'badamtala', 'suruchi-sangha', 'chetla-agrani', 'ballygunge-cultural'],
  },
  {
    id: 'rabindra-sarobar',
    name: { en: 'Rabindra Sarobar', bn: 'রবীন্দ্র সরোবর', hi: 'रवींद्र सरोवर' },
    lines: ['blue'],
    orderBlue: 19,
    lat: 22.5085,
    lng: 88.3464,
    exitGates: [
      { gate: 'Gate 2', destination: { en: 'Southern Avenue Pujas (Mudiali & Shib Mandir)', bn: 'সাউদার্ন অ্যাভিনিউ পুজো (মুদিয়ালী ও শিব মন্দির)', hi: 'सदर्न एवेन्यू पूजा (मुदियाली व शिब मंदिर)' } },
    ],
    connectingPandals: ['mudiali-club', 'shib-mandir'],
  },
  {
    id: 'mahanayak-uttam-kumar',
    name: { en: 'Mahanayak Uttam Kumar (Tollygunge)', bn: 'মহানায়ক উত্তম কুমার (টালিগঞ্জ)', hi: 'महानायक उत्तम कुमार (टॉलीगंज)' },
    lines: ['blue'],
    orderBlue: 20,
    lat: 22.4985,
    lng: 88.3470,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Deshapran Sasmal Road & Tolly Club', bn: 'দেশপ্রাণ শাসমল রোড ও টালি ক্লাব', hi: 'देशप्राण शासमाल रोड' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'netaji',
    name: { en: 'Netaji (Kudghat)', bn: 'নেতাজি (কুঁদঘাট)', hi: 'नेताजी (कुदघाट)' },
    lines: ['blue'],
    orderBlue: 21,
    lat: 22.4895,
    lng: 88.3520,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Kudghat Bus Stand & Chandi Ghosh Road', bn: 'কুঁদঘাট বাস স্ট্যান্ড', hi: 'कुदघाट बस स्टैंड' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'masterda-surya-sen',
    name: { en: 'Masterda Surya Sen (Bansdroni)', bn: 'মাস্টারদা সূর্য সেন (বাঁশদ্রোণী)', hi: 'मास्टरदा सूर्य सेन (बांसद्रोणी)' },
    lines: ['blue'],
    orderBlue: 22,
    lat: 22.4800,
    lng: 88.3620,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Bansdroni Supermarket & NSC Bose Road', bn: 'বাঁশদ্রোণী বাজার ও এনএসসি বোস রোড', hi: 'बांसद्रोणी सुपरमार्केट' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'gitanjali',
    name: { en: 'Gitanjali (Naktala)', bn: 'গীতাঞ্জলি (নাকতলা)', hi: 'गीतांजलि (नाकतला)' },
    lines: ['blue'],
    orderBlue: 23,
    lat: 22.4760,
    lng: 88.3725,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Naktala Udayan Sangha Main Pandal', bn: 'নাকতলা উদয়ন সংঘ মূল মণ্ডপ', hi: 'नाकतला उदयन संघ मुख्य पंडाल' } },
    ],
    connectingPandals: ['naktala-udayan'],
  },
  {
    id: 'kavi-nazrul',
    name: { en: 'Kavi Nazrul (Garia Bazar)', bn: 'কবি নজরুল (গড়িয়া বাজার)', hi: 'कवि नजरूल (गड़िया बाजार)' },
    lines: ['blue'],
    orderBlue: 24,
    lat: 22.4710,
    lng: 88.3830,
    exitGates: [
      { gate: 'Gate 2', destination: { en: 'Garia 5-point crossing & Bus Stand', bn: 'গড়িয়া ৫ মাথার মোড় ও বাস স্ট্যান্ড', hi: 'गड़िया चौराहा व बस स्टैंड' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'shahid-khudiram',
    name: { en: 'Shahid Khudiram (Briji)', bn: 'শহিদ ক্ষুদিরাম (বৃজি)', hi: 'शहीद खुदीराम (बृजी)' },
    lines: ['blue'],
    orderBlue: 25,
    lat: 22.4680,
    lng: 88.3910,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'EM Bypass link & Briji West', bn: 'ইএম বাইপাস লিঙ্ক ও বৃজি', hi: 'ईएम बाईपास लिंक' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'kavi-subhash',
    name: { en: 'Kavi Subhash (New Garia Interchange)', bn: 'কবি সুভাষ (নিউ গড়িয়া ইন্টারচেঞ্জ)', hi: 'कवि सुभाष (न्यू गड़िया इंटरचेंज)' },
    lines: ['blue', 'orange'],
    orderBlue: 26,
    orderOrange: 1,
    isInterchange: true,
    lat: 22.4735,
    lng: 88.3970,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'EM Bypass South & New Garia Railway Station', bn: 'ইএম বাইপাস দক্ষিণ ও নিউ গড়িয়া স্টেশন', hi: 'ईएम बाईपास साउथ व न्यू गड़िया स्टेशन' } },
      { gate: 'Gate 2', destination: { en: 'Orange Line 6 Interchange towards Ruby More', bn: 'অরেঞ্জ লাইন ৬ ইন্টারচেঞ্জ রুবি অভিমুখী', hi: 'ऑरेंज लाइन 6 रूबी इंटरचेंज' } },
    ],
    connectingPandals: [],
  },

  // ==========================================
  // LINE 2 (Green Line) - East-West
  // West Section: Howrah Maidan ↔ Esplanade (Underwater)
  // East Section: Sealdah ↔ Salt Lake Sector V
  // ==========================================
  {
    id: 'howrah-maidan',
    name: { en: 'Howrah Maidan', bn: 'হাওড়া ময়দান', hi: 'हावड़ा मैदान' },
    lines: ['green'],
    orderGreen: 1,
    lat: 22.5855,
    lng: 88.3242,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Howrah Maidan Stadium & GT Road', bn: 'হাওড়া ময়দান স্টেডিয়াম ও জিটি রোড', hi: 'हावड़ा मैदान स्टेडियम' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'howrah-station-metro',
    name: { en: 'Howrah', bn: 'হাওড়া', hi: 'हावड़ा' },
    lines: ['green'],
    orderGreen: 2,
    lat: 22.5840,
    lng: 88.3424,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Howrah Railway Platforms 1-23', bn: 'হাওড়া রেল প্ল্যাটফর্ম ১-২৩', hi: 'हावड़ा रेलवे प्लेटफार्म 1-23' } },
      { gate: 'Gate 3', destination: { en: 'Howrah Ferry Ghat towards Babu Ghat', bn: 'বাবু ঘাটের দিকে হাওড়া ফেরি ঘাট', hi: 'बाबू घाट की ओर फेरी ঘাট' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'mahakaran',
    name: { en: 'Mahakaran', bn: 'মহাকরণ', hi: 'महाकरण' },
    lines: ['green'],
    orderGreen: 3,
    lat: 22.5723,
    lng: 88.3490,
    exitGates: [
      { gate: 'Gate 2', destination: { en: 'Writers Building & Brabourne Road', bn: 'রাইটার্স বিল্ডিং ও ব্র্যাবোর্ন রোড', hi: 'राइटर्स बिल्डिंग' } },
    ],
    connectingPandals: [],
  },
  // Esplanade is declared above with lines: ['blue', 'green']
  {
    id: 'sealdah-metro',
    name: { en: 'Sealdah', bn: 'শিয়ালদহ', hi: 'सियालदह' },
    lines: ['green'],
    orderGreen: 5,
    lat: 22.5670,
    lng: 88.3718,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Sealdah Railway Main & North Terminus', bn: 'শিয়ালদহ রেলওয়ে প্রধান টার্মিনাস', hi: 'सियालदह रेलवे मुख्य टर्मिनस' } },
      { gate: 'Gate 3', destination: { en: 'Santosh Mitra Square & Central Bypass link', bn: 'সন্তোষ মিত্র স্কয়ার ও সেন্ট্রাল বাইপাস', hi: 'संतोष मित्रा स्क्वायर व सेंट्रल बाईपास' } },
    ],
    connectingPandals: ['santosh-mitra', 'college-square'],
  },
  {
    id: 'phoolbagan',
    name: { en: 'Phoolbagan', bn: 'ফুলবাগান', hi: 'फूलबागान' },
    lines: ['green'],
    orderGreen: 6,
    lat: 22.5694,
    lng: 88.3912,
    exitGates: [
      { gate: 'Gate 2', destination: { en: 'Phoolbagan Crossing & Beleghata Pandal Link', bn: 'ফুলবাগান মোড় ও বেলেঘাটা সংযোগ', hi: 'फूलबागान चौराहा' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'salt-lake-stadium',
    name: { en: 'Salt Lake Stadium', bn: 'সল্টলেক স্টেডিয়াম', hi: 'सॉल्ट लेक स्टेडियम' },
    lines: ['green'],
    orderGreen: 7,
    lat: 22.5714,
    lng: 88.4045,
    exitGates: [
      { gate: 'Gate 3', destination: { en: 'Yuva Bharati Krirangan Gate 3', bn: 'যুবভারতী ক্রীড়াঙ্গন ৩ নং গেট', hi: 'युवा भारती क्रीड़ांगन' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'bengal-chemical',
    name: { en: 'Bengal Chemical', bn: 'বেঙ্গল কেমিক্যাল', hi: 'बंगाल केमिकल' },
    lines: ['green'],
    orderGreen: 8,
    lat: 22.5768,
    lng: 88.4089,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Mani Square Mall & EM Bypass', bn: 'মণি স্কয়ার মল ও ইএম বাইপাস', hi: 'मणि स्क्वायर मॉल' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'city-centre',
    name: { en: 'City Centre (Salt Lake)', bn: 'সিটি সেন্টার (সল্টলেক)', hi: 'सिटी सेंटर (सॉल्ट लेक)' },
    lines: ['green'],
    orderGreen: 9,
    lat: 22.5878,
    lng: 88.4116,
    exitGates: [
      { gate: 'Gate 2', destination: { en: 'City Centre 1 Mall & Block DC Kund', bn: 'সিটি সেন্টার ১ মল ও ডিসি ব্লক', hi: 'सिटी सेंटर 1 मॉल' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'central-park',
    name: { en: 'Central Park', bn: 'সেন্ট্রাল পার্ক', hi: 'सेंट्रल पार्क' },
    lines: ['green'],
    orderGreen: 10,
    lat: 22.5902,
    lng: 88.4190,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Central Park Fair Ground / Book Fair Area', bn: 'সেন্ট্রাল পার্ক মেলা প্রাঙ্গণ', hi: 'सेंट्रल पार्क मेला मैदान' } },
    ],
    connectingPandals: ['fd-block-saltlake'],
  },
  {
    id: 'karunamoyee',
    name: { en: 'Karunamoyee', bn: 'করুণাময়ী', hi: 'करुणामयी' },
    lines: ['green'],
    orderGreen: 11,
    lat: 22.5874,
    lng: 88.4282,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Karunamoyee Central Bus Terminus', bn: 'করুণাময়ী কেন্দ্রীয় বাস টার্মিনাস', hi: 'करुणामयी बस टर्मिनस' } },
    ],
    connectingPandals: ['bj-block-saltlake'],
  },
  {
    id: 'sector-v',
    name: { en: 'Salt Lake Sector V', bn: 'সল্টলেক সেক্টর ৫', hi: 'सॉल्ट लेक सेक्टर 5' },
    lines: ['green'],
    orderGreen: 12,
    lat: 22.5802,
    lng: 88.4374,
    exitGates: [
      { gate: 'Gate 2', destination: { en: 'Wipro Crossing & College More', bn: 'উইপ্রো মোড় ও কলেজ মোড়', hi: 'विप्रो चौराहा' } },
    ],
    connectingPandals: [],
  },

  // ==========================================
  // LINE 6 (Orange Line) - Kavi Subhash ↔ Hemanta Mukhopadhyay (Ruby)
  // ==========================================
  // Kavi Subhash is declared above with lines: ['blue', 'orange']
  {
    id: 'satyajit-ray',
    name: { en: 'Satyajit Ray (Hiland Park)', bn: 'সত্যজিৎ রায় (হাইল্যান্ড পার্ক)', hi: 'सत्यजीत रे (हाइलैंड पार्क)' },
    lines: ['orange'],
    orderOrange: 2,
    lat: 22.4842,
    lng: 88.3965,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Hiland Park & Metropolis Mall EM Bypass', bn: 'হাইল্যান্ড পার্ক ও মেট্রোপলিস মল', hi: 'हाइलैंड पार्क व मेट्रोपोलिस मॉल' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'jyotirindra-nandi',
    name: { en: 'Jyotirindra Nandi (Mukundapur)', bn: 'জ্যোতিরিন্দ্র নন্দী (মুকুন্দপুর)', hi: 'ज्योतिरींद्र नंदी (मुकुंदपुर)' },
    lines: ['orange'],
    orderOrange: 3,
    lat: 22.4975,
    lng: 88.4005,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Mukundapur Medical Hub & RN Tagore Hospital', bn: 'মুকুন্দপুর হাসপাতাল হাব', hi: 'मुकुंदपुर मेडिकल हब' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'kavi-sukanta',
    name: { en: 'Kavi Sukanta (Kalikapur)', bn: 'কবি সুকান্ত (কালিকাপুর)', hi: 'कवि सुकांत (कालिकापुर)' },
    lines: ['orange'],
    orderOrange: 4,
    lat: 22.5085,
    lng: 88.4010,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Kalikapur Crossing & Prince Anwar Shah Connector', bn: 'কালিকাপুর মোড় ও আনোয়ার শাহ সংযোগ', hi: 'कालिकापुर चौराहा' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'hemanta-mukhopadhyay',
    name: { en: 'Hemanta Mukhopadhyay', bn: 'হেমন্ত মুখোপাধ্যায় (রুবি)', hi: 'हेमंत मुखोपाध्याय (रूबी)' },
    lines: ['orange'],
    orderOrange: 5,
    lat: 22.5165,
    lng: 88.4012,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Ruby Hospital & Rashbehari Connector Pujo Hub', bn: 'রুবি হাসপাতাল ও রাসবিহারী কানেক্টর', hi: 'रूबी हॉस्पिटल व रासबिहारी कनेक्टर' } },
    ],
    connectingPandals: ['ballygunge-cultural'],
  },
  {
    id: 'vip-bazar',
    name: { en: 'VIP Bazar', bn: 'ভিআইপি বাজার', hi: 'वीआईपी बाजार' },
    lines: ['orange'],
    orderOrange: 6,
    lat: 22.5270,
    lng: 88.4015,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'VIP Bazar Market & EM Bypass', bn: 'ভিআইপি বাজার ও ইএম বাইপাস', hi: 'वीआईपी बाजार व ईएम बाईपास' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'ritwik-ghatak',
    name: { en: 'Ritwik Ghatak', bn: 'ঋত্বিক ঘটক', hi: 'ऋत्विक घटक' },
    lines: ['orange'],
    orderOrange: 7,
    lat: 22.5350,
    lng: 88.4018,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Science City Connector & PC Chandra Garden', bn: 'সায়েন্স সিটি কানেক্টর ও পিসি চন্দ্র গার্ডেন', hi: 'साइंस सिटी कनेक्टर' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'barun-sengupta',
    name: { en: 'Barun Sengupta', bn: 'বরুণ সেনগুপ্ত', hi: 'बरुण सेनगुप्त' },
    lines: ['orange'],
    orderOrange: 8,
    lat: 22.5440,
    lng: 88.4022,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Parama Island & Science City', bn: 'পরমা দ্বীপ ও সায়েন্স সিটি', hi: 'परमा आइलैंड व साइंस सिटी' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'beleghata',
    name: { en: 'Beleghata', bn: 'বেলেঘাটা', hi: 'बेलेघाटा' },
    lines: ['orange'],
    orderOrange: 9,
    lat: 22.5530,
    lng: 88.4025,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Beleghata EM Bypass Crossing & Salt Lake Link', bn: 'বেলেঘাটা বাইপাস মোড়', hi: 'बेलेघाटा बाईपास चौराहा' } },
    ],
    connectingPandals: [],
  },

  // ==========================================
  // LINE 3 (Purple Line) - Joka ↔ Majerhat
  // ==========================================
  {
    id: 'joka',
    name: { en: 'Joka', bn: 'জোকা', hi: 'जोका' },
    lines: ['purple'],
    orderPurple: 1,
    lat: 22.4410,
    lng: 88.3005,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'IIM Calcutta Campus & Diamond Harbour Road', bn: 'আইআইএম জোকা ও ডায়মন্ড হারবার রোড', hi: 'आईआईएम जोका' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'thakurpukur',
    name: { en: 'Thakurpukur', bn: 'ঠাকুরপুকুর', hi: 'ठाकुरपुकुर' },
    lines: ['purple'],
    orderPurple: 2,
    lat: 22.4550,
    lng: 88.3070,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Thakurpukur Cancer Centre & 3A Bus Stand', bn: 'ঠাকুরপুকুর ৩এ বাস স্ট্যান্ড', hi: 'ठाकुरपुकुर बस स्टैंड' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'sakherbazar',
    name: { en: 'Sakherbazar', bn: 'সখেরবাজার', hi: 'सखेरबाजार' },
    lines: ['purple'],
    orderPurple: 3,
    lat: 22.4680,
    lng: 88.3140,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Sakherbazar Market & Barisha Club Pujas', bn: 'সখেরবাজার ও বড়িশা পুজো অঞ্চল', hi: 'सखेरबाजार व बड़िशा' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'behala-chowrasta',
    name: { en: 'Behala Chowrasta', bn: 'বেহালা চৌরাস্তা', hi: 'बेहाला चौरास्ता' },
    lines: ['purple'],
    orderPurple: 4,
    lat: 22.4830,
    lng: 88.3185,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Behala Nutan Dal & James Long Sarani', bn: 'বেহালা নতুন দল ও জেমস লং সরণি', hi: 'बेहाला नूतन दल व जेम्स लॉन्ग सरणी' } },
    ],
    connectingPandals: ['behala-nutan-dal'],
  },
  {
    id: 'behala-bazar',
    name: { en: 'Behala Bazar', bn: 'বেহালা বাজার', hi: 'बेहाला बाजार' },
    lines: ['purple'],
    orderPurple: 5,
    lat: 22.4920,
    lng: 88.3210,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Behala Tram Depot & Diamond Harbour Road', bn: 'বেহালা ট্রাম ডিপো', hi: 'बेहाला ट्राम डिपो' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'taratala',
    name: { en: 'Taratala', bn: 'তারাতলা', hi: 'तारातला' },
    lines: ['purple'],
    orderPurple: 6,
    lat: 22.5030,
    lng: 88.3235,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Suruchi Sangha (New Alipore) & Taratala Crossing', bn: 'সুরুচি সংঘ (নিউ আলিপুর) ও তারাতলা মোড়', hi: 'सुरुचि संघ (न्यू अलीपुर)' } },
    ],
    connectingPandals: ['suruchi-sangha'],
  },
  {
    id: 'majerhat',
    name: { en: 'Majerhat', bn: 'মাঝেরহাট', hi: 'माझेरहाट' },
    lines: ['purple'],
    orderPurple: 7,
    lat: 22.5185,
    lng: 88.3260,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Majerhat Railway Station & Chetla/Kalighat Bypass', bn: 'মাঝেরহাট স্টেশন ও চেতলা/কালীঘাট বাইপাস', hi: 'माझेरहाट स्टेशन व चेतला बाईपास' } },
    ],
    connectingPandals: [],
  },

  // ==========================================
  // LINE 4 (Yellow Line) - Noapara ↔ Jai Hind (Airport)
  // ==========================================
  // Noapara is declared above with lines: ['blue', 'yellow']
  {
    id: 'dum-dum-cantonment',
    name: { en: 'Dum Dum Cantonment', bn: 'দমদম ক্যান্টনমেন্ট', hi: 'दमदम कैंटोनमेंट' },
    lines: ['yellow'],
    orderYellow: 2,
    lat: 22.6380,
    lng: 88.4050,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Dum Dum Cantt Railway Station Link', bn: 'দমদম ক্যান্টনমেন্ট রেল স্টেশন সংযোগ', hi: 'दमदम कैंट स्टेशन लिंक' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'jessore-road',
    name: { en: 'Jessore Road', bn: 'যশোর রোড', hi: 'जेसोर रोड' },
    lines: ['yellow'],
    orderYellow: 3,
    lat: 22.6450,
    lng: 88.4280,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Jessore Road Highway & Nagerbazar Auto Link', bn: 'যশোর রোড ও নাগেরবাজার অটো সংযোগ', hi: 'यश block রোড व नागेरबाजार' } },
    ],
    connectingPandals: [],
  },
  {
    id: 'jai-hind-airport',
    name: { en: 'Jai Hind', bn: 'জয় হিন্দ', hi: 'जय हिन्द' },
    lines: ['yellow'],
    orderYellow: 4,
    lat: 22.6515,
    lng: 88.4465,
    exitGates: [
      { gate: 'Gate 1', destination: { en: 'Netaji Subhash Chandra Bose International Airport Terminals', bn: 'নেতাজি সুভাষচন্দ্র বসু আন্তর্জাতিক বিমানবন্দর', hi: 'नेताजी सुभाष चंद्र बोस अंतरराष्ट्रीय हवाई अड्डा' } },
    ],
    connectingPandals: [],
  },
];

export const METRO_LINES: import('../types').MetroLineMeta[] = [
  {
    id: 'blue',
    code: 'Line 1',
    name: { en: 'Blue Line (Line 1)', bn: 'ব্লু লাইন (লাইন ১)', hi: 'ब्लू लाइन (लाइन 1)' },
    color: '#2563EB',
    corridor: {
      en: 'North–South spine from Dakshineswar to Kavi Subhash',
      bn: 'উত্তর-দক্ষিণ করিডোর: দক্ষিণেশ্বর থেকে কবি সুভাষ',
      hi: 'उत्तर-दक्षिण गलियारा: दक्षिणेश्वर से कवि सुभाष'
    },
    stationsCount: 26,
    terminalStart: { en: 'Dakshineswar', bn: 'দক্ষিণেশ্বর', hi: 'दक्षिणेश्वर' },
    terminalEnd: { en: 'Kavi Subhash', bn: 'কবি সুভাষ', hi: 'कवि सुभाष' },
    highlightHaloColor: 'rgba(37, 99, 235, 0.4)',
  },
  {
    id: 'green',
    code: 'Line 2',
    name: { en: 'Green Line (Line 2)', bn: 'গ্রিন লাইন (লাইন ২)', hi: 'ग्रीन लाइन (लाइन 2)' },
    color: '#10B981',
    corridor: {
      en: 'East–West corridor, featuring under-river Hooghly tunnel & Bowbazar connector',
      bn: 'পূর্ব-পশ্চিম করিডোর: গঙ্গার তলা দিয়ে টানেল ও বউবাজার সংযোগ',
      hi: 'पूर्व-पश्चिम गलियारा: हुगली नदी सुरंग व बहूबाजार कनेक्टर'
    },
    stationsCount: 12,
    terminalStart: { en: 'Howrah Maidan', bn: 'হাওড়া ময়দান', hi: 'हावड़ा मैदान' },
    terminalEnd: { en: 'Salt Lake Sector V', bn: 'সল্টলেক সেক্টর ৫', hi: 'सॉल्ट लेक सेक्टर 5' },
    highlightHaloColor: 'rgba(16, 185, 129, 0.4)',
  },
  {
    id: 'orange',
    code: 'Line 6',
    name: { en: 'Orange Line (Line 6)', bn: 'অরেঞ্জ লাইন (লাইন ৬)', hi: 'ऑरेंज लाइन (लाइन 6)' },
    color: '#F97316',
    corridor: {
      en: 'EM Bypass corridor to Ruby & Beleghata',
      bn: 'ইএম বাইপাস করিডোর: রুবি ও বেলেঘাটা অভিমুখী',
      hi: 'ईएम बाईपास गलियारा: रूबी व बेलेघाटा'
    },
    stationsCount: 9,
    terminalStart: { en: 'Kavi Subhash', bn: 'কবি সুভাষ', hi: 'कवि सुभाष' },
    terminalEnd: { en: 'Beleghata', bn: 'বেলেঘাটা', hi: 'बेलेघाटा' },
    highlightHaloColor: 'rgba(249, 115, 22, 0.4)',
  },
  {
    id: 'purple',
    code: 'Line 3',
    name: { en: 'Purple Line (Line 3)', bn: 'পার্পল লাইন (লাইন ৩)', hi: 'पर्पल लाइन (लाइन 3)' },
    color: '#9333EA',
    corridor: {
      en: 'Diamond Harbour Rd from Joka to Majerhat',
      bn: 'ডায়মন্ড হারবার রোড: জোকা থেকে মাঝেরহাট',
      hi: 'डायमंड हार्बर रोड: जोका से माझेरहाट'
    },
    stationsCount: 7,
    terminalStart: { en: 'Joka', bn: 'জোকা', hi: 'जोका' },
    terminalEnd: { en: 'Majerhat', bn: 'মাঝেরহাট', hi: 'माझेरहाट' },
    highlightHaloColor: 'rgba(147, 51, 234, 0.4)',
  },
  {
    id: 'yellow',
    code: 'Line 4',
    name: { en: 'Yellow Line (Line 4)', bn: 'ইয়েলো লাইন (লাইন ৪)', hi: 'येलो लाइन (लाइन 4)' },
    color: '#EAB308',
    corridor: {
      en: 'Airport Express corridor to Jai Hind Airport',
      bn: 'বিমানবন্দর এক্সপ্রেস: নোয়াপাড়া থেকে জয় হিন্দ বিমানবন্দর',
      hi: 'एयरपोर्ट एक्सप्रेस: नोआपाड़ा से जय हिन्द एयरपोर्ट'
    },
    stationsCount: 4,
    terminalStart: { en: 'Noapara', bn: 'নোয়াপাড়া', hi: 'नोआपाड़ा' },
    terminalEnd: { en: 'Jai Hind (Airport)', bn: 'জয় হিন্দ (বিমানবন্দর)', hi: 'जय हिन्द (हवाई अड्डा)' },
    highlightHaloColor: 'rgba(234, 179, 8, 0.4)',
  },
];

export function getLineStations(lineId: import('../types').MetroLine): MetroStation[] {
  return METRO_STATIONS.filter((s) => s.lines.includes(lineId)).sort((a, b) => {
    if (lineId === 'blue') return (a.orderBlue ?? 0) - (b.orderBlue ?? 0);
    if (lineId === 'green') return (a.orderGreen ?? 0) - (b.orderGreen ?? 0);
    if (lineId === 'orange') return (a.orderOrange ?? 0) - (b.orderOrange ?? 0);
    if (lineId === 'purple') return (a.orderPurple ?? 0) - (b.orderPurple ?? 0);
    if (lineId === 'yellow') return (a.orderYellow ?? 0) - (b.orderYellow ?? 0);
    return 0;
  });
}

