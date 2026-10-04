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
