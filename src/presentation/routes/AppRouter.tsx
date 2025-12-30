/**
 * Application Router - Defines all routes for the application
 */
import type { FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  HomePage,
  TripsPage,
  TripDetailPage,
  ParticipantsPage,
  ProductsPage,
  AvailabilityPage,
  ShoppingListPage,
} from '../pages';
import { TripProvider } from '../context/TripContext';

/**
 * Route path constants
 */
export const ROUTES = {
  HOME: '/',
  TRIPS: '/trips',
  TRIP_NEW: '/trips/new',
  TRIP_DETAIL: '/trips/:tripId',
  TRIP_EDIT: '/trips/:tripId/edit',
  PARTICIPANTS: '/trips/:tripId/participants',
  PRODUCTS: '/trips/:tripId/products',
  AVAILABILITY: '/trips/:tripId/availability',
  CONSUMPTIONS: '/trips/:tripId/consumptions',
  SHOPPING: '/trips/:tripId/shopping',
} as const;

/**
 * Helper function to generate trip-specific routes
 */
export const getTripRoute = (tripId: string, route: string): string => {
  return route.replace(':tripId', tripId);
};

/**
 * Trip routes wrapper - provides TripProvider context
 */
const TripRoutes: FC = () => {
  return (
    <Routes>
      <Route index element={<TripDetailPage />} />
      <Route path="participants" element={<ParticipantsPage />} />
      <Route path="products" element={<ProductsPage />} />
      <Route path="availability" element={<AvailabilityPage />} />
      <Route path="shopping" element={<ShoppingListPage />} />
      {/* Redirect unknown trip subroutes to trip detail */}
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

/**
 * Main application router component
 */
export const AppRouter: FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.TRIPS} element={<TripsPage />} />

      {/* Trip-specific routes with TripProvider */}
      <Route
        path="/trips/:tripId/*"
        element={
          <TripProvider>
            <TripRoutes />
          </TripProvider>
        }
      />

      {/* Fallback - redirect to home */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};
