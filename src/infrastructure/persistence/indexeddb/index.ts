/**
 * @fileoverview Barrel export para la capa de persistencia IndexedDB.
 *
 * Este archivo re-exporta todos los componentes de persistencia IndexedDB
 * para facilitar las importaciones desde otros módulos.
 *
 * @module infrastructure/persistence/indexeddb
 * @version 1.0.0
 */

// Database
export { TripFoodDatabase, db } from './database';
export type {
  TripRecord,
  ParticipantRecord,
  ProductRecord,
  ConsumptionRecord,
  AvailabilityRecord,
} from './database';

// Repositories
export { IndexedDBTripRepository } from './TripRepository';
export { IndexedDBParticipantRepository } from './ParticipantRepository';
export { IndexedDBProductRepository } from './ProductRepository';
export { IndexedDBConsumptionRepository } from './ConsumptionRepository';
export { IndexedDBAvailabilityRepository } from './AvailabilityRepository';
