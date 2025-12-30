/**
 * useConsumptions Hook - Manages consumption records for a trip
 * Provides a complete interface for consumption tracking with service integration
 *
 * @module presentation/hooks/useConsumptions
 */
import { useState, useCallback, useEffect } from 'react';
import { useServices } from '../context/ServiceContext';
import type { Consumption } from '@domain/entities/Consumption';
import type { MealType } from '@domain/types';
import type { CreateConsumptionDTO, UpdateConsumptionDTO } from '@application/services/ConsumptionService';

/**
 * Input type for creating a consumption (without tripId since it's provided to the hook)
 */
export interface CreateConsumptionInput {
  /** ID of the participant */
  participantId: string;
  /** ID of the product */
  productId: string;
  /** Date of consumption */
  date: Date;
  /** Meal type */
  meal: MealType;
  /** Quantity consumed */
  quantity: number;
}

/**
 * State interface for the useConsumptions hook
 */
export interface UseConsumptionsState {
  /** List of all consumptions for the trip */
  consumptions: Consumption[];
  /** Loading state indicator */
  isLoading: boolean;
  /** Error object if an operation failed */
  error: Error | null;
}

/**
 * Actions interface for the useConsumptions hook
 */
export interface UseConsumptionsActions {
  /** Fetches all consumptions for the trip */
  fetchConsumptions: () => Promise<void>;
  /** Gets consumptions for a specific date */
  getConsumptionsByDate: (date: Date) => Promise<Consumption[]>;
  /** Gets consumptions for a specific participant */
  getConsumptionsByParticipant: (participantId: string) => Promise<Consumption[]>;
  /** Gets consumptions for a specific product */
  getConsumptionsByProduct: (productId: string) => Promise<Consumption[]>;
  /** Creates a new consumption record */
  createConsumption: (input: CreateConsumptionInput) => Promise<Consumption>;
  /** Updates an existing consumption */
  updateConsumption: (id: string, dto: UpdateConsumptionDTO) => Promise<Consumption>;
  /** Deletes a consumption by ID */
  deleteConsumption: (id: string) => Promise<void>;
  /** Gets a single consumption by ID */
  getConsumptionById: (id: string) => Promise<Consumption>;
  /** Clears the current error */
  clearError: () => void;
  /** Refetches consumptions (alias for fetchConsumptions) */
  refetch: () => Promise<void>;
}

/**
 * Combined return type for the useConsumptions hook
 */
export type UseConsumptionsReturn = UseConsumptionsState & UseConsumptionsActions;

/**
 * Hook for managing consumption records within a specific trip
 *
 * @description
 * This hook provides a complete interface for tracking consumption records
 * during a trip. It handles loading states, error management, and
 * automatic data fetching.
 * Uses the ConsumptionService from the ServiceContext for all operations.
 *
 * @param tripId - The ID of the trip to manage consumptions for
 * @returns {UseConsumptionsReturn} State and actions for consumption management
 *
 * @example
 * ```tsx
 * function ConsumptionsPage({ tripId }: { tripId: string }) {
 *   const {
 *     consumptions,
 *     isLoading,
 *     error,
 *     createConsumption,
 *     deleteConsumption,
 *   } = useConsumptions(tripId);
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error message={error.message} />;
 *
 *   const handleAddConsumption = async () => {
 *     await createConsumption({
 *       participantId: 'participant-123',
 *       productId: 'product-456',
 *       date: new Date(),
 *       meal: 'lunch',
 *       quantity: 1,
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleAddConsumption}>Add Consumption</button>
 *       {consumptions.map(c => (
 *         <ConsumptionCard
 *           key={c.id}
 *           consumption={c}
 *           onDelete={() => deleteConsumption(c.id)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useConsumptions(tripId: string): UseConsumptionsReturn {
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const { consumptionService } = useServices();

  /**
   * Clears the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Fetches all consumptions for the trip
   */
  const fetchConsumptions = useCallback(async (): Promise<void> => {
    if (!tripId) {
      setConsumptions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await consumptionService.getConsumptionsByTripId(tripId);
      setConsumptions(data);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al cargar los consumos');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [tripId, consumptionService]);

  /**
   * Gets consumptions for a specific date
   */
  const getConsumptionsByDate = useCallback(async (date: Date): Promise<Consumption[]> => {
    try {
      setError(null);
      return await consumptionService.getConsumptionsByTripIdAndDate(tripId, date);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al obtener consumos por fecha');
      setError(errorObj);
      throw errorObj;
    }
  }, [tripId, consumptionService]);

  /**
   * Gets consumptions for a specific participant
   */
  const getConsumptionsByParticipant = useCallback(async (participantId: string): Promise<Consumption[]> => {
    try {
      setError(null);
      return await consumptionService.getConsumptionsByParticipantId(participantId);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al obtener consumos por participante');
      setError(errorObj);
      throw errorObj;
    }
  }, [consumptionService]);

  /**
   * Gets consumptions for a specific product
   */
  const getConsumptionsByProduct = useCallback(async (productId: string): Promise<Consumption[]> => {
    try {
      setError(null);
      return await consumptionService.getConsumptionsByProductId(productId);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al obtener consumos por producto');
      setError(errorObj);
      throw errorObj;
    }
  }, [consumptionService]);

  /**
   * Creates a new consumption record
   */
  const createConsumption = useCallback(async (
    input: CreateConsumptionInput
  ): Promise<Consumption> => {
    try {
      setIsLoading(true);
      setError(null);
      const dto: CreateConsumptionDTO = {
        tripId,
        ...input,
      };
      const newConsumption = await consumptionService.createConsumption(dto);
      setConsumptions((prev) => [...prev, newConsumption]);
      return newConsumption;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al crear el consumo');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [tripId, consumptionService]);

  /**
   * Updates an existing consumption
   */
  const updateConsumption = useCallback(async (
    id: string,
    dto: UpdateConsumptionDTO
  ): Promise<Consumption> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedConsumption = await consumptionService.updateConsumption(id, dto);
      setConsumptions((prev) =>
        prev.map((c) => (c.id === id ? updatedConsumption : c))
      );
      return updatedConsumption;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al actualizar el consumo');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [consumptionService]);

  /**
   * Deletes a consumption by ID
   */
  const deleteConsumption = useCallback(async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await consumptionService.deleteConsumption(id);
      setConsumptions((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al eliminar el consumo');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [consumptionService]);

  /**
   * Gets a single consumption by ID
   */
  const getConsumptionById = useCallback(async (id: string): Promise<Consumption> => {
    try {
      setError(null);
      return await consumptionService.getConsumptionById(id);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al obtener el consumo');
      setError(errorObj);
      throw errorObj;
    }
  }, [consumptionService]);

  // Fetch consumptions on mount and when tripId changes
  useEffect(() => {
    fetchConsumptions();
  }, [fetchConsumptions]);

  return {
    // State
    consumptions,
    isLoading,
    error,
    // Actions
    fetchConsumptions,
    getConsumptionsByDate,
    getConsumptionsByParticipant,
    getConsumptionsByProduct,
    createConsumption,
    updateConsumption,
    deleteConsumption,
    getConsumptionById,
    clearError,
    refetch: fetchConsumptions,
  };
}

// Re-export types for convenience
export type { Consumption } from '@domain/entities/Consumption';
export type { MealType } from '@domain/types';
export type { CreateConsumptionDTO, UpdateConsumptionDTO } from '@application/services/ConsumptionService';
