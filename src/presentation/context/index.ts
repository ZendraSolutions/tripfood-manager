/**
 * Context - Barrel export file
 * Re-exports all context providers and hooks for easier imports
 */

// ServiceContext
export {
  ServiceProvider,
  useServices,
  useTripService,
  useParticipantService,
  useProductService,
  useConsumptionService,
  useAvailabilityService,
  useShoppingService,
} from './ServiceContext';
export type { ServiceContainer } from './ServiceContext';

// AppContext
export { AppProvider, useApp } from './AppContext';
export type { AppState, AppContextValue, Notification } from './AppContext';

// TripContext
export { TripProvider, useTrip } from './TripContext';
export type {
  TripContextState,
  TripContextActions,
  TripContextValue,
  TripStats,
  AvailabilityEntry,
} from './TripContext';
