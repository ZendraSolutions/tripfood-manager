/**
 * useTrips Hook - Manages trips data and CRUD operations
 * Provides a complete interface for trip management with service integration
 *
 * @module presentation/hooks/useTrips
 */
import { useState, useCallback, useEffect } from 'react';
import { useServices } from '../context/ServiceContext';
import type { Trip, ITripCreateDTO, ITripUpdateDTO } from '@domain/entities/Trip';

/**
 * State interface for the useTrips hook
 */
export interface UseTripsState {
  /** List of all trips */
  trips: Trip[];
  /** Loading state indicator */
  isLoading: boolean;
  /** Error object if an operation failed */
  error: Error | null;
}

/**
 * Actions interface for the useTrips hook
 */
export interface UseTripsActions {
  /** Fetches all trips from the service */
  fetchTrips: () => Promise<void>;
  /** Creates a new trip */
  createTrip: (dto: ITripCreateDTO) => Promise<Trip>;
  /** Updates an existing trip */
  updateTrip: (id: string, dto: ITripUpdateDTO) => Promise<Trip>;
  /** Deletes a trip by ID */
  deleteTrip: (id: string) => Promise<void>;
  /** Gets a single trip by ID */
  getTripById: (id: string) => Promise<Trip>;
  /** Clears the current error */
  clearError: () => void;
  /** Refetches trips (alias for fetchTrips) */
  refetch: () => Promise<void>;
}

/**
 * Combined return type for the useTrips hook
 */
export type UseTripsReturn = UseTripsState & UseTripsActions;

/**
 * Hook for managing trips with full CRUD operations
 *
 * @description
 * This hook provides a complete interface for managing trips in the application.
 * It handles loading states, error management, and automatic data fetching.
 * Uses the TripService from the ServiceContext for all operations.
 *
 * @returns {UseTripsReturn} State and actions for trip management
 *
 * @example
 * ```tsx
 * function TripsPage() {
 *   const { trips, isLoading, error, createTrip, deleteTrip } = useTrips();
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return (
 *     <div>
 *       {trips.map(trip => (
 *         <TripCard key={trip.id} trip={trip} onDelete={deleteTrip} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTrips(): UseTripsReturn {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const { tripService } = useServices();

  /**
   * Clears the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Fetches all trips from the service
   */
  const fetchTrips = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await tripService.getAllTripsOrderedByStartDate();
      setTrips(data);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al cargar los viajes');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [tripService]);

  /**
   * Creates a new trip
   */
  const createTrip = useCallback(async (dto: ITripCreateDTO): Promise<Trip> => {
    try {
      setIsLoading(true);
      setError(null);
      const newTrip = await tripService.createTrip(dto);
      setTrips((prev) => [...prev, newTrip]);
      return newTrip;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al crear el viaje');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [tripService]);

  /**
   * Updates an existing trip
   */
  const updateTrip = useCallback(async (id: string, dto: ITripUpdateDTO): Promise<Trip> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedTrip = await tripService.updateTrip(id, dto);
      setTrips((prev) =>
        prev.map((trip) => (trip.id === id ? updatedTrip : trip))
      );
      return updatedTrip;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al actualizar el viaje');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [tripService]);

  /**
   * Deletes a trip by ID
   */
  const deleteTrip = useCallback(async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await tripService.deleteTrip(id);
      setTrips((prev) => prev.filter((trip) => trip.id !== id));
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al eliminar el viaje');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [tripService]);

  /**
   * Gets a single trip by ID
   */
  const getTripById = useCallback(async (id: string): Promise<Trip> => {
    try {
      setError(null);
      return await tripService.getTripById(id);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al obtener el viaje');
      setError(errorObj);
      throw errorObj;
    }
  }, [tripService]);

  // Fetch trips on mount
  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return {
    // State
    trips,
    isLoading,
    error,
    // Actions
    fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    getTripById,
    clearError,
    refetch: fetchTrips,
  };
}

// Re-export types for convenience
export type { Trip, ITripCreateDTO, ITripUpdateDTO } from '@domain/entities/Trip';
