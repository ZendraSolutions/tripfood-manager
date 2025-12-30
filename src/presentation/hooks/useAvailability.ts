/**
 * useAvailability Hook - Manages participant availability matrix for a trip
 * Provides a complete interface for availability tracking with meal toggles
 *
 * @module presentation/hooks/useAvailability
 */
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useServices } from '../context/ServiceContext';
import type { Availability } from '@domain/entities/Availability';
import type { MealType } from '@domain/types';
import type { SetAvailabilityDTO } from '@application/services/AvailabilityService';

/**
 * Availability matrix entry representing a participant's availability for a date
 */
export interface AvailabilityMatrixEntry {
  /** The availability record (null if no record exists) */
  availability: Availability | null;
  /** Participant ID */
  participantId: string;
  /** Date */
  date: Date;
  /** Whether the participant is available for breakfast */
  breakfast: boolean;
  /** Whether the participant is available for lunch */
  lunch: boolean;
  /** Whether the participant is available for dinner */
  dinner: boolean;
  /** Whether the participant is available for snacks */
  snack: boolean;
}

/**
 * State interface for the useAvailability hook
 */
export interface UseAvailabilityState {
  /** List of all availability records for the trip */
  availabilities: Availability[];
  /** Loading state indicator */
  isLoading: boolean;
  /** Error object if an operation failed */
  error: Error | null;
}

/**
 * Actions interface for the useAvailability hook
 */
export interface UseAvailabilityActions {
  /** Fetches all availability records for the trip */
  fetchAvailabilities: () => Promise<void>;
  /** Gets availability records for a specific date */
  getAvailabilitiesByDate: (date: Date) => Promise<Availability[]>;
  /** Gets availability records for a specific participant */
  getAvailabilitiesByParticipant: (participantId: string) => Promise<Availability[]>;
  /** Gets a participant's availability for a specific date */
  getParticipantAvailability: (participantId: string, date: Date) => Promise<Availability | null>;
  /** Sets availability for a participant on a date */
  setAvailability: (dto: Omit<SetAvailabilityDTO, 'tripId'>) => Promise<Availability>;
  /** Toggles a meal for a participant on a date */
  toggleMeal: (participantId: string, date: Date, meal: MealType) => Promise<Availability>;
  /** Sets all meals as available for a participant on a date */
  setAllMealsAvailable: (participantId: string, date: Date) => Promise<Availability>;
  /** Clears all meals for a participant on a date */
  clearAllMeals: (participantId: string, date: Date) => Promise<void>;
  /** Deletes an availability record */
  deleteAvailability: (id: string) => Promise<void>;
  /** Gets participants available for a specific meal on a date */
  getAvailableParticipantsForMeal: (date: Date, meal: MealType) => Promise<string[]>;
  /** Builds a matrix entry for a participant and date */
  getMatrixEntry: (participantId: string, date: Date) => AvailabilityMatrixEntry;
  /** Clears the current error */
  clearError: () => void;
  /** Refetches availabilities (alias for fetchAvailabilities) */
  refetch: () => Promise<void>;
}

/**
 * Combined return type for the useAvailability hook
 */
export type UseAvailabilityReturn = UseAvailabilityState & UseAvailabilityActions;

/**
 * All meal types in order
 */
const ALL_MEALS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

/**
 * Hook for managing participant availability matrix within a trip
 *
 * @description
 * This hook provides a complete interface for managing availability records
 * for participants during a trip. It supports toggling individual meals
 * and building availability matrices.
 * Uses the AvailabilityService from the ServiceContext for all operations.
 *
 * @param tripId - The ID of the trip to manage availability for
 * @returns {UseAvailabilityReturn} State and actions for availability management
 *
 * @example
 * ```tsx
 * function AvailabilityMatrix({ tripId, participants, dates }: Props) {
 *   const {
 *     isLoading,
 *     error,
 *     toggleMeal,
 *     getMatrixEntry,
 *   } = useAvailability(tripId);
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return (
 *     <table>
 *       <thead>
 *         <tr>
 *           <th>Participante</th>
 *           {dates.map(date => <th key={date.toISOString()}>{date.toLocaleDateString()}</th>)}
 *         </tr>
 *       </thead>
 *       <tbody>
 *         {participants.map(p => (
 *           <tr key={p.id}>
 *             <td>{p.name}</td>
 *             {dates.map(date => {
 *               const entry = getMatrixEntry(p.id, date);
 *               return (
 *                 <td key={date.toISOString()}>
 *                   <MealCheckboxes
 *                     entry={entry}
 *                     onToggle={(meal) => toggleMeal(p.id, date, meal)}
 *                   />
 *                 </td>
 *               );
 *             })}
 *           </tr>
 *         ))}
 *       </tbody>
 *     </table>
 *   );
 * }
 * ```
 */
export function useAvailability(tripId: string): UseAvailabilityReturn {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const { availabilityService } = useServices();

  /**
   * Clears the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Fetches all availability records for the trip
   */
  const fetchAvailabilities = useCallback(async (): Promise<void> => {
    if (!tripId) {
      setAvailabilities([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await availabilityService.getAvailabilitiesByTripId(tripId);
      setAvailabilities(data);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al cargar la disponibilidad');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [tripId, availabilityService]);

  /**
   * Gets availability records for a specific date
   */
  const getAvailabilitiesByDate = useCallback(async (date: Date): Promise<Availability[]> => {
    try {
      setError(null);
      return await availabilityService.getAvailabilitiesByTripIdAndDate(tripId, date);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al obtener disponibilidad por fecha');
      setError(errorObj);
      throw errorObj;
    }
  }, [tripId, availabilityService]);

  /**
   * Gets availability records for a specific participant
   */
  const getAvailabilitiesByParticipant = useCallback(async (participantId: string): Promise<Availability[]> => {
    try {
      setError(null);
      return await availabilityService.getAvailabilitiesByParticipantId(participantId);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al obtener disponibilidad por participante');
      setError(errorObj);
      throw errorObj;
    }
  }, [availabilityService]);

  /**
   * Gets a participant's availability for a specific date
   */
  const getParticipantAvailability = useCallback(async (
    participantId: string,
    date: Date
  ): Promise<Availability | null> => {
    try {
      setError(null);
      return await availabilityService.getAvailabilityByParticipantIdAndDate(participantId, date);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al obtener disponibilidad');
      setError(errorObj);
      throw errorObj;
    }
  }, [availabilityService]);

  /**
   * Sets availability for a participant on a date
   */
  const setAvailability = useCallback(async (
    dto: Omit<SetAvailabilityDTO, 'tripId'>
  ): Promise<Availability> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await availabilityService.setAvailability({
        ...dto,
        tripId,
      });

      // Update local state
      setAvailabilities((prev) => {
        const existingIndex = prev.findIndex(
          (a) => a.participantId === dto.participantId && a.isOnDate(dto.date)
        );
        if (existingIndex >= 0) {
          // Update existing
          const newArr = [...prev];
          newArr[existingIndex] = result;
          return newArr;
        } else {
          // Add new
          return [...prev, result];
        }
      });

      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al establecer disponibilidad');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [tripId, availabilityService]);

  /**
   * Toggles a meal for a participant on a date
   */
  const toggleMeal = useCallback(async (
    participantId: string,
    date: Date,
    meal: MealType
  ): Promise<Availability> => {
    try {
      setError(null);

      // Find existing availability
      const existing = availabilities.find(
        (a) => a.participantId === participantId && a.isOnDate(date)
      );

      let newMeals: MealType[];
      if (existing) {
        // Toggle the meal
        if (existing.meals.includes(meal)) {
          newMeals = existing.meals.filter((m) => m !== meal);
        } else {
          newMeals = [...existing.meals, meal];
        }
      } else {
        // Create with just this meal
        newMeals = [meal];
      }

      return await setAvailability({
        participantId,
        date,
        meals: newMeals,
      });
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al alternar comida');
      setError(errorObj);
      throw errorObj;
    }
  }, [availabilities, setAvailability]);

  /**
   * Sets all meals as available for a participant on a date
   */
  const setAllMealsAvailable = useCallback(async (
    participantId: string,
    date: Date
  ): Promise<Availability> => {
    return await setAvailability({
      participantId,
      date,
      meals: ALL_MEALS,
    });
  }, [setAvailability]);

  /**
   * Clears all meals for a participant on a date
   */
  const clearAllMeals = useCallback(async (
    participantId: string,
    date: Date
  ): Promise<void> => {
    // Find existing availability
    const existing = availabilities.find(
      (a) => a.participantId === participantId && a.isOnDate(date)
    );

    if (existing) {
      await deleteAvailability(existing.id);
    }
  }, [availabilities]);

  /**
   * Deletes an availability record
   */
  const deleteAvailability = useCallback(async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await availabilityService.deleteAvailability(id);
      setAvailabilities((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al eliminar disponibilidad');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [availabilityService]);

  /**
   * Gets participants available for a specific meal on a date
   */
  const getAvailableParticipantsForMeal = useCallback(async (
    date: Date,
    meal: MealType
  ): Promise<string[]> => {
    try {
      setError(null);
      return await availabilityService.getParticipantsAvailableForMeal(tripId, date, meal);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al obtener participantes disponibles');
      setError(errorObj);
      throw errorObj;
    }
  }, [tripId, availabilityService]);

  /**
   * Builds a matrix entry for a participant and date
   * This is a synchronous helper that uses cached data
   */
  const getMatrixEntry = useCallback((
    participantId: string,
    date: Date
  ): AvailabilityMatrixEntry => {
    const availability = availabilities.find(
      (a) => a.participantId === participantId && a.isOnDate(date)
    ) || null;

    const meals = availability?.meals || [];

    return {
      availability,
      participantId,
      date,
      breakfast: meals.includes('breakfast'),
      lunch: meals.includes('lunch'),
      dinner: meals.includes('dinner'),
      snack: meals.includes('snack'),
    };
  }, [availabilities]);

  // Fetch availabilities on mount and when tripId changes
  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  return {
    // State
    availabilities,
    isLoading,
    error,
    // Actions
    fetchAvailabilities,
    getAvailabilitiesByDate,
    getAvailabilitiesByParticipant,
    getParticipantAvailability,
    setAvailability,
    toggleMeal,
    setAllMealsAvailable,
    clearAllMeals,
    deleteAvailability,
    getAvailableParticipantsForMeal,
    getMatrixEntry,
    clearError,
    refetch: fetchAvailabilities,
  };
}

// Re-export types for convenience
export type { Availability } from '@domain/entities/Availability';
export type { MealType } from '@domain/types';
export type { SetAvailabilityDTO } from '@application/services/AvailabilityService';
