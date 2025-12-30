/**
 * @fileoverview Application services barrel export
 * @module application/services
 */

export { TripService } from './TripService';
export { ParticipantService } from './ParticipantService';
export { ProductService } from './ProductService';
export { ConsumptionService } from './ConsumptionService';
export type { CreateConsumptionDTO, UpdateConsumptionDTO } from './ConsumptionService';
export { AvailabilityService } from './AvailabilityService';
export type { SetAvailabilityDTO } from './AvailabilityService';
export { ShoppingService } from './ShoppingService';
export type { ShoppingList, ShoppingListItem, ProductConsumptionSummary } from './ShoppingService';
