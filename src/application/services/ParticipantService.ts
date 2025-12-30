/**
 * @fileoverview Participant Application Service.
 * Handles business logic and orchestration for Participant operations.
 * Follows SOLID principles with single responsibility and dependency injection.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 * @module application/services/ParticipantService
 */

import type { Participant, IParticipantCreateDTO, IParticipantUpdateDTO } from '@domain/entities/Participant';
import type { IParticipantRepository } from '@domain/interfaces/repositories/IParticipantRepository';
import type { ITripRepository } from '@domain/interfaces/repositories/ITripRepository';
import type { IConsumptionRepository } from '@domain/interfaces/repositories/IConsumptionRepository';
import type { IAvailabilityRepository } from '@domain/interfaces/repositories/IAvailabilityRepository';
import { NotFoundError, DuplicateError, ValidationError, DomainError, DomainErrorCode } from '@domain/errors';
import type {
  CreateParticipantDTO,
  UpdateParticipantDTO,
  ParticipantResponseDTO,
  ParticipantWithAvailabilityDTO,
} from '../dtos/participant';

/**
 * Application service for Participant operations.
 *
 * @description
 * This service provides the application layer interface for Participant operations.
 * It handles:
 * - CRUD operations for participants
 * - Business rule validation (duplicate names, trip existence)
 * - Data transformation between DTOs and domain entities
 * - Cascade operations for related entities
 *
 * @example
 * ```typescript
 * const participantService = new ParticipantService(
 *   participantRepository,
 *   tripRepository,
 *   consumptionRepository,
 *   availabilityRepository
 * );
 *
 * const participant = await participantService.create({
 *   tripId: 'trip-123',
 *   name: 'John Doe',
 *   email: 'john@example.com',
 * });
 * ```
 */
export class ParticipantService {
  /**
   * Creates a new ParticipantService instance.
   *
   * @param participantRepository - Repository for Participant persistence operations
   * @param tripRepository - Repository for Trip operations (for existence validation)
   * @param consumptionRepository - Repository for Consumption operations (optional, for cascade deletes)
   * @param availabilityRepository - Repository for Availability operations (optional, for cascade deletes)
   */
  constructor(
    private readonly participantRepository: IParticipantRepository,
    private readonly tripRepository: ITripRepository,
    private readonly consumptionRepository?: IConsumptionRepository,
    private readonly availabilityRepository?: IAvailabilityRepository
  ) {}

  /**
   * Creates a new participant.
   *
   * @param dto - The participant creation data
   * @returns Promise resolving to the created participant
   * @throws {NotFoundError} If the trip is not found
   * @throws {DuplicateError} If participant name already exists in trip
   * @throws {ValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const participant = await participantService.create({
   *   tripId: 'trip-123',
   *   name: 'John Doe',
   *   email: 'john@example.com',
   * });
   * ```
   */
  public async create(dto: CreateParticipantDTO): Promise<Participant> {
    // Validate input
    this.validateCreateDTO(dto);

    // Verify trip exists
    const tripExists = await this.tripRepository.exists(dto.tripId);
    if (!tripExists) {
      throw NotFoundError.withId('Trip', dto.tripId);
    }

    // Check for duplicate name in trip
    const existing = await this.participantRepository.findByTripIdAndName(dto.tripId, dto.name);
    if (existing) {
      throw DuplicateError.withField('Participant', 'name', dto.name);
    }

    // Create domain entity
    const { Participant } = await import('@domain/entities/Participant');
    const participant = Participant.create({
      tripId: dto.tripId,
      name: dto.name,
      email: dto.email,
      notes: dto.notes,
    });

    return this.participantRepository.save(participant);
  }

  /**
   * Creates a new participant using domain DTO.
   *
   * @param dto - The participant creation data using domain DTO
   * @returns Promise resolving to the created participant
   * @throws {NotFoundError} If trip is not found
   * @throws {DuplicateError} If participant name already exists in trip
   */
  public async createParticipant(dto: IParticipantCreateDTO): Promise<Participant> {
    // Verify trip exists
    const tripExists = await this.tripRepository.exists(dto.tripId);
    if (!tripExists) {
      throw NotFoundError.withId('Trip', dto.tripId);
    }

    // Check for duplicate name in trip
    const existing = await this.participantRepository.findByTripIdAndName(dto.tripId, dto.name);
    if (existing) {
      throw DuplicateError.withField('Participant', 'name', dto.name);
    }

    const { Participant } = await import('@domain/entities/Participant');
    const participant = Participant.create(dto);
    return this.participantRepository.save(participant);
  }

  /**
   * Retrieves a participant by its ID.
   *
   * @param id - The participant's unique identifier
   * @returns Promise resolving to the participant if found, null otherwise
   */
  public async getById(id: string): Promise<Participant | null> {
    return this.participantRepository.findById(id);
  }

  /**
   * Retrieves a participant by ID, throwing if not found.
   *
   * @param id - The participant's unique identifier
   * @returns Promise resolving to the participant
   * @throws {NotFoundError} If the participant is not found
   */
  public async getParticipantById(id: string): Promise<Participant> {
    const participant = await this.participantRepository.findById(id);
    if (!participant) {
      throw NotFoundError.withId('Participant', id);
    }
    return participant;
  }

  /**
   * Retrieves all participants for a trip.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to array of participants
   * @throws {NotFoundError} If the trip is not found
   *
   * @example
   * ```typescript
   * const participants = await participantService.getByTripId('trip-123');
   * console.log(`${participants.length} participants in trip`);
   * ```
   */
  public async getByTripId(tripId: string): Promise<Participant[]> {
    const tripExists = await this.tripRepository.exists(tripId);
    if (!tripExists) {
      throw NotFoundError.withId('Trip', tripId);
    }
    return this.participantRepository.findByTripId(tripId);
  }

  /**
   * Retrieves all participants for a trip (alias for getByTripId).
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to array of participants
   * @throws {NotFoundError} If the trip is not found
   */
  public async getParticipantsByTripId(tripId: string): Promise<Participant[]> {
    const tripExists = await this.tripRepository.exists(tripId);
    if (!tripExists) {
      throw NotFoundError.withId('Trip', tripId);
    }
    return this.participantRepository.findByTripId(tripId);
  }

  /**
   * Retrieves participants with availability information.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to array of participants with availability
   * @throws {NotFoundError} If the trip is not found
   */
  public async getParticipantsWithAvailability(tripId: string): Promise<ParticipantWithAvailabilityDTO[]> {
    const participants = await this.getByTripId(tripId);

    if (!this.availabilityRepository) {
      return participants.map((p) => this.toWithAvailabilityDTO(p, [], 0));
    }

    const responses: ParticipantWithAvailabilityDTO[] = [];

    for (const participant of participants) {
      const availabilities = await this.availabilityRepository.findByParticipantId(participant.id);
      const availableDates = availabilities.map((a) => a.date);

      // Calculate percentage (assuming trip duration would be needed)
      const trip = await this.tripRepository.findById(tripId);
      const tripDays = trip ? trip.getDurationInDays() : 1;
      const percentage = (availableDates.length / tripDays) * 100;

      responses.push(this.toWithAvailabilityDTO(participant, availableDates, percentage));
    }

    return responses;
  }

  /**
   * Updates an existing participant.
   *
   * @param id - The participant's unique identifier
   * @param dto - The update data
   * @returns Promise resolving to the updated participant
   * @throws {NotFoundError} If the participant is not found
   * @throws {DuplicateError} If new name already exists in trip
   * @throws {ValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const updated = await participantService.update('participant-123', {
   *   name: 'Jane Doe',
   *   email: 'jane@example.com',
   * });
   * ```
   */
  public async update(id: string, dto: UpdateParticipantDTO): Promise<Participant> {
    const participant = await this.getParticipantById(id);

    // Validate update
    this.validateUpdateDTO(dto);

    // Check for duplicate name if name is being changed
    if (dto.name && dto.name !== participant.name) {
      const existing = await this.participantRepository.findByTripIdAndName(participant.tripId, dto.name);
      if (existing && existing.id !== id) {
        throw DuplicateError.withField('Participant', 'name', dto.name);
      }
    }

    const updatedParticipant = participant.update({
      name: dto.name,
      email: dto.email,
      notes: dto.notes,
    });

    return this.participantRepository.save(updatedParticipant);
  }

  /**
   * Updates an existing participant using domain DTO.
   *
   * @param id - The participant's unique identifier
   * @param dto - The update data using domain DTO
   * @returns Promise resolving to the updated participant
   * @throws {NotFoundError} If participant is not found
   * @throws {DuplicateError} If new name already exists in trip
   */
  public async updateParticipant(id: string, dto: IParticipantUpdateDTO): Promise<Participant> {
    const participant = await this.getParticipantById(id);

    // Check for duplicate name if name is being changed
    if (dto.name && dto.name !== participant.name) {
      const existing = await this.participantRepository.findByTripIdAndName(participant.tripId, dto.name);
      if (existing && existing.id !== id) {
        throw DuplicateError.withField('Participant', 'name', dto.name);
      }
    }

    const updatedParticipant = participant.update(dto);
    return this.participantRepository.save(updatedParticipant);
  }

  /**
   * Deletes a participant by ID.
   *
   * @param id - The participant's unique identifier
   * @param force - If true, deletes even if participant has consumptions
   * @returns Promise resolving when deletion is complete
   * @throws {NotFoundError} If the participant is not found
   * @throws {DomainError} If participant has consumptions and force is false
   *
   * @example
   * ```typescript
   * // Safe delete
   * await participantService.delete('participant-123');
   *
   * // Force delete (removes all related data)
   * await participantService.delete('participant-123', true);
   * ```
   */
  public async delete(id: string, force: boolean = false): Promise<void> {
    const exists = await this.participantRepository.exists(id);
    if (!exists) {
      throw NotFoundError.withId('Participant', id);
    }

    // Check for dependencies if we have consumption repository
    if (this.consumptionRepository && !force) {
      const consumptions = await this.consumptionRepository.findByParticipantId(id);
      if (consumptions.length > 0) {
        throw new DomainError(
          `Cannot delete participant with ${consumptions.length} consumption record(s). Use force=true to delete all related data.`,
          DomainErrorCode.BUSINESS_RULE_ERROR,
          { participantId: id, consumptionCount: consumptions.length }
        );
      }
    }

    // If force delete, remove all related data
    if (force) {
      if (this.consumptionRepository) {
        await this.consumptionRepository.deleteByParticipantId(id);
      }
      if (this.availabilityRepository) {
        await this.availabilityRepository.deleteByParticipantId(id);
      }
    }

    await this.participantRepository.delete(id);
  }

  /**
   * Deletes a participant by ID (simple version without force option).
   *
   * @param id - The participant's unique identifier
   * @returns Promise resolving when deletion is complete
   * @throws {NotFoundError} If participant is not found
   */
  public async deleteParticipant(id: string): Promise<void> {
    const exists = await this.participantRepository.exists(id);
    if (!exists) {
      throw NotFoundError.withId('Participant', id);
    }
    await this.participantRepository.delete(id);
  }

  /**
   * Deletes all participants for a trip.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to the number of participants deleted
   */
  public async deleteByTripId(tripId: string): Promise<number> {
    return this.participantRepository.deleteByTripId(tripId);
  }

  /**
   * Deletes all participants for a trip (alias for deleteByTripId).
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to the number of participants deleted
   */
  public async deleteParticipantsByTripId(tripId: string): Promise<number> {
    return this.participantRepository.deleteByTripId(tripId);
  }

  /**
   * Gets the count of participants in a trip.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to the count
   */
  public async countByTripId(tripId: string): Promise<number> {
    return this.participantRepository.countByTripId(tripId);
  }

  /**
   * Gets the count of participants in a trip (alias for countByTripId).
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to the count
   */
  public async getParticipantCountByTripId(tripId: string): Promise<number> {
    return this.participantRepository.countByTripId(tripId);
  }

  /**
   * Searches participants by name.
   *
   * @param name - The name or partial name to search
   * @returns Promise resolving to array of matching participants
   */
  public async searchByName(name: string): Promise<Participant[]> {
    return this.participantRepository.findByName(name);
  }

  /**
   * Searches participants by name (alias for searchByName).
   *
   * @param name - The name or partial name to search
   * @returns Promise resolving to array of matching participants
   */
  public async searchParticipantsByName(name: string): Promise<Participant[]> {
    return this.participantRepository.findByName(name);
  }

  /**
   * Searches participants by email.
   *
   * @param email - The email or partial email to search
   * @returns Promise resolving to array of matching participants
   */
  public async searchByEmail(email: string): Promise<Participant[]> {
    return this.participantRepository.findByEmail(email);
  }

  /**
   * Checks if a participant exists.
   *
   * @param id - The participant's unique identifier
   * @returns Promise resolving to true if the participant exists
   */
  public async exists(id: string): Promise<boolean> {
    return this.participantRepository.exists(id);
  }

  /**
   * Validates the create DTO.
   *
   * @param dto - The DTO to validate
   * @throws {ValidationError} If validation fails
   */
  private validateCreateDTO(dto: CreateParticipantDTO): void {
    if (!dto.tripId || dto.tripId.trim().length === 0) {
      throw ValidationError.required('tripId', 'Participant');
    }

    if (!dto.name || dto.name.trim().length === 0) {
      throw ValidationError.required('name', 'Participant');
    }

    if (dto.email && !this.isValidEmail(dto.email)) {
      throw ValidationError.invalidFormat('email', 'valid email address', dto.email);
    }
  }

  /**
   * Validates the update DTO.
   *
   * @param dto - The DTO to validate
   * @throws {ValidationError} If validation fails
   */
  private validateUpdateDTO(dto: UpdateParticipantDTO): void {
    if (dto.name !== undefined && dto.name.trim().length === 0) {
      throw ValidationError.invalidLength('name', 1, undefined, 0);
    }

    if (dto.email !== undefined && dto.email !== null && !this.isValidEmail(dto.email)) {
      throw ValidationError.invalidFormat('email', 'valid email address', dto.email);
    }
  }

  /**
   * Validates email format.
   *
   * @param email - The email to validate
   * @returns True if valid email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Transforms a Participant entity to a response DTO.
   *
   * @param participant - The participant entity
   * @returns The response DTO
   */
  private toResponseDTO(participant: Participant): ParticipantResponseDTO {
    return {
      id: participant.id,
      tripId: participant.tripId,
      name: participant.name,
      email: participant.email,
      notes: participant.notes,
      dietaryRestrictions: [],
      createdAt: participant.createdAt,
      updatedAt: participant.updatedAt ?? participant.createdAt,
    };
  }

  /**
   * Transforms a Participant entity to a response DTO with availability.
   *
   * @param participant - The participant entity
   * @param availableDates - Array of available dates
   * @param availabilityPercentage - Percentage of trip days available
   * @returns The response DTO with availability
   */
  private toWithAvailabilityDTO(
    participant: Participant,
    availableDates: Date[],
    availabilityPercentage: number
  ): ParticipantWithAvailabilityDTO {
    return {
      ...this.toResponseDTO(participant),
      availableDates,
      availabilityPercentage,
    };
  }
}
