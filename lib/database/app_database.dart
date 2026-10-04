// ==============================================================================
// HOPPERS DURGA PUJA OFFLINE COMPANION (v3.2.0-PROD)
// Handshake Step 1: Master Offline SQLite Engine
// Handled by: @Agent-CivicData & @Agent-Database
// Sub-Agent Validation: @Sub-TypeSafety
// ==============================================================================

import 'dart:async';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

/// Supported Zone identifiers matching the unified Hoppers taxonomy
enum HoppersZone {
  north,
  south,
  central,
  saltlakeRajarhat,
  newtown,
  dumdum,
  west,
  behala,
}

extension HoppersZoneExtension on HoppersZone {
  String get value {
    switch (this) {
      case HoppersZone.north:
        return 'north';
      case HoppersZone.south:
        return 'south';
      case HoppersZone.central:
        return 'central';
      case HoppersZone.saltlakeRajarhat:
        return 'saltlake_rajarhat';
      case HoppersZone.newtown:
        return 'newtown';
      case HoppersZone.dumdum:
        return 'dumdum';
      case HoppersZone.west:
        return 'west';
      case HoppersZone.behala:
        return 'behala';
    }
  }

  static HoppersZone fromString(String val) {
    switch (val.toLowerCase().trim()) {
      case 'north':
        return HoppersZone.north;
      case 'south':
        return HoppersZone.south;
      case 'central':
        return HoppersZone.central;
      case 'saltlake_rajarhat':
      case 'saltlake':
      case 'rajarhat':
        return HoppersZone.saltlakeRajarhat;
      case 'newtown':
      case 'new_town':
      case 'action_area':
        return HoppersZone.newtown;
      case 'dumdum':
        return HoppersZone.dumdum;
      case 'west':
        return HoppersZone.west;
      case 'behala':
        return HoppersZone.behala;
      default:
        return HoppersZone.central;
    }
  }
}

/// Strictly typed model for Durga Puja Pandals
class PandalRecord {
  final String id;
  final String name;
  final String zone; // e.g., 'saltlake_rajarhat', 'newtown', etc.
  final double lat;
  final double lng;
  final String? theme2026;
  final String? nearestMetro;
  final bool isUserSubmitted;

  const PandalRecord({
    required this.id,
    required this.name,
    required this.zone,
    required this.lat,
    required this.lng,
    this.theme2026,
    this.nearestMetro,
    this.isUserSubmitted = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'zone': zone,
      'lat': lat,
      'lng': lng,
      'theme_2026': theme2026,
      'nearest_metro': nearestMetro,
      'is_user_submitted': isUserSubmitted ? 1 : 0,
    };
  }

  factory PandalRecord.fromMap(Map<String, dynamic> map) {
    return PandalRecord(
      id: map['id'] as String,
      name: map['name'] as String,
      zone: map['zone'] as String,
      lat: (map['lat'] as num).toDouble(),
      lng: (map['lng'] as num).toDouble(),
      theme2026: map['theme_2026'] as String?,
      nearestMetro: map['nearest_metro'] as String?,
      isUserSubmitted: (map['is_user_submitted'] as int? ?? 0) == 1,
    );
  }
}

/// Strictly typed model for Hyper-Local Civic Utilities
class CivicUtilityRecord {
  final String id;
  final String category; // 'parking', 'hospital', 'atm', 'veg_food', 'toilet', 'police'
  final String name;
  final String? details; // e.g., 'Police Authorized · Free' vs 'Private Commercial Paid'
  final String? zone;
  final double lat;
  final double lng;

  const CivicUtilityRecord({
    required this.id,
    required this.category,
    required this.name,
    this.details,
    this.zone,
    required this.lat,
    required this.lng,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'category': category,
      'name': name,
      'details': details,
      'zone': zone,
      'lat': lat,
      'lng': lng,
    };
  }

  factory CivicUtilityRecord.fromMap(Map<String, dynamic> map) {
    return CivicUtilityRecord(
      id: map['id'] as String,
      category: map['category'] as String,
      name: map['name'] as String,
      details: map['details'] as String?,
      zone: map['zone'] as String?,
      lat: (map['lat'] as num).toDouble(),
      lng: (map['lng'] as num).toDouble(),
    );
  }
}

/// Master SQLite database manager for Hoppers Durga Puja Application
class AppDatabase {
  static const String _databaseName = 'hoppers_offline_master.db';
  static const int _databaseVersion = 1;

  // Master Table Names
  static const String tablePandals = 'pandals';
  static const String tableCivicUtilities = 'civic_utilities';

  // Singleton Instance
  static final AppDatabase instance = AppDatabase._init();
  static Database? _database;

  AppDatabase._init();

  /// Thread-safe accessor to the underlying SQLite database
  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB(_databaseName);
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: _databaseVersion,
      onCreate: _createDB,
      onConfigure: _configureDB,
    );
  }

  /// Optimize SQLite PRAGMAs for high-performance offline reads
  Future<void> _configureDB(Database db) async {
    await db.execute('PRAGMA foreign_keys = ON;');
    await db.execute('PRAGMA synchronous = NORMAL;');
    await db.execute('PRAGMA journal_mode = WAL;');
  }

  /// Schema creation adhering strictly to @Agent-CivicData invariants
  Future<void> _createDB(Database db, int version) async {
    // 1. Master Pandals Table
    await db.execute('''
      CREATE TABLE $tablePandals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        zone TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        theme_2026 TEXT,
        nearest_metro TEXT,
        is_user_submitted INTEGER NOT NULL DEFAULT 0
      );
    ''');

    // 2. Master Civic Utilities Table
    await db.execute('''
      CREATE TABLE $tableCivicUtilities (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        details TEXT,
        zone TEXT,
        lat REAL NOT NULL,
        lng REAL NOT NULL
      );
    ''');

    // 3. High-Performance B-Tree Spatial & Zone Indexes for sub-20ms @Agent-Spatial queries
    await db.execute('''
      CREATE INDEX idx_pandals_lat_lng ON $tablePandals (lat, lng);
    ''');

    await db.execute('''
      CREATE INDEX idx_pandals_zone ON $tablePandals (zone);
    ''');

    await db.execute('''
      CREATE INDEX idx_civic_utilities_lat_lng ON $tableCivicUtilities (lat, lng);
    ''');

    await db.execute('''
      CREATE INDEX idx_civic_utilities_zone ON $tableCivicUtilities (zone);
    ''');

    await db.execute('''
      CREATE INDEX idx_civic_utilities_cat_lat_lng ON $tableCivicUtilities (category, lat, lng);
    ''');
  }

  // ===========================================================================
  // QUERY PIPELINES FOR @Agent-Spatial & @Agent-Database
  // ===========================================================================

  /// Sub-20ms Bounding Box Query for 500m Viewport Radius (Pandals)
  Future<List<PandalRecord>> getPandalsInBoundingBox({
    required double minLat,
    required double maxLat,
    required double minLng,
    required double maxLng,
  }) async {
    final db = await instance.database;
    final results = await db.rawQuery(
      '''
      SELECT * FROM $tablePandals
      WHERE lat >= ? AND lat <= ? AND lng >= ? AND lng <= ?
      ''',
      [minLat, maxLat, minLng, maxLng],
    );

    return results.map((row) => PandalRecord.fromMap(row)).toList();
  }

  /// Sub-20ms Bounding Box Query for 500m Survival Grid (Civic Utilities)
  Future<List<CivicUtilityRecord>> getUtilitiesInBoundingBox({
    required String category,
    required double minLat,
    required double maxLat,
    required double minLng,
    required double maxLng,
  }) async {
    final db = await instance.database;
    final results = await db.rawQuery(
      '''
      SELECT * FROM $tableCivicUtilities
      WHERE category = ? AND lat >= ? AND lat <= ? AND lng >= ? AND lng <= ?
      LIMIT 25
      ''',
      [category, minLat, maxLat, minLng, maxLng],
    );

    return results.map((row) => CivicUtilityRecord.fromMap(row)).toList();
  }

  /// Fetch all pandals belonging to a specific zone (e.g. 'saltlake_rajarhat' or 'newtown')
  Future<List<PandalRecord>> getPandalsByZone(String zone) async {
    final db = await instance.database;
    final results = await db.query(
      tablePandals,
      where: 'zone = ?',
      whereArgs: [zone.toLowerCase()],
      orderBy: 'name ASC',
    );

    return results.map((row) => PandalRecord.fromMap(row)).toList();
  }

  /// Bulk Ingestion Transaction for 713 Pandals (Atomic Seed)
  Future<void> insertPandalsBatch(List<PandalRecord> pandals) async {
    final db = await instance.database;
    await db.transaction((txn) async {
      final batch = txn.batch();
      for (final pandal in pandals) {
        batch.insert(
          tablePandals,
          pandal.toMap(),
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
      await batch.commit(noResult: true);
    });
  }

  /// Bulk Ingestion Transaction for 10,492 Civic Utilities (Atomic Seed)
  Future<void> insertUtilitiesBatch(List<CivicUtilityRecord> utilities) async {
    final db = await instance.database;
    await db.transaction((txn) async {
      final batch = txn.batch();
      for (final utility in utilities) {
        batch.insert(
          tableCivicUtilities,
          utility.toMap(),
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
      await batch.commit(noResult: true);
    });
  }

  /// Close database instance gracefully
  Future<void> close() async {
    final db = _database;
    if (db != null) {
      await db.close();
      _database = null;
    }
  }
}
