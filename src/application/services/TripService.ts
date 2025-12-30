/**
 * @fileoverview Trip Application Service.
 * Handles business logic and orchestration for Trip operations.
 * Follows SOLID principles with single responsibility and dependency injection.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 * @module application/services/TripService
 */

import type { Trip, ITripCreateDTO, ITripUpdateDTO } from '@domain/entities/Trip';
import type { ITripRepository } from '@domain/interfaces/repositories/ITripRepository';
import type { IParticipantRepository } from '@domain/interfaces/repositories/IParticipantRepository';
import type { IConsumptionRepository } from '@domain/interfaces/repositories/IConsumptionRepository';
import type { IAvailabilityRepository } from '@domain/interfaces/repositories/IAvailabilityRepository';
import { NotFoundError, ValidationError, DomainError, DomainErrorCode } from '@domain/errors';
import type { CreateTripDTO, UpdateTripDTO, TripResponseDTO, TripDetailResponseDTO } from '../dtos/trip';

/**
 * Application service for Trip operations.
 *
 * @description
 * This service provides the application layer interface for Trip operations.
 * It handles:
 * - CRUD operations for trips
 * - Business rule validation
 * - Data transformation between DTOs and domain entities
 * - Orchestration of repository operations
 * - Cascade operations for related entities
 *
 * @example
 * ```typescript
 * const tripService = new TripService(
 *   tripRepository,
 *   participantRepository,
 *   consumptionRepository,
 *   availabilityRepository
 * );
 *
 * const trip = await tripService.create({
 *   name: 'Summer Vacation',
 *   startDate: new Date('2024-07-01'),
 *   endDate: new Date('2024-07-15'),
 * });
 * ```
 */
export class TripService {
  /**
   * Creates a new TripService instance.
   *
   * @param tripRepository - Repository for Trip persistence operations
   * @param participantRepository - Repository for Participant operations (optional, for dependency checks)
   * @param consumptionRepository - Repository for Consumption operations (optional, for cascade deletes)
   * @param availabilityRepository - Repository for Availability operations (optional, for cascade deletes)
   */
  constructor(
    private readonly tripRepository: ITripRepository,
    private readonly participantRepository?: IParticipantRepository,
    private readonly consumptionRepository?: IConsumptionRepository,
    private readonly availabilityRepository?: IAvailabilityRepository
  ) {}

  /**
   * Creates a new trip.
   *
   * @param dto - The trip creation data
   * @returns Promise resolving to the created trip
   * @throws {ValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const trip = await tripService.create({
   *   name: 'Beach Trip 2024',
   *   description: 'Annual beach trip with friends',
   *   startDate: new Date('2024-07-01'),
   *   endDate: new Date('2024-07-07'),
   * });
   * ```
   */
  public async create(dto: CreateTripDTO): Promise<Trip> {
    // Validate business rules
    this.validateCreateDTO(dto);

    // Create domain entity (entity performs its own validation)
    const { Trip } = await import('@domain/entities/Trip');
    const trip = Trip.create({
      name: dto.name,
      description: dto.description,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    // Persist the entity
    return this.tripRepository.save(trip);
  }

  /**
   * Creates a new trip (alias for create using domain DTO).
   *
   * @param dto - The trip creation data using domain DTO
   * @returns Promise resolving to the created trip
   */
  public async createTrip(dto: ITripCreateDTO): Promise<Trip> {
    const { Trip } = await import('@domain/entities/Trip');
    const trip = Trip.create(dto);
    return this.tripRepository.save(trip);
  }

  /**
   * Retrieves a trip by its ID.
   *
   * @param id - The trip's unique identifier
   * @returns Promise resolving to the trip if found, null otherwise
   *
   * @example
   * ```typescript
   * const trip = await tripService.getById('trip-123');
   * if (trip) {
   *   console.log(trip.name);
   * }
   * ```
   */
  public async getById(id: string): Promise<Trip | null> {
    return this.tripRepository.findById(id);
  }

  /**
   * Retrieves a trip by ID, throwing if not found.
   *
   * @param id - The trip's unique identifier
   * @returns Promise resolving to the trip
   * @throws {NotFoundError} If the trip is not found
   *
   * @example
   * ```typescript
   * try {
   *   const trip = await tripService.getTripById('trip-123');
   *   console.log(trip.name);
   * } catch (error) {
   *   if (error instanceof NotFoundError) {
   *     console.log('Trip not found');
   *   }
   * }
   * ```
   */
  public async getTripById(id: string): Promise<Trip> {
    const trip = await this.tripRepository.findById(id);
    if (!trip) {
      throw NotFoundError.withId('Trip', id);
    }
    return trip;
  }

  /**
   * Retrieves detailed trip information including related entity counts.
   *
   * @param id - The trip's unique identifier
   * @returns Promise resolving to the detailed trip response
   * @throws {NotFoundError} If the trip is not found
   *
   * @example
   * ```typescript
   * const tripDetails = await tripService.getDetails('trip-123');
   * console.log(`Participants: ${tripDetails.participantCount}`);
   * ```
   */
  public async getDetails(id: string): Promise<TripDetailResponseDTO> {
    const trip = await this.tripRepository.findById(id);

    if (!trip) {
      throw NotFoundError.withId('Trip', id);
    }

    const participants = this.participantRepository
      ? await this.participantRepository.findByTripId(id)
      : [];
    const consumptionCount = this.consumptionRepository
      ? (await this.consumptionRepository.findByTripId(id)).length
      : 0;

    return this.toDetailResponseDTO(trip, participants, consumptionCount);
  }

  /**
   * Retrieves all trips.
   *
   * @returns Promise resolving to array of trips
   *
   * @example
   * ```typescript
   * const trips = await tripService.getAll();
   * console.log(`Total trips: ${trips.length}`);
   * ```
   */
  public async getAll(): Promise<Trip[]> {
    return this.tripRepository.findAll();
  }

  /**
   * Retrieves all trips (alias for getAll).
   *
   * @returns Promise resolving to array of trips
   */
  public async getAllTrips(): Promise<Trip[]> {
    return this.tripRepository.findAll();
  }

  /**
   * Retrieves all trips ordered by start date (most recent first).
   *
   * @returns Promise resolving to array of trips
   */
  public async getAllTripsOrderedByStartDate(): Promise<Trip[]> {
    return this.tripRepository.findAllOrderedByStartDate();
  }

  /**
   * Retrieves all trips as response DTOs with participant counts.
   *
   * @returns Promise resolving to array of trip response DTOs
   */
  public async getAllAsResponseDTO(): Promise<TripResponseDTO[]> {
    const trips = await this.tripRepository.findAll();

    const responses: TripResponseDTO[] = [];
    for (const trip of trips) {
      const participantCount = this.participantRepository
        ? await this.participantRepository.countByTripId(trip.id)
        : 0;
      responses.push(this.toResponseDTO(trip, participantCount));
    }

    return responses;
  }

  /**
   * Searches trips by name.
   *
   * @param name - The name or partial name to search
   * @returns Promise resolving to array of matching trips
   *
   * @example
   * ```typescript
   * const beachTrips = await tripService.searchByName('beach');
   * ```
   */
  public async searchByName(name: string): Promise<Trip[]> {
    return this.tripRepository.findByName(name);
  }

  /**
   * Searches trips by name (alias for searchByName).
   *
   * @param name - The name or partial name to search
   * @returns Promise resolving to array of matching trips
   */
  public async searchTripsByName(name: string): Promise<Trip[]> {
    return this.tripRepository.findByName(name);
  }

  /**
   * Finds trips active on a specific date.
   *
   * @param date - The date to check
   * @returns Promise resolving to array of trips active on that date
   */
  public async findTripsByDate(date: Date): Promise<Trip[]> {
    return this.tripRepository.findByDate(date);
  }

  /**
   * Retrieves trips within a date range.
   *
   * @param startDate - Start of the date range
   * @param endDate - End of the date range
   * @returns Promise resolving to array of trips
   * @throws {ValidationError} If date range is invalid
   *
   * @example
   * ```typescript
   * const julyTrips = await tripService.findTripsByDateRange(
   *   new Date('2024-07-01'),
   *   new Date('2024-07-31')
   * );
   * ```
   */
  public async findTripsByDateRange(startDate: Date, endDate: Date): Promise<Trip[]> {
    if (startDate > endDate) {
      throw ValidationError.invalidDateRange('startDate', 'endDate');
    }

    return this.tripRepository.findByDateRange(startDate, endDate);
  }

  /**
   * Updates an existing trip.
   *
   * @param id - The trip's unique identifier
   * @param dto - The update data
   * @returns Promise resolving to the updated trip
   * @throws {NotFoundError} If the trip is not found
   * @throws {ValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const updatedTrip = await tripService.update('trip-123', {
   *   name: 'Updated Trip Name',
   *   endDate: new Date('2024-07-20'),
   * });
   * ```
   */
  public async update(id: string, dto: UpdateTripDTO): Promise<Trip> {
    // Find existing trip
    const existingTrip = await this.tripRepository.findById(id);

    if (!existingTrip) {
      throw NotFoundError.withId('Trip', id);
    }

    // Validate business rules
    this.validateUpdateDTO(dto, existingTrip);

    // Update the domain entity
    const updatedTrip = existingTrip.update({
      name: dto.name,
      description: dto.description,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    // Persist the updated entity
    return this.tripRepository.save(updatedTrip);
  }

  /**
   * Updates an existing trip using domain DTO.
   *
   * @param id - The trip's unique identifier
   * @param dto - The update data using domain DTO
   * @returns Promise resolving to the updated trip
   * @throws {NotFoundError} If the trip is not found
   */
  public async updateTrip(id: string, dto: ITripUpdateDTO): Promise<Trip> {
    const trip = await this.getTripById(id);
    const updatedTrip = trip.update(dto);
    return this.tripRepository.save(updatedTrip);
  }

  /**
   * Deletes a trip by ID.
   *
   * @param id - The trip's unique identifier
   * @param force - If true, deletes even if trip has dependencies
   * @returns Promise resolving when deletion is complete
   * @throws {NotFoundError} If the trip is not found
   * @throws {DomainError} If trip has dependencies and force is false
   *
   * @example
   * ```typescript
   * // Safe delete (fails if trip has participants)
   * await tripService.delete('trip-123');
   *
   * // Force delete (removes all related data)
   * await tripService.delete('trip-123', true);
   * ```
   */
  public async delete(id: string, force: boolean = false): Promise<void> {
    // Verify trip exists
    const exists = await this.tripRepository.exists(id);

    if (!exists) {
      throw NotFoundError.withId('Trip', id);
    }

    // Check for dependencies if we have participant repository
    if (this.participantRepository && !force) {
      const participantCount = await this.participantRepository.countByTripId(id);

      if (participantCount > 0) {
        throw new DomainError(
          `Cannot delete trip with ${participantCount} participant(s). Use force=true to delete all related data.`,
          DomainErrorCode.BUSINESS_RULE_ERROR,
          { tripId: id, participantCount }
        );
      }
    }

    // If force delete, remove all related data
    if (force) {
      if (this.consumptionRepository) {
        await this.consumptionRepository.deleteByTripId(id);
      }
      if (this.availabilityRepository) {
        await this.availabilityRepository.deleteByTripId(id);
      }
      if (this.participantRepository) {
        await this.participantRepository.deleteByTripId(id);
      }
    }

    // Delete the trip
    await this.tripRepository.delete(id);
  }

  /**
   * Deletes a trip by ID (simple version without force option).
   *
   * @param id - The trip's unique identifier
   * @returns Promise resolving when deletion is complete
   * @throws {NotFoundError} If the trip is not found
   */
  public async deleteTrip(id: string): Promise<void> {
    const exists = await this.tripRepository.exists(id);
    if (!exists) {
      throw NotFoundError.withId('Trip', id);
    }
    await this.tripRepository.delete(id);
  }

  /**
   * Checks if a trip exists.
   *
   * @param id - The trip's unique identifier
   * @returns Promise resolving to true if the trip exists
   */
  public async exists(id: string): Promise<boolean> {
    return this.tripRepository.exists(id);
  }

  /**
   * Checks if a trip exists (alias for exists).
   *
   * @param id - The trip's unique identifier
   * @returns Promise resolving to true if the trip exists
   */
  public async tripExists(id: string): Promise<boolean> {
    return this.tripRepository.exists(id);
  }

  /**
   * Gets the total count of trips.
   *
   * @returns Promise resolving to the count
   */
  public async count(): Promise<number> {
    return this.tripRepository.count();
  }

  /**
   * Gets the total count of trips (alias for count).
   *
   * @returns Promise resolving to the count
   */
  public async getTripCount(): Promise<number> {
    return this.tripRepository.count();
  }

  /**
   * Validates the create DTO.
   *
   * @param dto - The DTO to validate
   * @throws {ValidationError} If validation fails
   */
  private validateCreateDTO(dto: CreateTripDTO): void {
    if (!dto.name || dto.name.trim().length === 0) {
      throw ValidationError.required('name', 'Trip');
    }

    if (!dto.startDate) {
      throw ValidationError.required('startDate', 'Trip');
    }

    if (!dto.endDate) {
      throw ValidationError.required('endDate', 'Trip');
    }

    if (!(dto.startDate instanceof Date) || isNaN(dto.startDate.getTime())) {
      throw ValidationError.invalidFormat('startDate', 'valid Date');
    }

    if (!(dto.endDate instanceof Date) || isNaN(dto.endDate.getTime())) {
      throw ValidationError.invalidFormat('endDate', 'valid Date');
    }

    if (dto.startDate > dto.endDate) {
      throw ValidationError.invalidDateRange('startDate', 'endDate');
    }
  }

  /**
   * Validates the update DTO.
   *
   * @param dto - The DTO to validate
   * @param existingTrip - The existing trip being updated
   * @throws {ValidationError} If validation fails
   */
  private validateUpdateDTO(dto: UpdateTripDTO, existingTrip: Trip): void {
    if (dto.name !== undefined && dto.name.trim().length === 0) {
      throw ValidationError.invalidLength('name', 1, undefined, 0);
    }

    // Validate date consistency
    const newStartDate = dto.startDate ?? existingTrip.startDate;
    const newEndDate = dto.endDate ?? existingTrip.endDate;

    if (newStartDate > newEndDate) {
      throw ValidationError.invalidDateRange('startDate', 'endDate');
    }
  }

  /**
   * Transforms a Trip entity to a response DTO.
   *
   * @param trip - The trip entity
   * @param participantCount - Number of participants in the trip
   * @returns The response DTO
   */
  private toResponseDTO(trip: Trip, participantCount: number): TripResponseDTO {
    return {
      id: trip.id,
      name: trip.name,
      description: trip.description,
      startDate: trip.startDate,
      endDate: trip.endDate,
      durationDays: trip.getDurationInDays(),
      participantCount,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt ?? trip.createdAt,
    };
  }

  /**
   * Transforms a Trip entity to a detailed response DTO.
   *
   * @param trip - The trip entity
   * @param participants - Array of participants
   * @param consumptionCount - Number of consumption records
   * @returns The detailed response DTO
   */
  private toDetailResponseDTO(
    trip: Trip,
    participants: Array<{ id: string; name: string }>,
    consumptionCount: number
  ): TripDetailResponseDTO {
    return {
      ...this.toResponseDTO(trip, participants.length),
      participants: participants.map((p) => ({
        id: p.id,
        name: p.name,
      })),
      productCount: 0, // Products are global, not trip-specific
      consumptionCount,
    };
  }
}
