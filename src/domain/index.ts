/**
 * @fileoverview Domain layer barrel export file.
 * Provides a single point of import for all domain layer exports.
 *
 * The domain layer contains:
 * - Entities: Core business objects with behavior and validation
 * - Types: Type definitions, enums, and utility types
 * - Errors: Domain-specific error classes
 * - Interfaces: Repository contracts and other interfaces
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 *
 * @example
 * ```typescript
 * // Import entities
 * import { Trip, Participant, Product, Consumption, Availability } from '@domain';
 *
 * // Import types
 * import { MealType, ProductCategory, IDateRange } from '@domain';
 *
 * // Import errors
 * import { ValidationError, NotFoundError, DuplicateError } from '@domain';
 *
 * // Import repository interfaces
 * import { ITripRepository, IParticipantRepository } from '@domain';
 * ```
 */

// ============================================================================
// Entities
// ============================================================================

export {
  // Trip
  Trip,
  type ITripCreateDTO,
  type ITripUpdateDTO,
  type ITripProps,
  createTrip,
  type CreateTripProps,
  // Participant
  Participant,
  type IParticipantCreateDTO,
  type IParticipantUpdateDTO,
  type IParticipantProps,
  createParticipant,
  type CreateParticipantProps,
  // Product
  Product,
  type IProductCreateDTO,
  type IProductUpdateDTO,
  type IProductProps,
  createProduct,
  type CreateProductProps,
  // Consumption
  Consumption,
  type IConsumptionCreateDTO,
  type IConsumptionUpdateDTO,
  type IConsumptionProps,
  createConsumption,
  type CreateConsumptionProps,
  // Availability
  Availability,
  type IAvailabilityCreateDTO,
  type IAvailabilityUpdateDTO,
  type IAvailabilityProps,
  createAvailability,
  type CreateAvailabilityProps,
} from './entities';

// ============================================================================
// Types
// ============================================================================

export {
  // Meal types
  type MealType,
  MEAL_TYPES,
  MEAL_TYPE_DISPLAY_NAMES,
  MEAL_TYPE_ORDER,
  isMealType,
  parseMealType,
  sortMealsByOrder,
  // Product types
  type ProductCategory,
  type ProductType,
  type ProductUnit,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_DISPLAY_NAMES,
  PRODUCT_TYPES,
  PRODUCT_TYPE_DISPLAY_NAMES,
  PRODUCT_TYPE_TO_CATEGORY,
  CATEGORY_TO_PRODUCT_TYPES,
  PRODUCT_UNITS,
  PRODUCT_UNIT_DISPLAY_NAMES,
  PRODUCT_UNIT_ABBREVIATIONS,
  UNIT_GROUPS,
  isProductCategory,
  isProductType,
  isProductUnit,
  parseProductCategory,
  parseProductType,
  parseProductUnit,
  getCategoryForType,
  getTypesForCategory,
  isTypeInCategory,
  // Common types
  type UUID,
  isUUID,
  type IDateRange,
  createDateRange,
  isDateInRange,
  getDaysInRange,
  getDatesInRange,
  type IPaginationParams,
  type IPaginatedResult,
  paginateItems,
  type SortDirection,
  type ISortParams,
  type ITimestamps,
  type IEntity,
  type DeepReadonly,
  type PartialBy,
  type RequiredBy,
  type Result,
  success,
  failure,
  isSuccess,
  isFailure,
  EMAIL_REGEX,
  isValidEmail,
  normalizeToStartOfDay,
  normalizeToEndOfDay,
  toISODateString,
  parseISODateString,
} from './types';

// ============================================================================
// Errors
// ============================================================================

export {
  DomainError,
  DomainErrorCode,
  type ISerializedDomainError,
  ValidationError,
  type IValidationFailure,
  NotFoundError,
  DuplicateError,
} from './errors';

// ============================================================================
// Repository Interfaces
// ============================================================================

export {
  // Base repository
  type IBaseRepository,
  type IPaginatedRepository,
  type IQueryOptions,
  // Trip repository
  type ITripRepository,
  type ITripQueryFilters,
  // Participant repository
  type IParticipantRepository,
  type IParticipantQueryFilters,
  // Product repository
  type IProductRepository,
  type IProductQueryFilters,
  // Consumption repository
  type IConsumptionRepository,
  type IConsumptionQueryFilters,
  type IConsumptionSummary,
  // Availability repository
  type IAvailabilityRepository,
  type IAvailabilityQueryFilters,
  type IAvailabilitySummary,
} from './interfaces/repositories';
