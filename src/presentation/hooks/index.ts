/**
 * Hooks - Barrel export file
 * Re-exports all custom hooks for easier imports
 */

// useModal
export { useModal } from './useModal';
export type { UseModalReturn } from './useModal';

// useTrips
export { useTrips } from './useTrips';
export type {
  Trip,
  CreateTripInput,
  UpdateTripInput,
  UseTripsState,
  UseTripsActions,
  UseTripsReturn,
} from './useTrips';

// useParticipants
export { useParticipants } from './useParticipants';
export type {
  Participant,
  CreateParticipantInput,
  UpdateParticipantInput,
  UseParticipantsState,
  UseParticipantsActions,
  UseParticipantsReturn,
} from './useParticipants';

// useProducts
export { useProducts } from './useProducts';
export type {
  Product,
  ProductCategory,
  CreateProductInput,
  UpdateProductInput,
  UseProductsState,
  UseProductsActions,
  UseProductsReturn,
} from './useProducts';
