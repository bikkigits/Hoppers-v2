import { MetroStation, RouteResult, Pandal } from '../types';
import { METRO_STATIONS, PANDALS_DATA } from '../data/mockData';

export function calculateMetroRoute(
  fromId: string,
  toId: string
): RouteResult | null {
  const fromStation = METRO_STATIONS.find((s) => s.id === fromId);
  const toStation = METRO_STATIONS.find((s) => s.id === toId);

  if (!fromStation || !toStation || fromStation.id === toStation.id) {
    return null;
  }

  const esplanade = METRO_STATIONS.find((s) => s.id === 'esplanade')!;

  // Check if both stations are on the Blue line
  const bothBlue =
    fromStation.lines.includes('blue') && toStation.lines.includes('blue');
  // Check if both stations are on the Green line
  const bothGreen =
    fromStation.lines.includes('green') && toStation.lines.includes('green');

  // Destination connecting pandals
  const destinationPandals: Pandal[] = PANDALS_DATA.filter((pandal) =>
    toStation.connectingPandals.includes(pandal.id)
  );

  if (bothBlue) {
    const fromOrder = fromStation.orderBlue!;
    const toOrder = toStation.orderBlue!;
    const hopCount = Math.abs(toOrder - fromOrder);
    const direction = toOrder > fromOrder ? 'Kavi Subhash (Southbound)' : 'Dakshineswar (Northbound)';
    const directionBn = toOrder > fromOrder ? 'কবি সুভাষ (দক্ষিণগামী)' : 'দক্ষিণেশ্বর (উত্তরগামী)';
    const directionHi = toOrder > fromOrder ? 'कवि सुभाष (दक्षिण दिशा)' : 'दक्षिणेश्वर (उत्तर दिशा)';

    const estMinutes = Math.round(hopCount * 2.5);

    const blueStations = METRO_STATIONS.filter((s) => s.lines.includes('blue')).sort(
      (a, b) => a.orderBlue! - b.orderBlue!
    );
    const minOrder = Math.min(fromOrder, toOrder);
    const maxOrder = Math.max(fromOrder, toOrder);
    let stationsList = blueStations.filter(
      (s) => s.orderBlue! >= minOrder && s.orderBlue! <= maxOrder
    );
    if (fromOrder > toOrder) {
      stationsList = [...stationsList].reverse();
    }

    return {
      fromStation,
      toStation,
      isDirect: true,
      line: 'blue',
      stationsCount: hopCount,
      estimatedMinutes: Math.max(3, estMinutes),
      stationsList,
      steps: [
        {
          instruction: {
            en: `Board Blue Line (Line 1) train towards ${direction}`,
            bn: `ব্লু লাইন ১-এর ${directionBn} ট্রেনের কামরায় উঠুন`,
            hi: `ब्लू लाइन 1 पर ${directionHi} की ट्रेन में चढ़ें`,
          },
          subtext: {
            en: `Travel for ${hopCount} stations through the heart of Kolkata`,
            bn: `${hopCount} টি স্টেশন অতিক্রম করুন`,
            hi: `${hopCount} स्टेशनों की यात्रा करें`,
          },
          lineBadge: 'blue',
        },
        {
          instruction: {
            en: `Alight at ${toStation.name.en}`,
            bn: `${toStation.name.bn}-এ নেমে পড়ুন`,
            hi: `${toStation.name.hi} पर उतरें`,
          },
          subtext: toStation.exitGates[0]
            ? {
                en: `Recommended: ${toStation.exitGates[0].gate} -> ${toStation.exitGates[0].destination.en}`,
                bn: `প্রস্তাবিত: ${toStation.exitGates[0].gate} -> ${toStation.exitGates[0].destination.bn}`,
                hi: `सुझाव: ${toStation.exitGates[0].gate} -> ${toStation.exitGates[0].destination.hi}`,
              }
            : undefined,
          lineBadge: 'blue',
        },
      ],
      exitGateAdvice: toStation.exitGates,
      destinationPandals,
    };
  }

  if (bothGreen) {
    const fromOrder = fromStation.orderGreen!;
    const toOrder = toStation.orderGreen!;
    const hopCount = Math.abs(toOrder - fromOrder);
    const direction = toOrder > fromOrder ? 'Salt Lake Sector V (Eastbound)' : 'Howrah Maidan (Westbound)';
    const directionBn = toOrder > fromOrder ? 'সল্টলেক সেক্টর ৫ (পূর্বগামী)' : 'হাওড়া ময়দান (পশ্চিমগামী)';
    const directionHi = toOrder > fromOrder ? 'सॉल्ट लेक सेक्टर 5 (पूर्व दिशा)' : 'हावड़ा मैदान (पश्चिम दिशा)';

    const estMinutes = Math.round(hopCount * 2.5);

    const greenStations = METRO_STATIONS.filter((s) => s.lines.includes('green')).sort(
      (a, b) => a.orderGreen! - b.orderGreen!
    );
    const minOrder = Math.min(fromOrder, toOrder);
    const maxOrder = Math.max(fromOrder, toOrder);
    let stationsList = greenStations.filter(
      (s) => s.orderGreen! >= minOrder && s.orderGreen! <= maxOrder
    );
    if (fromOrder > toOrder) {
      stationsList = [...stationsList].reverse();
    }

    return {
      fromStation,
      toStation,
      isDirect: true,
      line: 'green',
      stationsCount: hopCount,
      estimatedMinutes: Math.max(3, estMinutes),
      stationsList,
      steps: [
        {
          instruction: {
            en: `Board Green Line (Line 2) train towards ${direction}`,
            bn: `গ্রীন লাইন ২-এর ${directionBn} ট্রেনের কামরায় উঠুন`,
            hi: `ग्रीन लाइन 2 पर ${directionHi} की ट्रेन में चढ़ें`,
          },
          subtext: {
            en: `Travel for ${hopCount} stations (Passes underwater tunnel if traversing Hooghly River)`,
            bn: `${hopCount} টি স্টেশন ভ্রমণ করুন (গঙ্গার নিচে আন্ডারওয়াটার টানেল)`,
            hi: `${hopCount} स्टेशन की यात्रा (हुगली नदी के नीचे सुरंग)`,
          },
          lineBadge: 'green',
        },
        {
          instruction: {
            en: `Alight at ${toStation.name.en}`,
            bn: `${toStation.name.bn}-এ নেমে পড়ুন`,
            hi: `${toStation.name.hi} पर उतरें`,
          },
          subtext: toStation.exitGates[0]
            ? {
                en: `Recommended: ${toStation.exitGates[0].gate} -> ${toStation.exitGates[0].destination.en}`,
                bn: `প্রস্তাবিত: ${toStation.exitGates[0].gate} -> ${toStation.exitGates[0].destination.bn}`,
                hi: `सुझाव: ${toStation.exitGates[0].gate} -> ${toStation.exitGates[0].destination.hi}`,
              }
            : undefined,
          lineBadge: 'green',
        },
      ],
      exitGateAdvice: toStation.exitGates,
      destinationPandals,
    };
  }

  // Interchange required via Esplanade
  // Determine start line and second line
  const isStartBlue = fromStation.lines.includes('blue');

  let leg1Hops = 0;
  let leg2Hops = 0;
  let leg1Dir = '';
  let leg1DirBn = '';
  let leg1DirHi = '';
  let leg2Dir = '';
  let leg2DirBn = '';
  let leg2DirHi = '';

  if (isStartBlue) {
    // Start on Blue, transfer to Green at Esplanade
    leg1Hops = Math.abs(esplanade.orderBlue! - fromStation.orderBlue!);
    leg1Dir = fromStation.orderBlue! < esplanade.orderBlue! ? 'Kavi Subhash (Southbound)' : 'Dakshineswar (Northbound)';
    leg1DirBn = fromStation.orderBlue! < esplanade.orderBlue! ? 'কবি সুভাষ (দক্ষিণগামী)' : 'দক্ষিণেশ্বর (উত্তরগামী)';
    leg1DirHi = fromStation.orderBlue! < esplanade.orderBlue! ? 'कवि सुभाष (दक्षिण)' : 'दक्षिणेश्वर (उत्तर)';

    leg2Hops = Math.abs(toStation.orderGreen! - esplanade.orderGreen!);
    leg2Dir = toStation.orderGreen! > esplanade.orderGreen! ? 'Salt Lake Sector V (Eastbound)' : 'Howrah Maidan (Westbound)';
    leg2DirBn = toStation.orderGreen! > esplanade.orderGreen! ? 'সল্টলেক সেক্টর ৫ (পূর্বগামী)' : 'হাওড়া ময়দান (পশ্চিমগামী)';
    leg2DirHi = toStation.orderGreen! > esplanade.orderGreen! ? 'सॉल्ट लेक सेक्टर 5' : 'हावड़ा मैदान';
  } else {
    // Start on Green, transfer to Blue at Esplanade
    leg1Hops = Math.abs(esplanade.orderGreen! - fromStation.orderGreen!);
    leg1Dir = fromStation.orderGreen! < esplanade.orderGreen! ? 'Esplanade / Sector V' : 'Howrah Maidan / Esplanade';
    leg1DirBn = 'এসপ্ল্যানেড অভিমুখী';
    leg1DirHi = 'एस्प्लेनेड की ओर';

    leg2Hops = Math.abs(toStation.orderBlue! - esplanade.orderBlue!);
    leg2Dir = toStation.orderBlue! > esplanade.orderBlue! ? 'Kavi Subhash (Southbound)' : 'Dakshineswar (Northbound)';
    leg2DirBn = toStation.orderBlue! > esplanade.orderBlue! ? 'কবি সুভাষ (দক্ষিণগামী)' : 'দক্ষিণেশ্বর (উত্তরগামী)';
    leg2DirHi = toStation.orderBlue! > esplanade.orderBlue! ? 'कवि सुभाष (दक्षिण)' : 'दक्षिणेश्वर (उत्तर)';
  }

  const totalHops = leg1Hops + leg2Hops;
  const estimatedMinutes = Math.round(totalHops * 2.5 + 7); // +7 mins transfer buffer at Esplanade

  let leg1Stations: MetroStation[] = [];
  let leg2Stations: MetroStation[] = [];

  if (isStartBlue) {
    const blueStations = METRO_STATIONS.filter((s) => s.lines.includes('blue')).sort(
      (a, b) => a.orderBlue! - b.orderBlue!
    );
    const minO = Math.min(fromStation.orderBlue!, esplanade.orderBlue!);
    const maxO = Math.max(fromStation.orderBlue!, esplanade.orderBlue!);
    leg1Stations = blueStations.filter((s) => s.orderBlue! >= minO && s.orderBlue! <= maxO);
    if (fromStation.orderBlue! > esplanade.orderBlue!) leg1Stations.reverse();

    const greenStations = METRO_STATIONS.filter((s) => s.lines.includes('green')).sort(
      (a, b) => a.orderGreen! - b.orderGreen!
    );
    const minG = Math.min(esplanade.orderGreen!, toStation.orderGreen!);
    const maxG = Math.max(esplanade.orderGreen!, toStation.orderGreen!);
    leg2Stations = greenStations.filter((s) => s.orderGreen! >= minG && s.orderGreen! <= maxG);
    if (esplanade.orderGreen! > toStation.orderGreen!) leg2Stations.reverse();
  } else {
    const greenStations = METRO_STATIONS.filter((s) => s.lines.includes('green')).sort(
      (a, b) => a.orderGreen! - b.orderGreen!
    );
    const minG = Math.min(fromStation.orderGreen!, esplanade.orderGreen!);
    const maxG = Math.max(fromStation.orderGreen!, esplanade.orderGreen!);
    leg1Stations = greenStations.filter((s) => s.orderGreen! >= minG && s.orderGreen! <= maxG);
    if (fromStation.orderGreen! > esplanade.orderGreen!) leg1Stations.reverse();

    const blueStations = METRO_STATIONS.filter((s) => s.lines.includes('blue')).sort(
      (a, b) => a.orderBlue! - b.orderBlue!
    );
    const minB = Math.min(esplanade.orderBlue!, toStation.orderBlue!);
    const maxB = Math.max(esplanade.orderBlue!, toStation.orderBlue!);
    leg2Stations = blueStations.filter((s) => s.orderBlue! >= minB && s.orderBlue! <= maxB);
    if (esplanade.orderBlue! > toStation.orderBlue!) leg2Stations.reverse();
  }

  const stationsList = [...leg1Stations, ...leg2Stations.filter((s) => s.id !== 'esplanade')];

  return {
    fromStation,
    toStation,
    isDirect: false,
    line: 'interchange',
    stationsCount: totalHops,
    estimatedMinutes,
    transferStation: esplanade,
    stationsList,
    steps: [
      {
        instruction: {
          en: `Leg 1: Board ${isStartBlue ? 'Blue Line 1' : 'Green Line 2'} towards ${leg1Dir}`,
          bn: `১ম পর্ব: ${isStartBlue ? 'ব্লু লাইন ১' : 'গ্রীন লাইন ২'} ট্রেনে উঠুন (${leg1DirBn})`,
          hi: `पहला भाग: ${isStartBlue ? 'ब्लू लाइन 1' : 'ग्रीन लाइन 2'} पर सवार हों (${leg1DirHi})`,
        },
        subtext: {
          en: `Ride ${leg1Hops} stations to Esplanade Interchange`,
          bn: `এসপ্ল্যানেড স্টেশন পর্যন্ত ${leg1Hops} টি স্টপ অতিক্রম করুন`,
          hi: `${leg1Hops} स्टेशन चलकर एस्प्लेनेड पहुंचें`,
        },
        lineBadge: isStartBlue ? 'blue' : 'green',
      },
      {
        instruction: {
          en: 'Transfer at Esplanade Subway Interchange',
          bn: 'এসপ্ল্যানেড ইন্টারচেঞ্জ সাবওয়ে দিয়ে লাইন বদলান',
          hi: 'एस्प्लेनेड सबवे से लाइन बदलें',
        },
        subtext: {
          en: `Walk through the underground passenger tunnel to ${isStartBlue ? 'Green Line (Line 2)' : 'Blue Line (Line 1)'} platform (~7 mins buffer)`,
          bn: `ভূগর্ভস্থ পথ দিয়ে ${isStartBlue ? 'গ্রীন লাইন ২' : 'ব্লু লাইন ১'} প্ল্যাটফর্মে যান (আনুমানিক ৭ মিনিট)`,
          hi: `भूमिगत मार्ग से ${isStartBlue ? 'ग्रीन लाइन 2' : 'ब्लू लाइन 1'} पर जाएं (~7 मिनट)`,
        },
      },
      {
        instruction: {
          en: `Leg 2: Board ${isStartBlue ? 'Green Line 2' : 'Blue Line 1'} towards ${leg2Dir}`,
          bn: `২য় পর্ব: ${isStartBlue ? 'গ্রীন লাইন ২' : 'ব্লু লাইন ১'} ট্রেনে উঠুন (${leg2DirBn})`,
          hi: `दूसरा भाग: ${isStartBlue ? 'ग्रीन लाइन 2' : 'ब्लू लाइन 1'} पर सवार हों (${leg2DirHi})`,
        },
        subtext: {
          en: `Ride ${leg2Hops} stations and alight at destination: ${toStation.name.en}`,
          bn: `আরও ${leg2Hops} টি স্টেশন গিয়ে আপনার গন্তব্য ${toStation.name.bn}-এ পৌঁছান`,
          hi: `आगे ${leg2Hops} स्टेशन चलकर ${toStation.name.hi} पर उतरें`,
        },
        lineBadge: isStartBlue ? 'green' : 'blue',
      },
    ],
    exitGateAdvice: toStation.exitGates,
    destinationPandals,
  };
}
