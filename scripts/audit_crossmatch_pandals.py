import json
import math
import re
from typing import List, Dict, Tuple, Optional

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Returns distance in meters between two lat/lon coordinates."""
    R = 6371000  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def normalize_text(text: str) -> str:
    """Normalize names for fuzzy token matching."""
    if not text:
        return ""
    text = text.lower()
    # Strip common stopwords/suffixes
    text = re.sub(r'\b(sarbojanin|sarbojonin|sarbajanin|durgotsav|durgotsab|durga|puja|pujo|samity|committee|club|sangha|association|brinda|adhibasibrinda|kolkata|calcutta|er|no|street|road|lane|park|barir|bari|jubak|yubak|tarun|dal|pally|palli)\b', ' ', text)
    text = re.sub(r'[^a-z0-9]', ' ', text)
    tokens = [t for t in text.split() if len(t) > 1]
    return " ".join(tokens)

def token_similarity(s1: str, s2: str) -> float:
    set1 = set(s1.split())
    set2 = set(s2.split())
    if not set1 or not set2:
        return 0.0
    intersection = set1.intersection(set2)
    union = set1.union(set2)
    jaccard = len(intersection) / len(union)
    overlap = len(intersection) / min(len(set1), len(set2))
    return max(jaccard, overlap)

def main():
    with open('src/data/allPandalsData.json', 'r', encoding='utf-8') as f:
        hoppers_pandals = json.load(f)

    with open('public/dharmkriya_master.json', 'r', encoding='utf-8') as f:
        dharmkriya_pandals = json.load(f)

    print(f"Loaded {len(hoppers_pandals)} Hoppers Pandals")
    print(f"Loaded {len(dharmkriya_pandals)} DharmKriya Pandals")

    matched_pairs = []
    unmatched_dharmkriya = []
    discrepancies = []

    hoppers_used = set()

    for dk in dharmkriya_pandals:
        dk_name = dk.get('name', '')
        dk_slug = dk.get('slug', '').replace('-', ' ')
        dk_lat = dk.get('lat')
        dk_lng = dk.get('lng')

        if dk_lat is None or dk_lng is None:
            continue

        dk_norm = normalize_text(dk_name + " " + dk_slug)
        best_match = None
        best_score = 0.0
        min_dist = float('inf')

        for idx, hp in enumerate(hoppers_pandals):
            hp_name = hp.get('name', '')
            if isinstance(hp_name, dict):
                hp_name_en = hp_name.get('en', '')
            else:
                hp_name_en = str(hp_name)
            
            hp_lat = hp.get('lat') or (hp.get('coordinates', [None, None])[0] if isinstance(hp.get('coordinates'), list) else None)
            hp_lng = hp.get('lng') or (hp.get('coordinates', [None, None])[1] if isinstance(hp.get('coordinates'), list) else None)

            if hp_lat is None or hp_lng is None:
                continue

            dist = haversine_distance(dk_lat, dk_lng, hp_lat, hp_lng)
            hp_norm = normalize_text(hp_name_en)
            sim = token_similarity(dk_norm, hp_norm)

            # Match criteria: High token match & distance < 2500m OR exact close proximity < 120m with slight token match
            if (sim >= 0.5 and dist < 2500) or (dist < 150 and sim >= 0.25) or (dist < 50):
                score = sim * 1000 - dist
                if score > best_score:
                    best_score = score
                    best_match = (idx, hp, dist, sim, hp_name_en, hp_lat, hp_lng)

        if best_match:
            idx, hp, dist, sim, hp_name_en, hp_lat, hp_lng = best_match
            hoppers_used.add(idx)
            matched_pairs.append({
                'dharmkriya': dk,
                'hoppers': hp,
                'distance_meters': dist,
                'similarity': sim,
                'dk_name': dk_name,
                'hp_name': hp_name_en,
                'dk_coords': (dk_lat, dk_lng),
                'hp_coords': (hp_lat, hp_lng)
            })

            if dist > 500:
                discrepancies.append({
                    'dharmkriya_name': dk_name,
                    'hoppers_name': hp_name_en,
                    'distance_m': round(dist, 1),
                    'dk_coords': (dk_lat, dk_lng),
                    'hp_coords': (hp_lat, hp_lng),
                    'similarity': round(sim, 2)
                })
        else:
            unmatched_dharmkriya.append(dk)

    discrepancies.sort(key=lambda x: x['distance_m'], reverse=True)

    print("\n" + "="*60)
    print("🎯 CROSS-VERIFICATION AUDIT RESULTS")
    print("="*60)
    print(f"Total Hoppers Dataset: {len(hoppers_pandals)}")
    print(f"Total DharmKriya Dataset: {len(dharmkriya_pandals)}")
    print(f"Total Confirmed Matches: {len(matched_pairs)}")
    print(f"Total Coordinates Discrepancies (>500m): {len(discrepancies)}")
    print(f"Total New/Unique DharmKriya Pandals: {len(unmatched_dharmkriya)}")
    print("="*60)

    if discrepancies:
        print("\nTop Discrepancy Samples (>500m):")
        for i, d in enumerate(discrepancies[:5], 1):
            print(f"{i}. {d['hoppers_name']} vs {d['dharmkriya_name']}")
            print(f"   Distance delta: {d['distance_m']}m | Similarity: {d['similarity']}")
            print(f"   Hoppers Coords: {d['hp_coords']} -> DharmKriya: {d['dk_coords']}")

    print("\nSample New/Unique DharmKriya Pandals (Not in Hoppers 713):")
    for i, u in enumerate(unmatched_dharmkriya[:5], 1):
        print(f"{i}. {u.get('name')} ({u.get('zone', 'Unknown')}) - [{u.get('lat')}, {u.get('lng')}]")

if __name__ == '__main__':
    main()
