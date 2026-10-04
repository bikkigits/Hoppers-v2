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
