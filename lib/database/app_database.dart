// ==============================================================================
// HOPPERS DURGA PUJA 2026: MASTER OFFLINE SQLITE SERVICE
// Offline-first Spatial & Transit Companion for Kolkata
// Connects to bundled 'assets/database/hoppers_master.db'
// ==============================================================================

import 'dart:async';
import 'dart:io';
import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';

// ==============================================================================
// 1. DATA MODELS
// ==============================================================================

/// Master Durga Puja Pandal Model (713 Records)
class PandalRecord {
  final String id;
  final String nameEn;
  final String? nameBn;
  final String? nameHi;
  final String zone;
  final double lat;
  final double lng;
  final String? nearestMetro;
  final String? nearestMetroEn;
  final int walkingTimeMin;
  final String? themeEn;
  final String crowdLevel;
  final bool isFeatured;
  final String? exitGateSuggestion;

  const PandalRecord({
    required this.id,
    required this.nameEn,
    this.nameBn,
    this.nameHi,
    required this.zone,
    required this.lat,
    required this.lng,
    this.nearestMetro,
    this.nearestMetroEn,
    this.walkingTimeMin = 5,
    this.themeEn,
    this.crowdLevel = 'Moderate',
    this.isFeatured = false,
    this.exitGateSuggestion,
  });

  factory PandalRecord.fromMap(Map<String, dynamic> map) {
    return PandalRecord(
      id: map['id'] as String,
      nameEn: map['name_en'] as String,
      nameBn: map['name_bn'] as String?,
      nameHi: map['name_hi'] as String?,
      zone: map['zone'] as String,
      lat: (map['lat'] as num).toDouble(),
      lng: (map['lng'] as num).toDouble(),
      nearestMetro: map['nearest_metro'] as String?,
      nearestMetroEn: map['nearest_metro_en'] as String?,
      walkingTimeMin: (map['walking_time_min'] as int?) ?? 5,
      themeEn: map['theme_en'] as String?,
      crowdLevel: (map['crowd_level'] as String?) ?? 'Moderate',
      isFeatured: (map['is_featured'] as int? ?? 0) == 1,
      exitGateSuggestion: map['exit_gate_suggestion'] as String?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name_en': nameEn,
      'name_bn': nameBn,
      'name_hi': nameHi,
      'zone': zone,
      'lat': lat,
      'lng': lng,
      'nearest_metro': nearestMetro,
      'nearest_metro_en': nearestMetroEn,
      'walking_time_min': walkingTimeMin,
      'theme_en': themeEn,
      'crowd_level': crowdLevel,
      'is_featured': isFeatured ? 1 : 0,
      'exit_gate_suggestion': exitGateSuggestion,
    };
  }
}

/// Transit Hub Model (39 Records: Ferry Ghats & Railway Terminals)
class TransitHubRecord {
  final String id;
  final String name;
  final String type;
  final String? operator;
  final double lat;
  final double lng;
  final String? connectingZones;
  final String? keyPandals;
  final String? travelTip;

  const TransitHubRecord({
    required this.id,
    required this.name,
    required this.type,
    this.operator,
    required this.lat,
    required this.lng,
    this.connectingZones,
    this.keyPandals,
    this.travelTip,
  });

  bool get isFerry => type.toLowerCase().contains('ferry');
  bool get isRailway => !isFerry;

  factory TransitHubRecord.fromMap(Map<String, dynamic> map) {
    return TransitHubRecord(
      id: map['id'] as String,
      name: map['name'] as String,
      type: map['type'] as String,
      operator: map['operator'] as String?,
      lat: (map['lat'] as num).toDouble(),
      lng: (map['lng'] as num).toDouble(),
      connectingZones: map['connecting_zones'] as String?,
      keyPandals: map['key_pandals'] as String?,
      travelTip: map['travel_tip'] as String?,
    );
  }
}

/// Kolkata Police Official Bus Diversion Model (160 Routes)
class BusDiversionRecord {
  final String routeId;
  final String routeNo;
  final String? fullTitle;
  final String origin;
  final String destination;
  final int totalStops;
  final String status;
  final String? terminusEntry;
  final String? restrictedStops;
  final String? divertedPath;
  final String? hours;

  const BusDiversionRecord({
    required this.routeId,
    required this.routeNo,
    this.fullTitle,
    required this.origin,
    required this.destination,
    required this.totalStops,
    required this.status,
    this.terminusEntry,
    this.restrictedStops,
    this.divertedPath,
    this.hours,
  });

  factory BusDiversionRecord.fromMap(Map<String, dynamic> map) {
    return BusDiversionRecord(
      routeId: map['route_id'] as String,
      routeNo: map['route_no'] as String,
      fullTitle: map['full_title'] as String?,
      origin: map['origin'] as String,
      destination: map['destination'] as String,
      totalStops: (map['total_stops'] as int?) ?? 20,
      status: (map['status'] as String?) ?? 'Diverted',
      terminusEntry: map['terminus_entry'] as String?,
      restrictedStops: map['restricted_stops'] as String?,
      divertedPath: map['diverted_path'] as String?,
      hours: map['hours'] as String?,
    );
  }
}

/// Metro Station Model (55 Stations)
class MetroStationRecord {
  final String id;
  final String nameEn;
  final String? nameBn;
  final String? nameHi;
  final String lineId;
  final double lat;
  final double lng;
  final bool isInterchange;

  const MetroStationRecord({
    required this.id,
    required this.nameEn,
    this.nameBn,
    this.nameHi,
    required this.lineId,
    required this.lat,
    required this.lng,
    this.isInterchange = false,
  });

  factory MetroStationRecord.fromMap(Map<String, dynamic> map) {
    return MetroStationRecord(
      id: map['id'] as String,
      nameEn: map['name_en'] as String,
      nameBn: map['name_bn'] as String?,
      nameHi: map['name_hi'] as String?,
      lineId: map['line_id'] as String,
      lat: (map['lat'] as num).toDouble(),
      lng: (map['lng'] as num).toDouble(),
      isInterchange: (map['is_interchange'] as int? ?? 0) == 1,
    );
  }
}

/// Civic Utilities Model (10,492 Records)
class CivicUtilityRecord {
  final String id;
  final String name;
  final String category; // 'hospital', 'toilet', 'atm', 'helpdesk', 'food'
  final double lat;
  final double lng;
  final String? address;

  const CivicUtilityRecord({
    required this.id,
    required this.name,
    required this.category,
    required this.lat,
    required this.lng,
    this.address,
  });

  factory CivicUtilityRecord.fromMap(Map<String, dynamic> map) {
    return CivicUtilityRecord(
      id: map['id'] as String,
      name: map['name'] as String,
      category: map['category'] as String,
      lat: (map['lat'] as num).toDouble(),
      lng: (map['lng'] as num).toDouble(),
      address: map['address'] as String?,
    );
  }
}

/// Parking Spot Model (400 Records)
class ParkingSpotRecord {
  final String id;
  final String name;
  final String type;
  final double lat;
  final double lng;
  final int capacity;
  final String feeType;

  const ParkingSpotRecord({
    required this.id,
    required this.name,
    required this.type,
    required this.lat,
    required this.lng,
    this.capacity = 50,
    this.feeType = 'Paid KMC',
  });

  factory ParkingSpotRecord.fromMap(Map<String, dynamic> map) {
    return ParkingSpotRecord(
      id: map['id'] as String,
      name: map['name'] as String,
      type: map['type'] as String,
      lat: (map['lat'] as num).toDouble(),
      lng: (map['lng'] as num).toDouble(),
      capacity: (map['capacity'] as int?) ?? 50,
      feeType: (map['fee_type'] as String?) ?? 'Paid KMC',
    );
  }
}

/// Traffic Advisory Model (8 Records)
class TrafficAdvisoryRecord {
  final String id;
  final String zone;
  final String advisoryType;
  final String affectedRoad;
  final String? alternativeRoute;
  final String? timings;
  final String? refNo;

  const TrafficAdvisoryRecord({
    required this.id,
    required this.zone,
    required this.advisoryType,
    required this.affectedRoad,
    this.alternativeRoute,
    this.timings,
    this.refNo,
  });

  factory TrafficAdvisoryRecord.fromMap(Map<String, dynamic> map) {
    return TrafficAdvisoryRecord(
      id: map['id'] as String,
      zone: map['zone'] as String,
      advisoryType: map['advisory_type'] as String,
      affectedRoad: map['affected_road'] as String,
      alternativeRoute: map['alternative_route'] as String?,
      timings: map['timings'] as String?,
      refNo: map['ref_no'] as String?,
    );
  }
}

// ==============================================================================
// 2. MASTER DATABASE SINGLETON SERVICE
// ==============================================================================

class AppDatabase {
  static const String databaseName = 'hoppers_master.db';
  static const int databaseVersion = 1;

  // Table Identifiers
  static const String tablePandals = 'pandals';
  static const String tableTransitHubs = 'transit_hubs';
  static const String tableBusDiversions = 'bus_diversions';
  static const String tableMetroStations = 'metro_stations';
  static const String tableCivicUtilities = 'civic_utilities';
  static const String tableParkingSpots = 'parking_spots';
  static const String tableTrafficAdvisory = 'traffic_advisory';

  AppDatabase._internal();
  static final AppDatabase instance = AppDatabase._internal();

  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final documentsDirectory = await getApplicationDocumentsDirectory();
    final path = join(documentsDirectory.path, databaseName);

    // If database doesn't exist in user storage, copy from bundled assets
    final exists = await databaseExists(path);
    if (!exists) {
      debugPrint('[@AppDatabase] Copying pre-compiled master SQLite DB from assets...');
      try {
        await Directory(dirname(path)).create(recursive: true);
        ByteData data;
        try {
          data = await rootBundle.load('assets/database/$databaseName');
        } catch (_) {
          data = await rootBundle.load('public/$databaseName');
        }
        final List<int> bytes = data.buffer.asUint8List(data.offsetInBytes, data.lengthInBytes);
        await File(path).writeAsBytes(bytes, flush: true);
        debugPrint('[@AppDatabase] Master SQLite DB unpacked successfully (${bytes.length} bytes).');
      } catch (e) {
        debugPrint('[@AppDatabase] Error copying asset DB: $e');
      }
    }

    return await openDatabase(
      path,
      version: databaseVersion,
      readOnly: false,
      onConfigure: (db) async {
        // High performance SQLite configuration
        await db.execute('PRAGMA journal_mode = WAL;');
        await db.execute('PRAGMA synchronous = NORMAL;');
      },
    );
  }

  // ============================================================================
  // 3. QUERY HELPER METHODS
  // ============================================================================

  // --- A. PANDALS QUERIES ---

  /// Fetch all 713 pandals
  Future<List<PandalRecord>> getAllPandals() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      tablePandals,
      orderBy: 'is_featured DESC, name_en ASC',
    );
    return maps.map((m) => PandalRecord.fromMap(m)).toList();
  }

  /// Filter pandals by zone (e.g. 'North', 'South', 'Central', 'East', 'Salt Lake & Rajarhat')
  Future<List<PandalRecord>> getPandalsByZone(String zone) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      tablePandals,
      where: 'LOWER(zone) = LOWER(?)',
      whereArgs: [zone],
      orderBy: 'is_featured DESC, name_en ASC',
    );
    return maps.map((m) => PandalRecord.fromMap(m)).toList();
  }

  /// Proximity query for Pandals within radiusKm (Bounding-box pre-filter + Haversine)
  Future<List<PandalRecord>> getNearbyPandals({
    required double userLat,
    required double userLng,
    double radiusKm = 1.5,
  }) async {
    final db = await database;
    final dLat = radiusKm / 111.0;
    final dLng = radiusKm / (111.0 * math.cos(userLat * math.pi / 180));

    final List<Map<String, dynamic>> maps = await db.rawQuery('''
      SELECT * FROM $tablePandals
      WHERE lat BETWEEN ? AND ?
        AND lng BETWEEN ? AND ?
    ''', [userLat - dLat, userLat + dLat, userLng - dLng, userLng + dLng]);

    final List<PandalRecord> results = [];
    for (final map in maps) {
      final p = PandalRecord.fromMap(map);
      final dist = _haversineKm(userLat, userLng, p.lat, p.lng);
      if (dist <= radiusKm) {
        results.add(p);
      }
    }
    return results;
  }

  // --- B. TRANSIT HUBS QUERIES (39 Records) ---

  /// Fetch all 39 Ferry Ghats & Railway Terminals
  Future<List<TransitHubRecord>> getAllTransitHubs() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(tableTransitHubs, orderBy: 'name ASC');
    return maps.map((m) => TransitHubRecord.fromMap(m)).toList();
  }

  /// Fetch only Ferry Ghats (14 Ghats)
  Future<List<TransitHubRecord>> getFerryGhats() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      tableTransitHubs,
      where: "LOWER(type) LIKE '%ferry%'",
      orderBy: 'name ASC',
    );
    return maps.map((m) => TransitHubRecord.fromMap(m)).toList();
  }

  /// Fetch Railway Terminals (25 Hubs)
  Future<List<TransitHubRecord>> getRailwayHubs() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      tableTransitHubs,
      where: "LOWER(type) NOT LIKE '%ferry%'",
      orderBy: 'name ASC',
    );
    return maps.map((m) => TransitHubRecord.fromMap(m)).toList();
  }

  /// Nearest Transit Hub within radiusKm (e.g. 1.5km companion chip)
  Future<TransitHubRecord?> getNearestTransitHub({
    required double lat,
    required double lng,
    double radiusKm = 1.5,
  }) async {
    final hubs = await getAllTransitHubs();
    TransitHubRecord? closest;
    double minDistance = double.infinity;

    for (final hub in hubs) {
      final d = _haversineKm(lat, lng, hub.lat, hub.lng);
      if (d <= radiusKm && d < minDistance) {
        minDistance = d;
        closest = hub;
      }
    }
    return closest;
  }

  // --- C. BUS DIVERSIONS QUERIES (160 Routes) ---

  /// Fetch all 160 official Kolkata Police bus diversions
  Future<List<BusDiversionRecord>> getAllBusDiversions() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(tableBusDiversions, orderBy: 'route_no ASC');
    return maps.map((m) => BusDiversionRecord.fromMap(m)).toList();
  }

  /// Search bus route by route number, origin, destination, or street
  Future<List<BusDiversionRecord>> searchBusDiversions(String query) async {
    if (query.trim().isEmpty) return getAllBusDiversions();
    final db = await database;
    final q = '%${query.trim()}%';
    final List<Map<String, dynamic>> maps = await db.rawQuery('''
      SELECT * FROM $tableBusDiversions
      WHERE route_no LIKE ?
         OR origin LIKE ?
         OR destination LIKE ?
         OR restricted_stops LIKE ?
         OR diverted_path LIKE ?
      ORDER BY route_no ASC
    ''', [q, q, q, q, q]);
    return maps.map((m) => BusDiversionRecord.fromMap(m)).toList();
  }

  // --- D. METRO STATIONS QUERIES (55 Stations) ---

  /// Fetch all 55 metro stations
  Future<List<MetroStationRecord>> getAllMetroStations() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(tableMetroStations, orderBy: 'name_en ASC');
    return maps.map((m) => MetroStationRecord.fromMap(m)).toList();
  }

  /// Fetch stations for a specific line (e.g. 'blue', 'green', 'orange', 'purple', 'yellow')
  Future<List<MetroStationRecord>> getStationsByLine(String lineId) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      tableMetroStations,
      where: "LOWER(line_id) LIKE ?",
      whereArgs: ['%${lineId.toLowerCase()}%'],
    );
    return maps.map((m) => MetroStationRecord.fromMap(m)).toList();
  }

  // --- E. CIVIC UTILITIES QUERIES (10,492 Records) ---

  /// Fetch civic utilities within 500m (Toilets, Hospitals, Food, ATMs)
  Future<List<CivicUtilityRecord>> getNearbyCivicUtilities({
    required double userLat,
    required double userLng,
    double radiusMeters = 500.0,
    String? category,
  }) async {
    final db = await database;
    final radiusKm = radiusMeters / 1000.0;
    final dLat = radiusKm / 111.0;
    final dLng = radiusKm / (111.0 * math.cos(userLat * math.pi / 180));

    String whereClause = 'lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?';
    List<dynamic> whereArgs = [userLat - dLat, userLat + dLat, userLng - dLng, userLng + dLng];

    if (category != null && category.isNotEmpty && category != 'all') {
      whereClause += ' AND LOWER(category) = LOWER(?)';
      whereArgs.add(category);
    }

    final List<Map<String, dynamic>> maps = await db.rawQuery('''
      SELECT * FROM $tableCivicUtilities
      WHERE $whereClause
    ''', whereArgs);

    final List<CivicUtilityRecord> results = [];
    for (final map in maps) {
      final u = CivicUtilityRecord.fromMap(map);
      final distM = _haversineKm(userLat, userLng, u.lat, u.lng) * 1000.0;
      if (distM <= radiusMeters) {
        results.add(u);
      }
    }
    return results;
  }

  // --- F. PARKING SPOTS (400 Records) & ADVISORIES ---

  /// Fetch nearby parking facilities within radiusKm
  Future<List<ParkingSpotRecord>> getNearbyParkingSpots({
    required double userLat,
    required double userLng,
    double radiusKm = 1.0,
  }) async {
    final db = await database;
    final dLat = radiusKm / 111.0;
    final dLng = radiusKm / (111.0 * math.cos(userLat * math.pi / 180));

    final List<Map<String, dynamic>> maps = await db.rawQuery('''
      SELECT * FROM $tableParkingSpots
      WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?
    ''', [userLat - dLat, userLat + dLat, userLng - dLng, userLng + dLng]);

    return maps.map((m) => ParkingSpotRecord.fromMap(m)).toList();
  }

  /// Fetch official traffic advisories
  Future<List<TrafficAdvisoryRecord>> getAllTrafficAdvisories() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(tableTrafficAdvisory, orderBy: 'id ASC');
    return maps.map((m) => TrafficAdvisoryRecord.fromMap(m)).toList();
  }

  // ============================================================================
  // 4. MATHEMATICAL UTILITIES
  // ============================================================================

  static double _haversineKm(double lat1, double lon1, double lat2, double lon2) {
    const double r = 6371.0;
    final double dLat = (lat2 - lat1) * (math.pi / 180.0);
    final double dLon = (lon2 - lon1) * (math.pi / 180.0);
    final double a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(lat1 * (math.pi / 180.0)) *
            math.cos(lat2 * (math.pi / 180.0)) *
            math.sin(dLon / 2) *
            math.sin(dLon / 2);
    final double c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return r * c;
  }

  /// Close database connection
  Future<void> close() async {
    final db = _database;
    if (db != null) {
      await db.close();
      _database = null;
    }
  }
}
