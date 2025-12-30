/**
 * Hooks - Barrel export file
 * Re-exports all custom hooks for easier imports
 *
 * @module presentation/hooks
 */

// ============================================================================
// Modal Hooks
// ============================================================================

export { useModal, useModals, useConfirmModal } from './useModal';
export type { UseModalOptions, UseModalReturn } from './useModal';

// ============================================================================
// Form Hook
// ============================================================================

export {
  useForm,
  // Validation rules
  required,
  minLength,
  maxLength,
  email,
  pattern,
  min,
  max,
  custom,
} from './useForm';
export type {
  ValidationRule,
  ValidationSchema,
  FormErrors,
  TouchedFields,
  UseFormOptions,
  UseFormState,
  UseFormActions,
  UseFormReturn,
} from './useForm';

// ============================================================================
// Data Hooks - Trips
// ============================================================================

export { useTrips } from './useTrips';
export type {
  UseTripsState,
  UseTripsActions,
  UseTripsReturn,
  Trip,
  ITripCreateDTO,
  ITripUpdateDTO,
} from './useTrips';

// ============================================================================
// Data Hooks - Participants
// ============================================================================

export { useParticipants } from './useParticipants';
export type {
  UseParticipantsState,
  UseParticipantsActions,
  UseParticipantsReturn,
  Participant,
  IParticipantCreateDTO,
  IParticipantUpdateDTO,
} from './useParticipants';

// ============================================================================
// Data Hooks - Products
// ============================================================================

export { useProducts } from './useProducts';
export type {
  ProductFilters,
  UseProductsState,
  UseProductsActions,
  UseProductsReturn,
  Product,
  IProductCreateDTO,
  IProductUpdateDTO,
  ProductCategory,
  ProductType,
} from './useProducts';

// ============================================================================
// Data Hooks - Consumptions
// ============================================================================

export { useConsumptions } from './useConsumptions';
export type {
  CreateConsumptionInput,
  UseConsumptionsState,
  UseConsumptionsActions,
  UseConsumptionsReturn,
  Consumption,
  MealType,
  CreateConsumptionDTO,
  UpdateConsumptionDTO,
} from './useConsumptions';

// ============================================================================
// Data Hooks - Availability
// ============================================================================

export { useAvailability } from './useAvailability';
export type {
  AvailabilityMatrixEntry,
  UseAvailabilityState,
  UseAvailabilityActions,
  UseAvailabilityReturn,
  Availability,
  SetAvailabilityDTO,
} from './useAvailability';

// ============================================================================
// Data Hooks - Shopping List
// ============================================================================

export { useShoppingList } from './useShoppingList';
export type {
  ExportFormat,
  UseShoppingListState,
  UseShoppingListActions,
  UseShoppingListReturn,
  ShoppingList,
  ShoppingListItem,
  ProductConsumptionSummary,
  CSVExportResult,
} from './useShoppingList';
