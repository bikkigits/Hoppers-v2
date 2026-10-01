// Path: src/data/poiData.ts

import { HospitalPOI, SanitationPOI, DiningPOI, UnifiedPOI, CivicPOICategory, GeoBoundingBox } from '../types';

// 1. 18 Verified 24x7 Emergency Hospitals with direct mobile tel: dialing
export const hospitalsList: HospitalPOI[] = [
  {
    id: 'hosp-01',
    name: 'SSKM Hospital (IPGMER)',
    category: 'hospital',
    coordinates: { lat: 22.5394, lng: 88.3432 },
    zone: 'South',
    address: '244, AJC Bose Road, Bhowanipore, Kolkata 700020',
    landmark: 'Near Rabindra Sadan Metro',
    emergencyPhone: '+913322231589',
    bloodBank: true,
    is24x7: true,
    totalBeds: 1800
  },
  {
    id: 'hosp-02',
    name: 'Calcutta Medical College & Hospital',
    category: 'hospital',
    coordinates: { lat: 22.5735, lng: 88.3618 },
    zone: 'Central',
    address: '88, College Street, Bowbazar, Kolkata 700073',
    landmark: 'Opposite Presidency University',
    emergencyPhone: '+913322551633',
    bloodBank: true,
    is24x7: true,
    totalBeds: 1200
  },
  {
    id: 'hosp-03',
    name: 'NRS Medical College & Hospital',
    category: 'hospital',
    coordinates: { lat: 22.5647, lng: 88.3698 },
    zone: 'Central',
    address: '138, AJC Bose Road, Sealdah, Kolkata 700014',
    landmark: 'Near Sealdah Railway Station',
    emergencyPhone: '+913322860033',
    bloodBank: true,
    is24x7: true,
    totalBeds: 1400
  },
  {
    id: 'hosp-04',
    name: 'R. G. Kar Medical College & Hospital',
    category: 'hospital',
    coordinates: { lat: 22.6044, lng: 88.3756 },
    zone: 'North',
    address: '1, Khudiram Bose Sarani, Belgachia, Kolkata 700004',
    landmark: 'Near Shyambazar 5-point crossing',
    emergencyPhone: '+913325557656',
    bloodBank: true,
    is24x7: true,
    totalBeds: 1200
  },
  {
    id: 'hosp-05',
    name: 'Calcutta National Medical College (CNMC)',
    category: 'hospital',
    coordinates: { lat: 22.5412, lng: 88.3712 },
    zone: 'South',
    address: '32, Gorachand Road, Beniapukur, Kolkata 700014',
    landmark: 'Near Park Circus 7-point crossing',
    emergencyPhone: '+913322844834',
    bloodBank: true,
    is24x7: true,
    totalBeds: 1100
  },
  {
    id: 'hosp-06',
    name: 'Apollo Multispeciality Hospitals',
    category: 'hospital',
    coordinates: { lat: 22.5701, lng: 88.4039 },
    zone: 'East',
    address: '58, Canal Circular Road, Kadapara, Phoolbagan, Kolkata 700054',
    landmark: 'Off EM Bypass',
    emergencyPhone: '+913323203040',
    bloodBank: true,
    is24x7: true,
    totalBeds: 700
  },
  {
    id: 'hosp-07',
    name: 'Fortis Hospital Anandapur',
    category: 'hospital',
    coordinates: { lat: 22.5165, lng: 88.4014 },
    zone: 'East',
    address: '730, Anandapur, EM Bypass Road, Kolkata 700107',
    landmark: 'Near Ruby General Hospital',
    emergencyPhone: '+913366284444',
    bloodBank: true,
    is24x7: true,
    totalBeds: 400
  },
  {
    id: 'hosp-08',
    name: 'Ruby General Hospital',
    category: 'hospital',
    coordinates: { lat: 22.5132, lng: 88.4021 },
    zone: 'East',
    address: 'Kasba Golpark, EM Bypass, Kolkata 700107',
    landmark: 'Ruby More Crossing',
    emergencyPhone: '+913339871800',
    bloodBank: true,
    is24x7: true,
    totalBeds: 316
  },
  {
    id: 'hosp-09',
    name: 'AMRI Hospitals Dhakuria',
    category: 'hospital',
    coordinates: { lat: 22.5115, lng: 88.3638 },
    zone: 'South',
    address: 'Block-A, Scheme-LII, P-4&5, Gariahat Rd, Dhakuria, Kolkata 700029',
    landmark: 'Near Dhakuria Railway Bridge',
    emergencyPhone: '+913366063800',
    bloodBank: true,
    is24x7: true,
    totalBeds: 220
  },
  {
    id: 'hosp-10',
    name: 'Belle Vue Clinic',
    category: 'hospital',
    coordinates: { lat: 22.5442, lng: 88.3541 },
    zone: 'South',
    address: '9, Dr. UN Brahmachari St, Elgin, Kolkata 700017',
    landmark: 'Near Loudon Street Crossing',
    emergencyPhone: '+913322872321',
    bloodBank: true,
    is24x7: true,
    totalBeds: 372
  },
  {
    id: 'hosp-11',
    name: 'Woodlands Multispeciality Hospital',
    category: 'hospital',
    coordinates: { lat: 22.5342, lng: 88.3312 },
    zone: 'South',
    address: '8/5, Alipore Road, Alipore, Kolkata 700027',
    landmark: 'Near National Library',
    emergencyPhone: '+913340337000',
    bloodBank: true,
    is24x7: true,
    totalBeds: 240
  },
  {
    id: 'hosp-12',
    name: 'Peerless Hospital & B.K. Roy Research Centre',
    category: 'hospital',
    coordinates: { lat: 22.4842, lng: 88.3972 },
    zone: 'Jadavpur',
    address: '360, Panchasayar, Garia, Kolkata 700094',
    landmark: 'Near Kavi Subhash Metro Station',
    emergencyPhone: '+913340111222',
    bloodBank: true,
    is24x7: true,
    totalBeds: 500
  },
  {
    id: 'hosp-13',
    name: 'Medica Superspecialty Hospital',
    category: 'hospital',
    coordinates: { lat: 22.4891, lng: 88.3985 },
    zone: 'Jadavpur',
    address: '127, Mukundapur, E.M. Bypass, Kolkata 700099',
    landmark: 'Mukundapur crossing',
    emergencyPhone: '+913366520000',
    bloodBank: true,
    is24x7: true,
    totalBeds: 500
  },
  {
    id: 'hosp-14',
    name: 'Desun Hospital',
    category: 'hospital',
    coordinates: { lat: 22.5147, lng: 88.4029 },
    zone: 'East',
    address: '720, Anandapur, Desun More, EM Bypass, Kolkata 700107',
    landmark: 'Next to Ruby More',
    emergencyPhone: '+919051715171',
    bloodBank: true,
    is24x7: true,
    totalBeds: 300
  },
  {
    id: 'hosp-15',
    name: 'Kothari Medical Centre',
    category: 'hospital',
    coordinates: { lat: 22.5311, lng: 88.3325 },
    zone: 'South',
    address: '8/3, Alipore Road, Alipore, Kolkata 700027',
    landmark: 'Alipore Zoo flank',
    emergencyPhone: '+913324567050',
    bloodBank: true,
    is24x7: true,
    totalBeds: 360
  },
  {
    id: 'hosp-16',
    name: 'Calcutta Heart Clinic & Hospital',
    category: 'hospital',
    coordinates: { lat: 22.5855, lng: 88.4112 },
    zone: 'Salt Lake',
    address: 'HC Block, Sector III, Bidhannagar, Kolkata 700106',
    landmark: 'Near Karunamoyee Bus Station',
    emergencyPhone: '+913323585212',
    bloodBank: true,
    is24x7: true,
    totalBeds: 120
  },
  {
    id: 'hosp-17',
    name: 'Vidyasagar State General Hospital',
    category: 'hospital',
    coordinates: { lat: 22.4988, lng: 88.3125 },
    zone: 'Behala',
    address: 'Brahmomoyee Bagan, Behala, Kolkata 700034',
    landmark: 'Diamond Harbour Road flank',
    emergencyPhone: '+913323980112',
    bloodBank: false,
    is24x7: true,
    totalBeds: 250
  },
  {
    id: 'hosp-18',
    name: 'B.R. Singh Hospital (Eastern Railway)',
    category: 'hospital',
    coordinates: { lat: 22.5658, lng: 88.3732 },
    zone: 'Central',
    address: 'Sealdah Railway Complex, Kaiser Street, Kolkata 700014',
    landmark: 'Adjacent to Sealdah Station DRM building',
    emergencyPhone: '+913323505298',
    bloodBank: true,
    is24x7: true,
    totalBeds: 450
  }
];

// 2. 19 Sanitation/Toilet Facilities in High-Density Hubs
export const sanitationList: SanitationPOI[] = [
  {
    id: 'toilet-01',
    name: 'KMC Public Toilet Kalighat',
    category: 'toilet',
    coordinates: { lat: 22.5218, lng: 88.3468 },
    zone: 'South',
    address: 'Near Kalighat Temple Gate 2, Kalighat',
    operator: 'KMC',
    hasDifferentlyAbledAccess: true,
    fee: 0
  },
  {
    id: 'toilet-02',
    name: 'Sulabh Complex Gariahat Crossing',
    category: 'toilet',
    coordinates: { lat: 22.5192, lng: 88.3654 },
    zone: 'South',
    address: 'Under Gariahat Flyover, Kolkata 700019',
    operator: 'Sulabh',
    hasDifferentlyAbledAccess: false,
    fee: 5
  },
  {
    id: 'toilet-03',
    name: 'Esplanade Metro Concourse Restroom',
    category: 'toilet',
    coordinates: { lat: 22.5654, lng: 88.3518 },
    zone: 'Central',
    address: 'Esplanade Interchange Concourse, Dharmatala',
    operator: 'Metro',
    hasDifferentlyAbledAccess: true,
    fee: 0
  },
  {
    id: 'toilet-04',
    name: 'Shyambazar Five-Point KMC Facility',
    category: 'toilet',
    coordinates: { lat: 22.6022, lng: 88.3731 },
    zone: 'North',
    address: 'Near Netaji Statue, Shyambazar',
    operator: 'KMC',
    hasDifferentlyAbledAccess: false,
    fee: 2
  },
  {
    id: 'toilet-05',
    name: 'College Street Boi Para Sulabh',
    category: 'toilet',
    coordinates: { lat: 22.5744, lng: 88.3631 },
    zone: 'Central',
    address: 'Near Coffee House lane, College Street',
    operator: 'Sulabh',
    hasDifferentlyAbledAccess: false,
    fee: 5
  },
  {
    id: 'toilet-06',
    name: 'Bagbazar Launch Ghat Public Toilet',
    category: 'toilet',
    coordinates: { lat: 22.6068, lng: 88.3651 },
    zone: 'North',
    address: 'Near Bagbazar Ferry Ghat, Girish Avenue',
    operator: 'KMC',
    hasDifferentlyAbledAccess: true,
    fee: 0
  },
  {
    id: 'toilet-07',
    name: 'Sovabazar Metro Station Sanitation Block',
    category: 'toilet',
    coordinates: { lat: 22.5975, lng: 88.3688 },
    zone: 'North',
    address: 'Sovabazar Sutanuti Metro Entrance',
    operator: 'Metro',
    hasDifferentlyAbledAccess: true,
    fee: 0
  },
  {
    id: 'toilet-08',
    name: 'Dum Dum Station South Concourse Sulabh',
    category: 'toilet',
    coordinates: { lat: 22.6212, lng: 88.3934 },
    zone: 'North',
    address: 'Near Metro Gate 1, Dum Dum',
    operator: 'Sulabh',
    hasDifferentlyAbledAccess: true,
    fee: 5
  },
  {
    id: 'toilet-09',
    name: 'Ruby Hospital Crossing KMC Restroom',
    category: 'toilet',
    coordinates: { lat: 22.5129, lng: 88.4018 },
    zone: 'East',
    address: 'Near Ruby Bus Stand, EM Bypass',
    operator: 'KMC',
    hasDifferentlyAbledAccess: false,
    fee: 2
  },
  {
    id: 'toilet-10',
    name: 'Jadavpur 8B Bus Stand Sulabh',
    category: 'toilet',
    coordinates: { lat: 22.4975, lng: 88.3718 },
    zone: 'Jadavpur',
    address: 'Inside 8B Bus Terminus, Jadavpur',
    operator: 'Sulabh',
    hasDifferentlyAbledAccess: true,
    fee: 5
  },
  {
    id: 'toilet-11',
    name: 'Rashbehari Avenue / Triangular Park KMC',
    category: 'toilet',
    coordinates: { lat: 22.5178, lng: 88.3582 },
    zone: 'South',
    address: 'Opposite Triangular Park, Rashbehari Avenue',
    operator: 'KMC',
    hasDifferentlyAbledAccess: false,
    fee: 0
  },
  {
    id: 'toilet-12',
    name: 'Behala Chowrasta Public Restroom',
    category: 'toilet',
    coordinates: { lat: 22.4925, lng: 88.3155 },
    zone: 'Behala',
    address: 'Diamond Harbour Road, Behala Chowrasta',
    operator: 'KMC',
    hasDifferentlyAbledAccess: false,
    fee: 2
  },
  {
    id: 'toilet-13',
    name: 'Park Circus 7-Point Sulabh Shauchalaya',
    category: 'toilet',
    coordinates: { lat: 22.5428, lng: 88.3688 },
    zone: 'Central',
    address: 'Near Orient Cinema Bus Stop, Park Circus',
    operator: 'Sulabh',
    hasDifferentlyAbledAccess: true,
    fee: 5
  },
  {
    id: 'toilet-14',
    name: 'Howrah Bridge Kolkata-side Ghat Sanitation Block',
    category: 'toilet',
    coordinates: { lat: 22.5848, lng: 88.3562 },
    zone: 'Central',
    address: 'Strand Bank Road, Near Jagannath Ghat',
    operator: 'KMC',
    hasDifferentlyAbledAccess: true,
    fee: 0
  },
  {
    id: 'toilet-15',
    name: 'Salt Lake Karunamoyee Bus Terminus Toilet',
    category: 'toilet',
    coordinates: { lat: 22.5862, lng: 88.4135 },
    zone: 'Salt Lake',
    address: 'Karunamoyee Central Bus Station, Sector II',
    operator: 'Sulabh',
    hasDifferentlyAbledAccess: true,
    fee: 5
  },
  {
    id: 'toilet-16',
    name: 'Sealdah Station Main Concourse Facility',
    category: 'toilet',
    coordinates: { lat: 22.5681, lng: 88.3715 },
    zone: 'Central',
    address: 'Sealdah South & North Passenger Corridor',
    operator: 'Metro',
    hasDifferentlyAbledAccess: true,
    fee: 5
  },
  {
    id: 'toilet-17',
    name: 'Hazra Crossing KMC Facility',
    category: 'toilet',
    coordinates: { lat: 22.5274, lng: 88.3478 },
    zone: 'South',
    address: 'Near Jatin Das Park Metro Gate 2, Hazra Rd',
    operator: 'KMC',
    hasDifferentlyAbledAccess: false,
    fee: 0
  },
  {
    id: 'toilet-18',
    name: 'Hatibagan Market Sulabh',
    category: 'toilet',
    coordinates: { lat: 22.5942, lng: 88.3721 },
    zone: 'North',
    address: 'Bidhan Sarani, Inside Hatibagan Market compound',
    operator: 'Sulabh',
    hasDifferentlyAbledAccess: false,
    fee: 5
  },
  {
    id: 'toilet-19',
    name: 'Ultadanga Hudco Crossing Sanitation Block',
    category: 'toilet',
    coordinates: { lat: 22.5912, lng: 88.3892 },
    zone: 'North',
    address: 'Near Ultadanga Underpass, VIP Road start',
    operator: 'KMC',
    hasDifferentlyAbledAccess: true,
    fee: 2
  }
];

// 3. 34 Segregated Food Spots (17 Pure-Veg + 17 Late-Night Iconic)
export const pureVegList: DiningPOI[] = [
  {
    id: 'veg-01',
    name: 'Anand Restaurant',
    category: 'pure_veg',
    coordinates: { lat: 22.5641, lng: 88.3548 },
    zone: 'Central',
    address: '19, C.R. Avenue, Chandni Chawk, Kolkata 700072',
    landmark: 'Near Chandni Chowk Metro',
    cuisine: ['South Indian', 'Pure Veg North Indian'],
    isLateNight: false,
    pureVeg: true,
    avgCostForTwo: 450
  },
  {
    id: 'veg-02',
    name: "Balwant Singh's Eating House",
    category: 'pure_veg',
    coordinates: { lat: 22.5361, lng: 88.3458 },
    zone: 'South',
    address: '10/B, Harish Mukherjee Road, Bhawanipur, Kolkata 700025',
    landmark: 'Near Gurdwara Sant Kutiya',
    cuisine: ['Doodh Cola', 'Punjabi Dhaba', 'Chai', 'Pure Veg Snacks'],
    isLateNight: true,
    pureVeg: true,
    avgCostForTwo: 400
  },
  {
    id: 'veg-03',
    name: 'Tewari Brothers Mithai Shop (Burrabazar)',
    category: 'pure_veg',
    coordinates: { lat: 22.5792, lng: 88.3551 },
    zone: 'Central',
    address: '161, Mahatma Gandhi Road, Burrabazar, Kolkata 700007',
    landmark: 'Near MG Road Metro',
    cuisine: ['Pure Desi Ghee Sweets', 'Samosa', 'Kachori Jalebi'],
    isLateNight: false,
    pureVeg: true,
    avgCostForTwo: 300
  },
  {
    id: 'veg-04',
    name: "Govinda's Restaurant (ISKCON)",
    category: 'pure_veg',
    coordinates: { lat: 22.5385, lng: 88.3612 },
    zone: 'South',
    address: '3C, Albert Road, Near Minto Park, Kolkata 700017',
    landmark: 'ISKCON Temple premises',
    cuisine: ['Sattvik', 'North Indian', 'Thali'],
    isLateNight: false,
    pureVeg: true,
    avgCostForTwo: 600
  },
  {
    id: 'veg-05',
    name: 'Gupta Brothers (Elgin Road)',
    category: 'pure_veg',
    coordinates: { lat: 22.5378, lng: 88.3498 },
    zone: 'South',
    address: '18/1, Ashutosh Mukherjee Road, Elgin, Kolkata 700020',
    landmark: 'Near Forum Mall',
    cuisine: ['Vegetarian Snacks', 'Thali', 'Sweets'],
    isLateNight: false,
    pureVeg: true,
    avgCostForTwo: 500
  },
  {
    id: 'veg-06',
    name: "Haldiram's Food City (Chinar Park)",
    category: 'pure_veg',
    coordinates: { lat: 22.6241, lng: 88.4385 },
    zone: 'East',
    address: 'Chinar Park Crossing, Rajarhat Main Road, Kolkata 700157',
    landmark: 'Chinar Park Crossing',
    cuisine: ['Pure Veg Chaat', 'North Indian', 'Thali'],
    isLateNight: false,
    pureVeg: true,
    avgCostForTwo: 550
  },
  {
    id: 'veg-07',
    name: 'Kaidi Kitchen',
    category: 'pure_veg',
    coordinates: { lat: 22.5492, lng: 88.3572 },
    zone: 'Central',
    address: '12A, Camac Street, Elgin, Kolkata 700017',
    landmark: 'Near Vardaan Market',
    cuisine: ['Pure Veg Mexican', 'North Indian', 'Italian'],
    isLateNight: false,
    pureVeg: true,
    avgCostForTwo: 1200
  },
  {
    id: 'veg-08',
    name: 'Jyoti Vihar',
    category: 'pure_veg',
    coordinates: { lat: 22.5532, lng: 88.3521 },
    zone: 'Central',
    address: '3A/1A, Ho Chi Minh Sarani, Park Street area, Kolkata 700071',
    landmark: 'Near US Consulate',
    cuisine: ['Authentic South Indian', 'Filter Coffee'],
    isLateNight: false,
    pureVeg: true,
    avgCostForTwo: 350
  },
  {
    id: 'veg-09',
    name: 'Casa Kitchen',
    category: 'pure_veg',
    coordinates: { lat: 22.5408, lng: 88.3512 },
    zone: 'South',
    address: 'Hotel Casa Fortuna, 234/1, AJC Bose Road, Kolkata 700020',
    landmark: 'Near Minto Park',
    cuisine: ['Pure Veg Continental', 'North Indian'],
    isLateNight: false,
    pureVeg: true,
    avgCostForTwo: 1100
  },
  {
    id: 'veg-10',
    name: 'Pabrai’s Fresh & Naturelle Ice Creams',
    category: 'pure_veg',
    coordinates: { lat: 22.5312, lng: 88.3621 },
    zone: 'South',
    address: '28, Sarat Bose Road, Paddapukur, Kolkata 700020',
    landmark: 'Opposite Health Point Nursing Home',
    cuisine: ['100% Pure Veg Artisanal Ice Cream', 'Nolen Gur Special'],
    isLateNight: true,
    pureVeg: true,
    avgCostForTwo: 300
  },
  {
    id: 'veg-11',
    name: 'Banana Leaf (Southern Avenue)',
    category: 'pure_veg',
    coordinates: { lat: 22.5085, lng: 88.3562 },
    zone: 'South',
    address: 'P-257, Lake Road, Hemanta Mukherjee Sarani, Kolkata 700029',
    landmark: 'Near Vivekananda Park',
    cuisine: ['South Indian Banana Leaf Meal', 'Dosa'],
    isLateNight: false,
    pureVeg: true,
    avgCostForTwo: 450
  },
  {
    id: 'veg-12',
    name: 'Sharma Tea House',
    category: 'pure_veg',
    coordinates: { lat: 22.5352, lng: 88.3491 },
    zone: 'South',
    address: '18, Sambhunath Pandit St, Bhowanipore, Kolkata 700020',
    landmark: 'Near PG Hospital',
    cuisine: ['Kachori', 'Jalebi', 'Kulhad Chai'],
    isLateNight: true,
    pureVeg: true,
    avgCostForTwo: 180
  },
  {
    id: 'veg-13',
    name: 'Balaram Mullick & Radharaman Mullick (Bhawanipur)',
    category: 'pure_veg',
    coordinates: { lat: 22.5298, lng: 88.3488 },
    zone: 'South',
    address: '2, Paddapukur Road, Bhowanipore, Kolkata 700020',
    landmark: 'Near Jadubabur Bazar',
    cuisine: ['Pure Traditional Bengali Sweets', 'Baked Rosogolla'],
    isLateNight: false,
    pureVeg: true,
    avgCostForTwo: 250
  },
  {
    id: 'veg-14',
    name: 'Vaidic (Pure Veg Dining)',
    category: 'pure_veg',
    coordinates: { lat: 22.5768, lng: 88.4215 },
    zone: 'Salt Lake',
    address: 'RDB Boulevard, Block EP & GP, Sector V, Salt Lake, Kolkata 700091',
    landmark: 'Near College More',
    cuisine: ['Pure Veg North Indian', 'Jain Special'],
    isLateNight: false,
    pureVeg: true,
    avgCostForTwo: 750
  },
  {
    id: 'veg-15',
    name: 'Kookie Jar (Alipore Pure Veg Corner)',
    category: 'pure_veg',
    coordinates: { lat: 22.5322, lng: 88.3341 },
    zone: 'South',
    address: 'Alipore Park Road, Kolkata 700027',
    landmark: 'Alipore Post Office flank',
    cuisine: ['Eggless Bakery', 'Gourmet Desserts'],
    isLateNight: false,
    pureVeg: true,
    avgCostForTwo: 400
  },
  {
    id: 'veg-16',
    name: 'Ramkrishna Lunch Home',
    category: 'pure_veg',
    coordinates: { lat: 22.5181, lng: 88.3512 },
    zone: 'South',
    address: '36, Sarat Bose Road, Lansdowne, Kolkata 700020',
    landmark: 'Near Lansdowne Padmapukur',
    cuisine: ['Udupi South Indian', 'Pure Veg Filter Coffee'],
    isLateNight: false,
    pureVeg: true,
    avgCostForTwo: 300
  },
  {
    id: 'veg-17',
    name: 'Maharaj Snack Bar (Sarat Bose Road)',
    category: 'pure_veg',
    coordinates: { lat: 22.5165, lng: 88.3531 },
    zone: 'South',
    address: '194, Sarat Bose Road, Lake Market, Kalighat, Kolkata 700029',
    landmark: 'Opposite Deshapriya Park gate',
    cuisine: ['Kachori', 'Jalebi', 'Pure Veg Snacks'],
    isLateNight: false,
    pureVeg: true,
    avgCostForTwo: 160
  }
];

export const iconicFoodList: DiningPOI[] = [
  {
    id: 'food-01',
    name: 'Arsalan (Park Circus 7-Point)',
    category: 'iconic_food',
    coordinates: { lat: 22.5422, lng: 88.3675 },
    zone: 'Central',
    address: '191, Marina Garden Court, Park Street, Park Circus, Kolkata 700017',
    landmark: 'Park Circus 7-Point Crossing',
    cuisine: ['Kolkata Dum Biryani', 'Mughlai', 'Kebabs'],
    isLateNight: true,
    pureVeg: false,
    avgCostForTwo: 850
  },
  {
    id: 'food-02',
    name: 'Shiraz Golden Restaurant',
    category: 'iconic_food',
    coordinates: { lat: 22.5491, lng: 88.3639 },
    zone: 'Central',
    address: '135, Park Street, Mullick Bazar, Beniapukur, Kolkata 700014',
    landmark: 'Mullick Bazar Crossing',
    cuisine: ['Mutton Chaap', 'Biryani', 'Rolls'],
    isLateNight: true,
    pureVeg: false,
    avgCostForTwo: 750
  },
  {
    id: 'food-03',
    name: 'Aminia (New Market)',
    category: 'iconic_food',
    coordinates: { lat: 22.5638, lng: 88.3531 },
    zone: 'Central',
    address: '6A, SN Banerjee Road, New Market, Dharmatala, Kolkata 700087',
    landmark: 'Next to Kolkata Municipal Corporation HQ',
    cuisine: ['Kolkata Awadhi Biryani', 'Rezala', 'Mutton Pasinda'],
    isLateNight: true,
    pureVeg: false,
    avgCostForTwo: 700
  },
  {
    id: 'food-04',
    name: 'Peter Cat',
    category: 'iconic_food',
    coordinates: { lat: 22.5528, lng: 88.3539 },
    zone: 'Central',
    address: '18A, Park Street, Park Street area, Kolkata 700016',
    landmark: 'Opposite Stephen Court',
    cuisine: ['Chelo Kebab', 'Continental', 'Tandoor'],
    isLateNight: false,
    pureVeg: false,
    avgCostForTwo: 1400
  },
  {
    id: 'food-05',
    name: 'Mocambo Restaurant',
    category: 'iconic_food',
    coordinates: { lat: 22.5525, lng: 88.3536 },
    zone: 'Central',
    address: '25B, Park Street, Kolkata 700016',
    landmark: 'Next to Peter Cat',
    cuisine: ['Devilled Crab', 'Beckty Bell Meuniere', 'Continental'],
    isLateNight: false,
    pureVeg: false,
    avgCostForTwo: 1500
  },
  {
    id: 'food-06',
    name: 'Olypub (Park Street)',
    category: 'iconic_food',
    coordinates: { lat: 22.5535, lng: 88.3531 },
    zone: 'Central',
    address: '21, Park Street, Taltala, Kolkata 700016',
    landmark: 'Near Park Street Metro Gate 1',
    cuisine: ['Late Night Steaks', 'Bar Bites'],
    isLateNight: true,
    pureVeg: false,
    avgCostForTwo: 800
  },
  {
    id: 'food-07',
    name: 'Royal India Hotel',
    category: 'iconic_food',
    coordinates: { lat: 22.5832, lng: 88.3582 },
    zone: 'Central',
    address: '147, Rabindra Sarani, Chitpur, Barabazar, Kolkata 700073',
    landmark: 'Near Nakhoda Masjid',
    cuisine: ['Mutton Chaap', 'Royal Biryani without Potato', 'Shahi Tukda'],
    isLateNight: true,
    pureVeg: false,
    avgCostForTwo: 650
  },
  {
    id: 'food-08',
    name: 'Mitra Cafe (Shobhabazar)',
    category: 'iconic_food',
    coordinates: { lat: 22.5978, lng: 88.3685 },
    zone: 'North',
    address: '47, Jatindra Mohan Avenue, Shobhabazar, Kolkata 700005',
    landmark: 'Opposite Shobhabazar Metro Station',
    cuisine: ['Diamond Fish Fry', 'Brain Chop', 'Mutton Kabiraji'],
    isLateNight: true,
    pureVeg: false,
    avgCostForTwo: 450
  },
  {
    id: 'food-09',
    name: 'Golbari (Kosha Mangsho)',
    category: 'iconic_food',
    coordinates: { lat: 22.6025, lng: 88.3735 },
    zone: 'North',
    address: 'Acharya Prafulla Chandra Rd, Shyambazar 5-point, Kolkata 700004',
    landmark: 'Shyambazar Five Point Crossing',
    cuisine: ['Iconic Kosha Mangsho', 'Tandoori Roti'],
    isLateNight: true,
    pureVeg: false,
    avgCostForTwo: 500
  },
  {
    id: 'food-10',
    name: 'Kusum Rolls',
    category: 'iconic_food',
    coordinates: { lat: 22.5521, lng: 88.3545 },
    zone: 'Central',
    address: '21, Park Street, Kolkata 700016',
    landmark: 'Park Street Dining Corridor',
    cuisine: ['Kolkata Kathi Rolls', 'Egg Chicken Kebab Roll'],
    isLateNight: true,
    pureVeg: false,
    avgCostForTwo: 250
  },
  {
    id: 'food-11',
    name: 'Nizam Restaurant (Birthplace of Kathi Roll)',
    category: 'iconic_food',
    coordinates: { lat: 22.5621, lng: 88.3535 },
    zone: 'Central',
    address: '23 & 24, Hogg Street, New Market area, Kolkata 700087',
    landmark: 'Behind New Market clock tower',
    cuisine: ['Original Kathi Rolls', 'Mughlai Kebabs'],
    isLateNight: false,
    pureVeg: false,
    avgCostForTwo: 400
  },
  {
    id: 'food-12',
    name: '6 Ballygunge Place',
    category: 'iconic_food',
    coordinates: { lat: 22.5255, lng: 88.3658 },
    zone: 'South',
    address: '6, Ballygunge Place, Ballygunge, Kolkata 700019',
    landmark: 'Near Patha Bhavan School',
    cuisine: ['Daab Chingri', 'Kasha Mangsho', 'Traditional Bengali Feast'],
    isLateNight: false,
    pureVeg: false,
    avgCostForTwo: 1400
  },
  {
    id: 'food-13',
    name: 'Kasturi Restaurant (Gariahat)',
    category: 'iconic_food',
    coordinates: { lat: 22.5185, lng: 88.3662 },
    zone: 'South',
    address: '13A, Hindusthan Road, Gariahat, Kolkata 700029',
    landmark: 'Behind Dover Lane Post Office',
    cuisine: ['Dhakai Bengali', 'Kochu Pata Chingri Bhapa'],
    isLateNight: false,
    pureVeg: false,
    avgCostForTwo: 700
  },
  {
    id: 'food-14',
    name: 'Dada Boudi Biryani (Sodepur link)',
    category: 'iconic_food',
    coordinates: { lat: 22.6482, lng: 88.3812 },
    zone: 'North',
    address: 'BT Road, Sodepur Crossing, Kolkata 700110',
    landmark: 'BT Road junction',
    cuisine: ['Signature Kolkata Mutton Biryani', 'Chicken Chaap'],
    isLateNight: true,
    pureVeg: false,
    avgCostForTwo: 750
  },
  {
    id: 'food-15',
    name: 'Campari (Gariahat)',
    category: 'iconic_food',
    coordinates: { lat: 22.5198, lng: 88.3639 },
    zone: 'South',
    address: '184, Rash Behari Ave, Gariahat, Kolkata 700019',
    landmark: 'Near Ballygunge Post Office',
    cuisine: ['Fish Roll', 'Mutton Cutlet', 'Bengali Telebhaja Fast Food'],
    isLateNight: false,
    pureVeg: false,
    avgCostForTwo: 350
  },
  {
    id: 'food-16',
    name: 'Bhojohori Manna (Hindustan Road)',
    category: 'iconic_food',
    coordinates: { lat: 22.5175, lng: 88.3648 },
    zone: 'South',
    address: '18/1A, Hindustan Road, Gariahat, Kolkata 700029',
    landmark: 'Near Triangular Park',
    cuisine: ['Bengali Homestyle Fish Thali', 'Ilish Bhapa'],
    isLateNight: false,
    pureVeg: false,
    avgCostForTwo: 800
  },
  {
    id: 'food-17',
    name: 'Haji Saheb (Behala Chowrasta)',
    category: 'iconic_food',
    coordinates: { lat: 22.4938, lng: 88.3142 },
    zone: 'Behala',
    address: 'Diamond Harbour Road, Behala, Kolkata 700034',
    landmark: 'Near Behala Tram Depot',
    cuisine: ['Late-Night Awadhi Biryani', 'Chicken Tandoori', 'Firni'],
    isLateNight: true,
    pureVeg: false,
    avgCostForTwo: 650
  }
];

// Unified POI collection
export const unifiedPOIData: UnifiedPOI[] = [
  ...hospitalsList,
  ...sanitationList,
  ...pureVegList,
  ...iconicFoodList
];

// Query helper utilities
export const getPOIsByCategory = (category: CivicPOICategory): UnifiedPOI[] => {
  return unifiedPOIData.filter((poi) => poi.category === category);
};

export const getPOIsInBounds = (bounds: GeoBoundingBox): UnifiedPOI[] => {
  return unifiedPOIData.filter(
    (poi) =>
      poi.coordinates.lat >= bounds.minLat &&
      poi.coordinates.lat <= bounds.maxLat &&
      poi.coordinates.lng >= bounds.minLng &&
      poi.coordinates.lng <= bounds.maxLng
  );
};

export const UNIFIED_POI_FACILITIES: import('../types').FacilityPoint[] = unifiedPOIData.map((poi) => {
  let category: import('../types').FacilityPoint['category'] = 'food';
  if (poi.category === 'hospital') category = 'hospital';
  else if (poi.category === 'toilet') category = 'toilets';
  else if (poi.category === 'police') category = 'police';
  else if (poi.category === 'ferry') category = 'ferry';
  else if (poi.category === 'railway') category = 'railway';

  const hospitalItem = poi.category === 'hospital' ? (poi as HospitalPOI) : null;
  const sanitationItem = poi.category === 'toilet' ? (poi as SanitationPOI) : null;
  const diningItem =
    poi.category === 'pure_veg' || poi.category === 'iconic_food' ? (poi as DiningPOI) : null;

  return {
    id: poi.id,
    name: {
      en: poi.name,
      bn: poi.name,
      hi: poi.name,
    },
    category,
    lat: poi.coordinates.lat,
    lng: poi.coordinates.lng,
    address: {
      en: poi.address,
      bn: poi.address,
      hi: poi.address,
    },
    details: {
      en: poi.landmark ? `${poi.address} (${poi.landmark})` : poi.address,
      bn: poi.landmark ? `${poi.address} (${poi.landmark})` : poi.address,
      hi: poi.landmark ? `${poi.address} (${poi.landmark})` : poi.address,
    },
    contact: hospitalItem?.emergencyPhone,
    is24x7: hospitalItem?.is24x7 ?? diningItem?.isLateNight,
    hasBloodBank: hospitalItem?.bloodBank,
    isPaid: sanitationItem ? sanitationItem.fee > 0 : false,
    hasDisabledAccess: sanitationItem?.hasDifferentlyAbledAccess,
    operator: sanitationItem?.operator,
    dietaryType: diningItem ? (diningItem.pureVeg ? 'pure-veg' : 'non-veg') : undefined,
    cuisineTags: diningItem?.cuisine,
    googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${poi.coordinates.lat},${poi.coordinates.lng}`,
  };
});