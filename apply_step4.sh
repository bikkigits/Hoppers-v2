#!/usr/bin/env bash
# ==============================================================================
# HOPPERS DURGA PUJA OFFLINE COMPANION (v3.2.0-PROD)
# Step 4 Automated Deployment & Git Sync Script
# Handled by: @Agent-BugFixer & @DevOpsAgent
# ==============================================================================

set -e

echo "🚀 [DevOpsAgent] Initiating Automated Application of Step 4 Dart Components..."

# Ensure target directories exist
mkdir -p lib/widgets
mkdir -p lib/screens

# ------------------------------------------------------------------------------
# 1. lib/widgets/pandal_bottom_sheet.dart
# ------------------------------------------------------------------------------
echo "📦 Writing lib/widgets/pandal_bottom_sheet.dart..."
cat << 'EOF' > lib/widgets/pandal_bottom_sheet.dart
// ==============================================================================
// HOPPERS DURGA PUJA OFFLINE COMPANION (v3.2.0-PROD)
// Handshake Step 4: Tri-State Peeking Pandal Drawer
// Handled by: @Agent-UI (@Sub-DesignSystem, @Sub-FilterLayout)
// Sub-Agent Validation: @Sub-ProximityEngine, @Sub-TypeSafety
// ==============================================================================

import 'package:flutter/material.dart';
import '../database/app_database.dart';

/// Tri-State Drawer:
/// State 0 (Hidden): 0.0 height
/// State 1 (Peek): ~0.28 height (Title, Crowd Badge, Theme, Metro, Survival Snapshot)
/// State 2 (Full): ~0.85 height (Cultural writeup, Entry gates, Trail navigation)
class PandalBottomSheet extends StatelessWidget {
  final PandalRecord pandal;
  final String crowdStatus; // 'Low' | 'Moderate' | 'Heavy' | 'Extreme'
  final String? culturalWriteup;
  final String? entryGateInfo;
  final Map<String, int> survivalSnapshot; // e.g. {'toilet': 80, 'atm': 120, 'hospital': 350, 'parking': 210}
  final VoidCallback? onStartTrail;
  final VoidCallback? onCollectPassport;
  final VoidCallback? onClose;

  const PandalBottomSheet({
    super.key,
    required this.pandal,
    this.crowdStatus = 'Moderate',
    this.culturalWriteup,
    this.entryGateInfo,
    this.survivalSnapshot = const {'toilet': 80, 'atm': 120, 'hospital': 350, 'parking': 210},
    this.onStartTrail,
    this.onCollectPassport,
    this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.28,
      minChildSize: 0.0,
      maxChildSize: 0.85,
      snap: true,
      snapSizes: const [0.28, 0.85],
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Color(0xFF0F172A), // Slate 900
            borderRadius: BorderRadius.vertical(top: Radius.circular(20.0)),
            boxShadow: [
              BoxShadow(
                color: Colors.black54,
                blurRadius: 16,
                spreadRadius: 2,
                offset: Offset(0, -4),
              ),
            ],
            border: Border(
              top: BorderSide(color: Color(0xFF334155), width: 1.0),
            ),
          ),
          child: ListView(
            controller: scrollController,
            padding: const EdgeInsets.symmetric(horizontal: 18.0, vertical: 10.0),
            children: [
              // Grab Handle
              Center(
                child: Container(
                  width: 44,
                  height: 4.5,
                  margin: const EdgeInsets.only(bottom: 12.0),
                  decoration: BoxDecoration(
                    color: const Color(0xFF475569),
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
              ),

              // ===============================================================
              // STATE 1: PEEK CONTENT (~28% Viewport)
              // ===============================================================
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          pandal.name,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18.0,
                            fontWeight: FontWeight.w700,
                            letterSpacing: -0.3,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 3),
                        if (pandal.theme2026 != null && pandal.theme2026!.isNotEmpty)
                          Text(
                            'Theme: ${pandal.theme2026}',
                            style: const TextStyle(
                              color: Color(0xFFFBBF24), // Amber 400
                              fontSize: 12.5,
                              fontWeight: FontWeight.w500,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  _buildCrowdBadge(crowdStatus),
                ],
              ),

              const SizedBox(height: 8),

              // Nearest Metro Hub
              if (pandal.nearestMetro != null && pandal.nearestMetro!.isNotEmpty)
                Row(
                  children: [
                    const Icon(Icons.subway_rounded, size: 14, color: Color(0xFF38BDF8)),
                    const SizedBox(width: 5),
                    Text(
                      pandal.nearestMetro!,
                      style: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 12.0,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),

              const SizedBox(height: 12),

              // Survival Snapshot Row (@Sub-ProximityEngine)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(10.0),
                  border: Border.all(color: const Color(0xFF334155), width: 0.8),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildSnapshotItem('🚻', '${survivalSnapshot['toilet'] ?? 80}m'),
                    _buildDivider(),
                    _buildSnapshotItem('💳', '${survivalSnapshot['atm'] ?? 120}m'),
                    _buildDivider(),
                    _buildSnapshotItem('🏥', '${survivalSnapshot['hospital'] ?? 350}m'),
                    _buildDivider(),
                    _buildSnapshotItem('🅿️', '${survivalSnapshot['parking'] ?? 210}m'),
                  ],
                ),
              ),

              // Peek indicator note
              const Padding(
                padding: EdgeInsets.only(top: 8.0, bottom: 14.0),
                child: Center(
                  child: Text(
                    '▲ Swipe up for cultural history & gate trails',
                    style: TextStyle(color: Color(0xFF64748B), fontSize: 10.5),
                  ),
                ),
              ),

              // ===============================================================
              // STATE 2: FULL DETAIL REVEAL (~85% Height)
              // ===============================================================
              const Divider(color: Color(0xFF334155), height: 1),
              const SizedBox(height: 14),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: onStartTrail,
                      icon: const Icon(Icons.directions_walk_rounded, size: 17),
                      label: const Text('Pedestrian Trail (A*)'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFF59E0B),
                        foregroundColor: const Color(0xFF0F172A),
                        padding: const EdgeInsets.symmetric(vertical: 12.0),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  OutlinedButton.icon(
                    onPressed: onCollectPassport,
                    icon: const Icon(Icons.military_tech_rounded, size: 17, color: Color(0xFF10B981)),
                    label: const Text('Passport', style: TextStyle(color: Color(0xFF10B981))),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFF10B981), width: 1.2),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12.0),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Entry Gate Details
              const Text(
                'ENTRY GATE & QUEUE ACCESS',
                style: TextStyle(
                  color: Color(0xFF94A3B8),
                  fontSize: 11.0,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  entryGateInfo ??
                      'Gate 1 (General Queuing via Southern Avenue). Dedicated senior citizen lane at Gate 3 with ramp access.',
                  style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 13, height: 1.4),
                ),
              ),

              const SizedBox(height: 16),

              // Cultural History & Writeup
              const Text(
                'HERITAGE & CULTURAL SIGNIFICANCE',
                style: TextStyle(
                  color: Color(0xFF94A3B8),
                  fontSize: 11.0,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                culturalWriteup ??
                    'One of Kolkata\'s most celebrated community celebrations. Renowned for its blend of traditional Bengal craftsmanship, eco-friendly hand-woven pandal architecture, and an idol sculpted following classic Pratima traditions.',
                style: const TextStyle(
                  color: Color(0xFF94A3B8),
                  fontSize: 13.5,
                  height: 1.5,
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCrowdBadge(String status) {
    Color bg;
    Color fg;
    switch (status.toLowerCase()) {
      case 'low':
        bg = const Color(0x2210B981);
        fg = const Color(0xFF34D399);
        break;
      case 'heavy':
        bg = const Color(0x22F97316);
        fg = const Color(0xFFFB923C);
        break;
      case 'extreme':
        bg = const Color(0x22EF4444);
        fg = const Color(0xFFF87171);
        break;
      case 'moderate':
      default:
        bg = const Color(0x22F59E0B);
        fg = const Color(0xFFFBBF24);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: fg.withOpacity(0.5), width: 0.8),
      ),
      child: Text(
        '● $status',
        style: TextStyle(color: fg, fontSize: 11, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildSnapshotItem(String icon, String distance) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(icon, style: const TextStyle(fontSize: 12)),
        const SizedBox(width: 4),
        Text(
          distance,
          style: const TextStyle(
            color: Color(0xFFE2E8F0),
            fontSize: 11.5,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildDivider() {
    return Container(
      width: 1,
      height: 12,
      color: const Color(0xFF334155),
    );
  }
}
EOF

# ------------------------------------------------------------------------------
# 2. lib/screens/directory_view.dart
# ------------------------------------------------------------------------------
echo "📦 Writing lib/screens/directory_view.dart..."
cat << 'EOF' > lib/screens/directory_view.dart
// ==============================================================================
// HOPPERS DURGA PUJA OFFLINE COMPANION (v3.2.0-PROD)
// Handshake Step 4: Pandal Directory with Strict Filter & Sorting Invariants
// Handled by: @Agent-UI (@Sub-FilterLayout, @Sub-DesignSystem)
// Sub-Agent Validation: @Sub-ProximityEngine, @Sub-TypeSafety
// ==============================================================================

import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../database/app_database.dart';

/// Unified Filter Definitions strictly aligned with Map Bottom Tray
class DirectoryFilterOption {
  final String id;
  final String label;
  final String? emoji;

  const DirectoryFilterOption({
    required this.id,
    required this.label,
    this.emoji,
  });
}

class DirectoryView extends StatefulWidget {
  final LatLng? userLocation;
  final void Function(PandalRecord pandal)? onPandalSelected;

  const DirectoryView({
    super.key,
    this.userLocation,
    this.onPandalSelected,
  });

  @override
  State<DirectoryView> createState() => _DirectoryViewState();
}

class _DirectoryViewState extends State<DirectoryView> {
  // Fallback Reference Point (Esplanade Metro Hub)
  static const LatLng esplanadeFallback = LatLng(22.5645, 88.3516);

  // Invariant 2: Ordered list of chips matching map bottom tray exactly
  static const List<DirectoryFilterOption> _filterOptions = [
    DirectoryFilterOption(id: 'nearby', label: 'Nearby', emoji: '📍'),
    DirectoryFilterOption(id: 'all', label: 'All Zones'),
    DirectoryFilterOption(id: 'north', label: 'North', emoji: '🧭'),
    DirectoryFilterOption(id: 'south', label: 'South', emoji: '📍'),
    DirectoryFilterOption(id: 'central', label: 'Central', emoji: '🏛️'),
    DirectoryFilterOption(id: 'east', label: 'East', emoji: '🌅'),
    DirectoryFilterOption(id: 'saltlake_rajarhat', label: 'Salt Lake & Rajarhat', emoji: '🌲'),
    DirectoryFilterOption(id: 'newtown', label: 'Newtown', emoji: '🏢'),
    DirectoryFilterOption(id: 'howrah', label: 'Howrah', emoji: '🌉'),
    DirectoryFilterOption(id: 'behala', label: 'Behala', emoji: '⛵'),
  ];

  // Invariant 1: 'nearby' MUST remain the absolute default active sorting filter
  String _activeFilterId = 'nearby';
  String _searchQuery = '';

  List<PandalRecord> _masterPandals = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPandals();
  }

  Future<void> _loadPandals() async {
    try {
      final db = AppDatabase.instance;
      final rows = await (await db.database).query(AppDatabase.tablePandals);
      final records = rows.map((r) => PandalRecord.fromMap(r)).toList();

      if (mounted) {
        setState(() {
          _masterPandals = records;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('[Agent-Database] Directory query failed: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  LatLng get _refLocation => widget.userLocation ?? esplanadeFallback;

  double _calculateDistanceMeters(double lat, double lng) {
    const double r = 6371000; // Earth radius in meters
    final double phi1 = _refLocation.latitude * (math.pi / 180);
    final double phi2 = lat * (math.pi / 180);
    final double deltaPhi = (lat - _refLocation.latitude) * (math.pi / 180);
    final double deltaLambda = (lng - _refLocation.longitude) * (math.pi / 180);

    final double a = math.sin(deltaPhi / 2) * math.sin(deltaPhi / 2) +
        math.cos(phi1) * math.cos(phi2) * math.sin(deltaLambda / 2) * math.sin(deltaLambda / 2);
    final double c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return r * c;
  }

  List<PandalRecord> get _filteredAndSortedPandals {
    List<PandalRecord> list = List.from(_masterPandals);

    // 1. Text Search Filter
    if (_searchQuery.trim().isNotEmpty) {
      final q = _searchQuery.toLowerCase().trim();
      list = list.where((p) {
        return p.name.toLowerCase().contains(q) ||
            (p.nearestMetro?.toLowerCase().contains(q) ?? false) ||
            (p.theme2026?.toLowerCase().contains(q) ?? false);
      }).toList();
    }

    // 2. Zone Filter
    if (_activeFilterId != 'nearby' && _activeFilterId != 'all') {
      list = list.where((p) {
        final pZone = p.zone.toLowerCase().trim();
        if (_activeFilterId == 'saltlake_rajarhat') {
          return pZone == 'saltlake_rajarhat' || pZone == 'saltlake' || pZone == 'rajarhat';
        }
        return pZone == _activeFilterId;
      }).toList();
    }

    // 3. Sorting: If 'nearby' is active (or default), sort strictly by ascending distance
    if (_activeFilterId == 'nearby' || widget.userLocation != null) {
      list.sort((a, b) {
        final distA = _calculateDistanceMeters(a.lat, a.lng);
        final distB = _calculateDistanceMeters(b.lat, b.lng);
        return distA.compareTo(distB);
      });
    }

    return list;
  }

  @override
  Widget build(BuildContext context) {
    final pandals = _filteredAndSortedPandals;

    return Scaffold(
      backgroundColor: const Color(0xFF090D16), // Dark Obsidian
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: const Text(
          'Pandal Directory',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60.0),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 8.0),
            child: TextField(
              onChanged: (val) => setState(() => _searchQuery = val),
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Search 700+ pandals, themes, metros...',
                hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 13.5),
                prefixIcon: const Icon(Icons.search, color: Color(0xFF94A3B8), size: 20),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          // Filter Tray (Strict Ordering Invariant)
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(vertical: 6.0),
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 14.0),
              itemCount: _filterOptions.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final option = _filterOptions[index];
                final isActive = option.id == _activeFilterId;

                return ChoiceChip(
                  label: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (option.emoji != null) ...[
                        Text(option.emoji!, style: const TextStyle(fontSize: 12)),
                        const SizedBox(width: 4),
                      ],
                      Text(option.label),
                    ],
                  ),
                  selected: isActive,
                  onSelected: (_) => setState(() => _activeFilterId = option.id),
                  selectedColor: const Color(0xFFF59E0B),
                  backgroundColor: const Color(0xFF1E293B),
                  labelStyle: TextStyle(
                    color: isActive ? const Color(0xFF0F172A) : const Color(0xFFCBD5E1),
                    fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                    fontSize: 12.5,
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18),
                    side: BorderSide(
                      color: isActive ? const Color(0xFFF59E0B) : const Color(0xFF334155),
                      width: 1.0,
                    ),
                  ),
                );
              },
            ),
          ),

          // Status & Count Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${pandals.length} Pandals Found',
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (_activeFilterId == 'nearby')
                  const Row(
                    children: [
                      Icon(Icons.near_me, size: 12, color: Color(0xFF38BDF8)),
                      SizedBox(width: 4),
                      Text(
                        'Sorted by Closest Distance',
                        style: TextStyle(color: Color(0xFF38BDF8), fontSize: 11.5),
                      ),
                    ],
                  ),
              ],
            ),
          ),

          // Pandal Cards List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFF59E0B)))
                : pandals.isEmpty
                    ? const Center(
                        child: Text(
                          'No pandals match the selected zone or query',
                          style: TextStyle(color: Color(0xFF64748B)),
                        ),
                      )
                    : ListView.builder(
                        itemCount: pandals.length,
                        padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 4.0),
                        itemBuilder: (context, index) {
                          final item = pandals[index];
                          final distM = _calculateDistanceMeters(item.lat, item.lng);
                          final distLabel = distM >= 1000
                              ? '${(distM / 1000).toStringAsFixed(1)} km'
                              : '${distM.round()} m';

                          return Container(
                            margin: const EdgeInsets.only(bottom: 8.0),
                            decoration: BoxDecoration(
                              color: const Color(0xFF131D31),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFF26334D), width: 0.8),
                            ),
                            child: ListTile(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                              onTap: () => widget.onPandalSelected?.call(item),
                              leading: Container(
                                width: 42,
                                height: 42,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E293B),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: const Color(0xFFF59E0B), width: 1),
                                ),
                                child: const Center(
                                  child: Text('🛕', style: TextStyle(fontSize: 18)),
                                ),
                              ),
                              title: Text(
                                item.name,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 14.5,
                                  fontWeight: FontWeight.w600,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const SizedBox(height: 2),
                                  if (item.theme2026 != null && item.theme2026!.isNotEmpty)
                                    Text(
                                      'Theme: ${item.theme2026}',
                                      style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 11.5),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  const SizedBox(height: 3),
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF1E293B),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          item.zone.toUpperCase(),
                                          style: const TextStyle(
                                            color: Color(0xFF94A3B8),
                                            fontSize: 9.5,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                      if (item.nearestMetro != null) ...[
                                        const SizedBox(width: 6),
                                        const Icon(Icons.subway, size: 11, color: Color(0xFF38BDF8)),
                                        const SizedBox(width: 3),
                                        Flexible(
                                          child: Text(
                                            item.nearestMetro!,
                                            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                ],
                              ),
                              trailing: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    distLabel,
                                    style: const TextStyle(
                                      color: Color(0xFF38BDF8),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12.5,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  const Icon(Icons.chevron_right, color: Color(0xFF64748B), size: 16),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
EOF

# ------------------------------------------------------------------------------
# 3. lib/screens/puja_passport.dart
# ------------------------------------------------------------------------------
echo "📦 Writing lib/screens/puja_passport.dart..."
cat << 'EOF' > lib/screens/puja_passport.dart
// ==============================================================================
// HOPPERS DURGA PUJA OFFLINE COMPANION (v3.2.0-PROD)
// Handshake Step 4: Proximity-Gated Hopper Passport
// Handled by: @Agent-Engagement (@Sub-PujaPassport)
// Sub-Agent Validation: @Sub-ProximityEngine, @Sub-TypeSafety
// ==============================================================================

import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../database/app_database.dart';

class PassportStampRecord {
  final String pandalId;
  final String pandalName;
  final String zone;
  final DateTime collectedAt;
  final bool isManualOverride;

  const PassportStampRecord({
    required this.pandalId,
    required this.pandalName,
    required this.zone,
    required this.collectedAt,
    this.isManualOverride = false,
  });
}

class PujaPassportView extends StatefulWidget {
  final LatLng? userLocation;
  final bool isGpsLocked;

  const PujaPassportView({
    super.key,
    this.userLocation,
    this.isGpsLocked = false,
  });

  @override
  State<PujaPassportView> createState() => _PujaPassportViewState();
}

class _PujaPassportViewState extends State<PujaPassportView> {
  static const LatLng fallbackCenter = LatLng(22.5645, 88.3516);

  // Invariant 3: Proximity threshold in meters
  static const double _stampProximityThresholdM = 100.0;

  // State
  bool _offlineManualOverride = false;
  final Map<String, PassportStampRecord> _collectedStamps = {};
  List<PandalRecord> _pandals = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadMasterData();
  }

  Future<void> _loadMasterData() async {
    try {
      final db = AppDatabase.instance;
      final results = await (await db.database).query(AppDatabase.tablePandals);
      final list = results.map((r) => PandalRecord.fromMap(r)).toList();

      if (mounted) {
        setState(() {
          _pandals = list;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('[Agent-Engagement] Passport load error: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  LatLng get _currentPos => widget.userLocation ?? fallbackCenter;

  double _getDistanceMeters(double lat, double lng) {
    const double r = 6371000;
    final double phi1 = _currentPos.latitude * (math.pi / 180);
    final double phi2 = lat * (math.pi / 180);
    final double deltaPhi = (lat - _currentPos.latitude) * (math.pi / 180);
    final double deltaLambda = (lng - _currentPos.longitude) * (math.pi / 180);

    final double a = math.sin(deltaPhi / 2) * math.sin(deltaPhi / 2) +
        math.cos(phi1) * math.cos(phi2) * math.sin(deltaLambda / 2) * math.sin(deltaLambda / 2);
    final double c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return r * c;
  }

  void _collectStamp(PandalRecord pandal) {
    final stamp = PassportStampRecord(
      pandalId: pandal.id,
      pandalName: pandal.name,
      zone: pandal.zone,
      collectedAt: DateTime.now(),
      isManualOverride: _offlineManualOverride && !widget.isGpsLocked,
    );

    setState(() {
      _collectedStamps[pandal.id] = stamp;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF10B981),
        content: Row(
          children: [
            const Text('✨', style: TextStyle(fontSize: 16)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Stamp Collected for ${pandal.name}!',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  String get _hopperRank {
    final count = _collectedStamps.length;
    if (count >= 25) return '👑 Grand Pandal Emperor';
    if (count >= 15) return '🌟 Veteran Hopper';
    if (count >= 7) return '🎖️ Experienced Explorer';
    if (count >= 3) return '🥉 Novice Hopper';
    return '🌱 Puja Wanderer';
  }

  @override
  Widget build(BuildContext context) {
    final count = _collectedStamps.length;
    final total = _pandals.isEmpty ? 700 : _pandals.length;
    final progress = total > 0 ? (count / total).clamp(0.0, 1.0) : 0.0;

    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: const Text(
          'Hopper Passport',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white),
        ),
      ),
      body: Column(
        children: [
          // Passport Badges & Progress Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xFF0F172A),
              border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _hopperRank,
                          style: const TextStyle(
                            color: Color(0xFFFBBF24),
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '$count stamps collected of $total pandals',
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFF59E0B), width: 1),
                      ),
                      child: Text(
                        '${(progress * 100).toStringAsFixed(1)}%',
                        style: const TextStyle(
                          color: Color(0xFFF59E0B),
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: progress,
                    minHeight: 6,
                    backgroundColor: const Color(0xFF1E293B),
                    color: const Color(0xFFF59E0B),
                  ),
                ),
                const SizedBox(height: 12),

                // Invariant 3 Fallback: Offline Manual Override Switch
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: _offlineManualOverride ? const Color(0xFFF59E0B) : const Color(0xFF334155),
                      width: 0.8,
                    ),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.wifi_off_rounded, size: 16, color: Color(0xFFFBBF24)),
                      const SizedBox(width: 8),
                      const Expanded(
                        child: Text(
                          'Offline Manual Override (Dead Zone / GPS Denied)',
                          style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 11),
                        ),
                      ),
                      Switch(
                        value: _offlineManualOverride,
                        onChanged: (val) => setState(() => _offlineManualOverride = val),
                        activeColor: const Color(0xFFF59E0B),
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Pandals Passport List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFF59E0B)))
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    itemCount: _pandals.length,
                    itemBuilder: (context, index) {
                      final item = _pandals[index];
                      final isStamped = _collectedStamps.containsKey(item.id);
                      final distanceM = _getDistanceMeters(item.lat, item.lng);

                      // Proximity Logic: Condition A (<= 100m) or Manual Override
                      final canCollect = (!isStamped) &&
                          ((distanceM <= _stampProximityThresholdM && widget.isGpsLocked) ||
                              _offlineManualOverride);

                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF131D31),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isStamped
                                ? const Color(0xFF10B981).withOpacity(0.5)
                                : const Color(0xFF26334D),
                            width: 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            // Stamp Icon Indicator
                            Container(
                              width: 38,
                              height: 38,
                              decoration: BoxDecoration(
                                color: isStamped
                                    ? const Color(0xFF064E3B)
                                    : const Color(0xFF1E293B),
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: isStamped ? const Color(0xFF10B981) : const Color(0xFF475569),
                                  width: 1.2,
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  isStamped ? '✅' : '🎟️',
                                  style: const TextStyle(fontSize: 16),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),

                            // Pandal Info
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.name,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 14,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${item.zone.toUpperCase()} • ${distanceM.round()}m away',
                                    style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),

                            // Invariant 3: Proximity-Gated Stamp Button
                            if (isStamped)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: const Color(0x2210B981),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: const Color(0xFF10B981), width: 0.8),
                                ),
                                child: const Text(
                                  'Stamped',
                                  style: TextStyle(
                                    color: Color(0xFF34D399),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 11.5,
                                  ),
                                ),
                              )
                            else if (canCollect)
                              ElevatedButton(
                                onPressed: () => _collectStamp(item),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF10B981),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                  elevation: 4,
                                  shadowColor: const Color(0xFF10B981),
                                ),
                                child: const Text(
                                  '✨ Collect Stamp',
                                  style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold),
                                ),
                              )
                            else
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E293B),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: const Color(0xFF475569), width: 0.6),
                                ),
                                child: Text(
                                  '🔒 Within 100m to Stamp',
                                  style: TextStyle(
                                    color: Colors.grey.shade500,
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
EOF

# ------------------------------------------------------------------------------
# 4. Git Synchronization
# ------------------------------------------------------------------------------
echo "🔄 [DevOpsAgent] Staging files for commit..."
git add lib/widgets/pandal_bottom_sheet.dart lib/screens/directory_view.dart lib/screens/puja_passport.dart

echo "📝 [DevOpsAgent] Committing changes..."
git commit -m "feat(ui): implement tri-state drawer, directory filter alignment, and proximity passport

- Add DraggableScrollableSheet 3-state drawer (0%, 28% peek, 85% full detail)
- Display survival snapshot row (toilets, ATMs, hospitals, parking) in drawer peek
- Enforce 'Nearby' as strict default sorting filter in Pandal Directory
- Align directory horizontal filter tray with map zones (including Salt Lake & Rajarhat, Newtown)
- Implement 100m proximity-gated stamping logic for Hopper Passport
- Add offline manual override toggle for dead zones and GPS-denied environments

Agents: @Agent-UI, @Agent-Engagement
Validators: @Sub-FilterLayout, @Sub-DesignSystem, @Sub-PujaPassport, @Sub-ProximityEngine, @Sub-TypeSafety
Version: 3.2.0-PROD"

echo "🚀 [DevOpsAgent] Pushing changes to remote repository..."
git push

echo "✅ [DevOpsAgent] Step 4 sync completed successfully!"
