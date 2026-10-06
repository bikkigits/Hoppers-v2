// ==============================================================================
// HOPPERS DURGA PUJA 2026: TRANSIT & BUS DIVERSIONS VIEW
// High-performance offline transit companion powered by SQLite
// Handled by: @Agent-Transit & @Agent-UI
// ==============================================================================

import 'package:flutter/material.dart';
import '../database/app_database.dart';

class TransitView extends StatefulWidget {
  final void Function(BusDiversionRecord busRoute)? onBusSelected;
  final void Function(TransitHubRecord hub)? onHubSelected;

  const TransitView({
    super.key,
    this.onBusSelected,
    this.onHubSelected,
  });

  @override
  State<TransitView> createState() => _TransitViewState();
}

class _TransitViewState extends State<TransitView> {
  // Active Section: 'buses' | 'ferry' | 'rail'
  String _activeSection = 'buses';
  String _searchQuery = '';

  List<BusDiversionRecord> _allBuses = [];
  List<TransitHubRecord> _ferryGhats = [];
  List<TransitHubRecord> _railHubs = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadTransitData();
  }

  Future<void> _loadTransitData() async {
    try {
      final db = AppDatabase.instance;
      final buses = await db.getAllBusDiversions();
      final ferries = await db.getFerryGhats();
      final rails = await db.getRailwayHubs();

      if (mounted) {
        setState(() {
          _allBuses = buses;
          _ferryGhats = ferries;
          _railHubs = rails;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('[@TransitView] Error loading transit datasets: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<BusDiversionRecord> get _filteredBuses {
    if (_searchQuery.trim().isEmpty) return _allBuses;
    final q = _searchQuery.toLowerCase().trim();
    return _allBuses.where((b) {
      return b.routeNo.toLowerCase().contains(q) ||
          b.origin.toLowerCase().contains(q) ||
          b.destination.toLowerCase().contains(q) ||
          (b.divertedPath?.toLowerCase().contains(q) ?? false) ||
          (b.restrictedStops?.toLowerCase().contains(q) ?? false);
    }).toList();
  }

  List<TransitHubRecord> get _filteredHubs {
    final list = _activeSection == 'ferry' ? _ferryGhats : _railHubs;
    if (_searchQuery.trim().isEmpty) return list;
    final q = _searchQuery.toLowerCase().trim();
    return list.where((h) {
      return h.name.toLowerCase().contains(q) ||
          (h.connectingZones?.toLowerCase().contains(q) ?? false) ||
          (h.keyPandals?.toLowerCase().contains(q) ?? false);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: const Text(
          'Puja Transit & Diversions 2026',
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
                hintText: _activeSection == 'buses'
                    ? 'Search 160 bus routes, origin, destination...'
                    : 'Search transit hubs, ferry ghats, stations...',
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
          // Section Switcher: Buses vs Ferry Ghats vs Rail Hubs
          Container(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 6),
            child: Row(
              children: [
                _buildTabButton('buses', '🚌 Bus Routes (160)'),
                const SizedBox(width: 8),
                _buildTabButton('ferry', '🚢 Ferry Ghats (14)'),
                const SizedBox(width: 8),
                _buildTabButton('rail', '🚉 Rail Hubs (25)'),
              ],
            ),
          ),

          // Official Advisory Banner
          if (_activeSection == 'buses')
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 6.0),
              padding: const EdgeInsets.all(10.0),
              decoration: BoxDecoration(
                color: const Color(0xFF450A0A).withOpacity(0.3),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.shield, color: Color(0xFFF87171), size: 18),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Kolkata Police Traffic Notification No. TP/47\nMandatory evening & midnight festive diversions applied.',
                      style: TextStyle(color: Color(0xFFFCA5A5), fontSize: 11, height: 1.2),
                    ),
                  ),
                ],
              ),
            ),

          // Body Content
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFEF4444)))
                : _activeSection == 'buses'
                    ? _buildBusesList()
                    : _buildHubsList(),
          ),
        ],
      ),
    );
  }

  Widget _buildTabButton(String id, String label) {
    final isActive = _activeSection == id;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _activeSection = id),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isActive ? const Color(0xFFEF4444) : const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isActive ? const Color(0xFFEF4444) : const Color(0xFF334155),
              width: 1,
            ),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              color: isActive ? Colors.white : const Color(0xFF94A3B8),
              fontSize: 11.5,
              fontWeight: isActive ? FontWeight.bold : FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ),
    );
  }

  Widget _buildBusesList() {
    final buses = _filteredBuses;
    if (buses.isEmpty) {
      return const Center(
        child: Text('No bus routes found matching query', style: TextStyle(color: Color(0xFF64748B))),
      );
    }

    return ListView.builder(
      itemCount: buses.length,
      padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 4.0),
      itemBuilder: (context, index) {
        final b = buses[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 8.0),
          decoration: BoxDecoration(
            color: const Color(0xFF131D31),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF26334D), width: 0.8),
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            onTap: () => widget.onBusSelected?.call(b),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFFEF4444), width: 0.8),
                  ),
                  child: Text(
                    'Route ${b.routeNo}',
                    style: const TextStyle(
                      color: Color(0xFFF87171),
                      fontSize: 11.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '${b.origin} ➔ ${b.destination}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13.5,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 6),
                if (b.restrictedStops != null && b.restrictedStops!.isNotEmpty)
                  Text(
                    '⛔ Restricted: ${b.restrictedStops}',
                    style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 11),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                if (b.divertedPath != null && b.divertedPath!.isNotEmpty)
                  Text(
                    '🔄 Detour: ${b.divertedPath}',
                    style: const TextStyle(color: Color(0xFF34D399), fontSize: 11),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                if (b.hours != null && b.hours!.isNotEmpty)
                  Text(
                    '⏱️ Timings: ${b.hours}',
                    style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5),
                  ),
              ],
            ),
            trailing: const Icon(Icons.arrow_forward_ios, color: Color(0xFF64748B), size: 14),
          ),
        );
      },
    );
  }

  Widget _buildHubsList() {
    final hubs = _filteredHubs;
    if (hubs.isEmpty) {
      return const Center(
        child: Text('No transit hubs found', style: TextStyle(color: Color(0xFF64748B))),
      );
    }

    return ListView.builder(
      itemCount: hubs.length,
      padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 4.0),
      itemBuilder: (context, index) {
        final h = hubs[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 8.0),
          decoration: BoxDecoration(
            color: const Color(0xFF131D31),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF26334D), width: 0.8),
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            onTap: () => widget.onHubSelected?.call(h),
            leading: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFF06B6D4), width: 0.8),
              ),
              child: Center(
                child: Text(h.isFerry ? '🚢' : '🚉', style: const TextStyle(fontSize: 18)),
              ),
            ),
            title: Text(
              h.name,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 3),
                Text(
                  '${h.type} • ${h.connectingZones ?? 'Kolkata'}',
                  style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11),
                ),
                if (h.travelTip != null && h.travelTip!.isNotEmpty)
                  Text(
                    '💡 ${h.travelTip}',
                    style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10.5),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
              ],
            ),
            trailing: const Icon(Icons.navigation, color: Color(0xFF06B6D4), size: 18),
          ),
        );
      },
    );
  }
}
