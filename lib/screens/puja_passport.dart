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
