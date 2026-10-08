import { CuratedTrailPreset } from '../types';

/**
 * 8 Verified Parikrama Circuits & Curated 1-Tap Trails
 * Powered by DharmKriya & Hoppers Kolkata Spatial Database
 */
export const CURATED_TRAILS: CuratedTrailPreset[] = [
  {
    id: 'grand-tour',
    title: {
      en: 'The Grand Tour',
      bn: 'দ্য গ্র্যান্ড ট্যুর পরিক্রমা',
      hi: 'द ग्रैंड टूर परिक्रमा',
    },
    subtitle: {
      en: 'Baghbazar ➔ College Sq ➔ Suruchi ➔ Ekdalia ➔ Santosh Mitra ➔ Sreebhumi',
      bn: 'বাগবাজার ➔ কলেজ স্কয়ার ➔ সুরুচি ➔ একডালিয়া ➔ সন্তোষ মিত্র ➔ শ্রীভূমি',
      hi: 'बागबाजार ➔ कॉलेज स्क्वायर ➔ सुरुचि ➔ एकडालिया ➔ संतोष मित्रा ➔ श्रीभूमि',
    },
    zone: 'Iconic',
    badge: 'Flagship 6-Star Mega Circuit',
    pandalIds: [
      'bagbazar-sarbojanin-durga-puja-mandap',
      'college-square-sarbojanin-durgotsab-committee',
      'suruchi-sangha-new-alipore',
      'ekdalia-evergreen-club',
      'santosh-mitra-square-lebutala',
      'sreebhumi-sporting-club',
    ],
  },
  {
    id: 'north-classics',
    title: {
      en: 'North Kolkata Classics',
      bn: 'উত্তর কলকাতা সাবেকি ঐতিহ্য পরিক্রমা',
      hi: 'उत्तर कोलकाता हेरिटेज वॉक',
    },
    subtitle: {
      en: 'Baghbazar ➔ Kumartuli ➔ Sovabazar Rajbari ➔ Ahiritola ➔ College Sq ➔ Santosh Mitra',
      bn: 'বাগবাজার ➔ কুমোরটুলি ➔ শোভাবাজার রাজবাড়ি ➔ আহিরীটোলা ➔ কলেজ স্কয়ার ➔ সন্তোষ মিত্র',
      hi: 'बागबाजार ➔ कुमोरटुली ➔ शोभाबाजार राजबाड़ी ➔ आहिरीटोला ➔ कॉलेज स्क्वायर ➔ संतोष मित्रा',
    },
    zone: 'North',
    badge: 'Sabeki & Heritage',
    pandalIds: [
      'bagbazar-sarbojanin-durga-puja-mandap',
      'kumartuli-park-sarbojanin-durgotsab',
      'dk_sovabazar-rajbarir-durga-pujo',
      'ahiritola-jubakbrinda-sarbojanin-sarodotsab',
      'college-square-sarbojanin-durgotsab-committee',
      'santosh-mitra-square-lebutala',
    ],
  },
  {
    id: 'south-big-budget',
    title: {
      en: 'South Kolkata Big-Budget',
      bn: 'দক্ষিণ কলকাতার মহারথী মণ্ডপ ট্রেইল',
      hi: 'दक्षिण कोलकाता बिग-बजट मेगास्टार',
    },
    subtitle: {
      en: 'Ekdalia ➔ Singhi Park ➔ Samaj Sebi ➔ Ballygunge Cultural ➔ Deshapriya ➔ Maddox Sq',
      bn: 'একডালিয়া ➔ সিংহী পার্ক ➔ সমাজ সেবী ➔ বালিগঞ্জ কালচারাল ➔ দেশপ্রিয় পার্ক ➔ ম্যাডক্স স্কয়ার',
      hi: 'एकডালিয়া ➔ সিংহী পার্ক ➔ সমাজ সেবী ➔ বালিগঞ্জ কালচারাল ➔ দেশপ্রিয় পার্ক ➔ ম্যাডক্স স্কয়ার',
    },
    zone: 'South',
    badge: 'Colossal Crowd Pullers',
    pandalIds: [
      'ekdalia-evergreen-club',
      'singhi-park-sarbojanin-durgapuja-committee',
      'samaj-sebi-sangha',
      'ballygunge-cultural-association',
      'deshapriya-park-sarbojanin-durgotsab',
      'maddox-square-durga-pujo',
    ],
  },
  {
    id: 'theme-trail',
    title: {
      en: 'Theme & Award Trail',
      bn: 'থিম ও সেরার সেরা শিরোপা ট্রেইল',
      hi: 'थीम और अवॉर्ड विनर ट्रेल',
    },
    subtitle: {
      en: 'Chetla Agrani ➔ Suruchi Sangha ➔ Mudiali ➔ 66 Palli ➔ Badamtala ➔ Tridhara',
      bn: 'চেতলা অগ্রণী ➔ সুরুচি সংঘ ➔ মুদিয়ালি ➔ ৬৬ পল্লী ➔ বাদামতলা ➔ ত্রিধারা',
      hi: 'चेतला अग्रिणी ➔ सुरुचि संघ ➔ मुदियाली ➔ 66 पल्ली ➔ बादामतला ➔ त्रिधारा',
    },
    zone: 'South',
    badge: 'Award Winning Artistry',
    pandalIds: [
      'chetla-agroni-club',
      'suruchi-sangha-new-alipore',
      'mudiali-club',
      '66-pally-durgapuja-pandal',
      'badamtala-ashar-sangha',
      'tridhara-sammilani',
    ],
  },
  {
    id: 'salt-lake',
    title: {
      en: 'Salt Lake & Sreebhumi',
      bn: 'সল্টলেক ও শ্রীভূমি আভিজাত্য ট্রেইল',
      hi: 'सॉल्ट लेक व श्रीभूमि सर्किट',
    },
    subtitle: {
      en: 'Sreebhumi ➔ Salt Lake FD Block ➔ Salt Lake BJ Block ➔ Salt Lake CK Block',
      bn: 'শ্রীভূমি ➔ সল্টলেক এফডি ব্লক ➔ সল্টলেক বিজে ব্লক ➔ সল্টলেক সিকে ব্লক',
      hi: 'श्रीभूमि ➔ सॉल्ट लेक एफडी ब्लॉक ➔ सॉल्ट लेक बीजे ब्लॉक ➔ सॉल्ट लेक सीके ब्लॉक',
    },
    zone: 'Salt Lake & Rajarhat',
    badge: 'Grand Scale & Illumination',
    pandalIds: [
      'sreebhumi-sporting-club',
      'salt-lake-fd-block',
      'salt-lake-bj-block',
      'salt-lake-ck-block',
    ],
  },
  {
    id: 'behala',
    title: {
      en: 'Behala Circuit',
      bn: 'বেহালা সাংস্কৃতিক পরিক্রমা',
      hi: 'बेहाला सांस्कृतिक सर्किट',
    },
    subtitle: {
      en: 'Barisha Club ➔ Behala Natun Dal ➔ Ajeya Sanghati',
      bn: 'বড়িশা ক্লাব ➔ বেহালা নতুন দল ➔ অজেয় সংহতি',
      hi: 'बरिशा क्लब ➔ बेहाला नतून दल ➔ अजेय संहति',
    },
    zone: 'Behala',
    badge: 'Art Installations & Thoughtful Themes',
    pandalIds: [
      'barisha-club',
      'behala-natun-dal',
      'dk_ajeya-sanghati',
    ],
  },
  {
    id: 'kasba-craft',
    title: {
      en: 'Kasba & Eastern Craft',
      bn: 'কসবা ও পূর্ব কলকাতা শিল্পকলা ট্রেইল',
      hi: 'कसबा और पूर्वी कोलकाता शिल्प ट्रेल',
    },
    subtitle: {
      en: 'Bosepukur Sitala Mandir ➔ Rajdanga Naba Uday ➔ Bosepukur Talbagan ➔ Telengabagan',
      bn: 'বোসপুকুর শীতলা মন্দির ➔ রাজডাঙ্গা নব উদয় ➔ বোসপুকুর তালবাগান ➔ তেলেঙ্গাবাগান',
      hi: 'बोसपुकुर शीतला मंदिर ➔ राजडांगा नव उदय ➔ बोसपुकुर तालबागान ➔ तेलेंगाबागान',
    },
    zone: 'East',
    badge: 'Handicraft & Rural Revival',
    pandalIds: [
      'bosepukur-sitala-mandir',
      'rajdanga-naba-uday-sangha',
      'bosepukur-talbagan',
      'telengabagan-sarbojanin-durgotsab',
    ],
  },
  {
    id: 'metro-parikrama',
    title: {
      en: 'Metro Parikrama',
      bn: 'মেট্রো লাইফলাইন পরিক্রমা',
      hi: 'मेट्रो लाइफलाइन परिक्रमा',
    },
    subtitle: {
      en: 'Tala Prattoy ➔ Hatibagan ➔ Sovabazar ➔ Kumartuli ➔ College Sq ➔ Deshapriya ➔ Badamtala ➔ Mudiali ➔ Naktala',
      bn: 'টালা প্রত্যয় ➔ হাতিবাগান ➔ শোভাবাজার ➔ কুমোরটুলি ➔ কলেজ স্কয়ার ➔ দেশপ্রিয় পার্ক ➔ বাদামতলা ➔ মুদিয়ালি ➔ নাকতলা',
      hi: 'टाला प्रत्यय ➔ हाथीबागान ➔ शोभाबाजार ➔ कुमोरटुली ➔ कॉलेज स्क्वायर ➔ देशप्रिय पार्क ➔ बादामतला ➔ मुदियाली ➔ नाकतला',
    },
    zone: 'Iconic',
    badge: 'Blue Line Zero-Traffic Hopping',
    pandalIds: [
      'tala-prattoy',
      'nabin-pally-sarbojanin-durgotsav-hatibagan-nabinpally',
      'sovabazar-rajbari-boro-rajbari',
      'kumartuli-park-sarbojanin-durgotsab',
      'college-square-sarbojanin-durgotsab-committee',
      'deshapriya-park-sarbojanin-durgotsab',
      'badamtala-ashar-sangha',
      'mudiali-club',
      'udayan-sangha',
    ],
  },
];
