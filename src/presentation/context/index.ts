/**
 * Context - Barrel export file
 * Re-exports all context providers and hooks for easier imports
 */

// ServiceContext (existing)
export { ServiceProvider, useServices } from './ServiceContext';

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
