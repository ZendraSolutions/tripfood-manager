/**
 * @fileoverview Barrel export para la capa de persistencia.
 *
 * Re-exporta todos los componentes de persistencia incluyendo
 * IndexedDB y mappers.
 *
 * @module infrastructure/persistence
 * @version 1.0.0
 */

// IndexedDB
export {
  TripFoodDatabase,
  db,
  IndexedDBTripRepository,
  IndexedDBParticipantRepository,
  IndexedDBProductRepository,
  IndexedDBConsumptionRepository,
  IndexedDBAvailabilityRepository,
} from './indexeddb';

export type {
  TripRecord,
  ParticipantRecord,
  ProductRecord,
  ConsumptionRecord,
  AvailabilityRecord,
} from './indexeddb';

// Mappers
export {
  TripMapper,
  ParticipantMapper,
  ProductMapper,
  ConsumptionMapper,
  AvailabilityMapper,
} from './mappers';

export type {
  TripProps,
  ParticipantProps,
  ProductProps,
  ProductType,
  ConsumptionProps,
  MealType,
  AvailabilityProps,
} from './mappers';
