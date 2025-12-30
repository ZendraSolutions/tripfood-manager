/**
 * @fileoverview Availability Application Service.
 * Handles business logic and orchestration for Availability operations.
 * Follows SOLID principles with single responsibility and dependency injection.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 * @module application/services/AvailabilityService
 */

import type { Availability } from '@domain/entities/Availability';
import type { IAvailabilityRepository } from '@domain/interfaces/repositories/IAvailabilityRepository';
import type { IParticipantRepository } from '@domain/interfaces/repositories/IParticipantRepository';
import type { ITripRepository } from '@domain/interfaces/repositories/ITripRepository';
import { NotFoundError, ValidationError } from '@domain/errors';
import type { MealType } from '@domain/types';
import type {
  AvailabilityResponseDTO,
  AvailabilityByDateDTO,
  AvailabilityByParticipantDTO,
  AvailabilityMatrixDTO,
  MealAvailabilityDTO,
} from '../dtos/availability';

/**
 * DTO for creating/updating availability (legacy compatibility).
 */
export interface SetAvailabilityDTO {
  /** Participant ID */
  readonly participantId: string;
  /** Trip ID */
  readonly tripId: string;
  /** Date of availability */
  readonly date: Date;
  /** Meals available for */
  readonly meals: MealType[];
}

/**
 * Application service for Availability operations.
 *
 * @description
 * This service provides the application layer interface for Availability operations.
 * It handles:
 * - CRUD operations for availability records
 * - Setting availability for participants on specific dates
 * - Generating availability matrices and summaries
 * - Business rule validation
 *
 * @example
 * ```typescript
 * const availabilityService = new AvailabilityService(
 *   availabilityRepository,
 *   participantRepository,
 *   tripRepository
 * );
 *
 * const availability = await availabilityService.setAvailability({
 *   tripId: 'trip-123',
 *   participantId: 'participant-456',
 *   date: new Date('2024-07-15'),
 *   meals: ['breakfast', 'lunch', 'dinner'],
 * });
 * ```
 */
export class AvailabilityService {
  /**
   * Creates a new AvailabilityService instance.
   *
   * @param availabilityRepository - Repository for Availability persistence operations
   * @param participantRepository - Repository for Participant operations (for existence validation)
   * @param tripRepository - Repository for Trip operations (optional, for date validation)
   */
  constructor(
    private readonly availabilityRepository: IAvailabilityRepository,
    private readonly participantRepository: IParticipantRepository,
    private readonly tripRepository?: ITripRepository
  ) {
    // Mark private methods as intentionally kept for future use
    void this._toResponseDTO;
  }

  /**
   * Sets availability for a participant on a specific date.
   * Creates new availability if not exists, updates if exists.
   *
   * @param dto - The availability data
   * @returns Promise resolving to the created/updated availability
   * @throws {NotFoundError} If participant is not found
   * @throws {ValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const availability = await availabilityService.setAvailability({
   *   tripId: 'trip-123',
   *   participantId: 'participant-456',
   *   date: new Date('2024-07-15'),
   *   meals: ['breakfast', 'lunch', 'dinner'],
   * });
   * ```
   */
  public async setAvailability(dto: SetAvailabilityDTO): Promise<Availability> {
    // Validate input
    this.validateSetAvailabilityDTO(dto);

    // Verify participant exists
    const participantExists = await this.participantRepository.exists(dto.participantId);
    if (!participantExists) {
      throw NotFoundError.withId('Participant', dto.participantId);
    }

    // Validate date is within trip range if we have trip repository
    if (this.tripRepository) {
      const trip = await this.tripRepository.findById(dto.tripId);
      if (trip) {
        const availabilityDate = new Date(dto.date);
        if (availabilityDate < trip.startDate || availabilityDate > trip.endDate) {
          throw ValidationError.invalidDateRange('date', 'trip dates');
        }
      }
    }

    // Check if availability already exists for this participant and date
    const existing = await this.availabilityRepository.findByParticipantIdAndDate(
      dto.participantId,
      dto.date
    );

    const { Availability } = await import('@domain/entities/Availability');

    if (existing) {
      // Update existing availability
      const updated = existing.update({ meals: dto.meals });
      return this.availabilityRepository.save(updated);
    } else {
      // Create new availability
      const availability = Availability.create({
        participantId: dto.participantId,
        tripId: dto.tripId,
        date: dto.date,
        meals: dto.meals,
      });
      return this.availabilityRepository.save(availability);
    }
  }

  /**
   * Sets availability for a participant for a date range.
   *
   * @param tripId - The trip ID
   * @param participantId - The participant ID
   * @param startDate - Start of the date range
   * @param endDate - End of the date range
   * @param meals - Meals available for
   * @returns Promise resolving to array of created availabilities
   */
  public async setAvailabilityRange(
    tripId: string,
    participantId: string,
    startDate: Date,
    endDate: Date,
    meals: MealType[]
  ): Promise<Availability[]> {
    const availabilities: Availability[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const availability = await this.setAvailability({
        tripId,
        participantId,
        date: new Date(currentDate),
        meals,
      });
      availabilities.push(availability);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availabilities;
  }

  /**
   * Sets availability for all participants in a trip for a specific date.
   *
   * @param tripId - The trip ID
   * @param date - The date
   * @param meals - Meals available for
   * @returns Promise resolving to array of created availabilities
   */
  public async setAvailabilityForAllParticipants(
    tripId: string,
    date: Date,
    meals: MealType[]
  ): Promise<Availability[]> {
    const participants = await this.participantRepository.findByTripId(tripId);
    const availabilities: Availability[] = [];

    for (const participant of participants) {
      const availability = await this.setAvailability({
        tripId,
        participantId: participant.id,
        date,
        meals,
      });
      availabilities.push(availability);
    }

    return availabilities;
  }

  /**
   * Retrieves an availability by its ID.
   *
   * @param id - The availability's unique identifier
   * @returns Promise resolving to the availability if found, null otherwise
   */
  public async getById(id: string): Promise<Availability | null> {
    return this.availabilityRepository.findById(id);
  }

  /**
   * Retrieves an availability by ID, throwing if not found.
   *
   * @param id - The availability's unique identifier
   * @returns Promise resolving to the availability
   * @throws {NotFoundError} If the availability is not found
   */
  public async getAvailabilityById(id: string): Promise<Availability> {
    const availability = await this.availabilityRepository.findById(id);
    if (!availability) {
      throw NotFoundError.withId('Availability', id);
    }
    return availability;
  }

  /**
   * Retrieves all availabilities for a trip.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to array of availabilities
   */
  public async getByTripId(tripId: string): Promise<Availability[]> {
    return this.availabilityRepository.findByTripId(tripId);
  }

  /**
   * Retrieves all availabilities for a trip (alias for getByTripId).
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to array of availabilities
   */
  public async getAvailabilitiesByTripId(tripId: string): Promise<Availability[]> {
    return this.availabilityRepository.findByTripId(tripId);
  }

  /**
   * Retrieves availabilities for a trip on a specific date.
   *
   * @param tripId - The trip's unique identifier
   * @param date - The date to filter by
   * @returns Promise resolving to array of availabilities
   */
  public async getByTripIdAndDate(tripId: string, date: Date): Promise<Availability[]> {
    return this.availabilityRepository.findByTripIdAndDate(tripId, date);
  }

  /**
   * Retrieves availabilities for a trip on a specific date (alias).
   *
   * @param tripId - The trip's unique identifier
   * @param date - The date to filter by
   * @returns Promise resolving to array of availabilities
   */
  public async getAvailabilitiesByTripIdAndDate(tripId: string, date: Date): Promise<Availability[]> {
    return this.availabilityRepository.findByTripIdAndDate(tripId, date);
  }

  /**
   * Retrieves availabilities for a participant.
   *
   * @param participantId - The participant's unique identifier
   * @returns Promise resolving to array of availabilities
   */
  public async getByParticipantId(participantId: string): Promise<Availability[]> {
    return this.availabilityRepository.findByParticipantId(participantId);
  }

  /**
   * Retrieves availabilities for a participant (alias).
   *
   * @param participantId - The participant's unique identifier
   * @returns Promise resolving to array of availabilities
   */
  public async getAvailabilitiesByParticipantId(participantId: string): Promise<Availability[]> {
    return this.availabilityRepository.findByParticipantId(participantId);
  }

  /**
   * Retrieves availability for a participant on a specific date.
   *
   * @param participantId - The participant's unique identifier
   * @param date - The date to filter by
   * @returns Promise resolving to the availability if found, null otherwise
   */
  public async getByParticipantIdAndDate(
    participantId: string,
    date: Date
  ): Promise<Availability | null> {
    return this.availabilityRepository.findByParticipantIdAndDate(participantId, date);
  }

  /**
   * Retrieves availability for a participant on a specific date (alias).
   *
   * @param participantId - The participant's unique identifier
   * @param date - The date to filter by
   * @returns Promise resolving to the availability if found, null otherwise
   */
  public async getAvailabilityByParticipantIdAndDate(
    participantId: string,
    date: Date
  ): Promise<Availability | null> {
    return this.availabilityRepository.findByParticipantIdAndDate(participantId, date);
  }

  /**
   * Gets availability summary grouped by date.
   *
   * @param tripId - The trip ID to get summary for
   * @returns Promise resolving to array of availability summaries by date
   */
  public async getSummaryByDate(tripId: string): Promise<AvailabilityByDateDTO[]> {
    const availabilities = await this.availabilityRepository.findByTripId(tripId);

    const byDate = new Map<string, {
      date: Date;
      participants: Array<{
        participantId: string;
        participantName: string;
        meals: MealAvailabilityDTO;
      }>;
    }>();

    for (const availability of availabilities) {
      const dateKey = availability.date.toISOString().split('T')[0] ?? '';

      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, {
          date: availability.date,
          participants: [],
        });
      }

      const participant = await this.participantRepository.findById(availability.participantId);
      const dateEntry = byDate.get(dateKey);
      if (dateEntry) {
        dateEntry.participants.push({
          participantId: availability.participantId,
          participantName: participant?.name ?? 'Unknown',
          meals: this.toMealAvailabilityDTO(availability.meals),
        });
      }
    }

    const summaries: AvailabilityByDateDTO[] = [];
    for (const [, data] of byDate) {
      const breakfastCount = data.participants.filter((p) => p.meals.breakfast).length;
      const lunchCount = data.participants.filter((p) => p.meals.lunch).length;
      const dinnerCount = data.participants.filter((p) => p.meals.dinner).length;

      summaries.push({
        date: data.date,
        totalAvailable: data.participants.length,
        breakfastCount,
        lunchCount,
        dinnerCount,
        participants: data.participants,
      });
    }

    return summaries.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Gets availability summary grouped by participant.
   *
   * @param tripId - The trip ID to get summary for
   * @returns Promise resolving to array of availability summaries by participant
   */
  public async getSummaryByParticipant(tripId: string): Promise<AvailabilityByParticipantDTO[]> {
    const availabilities = await this.availabilityRepository.findByTripId(tripId);
    const participants = await this.participantRepository.findByTripId(tripId);

    // Get trip duration for percentage calculation
    let tripDays = 1;
    if (this.tripRepository) {
      const trip = await this.tripRepository.findById(tripId);
      if (trip) {
        tripDays = trip.getDurationInDays();
      }
    }

    const byParticipant = new Map<string, {
      name: string;
      dates: Array<{ date: Date; meals: MealAvailabilityDTO }>;
    }>();

    // Initialize all participants
    for (const participant of participants) {
      byParticipant.set(participant.id, {
        name: participant.name,
        dates: [],
      });
    }

    // Add availability data
    for (const availability of availabilities) {
      const entry = byParticipant.get(availability.participantId);
      if (entry) {
        entry.dates.push({
          date: availability.date,
          meals: this.toMealAvailabilityDTO(availability.meals),
        });
      }
    }

    const summaries: AvailabilityByParticipantDTO[] = [];
    for (const [participantId, data] of byParticipant) {
      const percentage = (data.dates.length / tripDays) * 100;

      summaries.push({
        participantId,
        participantName: data.name,
        totalDaysAvailable: data.dates.length,
        availabilityPercentage: Math.round(percentage * 100) / 100,
        dates: data.dates,
      });
    }

    return summaries;
  }

  /**
   * Generates an availability matrix for a trip.
   *
   * @param tripId - The trip ID to generate matrix for
   * @returns Promise resolving to the availability matrix
   */
  public async getAvailabilityMatrix(tripId: string): Promise<AvailabilityMatrixDTO> {
    const availabilities = await this.availabilityRepository.findByTripId(tripId);
    const participants = await this.participantRepository.findByTripId(tripId);

    // Get all dates from trip
    let dates: Date[] = [];
    if (this.tripRepository) {
      const trip = await this.tripRepository.findById(tripId);
      if (trip) {
        const currentDate = new Date(trip.startDate);
        while (currentDate <= trip.endDate) {
          dates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }

    // Build matrix
    const matrix: Record<string, Record<string, MealAvailabilityDTO | null>> = {};

    for (const participant of participants) {
      matrix[participant.id] = {};
      const participantMatrix = matrix[participant.id];
      if (participantMatrix) {
        for (const date of dates) {
          const dateKey = date.toISOString().split('T')[0] ?? '';
          participantMatrix[dateKey] = null;
        }
      }
    }

    // Fill in availability data
    for (const availability of availabilities) {
      const dateKey = availability.date.toISOString().split('T')[0] ?? '';
      const participantMatrix = matrix[availability.participantId];
      if (participantMatrix) {
        participantMatrix[dateKey] = this.toMealAvailabilityDTO(availability.meals);
      }
    }

    // Calculate summary
    let totalAvailable = 0;
    for (const availability of availabilities) {
      if (availability.meals.length > 0) {
        totalAvailable++;
      }
    }

    const totalPossible = participants.length * dates.length;
    const averageAvailability = totalPossible > 0
      ? Math.round((totalAvailable / totalPossible) * 100 * 100) / 100
      : 0;

    return {
      tripId,
      dates,
      participants: participants.map((p) => ({ id: p.id, name: p.name })),
      matrix,
      summary: {
        totalParticipants: participants.length,
        totalDays: dates.length,
        averageAvailability,
      },
    };
  }

  /**
   * Gets participants available for a specific meal on a date.
   *
   * @param tripId - The trip ID
   * @param date - The date
   * @param meal - The meal type
   * @returns Promise resolving to array of participant IDs
   */
  public async getParticipantsAvailableForMeal(
    tripId: string,
    date: Date,
    meal: MealType
  ): Promise<string[]> {
    const availabilities = await this.getByTripIdAndDate(tripId, date);
    return availabilities
      .filter((a) => a.meals.includes(meal))
      .map((a) => a.participantId);
  }

  /**
   * Counts participants available for each meal on a date.
   *
   * @param tripId - The trip ID
   * @param date - The date
   * @returns Promise resolving to counts by meal type
   */
  public async countAvailableByMeal(
    tripId: string,
    date: Date
  ): Promise<{ breakfast: number; lunch: number; dinner: number; snack: number }> {
    const availabilities = await this.getByTripIdAndDate(tripId, date);

    return {
      breakfast: availabilities.filter((a) => a.meals.includes('breakfast')).length,
      lunch: availabilities.filter((a) => a.meals.includes('lunch')).length,
      dinner: availabilities.filter((a) => a.meals.includes('dinner')).length,
      snack: availabilities.filter((a) => a.meals.includes('snack')).length,
    };
  }

  /**
   * Deletes an availability by ID.
   *
   * @param id - The availability's unique identifier
   * @returns Promise resolving when deletion is complete
   * @throws {NotFoundError} If the availability is not found
   */
  public async delete(id: string): Promise<void> {
    const exists = await this.availabilityRepository.exists(id);
    if (!exists) {
      throw NotFoundError.withId('Availability', id);
    }
    await this.availabilityRepository.delete(id);
  }

  /**
   * Deletes an availability by ID (alias for delete).
   *
   * @param id - The availability's unique identifier
   * @returns Promise resolving when deletion is complete
   * @throws {NotFoundError} If availability is not found
   */
  public async deleteAvailability(id: string): Promise<void> {
    const exists = await this.availabilityRepository.exists(id);
    if (!exists) {
      throw NotFoundError.withId('Availability', id);
    }
    await this.availabilityRepository.delete(id);
  }

  /**
   * Deletes all availabilities for a participant.
   *
   * @param participantId - The participant's unique identifier
   * @returns Promise resolving to the number of availabilities deleted
   */
  public async deleteByParticipantId(participantId: string): Promise<number> {
    return this.availabilityRepository.deleteByParticipantId(participantId);
  }

  /**
   * Deletes all availabilities for a participant (alias).
   *
   * @param participantId - The participant's unique identifier
   * @returns Promise resolving to the number of availabilities deleted
   */
  public async deleteAvailabilitiesByParticipantId(participantId: string): Promise<number> {
    return this.availabilityRepository.deleteByParticipantId(participantId);
  }

  /**
   * Deletes all availabilities for a trip.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to the number of availabilities deleted
   */
  public async deleteByTripId(tripId: string): Promise<number> {
    return this.availabilityRepository.deleteByTripId(tripId);
  }

  /**
   * Deletes all availabilities for a trip (alias).
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to the number of availabilities deleted
   */
  public async deleteAvailabilitiesByTripId(tripId: string): Promise<number> {
    return this.availabilityRepository.deleteByTripId(tripId);
  }

  /**
   * Checks if an availability exists.
   *
   * @param id - The availability's unique identifier
   * @returns Promise resolving to true if the availability exists
   */
  public async exists(id: string): Promise<boolean> {
    return this.availabilityRepository.exists(id);
  }

  /**
   * Gets the total count of availabilities.
   *
   * @returns Promise resolving to the count
   */
  public async count(): Promise<number> {
    return this.availabilityRepository.count();
  }

  /**
   * Validates the set availability DTO.
   *
   * @param dto - The DTO to validate
   * @throws {ValidationError} If validation fails
   */
  private validateSetAvailabilityDTO(dto: SetAvailabilityDTO): void {
    if (!dto.tripId || dto.tripId.trim().length === 0) {
      throw ValidationError.required('tripId', 'Availability');
    }

    if (!dto.participantId || dto.participantId.trim().length === 0) {
      throw ValidationError.required('participantId', 'Availability');
    }

    if (!dto.date) {
      throw ValidationError.required('date', 'Availability');
    }

    if (!Array.isArray(dto.meals)) {
      throw ValidationError.invalidFormat('meals', 'array of meal types');
    }
  }

  /**
   * Converts meal array to MealAvailabilityDTO.
   *
   * @param meals - Array of meal types
   * @returns The meal availability DTO
   */
  private toMealAvailabilityDTO(meals: ReadonlyArray<MealType>): MealAvailabilityDTO {
    return {
      breakfast: meals.includes('breakfast'),
      lunch: meals.includes('lunch'),
      dinner: meals.includes('dinner'),
    };
  }

  /**
   * Transforms an Availability entity to a response DTO.
   *
   * @param availability - The availability entity
   * @param participantName - Name of the participant
   * @returns The response DTO
   */
  private _toResponseDTO(
    availability: Availability,
    participantName: string
  ): AvailabilityResponseDTO {
    return {
      id: availability.id,
      tripId: availability.tripId,
      participantId: availability.participantId,
      participantName,
      date: availability.date,
      meals: this.toMealAvailabilityDTO(availability.meals),
      createdAt: availability.createdAt,
      updatedAt: availability.updatedAt ?? availability.createdAt,
    };
  }
}
