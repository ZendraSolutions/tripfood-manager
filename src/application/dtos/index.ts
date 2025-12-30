/**
 * @fileoverview Barrel export for all DTOs.
 * Provides centralized access to all Data Transfer Objects.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

// Trip DTOs
export type {
  CreateTripDTO,
  UpdateTripDTO,
  TripResponseDTO,
  TripDetailResponseDTO,
} from './trip';

// Participant DTOs
export type {
  CreateParticipantDTO,
  UpdateParticipantDTO,
  ParticipantResponseDTO,
  ParticipantWithAvailabilityDTO,
} from './participant';

// Product DTOs
export { ProductCategory, ProductUnit } from './product';
export type {
  CreateProductDTO,
  UpdateProductDTO,
  ProductResponseDTO,
  ProductWithConsumptionDTO,
} from './product';

// Consumption DTOs
export { MealType } from './consumption';
export type {
  CreateConsumptionDTO,
  BulkCreateConsumptionDTO,
  UpdateConsumptionDTO,
  ConsumptionResponseDTO,
  ConsumptionByDateDTO,
  ConsumptionByParticipantDTO,
} from './consumption';

// Availability DTOs
export type {
  CreateAvailabilityDTO,
  CreateAvailabilityRangeDTO,
  BulkCreateAvailabilityDTO,
  UpdateAvailabilityDTO,
  MealAvailabilityDTO,
  AvailabilityResponseDTO,
  AvailabilityByDateDTO,
  AvailabilityByParticipantDTO,
  AvailabilityMatrixDTO,
} from './availability';

// Shopping DTOs
export type {
  QuantityByDateDTO,
  ShoppingListItemDTO,
  ShoppingListByCategoryDTO,
  ShoppingListDTO,
  GenerateShoppingListOptionsDTO,
  ExportShoppingListOptionsDTO,
} from './shopping';
