/**
 * @fileoverview Barrel export principal de la capa de infraestructura.
 *
 * Este archivo proporciona un punto de entrada único para todas las
 * exportaciones de la capa de infraestructura, incluyendo:
 * - Errores de infraestructura
 * - Persistencia (IndexedDB, mappers)
 * - Servicios de exportación (CSV)
 *
 * @module infrastructure
 * @version 1.0.0
 *
 * @example
 * ```typescript
 * import {
 *   db,
 *   IndexedDBTripRepository,
 *   TripMapper,
 *   CSVExporter,
 *   DatabaseError,
 * } from '@infrastructure';
 * ```
 */

// ============================================================================
// ERRORS
// ============================================================================

export { InfrastructureError, DatabaseError } from './errors';
export type { DatabaseOperation } from './errors';

// ============================================================================
// PERSISTENCE - DATABASE
// ============================================================================

export {
  TripFoodDatabase,
  db,
} from './persistence';

export type {
  TripRecord,
  ParticipantRecord,
  ProductRecord,
  ConsumptionRecord,
  AvailabilityRecord,
} from './persistence';

// ============================================================================
// PERSISTENCE - REPOSITORIES
// ============================================================================

export {
  IndexedDBTripRepository,
  IndexedDBParticipantRepository,
  IndexedDBProductRepository,
  IndexedDBConsumptionRepository,
  IndexedDBAvailabilityRepository,
} from './persistence';

// ============================================================================
// PERSISTENCE - MAPPERS
// ============================================================================

export {
  TripMapper,
  ParticipantMapper,
  ProductMapper,
  ConsumptionMapper,
  AvailabilityMapper,
} from './persistence';

export type {
  TripProps,
  ParticipantProps,
  ProductProps,
  ProductType,
  ConsumptionProps,
  MealType,
  AvailabilityProps,
} from './persistence';

// ============================================================================
// EXPORT SERVICES
// ============================================================================

export { CSVExporter } from './export';
export type {
  CSVExportOptions,
  CSVColumn,
  CSVExportResult,
} from './export';
