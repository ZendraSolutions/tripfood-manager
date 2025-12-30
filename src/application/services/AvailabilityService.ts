/**
 * @fileoverview Availability Application Service
 * Orchestrates availability-related use cases
 * @module application/services/AvailabilityService
 */

import type { Availability } from '@domain/entities/Availability';
import type { IAvailabilityRepository } from '@domain/interfaces/repositories/IAvailabilityRepository';
import type { IParticipantRepository } from '@domain/interfaces/repositories/IParticipantRepository';
import { NotFoundError } from '@domain/errors';
import type { MealType } from '@domain/types';

/**
 * DTO for creating/updating availability
 */
export interface SetAvailabilityDTO {
  participantId: string;
  tripId: string;
  date: Date;
  meals: MealType[];
}

/**
 * Application service for Availability operations
 */
export class AvailabilityService {
  constructor(
    private readonly availabilityRepository: IAvailabilityRepository,
    private readonly participantRepository: IParticipantRepository
  ) {}

  /**
   * Gets all availabilities for a trip
   */
  async getAvailabilitiesByTripId(tripId: string): Promise<Availability[]> {
    return this.availabilityRepository.findByTripId(tripId);
  }

  /**
   * Gets availabilities for a trip on a specific date
   */
  async getAvailabilitiesByTripIdAndDate(tripId: string, date: Date): Promise<Availability[]> {
    return this.availabilityRepository.findByTripIdAndDate(tripId, date);
  }

  /**
   * Gets availabilities for a participant
   */
  async getAvailabilitiesByParticipantId(participantId: string): Promise<Availability[]> {
    return this.availabilityRepository.findByParticipantId(participantId);
  }

  /**
   * Gets availability for a participant on a specific date
   */
  async getAvailabilityByParticipantIdAndDate(
    participantId: string,
    date: Date
  ): Promise<Availability | null> {
    return this.availabilityRepository.findByParticipantIdAndDate(participantId, date);
  }

  /**
   * Gets an availability by ID
   * @throws {NotFoundError} If availability is not found
   */
  async getAvailabilityById(id: string): Promise<Availability> {
    const availability = await this.availabilityRepository.findById(id);
    if (!availability) {
      throw NotFoundError.withId('Availability', id);
    }
    return availability;
  }

  /**
   * Sets availability for a participant (creates or updates)
   * @throws {NotFoundError} If participant is not found
   */
  async setAvailability(dto: SetAvailabilityDTO): Promise<Availability> {
    // Verify participant exists
    const participantExists = await this.participantRepository.exists(dto.participantId);
    if (!participantExists) {
      throw NotFoundError.withId('Participant', dto.participantId);
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
   * Deletes an availability by ID
   * @throws {NotFoundError} If availability is not found
   */
  async deleteAvailability(id: string): Promise<void> {
    const exists = await this.availabilityRepository.exists(id);
    if (!exists) {
      throw NotFoundError.withId('Availability', id);
    }
    await this.availabilityRepository.delete(id);
  }

  /**
   * Deletes all availabilities for a participant
   */
  async deleteAvailabilitiesByParticipantId(participantId: string): Promise<number> {
    return this.availabilityRepository.deleteByParticipantId(participantId);
  }

  /**
   * Deletes all availabilities for a trip
   */
  async deleteAvailabilitiesByTripId(tripId: string): Promise<number> {
    return this.availabilityRepository.deleteByTripId(tripId);
  }

  /**
   * Gets participants available for a specific meal on a date
   */
  async getParticipantsAvailableForMeal(
    tripId: string,
    date: Date,
    meal: MealType
  ): Promise<string[]> {
    const availabilities = await this.getAvailabilitiesByTripIdAndDate(tripId, date);
    return availabilities
      .filter((a) => a.meals.includes(meal))
      .map((a) => a.participantId);
  }
}
