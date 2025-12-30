/**
 * Dependency Injection Container
 * Instantiates and wires all dependencies
 * @module shared/di/container
 */

import { TripFoodDatabase } from '@infrastructure/persistence/indexeddb/database';

// Import repositories
import { IndexedDBTripRepository } from '@infrastructure/persistence/indexeddb/TripRepository';
import { IndexedDBParticipantRepository } from '@infrastructure/persistence/indexeddb/ParticipantRepository';
import { IndexedDBProductRepository } from '@infrastructure/persistence/indexeddb/ProductRepository';
import { IndexedDBConsumptionRepository } from '@infrastructure/persistence/indexeddb/ConsumptionRepository';
import { IndexedDBAvailabilityRepository } from '@infrastructure/persistence/indexeddb/AvailabilityRepository';

// Import entity classes for factory functions
import { Trip } from '@domain/entities/Trip';
import { Participant } from '@domain/entities/Participant';
import { Product } from '@domain/entities/Product';
import { Consumption } from '@domain/entities/Consumption';
import { Availability } from '@domain/entities/Availability';

// Import services
import { TripService } from '@application/services/TripService';
import { ParticipantService } from '@application/services/ParticipantService';
import { ProductService } from '@application/services/ProductService';
import { ConsumptionService } from '@application/services/ConsumptionService';
import { AvailabilityService } from '@application/services/AvailabilityService';
import { ShoppingService } from '@application/services/ShoppingService';

// Database instance (singleton)
const database = new TripFoodDatabase();

// Factory functions for creating domain entities from persistence props
const tripFactory = (props: Parameters<typeof Trip.fromPersistence>[0]) => Trip.fromPersistence(props);
const participantFactory = (props: Parameters<typeof Participant.fromPersistence>[0]) => Participant.fromPersistence(props);
const productFactory = (props: Parameters<typeof Product.fromPersistence>[0]) => Product.fromPersistence(props);
const consumptionFactory = (props: Parameters<typeof Consumption.fromPersistence>[0]) => Consumption.fromPersistence(props);
const availabilityFactory = (props: Parameters<typeof Availability.fromPersistence>[0]) => Availability.fromPersistence(props);

// Repositories
const tripRepository = new IndexedDBTripRepository(database, tripFactory);
const participantRepository = new IndexedDBParticipantRepository(database, participantFactory);
const productRepository = new IndexedDBProductRepository(database, productFactory);
const consumptionRepository = new IndexedDBConsumptionRepository(database, consumptionFactory);
const availabilityRepository = new IndexedDBAvailabilityRepository(database, availabilityFactory);

// Services
export const tripService = new TripService(tripRepository);
export const participantService = new ParticipantService(participantRepository, tripRepository);
export const productService = new ProductService(productRepository);
export const consumptionService = new ConsumptionService(consumptionRepository, participantRepository, productRepository);
export const availabilityService = new AvailabilityService(availabilityRepository, participantRepository);
export const shoppingService = new ShoppingService(consumptionRepository, productRepository, availabilityRepository);

// Container object for Context
export const services = {
  tripService,
  participantService,
  productService,
  consumptionService,
  availabilityService,
  shoppingService,
};

export type ServiceContainer = typeof services;

// Export database for direct access if needed
export { database };
