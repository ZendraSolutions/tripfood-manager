/**
 * @fileoverview Application services barrel export.
 * Provides centralized access to all application layer services.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 * @module application/services
 */

// Services
export { TripService } from './TripService';
export { ParticipantService } from './ParticipantService';
export { ProductService } from './ProductService';
export { ConsumptionService } from './ConsumptionService';
export { AvailabilityService } from './AvailabilityService';
export { ShoppingService } from './ShoppingService';

// Service DTOs (legacy compatibility)
export type { CreateConsumptionDTO, UpdateConsumptionDTO } from './ConsumptionService';
export type { SetAvailabilityDTO } from './AvailabilityService';
export type { ShoppingList, ShoppingListItem, ProductConsumptionSummary } from './ShoppingService';

// Product service filter options
export type { ProductFilterOptions } from './ProductService';
