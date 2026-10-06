// ==============================================================================
// HOPPERS DURGA PUJA OFFLINE COMPANION (v3.2.0-PROD)
// Handshake Step 5: Data Ingestion & Master SQLite Seeding Pipeline
// Handled by: @DataIngestionAgent (@Agent-CivicData) & @Agent-Database
// Sub-Agent Validation: @Sub-TypeSafety, @Sub-DataPipeline
// ==============================================================================

import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:sqflite/sqflite.dart';
import 'app_database.dart';

/// Performance metrics for telemetry and logging
class SeedingReport {
  final int pandalsCount;
  final int utilitiesCount;
  final int parkingCount;
  final Duration duration;
  final bool wasSkipped;

  const SeedingReport({
    required this.pandalsCount,
    required this.utilitiesCount,
    required this.parkingCount,
    required this.duration,
    this.wasSkipped = false,
  });

  @override
  String toString() {
    if (wasSkipped) {
      return '[DatabaseSeeder] Database already populated. Seeding skipped.';
    }
    return '[DatabaseSeeder] Successfully seeded in ${duration.inMilliseconds}ms:\n'
        '  - Pandals: $pandalsCount\n'
        '  - Civic Utilities: $utilitiesCount\n'
        '  - Parking Facilities: $parkingCount';
  }
}

/// Master Ingestion Engine with chunked transactions & zone normalization
class DatabaseSeeder {
  static const String pandalsAssetPath = 'assets/data/Hoppers_Final_App_Ready_Database_v3_Final.csv';
  static const String utilitiesAssetPath = 'assets/data/Hoppers_All_Utilities.csv';
  static const String parkingAssetPath = 'assets/data/Hoppers_Parking_Converted.csv';

  /// Execute seeding sequence on first application launch
  static Future<SeedingReport> seedDatabase({
    bool forceReseed = false,
    String? customPandalsCsv,
    String? customUtilitiesCsv,
    String? customParkingCsv,
  }) async {
    final stopwatch = Stopwatch()..start();
    final db = await AppDatabase.instance.database;

    // Check if database is already seeded
    if (!forceReseed) {
      final pandalCount = Sqflite.firstIntValue(
        await db.rawQuery('SELECT COUNT(*) FROM ${AppDatabase.tablePandals};'),
      );
      if (pandalCount != null && pandalCount > 0) {
        stopwatch.stop();
        return SeedingReport(
          pandalsCount: pandalCount,
          utilitiesCount: 0,
          parkingCount: 0,
          duration: stopwatch.elapsed,
          wasSkipped: true,
        );
      }
    }

    debugPrint('[@DataIngestionAgent] Commencing atomic master dataset seeding...');

    // Load CSV source strings (either custom provided or bundled assets)
    final String pandalsCsv = customPandalsCsv ?? await _loadAssetSafe(pandalsAssetPath);
    final String utilitiesCsv = customUtilitiesCsv ?? await _loadAssetSafe(utilitiesAssetPath);
    final String parkingCsv = customParkingCsv ?? await _loadAssetSafe(parkingAssetPath);

    int totalPandals = 0;
    int totalUtilities = 0;
    int totalParking = 0;

    // Execute bulk insertion within a high-performance SQLite atomic transaction
    await db.transaction((txn) async {
      // 1. Wipe old records if force reseed requested
      if (forceReseed) {
        await txn.delete(AppDatabase.tablePandals);
        await txn.delete(AppDatabase.tableCivicUtilities);
      }

      // 2. Ingest 713 Pandals
      if (pandalsCsv.isNotEmpty) {
        final List<PandalRecord> pandalRecords = _parsePandalsCsv(pandalsCsv);
        totalPandals = pandalRecords.length;

        final batch = txn.batch();
        for (final pandal in pandalRecords) {
          batch.insert(
            AppDatabase.tablePandals,
            pandal.toMap(),
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        }
        await batch.commit(noResult: true);
        debugPrint('[@Agent-Database] Seeded $totalPandals pandals with zone taxonomy.');
      }

      // 3. Ingest Civic Utilities (Chunked Batches of 1,000 for zero UI blocking)
      if (utilitiesCsv.isNotEmpty) {
        final List<CivicUtilityRecord> utilityRecords = _parseUtilitiesCsv(utilitiesCsv);
        totalUtilities = utilityRecords.length;

        const int chunkSize = 1000;
        for (int i = 0; i < utilityRecords.length; i += chunkSize) {
          final end = (i + chunkSize < utilityRecords.length) ? i + chunkSize : utilityRecords.length;
          final chunk = utilityRecords.sublist(i, end);

          final batch = txn.batch();
          for (final util in chunk) {
            batch.insert(
              AppDatabase.tableCivicUtilities,
              util.toMap(),
              conflictAlgorithm: ConflictAlgorithm.replace,
            );
          }
          await batch.commit(noResult: true);
        }
        debugPrint('[@Agent-Database] Seeded $totalUtilities civic utilities.');
      }

      // 4. Ingest Parking Facilities (400 spots)
      if (parkingCsv.isNotEmpty) {
        final List<CivicUtilityRecord> parkingRecords = _parseParkingCsv(parkingCsv);
        totalParking = parkingRecords.length;

        final batch = txn.batch();
        for (final parking in parkingRecords) {
          batch.insert(
            AppDatabase.tableCivicUtilities,
            parking.toMap(),
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        }
        await batch.commit(noResult: true);
        debugPrint('[@Agent-Database] Seeded $totalParking parking facilities.');
      }
    });

    stopwatch.stop();
    final report = SeedingReport(
      pandalsCount: totalPandals,
      utilitiesCount: totalUtilities,
      parkingCount: totalParking,
      duration: stopwatch.elapsed,
    );

    debugPrint(report.toString());
    return report;
  }

  // ===========================================================================
  // CSV PARSERS WITH QUOTED-FIELD & DELIMITER RESILIENCE
  // ===========================================================================

  /// Parses `Hoppers_Final_App_Ready_Database_v3_Final.csv`
  static List<PandalRecord> _parsePandalsCsv(String csvContent) {
    final List<List<String>> rows = _parseCsvRows(csvContent);
    if (rows.length <= 1) return [];

    final List<String> header = rows.first.map((c) => c.trim().toLowerCase()).toList();
    final int nameIdx = header.indexOf('pandal name');
    final int addrIdx = header.indexOf('address');
    final int latLngIdx = _findHeaderIndex(header, ['lat, long', 'lat_long', 'coordinates']);
    final int metroIdx = header.indexOf('nearest metro');
    final int zoneIdx = header.indexOf('zone');
    final int themeIdx = _findHeaderIndex(header, ['theme (2026)', 'theme', 'theme_2026']);

    final List<PandalRecord> records = [];

    for (int i = 1; i < rows.length; i++) {
      final row = rows[i];
      if (row.length < 3) continue;

      final name = nameIdx != -1 && nameIdx < row.length ? row[nameIdx].trim() : '';
      if (name.isEmpty) continue;

      final address = addrIdx != -1 && addrIdx < row.length ? row[addrIdx].trim() : '';
      final metro = metroIdx != -1 && metroIdx < row.length ? row[metroIdx].trim() : null;
      final rawZone = zoneIdx != -1 && zoneIdx < row.length ? row[zoneIdx].trim() : '';
      final theme = themeIdx != -1 && themeIdx < row.length ? row[themeIdx].trim() : null;

      // Coordinate Extraction from "22.595804, 88.384477"
      double lat = 22.5645; // Esplanade default
      double lng = 88.3516;

      if (latLngIdx != -1 && latLngIdx < row.length) {
        final rawLatLng = row[latLngIdx].replaceAll('"', '').trim();
        final parts = rawLatLng.split(',');
        if (parts.length >= 2) {
          final parsedLat = double.tryParse(parts[0].trim());
          final parsedLng = double.tryParse(parts[1].trim());
          if (parsedLat != null && parsedLng != null) {
            lat = parsedLat;
            lng = parsedLng;
          }
        }
      }

      // Invariant 2: Normalizes to taxonomy ('saltlake_rajarhat', 'newtown', etc.)
      final normalizedZone = normalizeZone(rawZone, name: name, address: address);
      final id = _generateSlug(name, i);

      records.add(PandalRecord(
        id: id,
        name: name,
        zone: normalizedZone,
        lat: lat,
        lng: lng,
        theme2026: theme,
        nearestMetro: metro,
        isUserSubmitted: false,
      ));
    }

    return records;
  }

  /// Parses `Hoppers_All_Utilities.csv`
  static List<CivicUtilityRecord> _parseUtilitiesCsv(String csvContent) {
    final List<List<String>> rows = _parseCsvRows(csvContent);
    if (rows.length <= 1) return [];

    final List<String> header = rows.first.map((c) => c.trim().toLowerCase()).toList();
    final int pandalNameIdx = header.indexOf('pandal_name');
    final int typeIdx = header.indexOf('utility_type');
    final int nameIdx = header.indexOf('utility_name');
    final int distIdx = header.indexOf('distance_meters');
    final int latIdx = header.indexOf('latitude');
    final int lngIdx = header.indexOf('longitude');

    final List<CivicUtilityRecord> records = [];

    for (int i = 1; i < rows.length; i++) {
      final row = rows[i];
      if (row.length < 5) continue;

      final pandalName = pandalNameIdx != -1 && pandalNameIdx < row.length ? row[pandalNameIdx].trim() : '';
      final rawType = typeIdx != -1 && typeIdx < row.length ? row[typeIdx].trim() : '';
      final name = nameIdx != -1 && nameIdx < row.length ? row[nameIdx].trim() : '';
      final distStr = distIdx != -1 && distIdx < row.length ? row[distIdx].trim() : null;

      final lat = latIdx != -1 && latIdx < row.length ? double.tryParse(row[latIdx].trim()) : null;
      final lng = lngIdx != -1 && lngIdx < row.length ? double.tryParse(row[lngIdx].trim()) : null;

      if (name.isEmpty || lat == null || lng == null) continue;

      // Invariant 3: Maps specific POI types to unified category tags
      final category = _normalizeUtilityCategory(rawType);
      final details = distStr != null && distStr.isNotEmpty
          ? '$distStr m from $pandalName · ${_cleanTypeLabel(rawType)}'
          : _cleanTypeLabel(rawType);

      records.add(CivicUtilityRecord(
        id: 'util_${i}_${lat.toStringAsFixed(4)}_${lng.toStringAsFixed(4)}',
        category: category,
        name: name,
        details: details,
        zone: null,
        lat: lat,
        lng: lng,
      ));
    }

    return records;
  }

  /// Parses `Hoppers_Parking_Converted.csv`
  static List<CivicUtilityRecord> _parseParkingCsv(String csvContent) {
    final List<List<String>> rows = _parseCsvRows(csvContent);
    if (rows.length <= 1) return [];

    final List<String> header = rows.first.map((c) => c.trim().toLowerCase()).toList();
    final int nameIdx = header.indexOf('parking_name');
    final int descIdx = header.indexOf('description');
    final int typeIdx = header.indexOf('type');
    final int latIdx = header.indexOf('latitude');
    final int lngIdx = header.indexOf('longitude');

    final List<CivicUtilityRecord> records = [];

    for (int i = 1; i < rows.length; i++) {
      final row = rows[i];
      if (row.length < 4) continue;

      final name = nameIdx != -1 && nameIdx < row.length ? row[nameIdx].trim() : '';
      final desc = descIdx != -1 && descIdx < row.length ? row[descIdx].trim() : '';
      final type = typeIdx != -1 && typeIdx < row.length ? row[typeIdx].trim() : 'Police Designated';
      final lat = latIdx != -1 && latIdx < row.length ? double.tryParse(row[latIdx].trim()) : null;
      final lng = lngIdx != -1 && lngIdx < row.length ? double.tryParse(row[lngIdx].trim()) : null;

      if (name.isEmpty || lat == null || lng == null) continue;

      final details = desc.isNotEmpty ? '$type · $desc' : type;

      records.add(CivicUtilityRecord(
        id: 'parking_${i}_${lat.toStringAsFixed(4)}',
        category: 'parking',
        name: name,
        details: details,
        zone: null,
        lat: lat,
        lng: lng,
      ));
    }

    return records;
  }

  // ===========================================================================
  // CLASSIFICATION & TAXONOMY NORMALIZERS
  // ===========================================================================

  /// Normalizes zone strings to consistent Hoppers taxonomies
  static String normalizeZone(String rawZone, {String name = '', String address = ''}) {
    final combined = '$rawZone $name $address'.toLowerCase();

    if (combined.contains('saltlake') ||
        combined.contains('salt lake') ||
        combined.contains('rajarhat') ||
        combined.contains('bidhannagar') ||
        combined.contains('karunamoyee') ||
        combined.contains('central park')) {
      return 'saltlake_rajarhat';
    }

    if (combined.contains('newtown') ||
        combined.contains('new town') ||
        combined.contains('action area') ||
        combined.contains('ecospace') ||
        combined.contains('shapoorji')) {
      return 'newtown';
    }

    if (combined.contains('howrah') || combined.contains('shibpur') || combined.contains('salkia')) {
      return 'howrah';
    }

    if (combined.contains('behala') || combined.contains('taratala') || combined.contains('barisha')) {
      return 'behala';
    }

    switch (rawZone.toLowerCase().trim()) {
      case 'north':
        return 'north';
      case 'south':
        return 'south';
      case 'central':
        return 'central';
      case 'east':
        return 'east';
      default:
        return 'south';
    }
  }

  /// Maps Google Places raw types to our 5 master utility categories
  static String _normalizeUtilityCategory(String rawType) {
    final t = rawType.toLowerCase();
    if (t.contains('hospital') || t.contains('medical') || t.contains('pharmacy') || t.contains('doctor')) {
      return 'hospital';
    }
    if (t.contains('toilet') || t.contains('washroom') || t.contains('sulabh')) {
      return 'toilet';
    }
    if (t.contains('atm') || t.contains('bank')) {
      return 'atm';
    }
    if (t.contains('parking') || t.contains('garage')) {
      return 'parking';
    }
    if (t.contains('restaurant') ||
        t.contains('food') ||
        t.contains('cafe') ||
        t.contains('bakery') ||
        t.contains('biryani') ||
        t.contains('meal')) {
      return 'food';
    }
    if (t.contains('police') || t.contains('government_office')) {
      return 'police';
    }
    return 'food';
  }

  static String _cleanTypeLabel(String rawType) {
    return rawType
        .replaceAll('_', ' ')
        .split(' ')
        .map((w) => w.isNotEmpty ? '${w[0].toUpperCase()}${w.substring(1)}' : '')
        .join(' ');
  }

  static String _generateSlug(String name, int index) {
    final clean = name.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '_');
    return '${clean}_$index';
  }

  static int _findHeaderIndex(List<String> header, List<String> possibleNames) {
    for (final name in possibleNames) {
      final idx = header.indexOf(name);
      if (idx != -1) return idx;
    }
    return -1;
  }

  /// Safe asset loader with silent fallback
  static Future<String> _loadAssetSafe(String path) async {
    try {
      return await rootBundle.loadString(path);
    } catch (_) {
      return '';
    }
  }

  /// RFC-4180 compliant CSV stream parser with quoted multiline and comma support
  static List<List<String>> _parseCsvRows(String input) {
    final List<List<String>> rows = [];
    final StringBuffer field = StringBuffer();
    List<String> currentRow = [];
    bool inQuotes = false;

    for (int i = 0; i < input.length; i++) {
      final char = input[i];

      if (char == '"') {
        if (inQuotes && i + 1 < input.length && input[i + 1] == '"') {
          field.write('"');
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char == ',' && !inQuotes) {
        currentRow.add(field.toString());
        field.clear();
      } else if ((char == '\n' || char == '\r') && !inQuotes) {
        if (char == '\r' && i + 1 < input.length && input[i + 1] == '\n') {
          i++;
        }
        currentRow.add(field.toString());
        field.clear();
        if (currentRow.any((c) => c.trim().isNotEmpty)) {
          rows.add(currentRow);
        }
        currentRow = [];
      } else {
        field.write(char);
      }
    }

    if (field.isNotEmpty || currentRow.isNotEmpty) {
      currentRow.add(field.toString());
      if (currentRow.any((c) => c.trim().isNotEmpty)) {
        rows.add(currentRow);
      }
    }

    return rows;
  }
}
