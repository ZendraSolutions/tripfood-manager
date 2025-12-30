/**
 * useParticipants Hook - Manages participants data and CRUD operations for a trip
 * Provides a complete interface for participant management with service integration
 *
 * @module presentation/hooks/useParticipants
 */
import { useState, useCallback, useEffect } from 'react';
import { useServices } from '../context/ServiceContext';
import type { Participant, IParticipantCreateDTO, IParticipantUpdateDTO } from '@domain/entities/Participant';

/**
 * State interface for the useParticipants hook
 */
export interface UseParticipantsState {
  /** List of participants for the current trip */
  participants: Participant[];
  /** Loading state indicator */
  isLoading: boolean;
  /** Error object if an operation failed */
  error: Error | null;
}

/**
 * Actions interface for the useParticipants hook
 */
export interface UseParticipantsActions {
  /** Fetches all participants for the trip */
  fetchParticipants: () => Promise<void>;
  /** Creates a new participant */
  createParticipant: (dto: Omit<IParticipantCreateDTO, 'tripId'>) => Promise<Participant>;
  /** Updates an existing participant */
  updateParticipant: (id: string, dto: IParticipantUpdateDTO) => Promise<Participant>;
  /** Deletes a participant by ID */
  deleteParticipant: (id: string) => Promise<void>;
  /** Gets a single participant by ID */
  getParticipantById: (id: string) => Promise<Participant>;
  /** Gets the count of participants */
  getParticipantCount: () => Promise<number>;
  /** Clears the current error */
  clearError: () => void;
  /** Refetches participants (alias for fetchParticipants) */
  refetch: () => Promise<void>;
}

/**
 * Combined return type for the useParticipants hook
 */
export type UseParticipantsReturn = UseParticipantsState & UseParticipantsActions;

/**
 * Hook for managing participants within a specific trip
 *
 * @description
 * This hook provides a complete interface for managing participants in a trip.
 * It handles loading states, error management, and automatic data fetching.
 * Uses the ParticipantService from the ServiceContext for all operations.
 *
 * @param tripId - The ID of the trip to manage participants for
 * @returns {UseParticipantsReturn} State and actions for participant management
 *
 * @example
 * ```tsx
 * function ParticipantsPage({ tripId }: { tripId: string }) {
 *   const {
 *     participants,
 *     isLoading,
 *     error,
 *     createParticipant,
 *     deleteParticipant
 *   } = useParticipants(tripId);
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error message={error.message} />;
 *
 *   const handleAdd = async (name: string) => {
 *     await createParticipant({ name });
 *   };
 *
 *   return (
 *     <div>
 *       {participants.map(p => (
 *         <ParticipantCard
 *           key={p.id}
 *           participant={p}
 *           onDelete={() => deleteParticipant(p.id)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useParticipants(tripId: string): UseParticipantsReturn {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const { participantService } = useServices();

  /**
   * Clears the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Fetches all participants for the trip
   */
  const fetchParticipants = useCallback(async (): Promise<void> => {
    if (!tripId) {
      setParticipants([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await participantService.getParticipantsByTripId(tripId);
      setParticipants(data);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al cargar los participantes');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [tripId, participantService]);

  /**
   * Creates a new participant in the trip
   */
  const createParticipant = useCallback(async (
    dto: Omit<IParticipantCreateDTO, 'tripId'>
  ): Promise<Participant> => {
    try {
      setIsLoading(true);
      setError(null);
      const newParticipant = await participantService.createParticipant({
        ...dto,
        tripId,
      });
      setParticipants((prev) => [...prev, newParticipant]);
      return newParticipant;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al crear el participante');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [tripId, participantService]);

  /**
   * Updates an existing participant
   */
  const updateParticipant = useCallback(async (
    id: string,
    dto: IParticipantUpdateDTO
  ): Promise<Participant> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedParticipant = await participantService.updateParticipant(id, dto);
      setParticipants((prev) =>
        prev.map((p) => (p.id === id ? updatedParticipant : p))
      );
      return updatedParticipant;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al actualizar el participante');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [participantService]);

  /**
   * Deletes a participant by ID
   */
  const deleteParticipant = useCallback(async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await participantService.deleteParticipant(id);
      setParticipants((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al eliminar el participante');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [participantService]);

  /**
   * Gets a single participant by ID
   */
  const getParticipantById = useCallback(async (id: string): Promise<Participant> => {
    try {
      setError(null);
      return await participantService.getParticipantById(id);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al obtener el participante');
      setError(errorObj);
      throw errorObj;
    }
  }, [participantService]);

  /**
   * Gets the count of participants in the trip
   */
  const getParticipantCount = useCallback(async (): Promise<number> => {
    try {
      return await participantService.getParticipantCountByTripId(tripId);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error al obtener el conteo de participantes');
      setError(errorObj);
      throw errorObj;
    }
  }, [tripId, participantService]);

  // Fetch participants on mount and when tripId changes
  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  return {
    // State
    participants,
    isLoading,
    error,
    // Actions
    fetchParticipants,
    createParticipant,
    updateParticipant,
    deleteParticipant,
    getParticipantById,
    getParticipantCount,
    clearError,
    refetch: fetchParticipants,
  };
}

// Re-export types for convenience
export type { Participant, IParticipantCreateDTO, IParticipantUpdateDTO } from '@domain/entities/Participant';
