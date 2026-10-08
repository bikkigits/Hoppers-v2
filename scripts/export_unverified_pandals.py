#!/usr/bin/env python3
"""
Hoppers Durga Puja 2026: Theme Verification Export Pipeline
Exports all unverified, generic placeholder, and newly ingested DharmKriya pandals
to public/unverified_and_new_pandals_for_meta_ai.json for 2026 theme curation.
"""

import json
import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_JSON_PATH = os.path.join(BASE_DIR, "src", "data", "allPandalsData.json")
OUTPUT_JSON_PATH = os.path.join(BASE_DIR, "public", "unverified_and_new_pandals_for_meta_ai.json")

GENERIC_PLACEHOLDERS = [
    "traditional / sabeki",
    "traditional celebration",
    "community celebration",
    "architectural artistry",
    "festive heritage",
    "celebration & architectural",
    "tbd",
    "to be announced",
    "tba",
    "traditional puja",
    "sabeki puja",
    "theme to be announced",
    "under creation",
    "grand celebration"
]

def is_generic_or_unverified(pandal: dict) -> bool:
    p_id = str(pandal.get("id", ""))
    
    # Criterion 1: All newly added DharmKriya pandals
    if p_id.startswith("dk_"):
        return True

    # Criterion 2: Check themeStatus if explicitly set
    theme_status = pandal.get("themeStatus")
    if theme_status and theme_status != "VERIFIED_2026":
        return True

    # Extract theme string
    theme = pandal.get("theme")
    if not theme:
        return True

    theme_str = ""
    if isinstance(theme, dict):
        theme_str = theme.get("en", "") or theme.get("bn", "") or theme.get("hi", "")
    elif isinstance(theme, str):
        theme_str = theme

    theme_str_clean = theme_str.strip().lower()

    if not theme_str_clean:
        return True

    # Check for placeholder patterns like "XX Pally Celebration"
    if re.search(r"\bpally celebration\b", theme_str_clean) or re.search(r"\bclub celebration\b", theme_str_clean):
        return True

    for placeholder in GENERIC_PLACEHOLDERS:
        if placeholder in theme_str_clean:
            return True

    return False

def main():
    print("==================================================================")
    print("HOPPERS DURGA PUJA 2026: THEME AUDIT & EXPORT PIPELINE")
    print("==================================================================")

    if not os.path.exists(INPUT_JSON_PATH):
        print(f"Error: {INPUT_JSON_PATH} not found.")
        return

    with open(INPUT_JSON_PATH, "r", encoding="utf-8") as f:
        pandals = json.load(f)

    total_pandals = len(pandals)
    print(f"Total Pandals Audited: {total_pandals}")

    unverified_list = []
    for p in pandals:
        if is_generic_or_unverified(p):
            p_id = p.get("id", "")
            
            # Extract readable name
            name = p.get("name", "")
            if isinstance(name, dict):
                name_str = name.get("en", "") or name.get("bn", "") or name.get("hi", "") or p_id
            else:
                name_str = str(name)

            # Extract readable theme
            theme = p.get("theme")
            theme_str = None
            if isinstance(theme, dict):
                theme_str = theme.get("en") or theme.get("bn") or theme.get("hi")
            elif isinstance(theme, str):
                theme_str = theme

            zone = p.get("zone", "Kolkata")
            address = p.get("address") or f"{name_str}, {zone}, Kolkata"

            unverified_list.append({
                "id": p_id,
                "name": name_str,
                "zone": zone,
                "address": address,
                "current_theme": theme_str
            })

    os.makedirs(os.path.dirname(OUTPUT_JSON_PATH), exist_ok=True)
    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(unverified_list, f, indent=2, ensure_ascii=False)

    print(f"Exported Count: {len(unverified_list)} pandals")
    print(f"Saved to: {OUTPUT_JSON_PATH}")

    # Display 3 sample exported items
    print("\nSample Exported Pandals:")
    for item in unverified_list[:3]:
        print(f"• ID: {item['id']} | Name: {item['name']} | Zone: {item['zone']}")
        print(f"  Current Theme: {item['current_theme']}")
        print(f"  Address: {item['address']}")

if __name__ == "__main__":
    main()
