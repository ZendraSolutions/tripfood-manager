/**
 * @fileoverview Domain types barrel export file.
 * Provides a single point of import for all domain types, enums, and utility functions.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

// ============================================================================
// Meal Types
// ============================================================================

export {
  type MealType,
  MEAL_TYPES,
  MEAL_TYPE_DISPLAY_NAMES,
  MEAL_TYPE_ORDER,
  isMealType,
  parseMealType,
  sortMealsByOrder,
} from './meal';

// ============================================================================
// Product Types
// ============================================================================

export {
  // Types
  type ProductCategory,
  type ProductType,
  type ProductUnit,
  // Constants - Categories
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_DISPLAY_NAMES,
  // Constants - Types
  PRODUCT_TYPES,
  PRODUCT_TYPE_DISPLAY_NAMES,
  PRODUCT_TYPE_TO_CATEGORY,
  CATEGORY_TO_PRODUCT_TYPES,
  // Constants - Units
  PRODUCT_UNITS,
  PRODUCT_UNIT_DISPLAY_NAMES,
  PRODUCT_UNIT_ABBREVIATIONS,
  UNIT_GROUPS,
  // Type guards
  isProductCategory,
  isProductType,
  isProductUnit,
  // Parsers
  parseProductCategory,
  parseProductType,
  parseProductUnit,
  // Utility functions
  getCategoryForType,
  getTypesForCategory,
  isTypeInCategory,
} from './product';

// ============================================================================
// Common Types
// ============================================================================

export {
  // UUID
  type UUID,
  isUUID,
  // Date Range
  type IDateRange,
  createDateRange,
  isDateInRange,
  getDaysInRange,
  getDatesInRange,
  // Pagination
  type IPaginationParams,
  type IPaginatedResult,
  paginateItems,
  // Sorting
  type SortDirection,
  type ISortParams,
  // Entity base types
  type ITimestamps,
  type IEntity,
  // Utility types
  type DeepReadonly,
  type PartialBy,
  type RequiredBy,
  // Result type (functional error handling)
  type Result,
  success,
  failure,
  isSuccess,
  isFailure,
  // Validation utilities
  EMAIL_REGEX,
  isValidEmail,
  // Date utilities
  normalizeToStartOfDay,
  normalizeToEndOfDay,
  toISODateString,
  parseISODateString,
} from './common';
