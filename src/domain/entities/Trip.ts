/**
 * @fileoverview Trip entity for TripFood Manager.
 * Represents a group trip with dates, participants, and consumption tracking.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from '../errors';
import { IDateRange, IEntity, createDateRange, getDaysInRange, isDateInRange } from '../types';

/**
 * Interface representing the data transfer object for creating a Trip.
 * Contains all required and optional fields for trip creation.
 */
export interface ITripCreateDTO {
  /** Name of the trip */
  readonly name: string;
  /** Optional description of the trip */
  readonly description?: string;
  /** Start date of the trip */
  readonly startDate: Date;
  /** End date of the trip */
  readonly endDate: Date;
}

/**
 * Interface representing the data transfer object for updating a Trip.
 * All fields are optional since we may only update specific properties.
 */
export interface ITripUpdateDTO {
  /** New name for the trip */
  readonly name?: string;
  /** New description for the trip (null to remove) */
  readonly description?: string | null;
  /** New start date for the trip */
  readonly startDate?: Date;
  /** New end date for the trip */
  readonly endDate?: Date;
}

/**
 * Interface representing the Trip entity properties.
 */
export interface ITripProps extends IEntity {
  /** Name of the trip */
  readonly name: string;
  /** Optional description of the trip */
  readonly description?: string;
  /** Start date of the trip */
  readonly startDate: Date;
  /** End date of the trip */
  readonly endDate: Date;
}

/**
 * Trip entity representing a group trip.
 *
 * @description
 * The Trip entity is the aggregate root for trip-related operations.
 * It encapsulates all business logic related to trips, including:
 * - Trip date range validation
 * - Name validation
 * - Immutable updates
 *
 * All instances are immutable - updates return new instances.
 *
 * @example
 * ```typescript
 * // Create a new trip
 * const trip = Trip.create({
 *   name: 'Summer Vacation 2024',
 *   description: 'Beach trip with friends',
 *   startDate: new Date('2024-07-01'),
 *   endDate: new Date('2024-07-15'),
 * });
 *
 * // Update the trip (returns new instance)
 * const updatedTrip = trip.update({ name: 'Summer Beach Trip 2024' });
 * ```
 *
 * @implements {ITripProps}
 */
export class Trip implements ITripProps {
  /**
   * Minimum length for trip name.
   */
  public static readonly MIN_NAME_LENGTH = 3;

  /**
   * Maximum length for trip name.
   */
  public static readonly MAX_NAME_LENGTH = 100;

  /**
   * Maximum length for trip description.
   */
  public static readonly MAX_DESCRIPTION_LENGTH = 500;

  /**
   * Unique identifier for the trip.
   * @readonly
   */
  public readonly id: string;

  /**
   * Name of the trip.
   * @readonly
   */
  public readonly name: string;

  /**
   * Optional description of the trip.
   * @readonly
   */
  public readonly description?: string;

  /**
   * Start date of the trip.
   * @readonly
   */
  public readonly startDate: Date;

  /**
   * End date of the trip.
   * @readonly
   */
  public readonly endDate: Date;

  /**
   * Timestamp when the trip was created.
   * @readonly
   */
  public readonly createdAt: Date;

  /**
   * Timestamp when the trip was last updated.
   * @readonly
   */
  public readonly updatedAt?: Date;

  /**
   * Private constructor to enforce factory method usage.
   *
   * @param props - The trip properties
   */
  private constructor(props: ITripProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.startDate = new Date(props.startDate);
    this.endDate = new Date(props.endDate);
    this.createdAt = new Date(props.createdAt);
    this.updatedAt = props.updatedAt ? new Date(props.updatedAt) : undefined;

    // Freeze the object to ensure immutability
    Object.freeze(this);
  }

  /**
   * Creates a new Trip entity with validation.
   *
   * @param dto - The data transfer object containing trip data
   * @returns A new Trip instance
   * @throws {ValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const trip = Trip.create({
   *   name: 'Mountain Hiking',
   *   startDate: new Date('2024-08-01'),
   *   endDate: new Date('2024-08-07'),
   * });
   * ```
   */
  public static create(dto: ITripCreateDTO): Trip {
    // Validate name
    Trip.validateName(dto.name);

    // Validate description if provided
    if (dto.description !== undefined) {
      Trip.validateDescription(dto.description);
    }

    // Validate date range
    Trip.validateDateRange(dto.startDate, dto.endDate);

    const now = new Date();

    return new Trip({
      id: uuidv4(),
      name: dto.name.trim(),
      description: dto.description?.trim(),
      startDate: dto.startDate,
      endDate: dto.endDate,
      createdAt: now,
    });
  }

  /**
   * Reconstructs a Trip entity from persistence data.
   *
   * @param props - The trip properties from persistence
   * @returns A Trip instance
   *
   * @description
   * This method is used by repositories to reconstruct entities
   * from storage. It performs minimal validation since data is
   * assumed to come from a trusted source.
   */
  public static fromPersistence(props: ITripProps): Trip {
    return new Trip(props);
  }

  /**
   * Updates the trip with new values, returning a new instance.
   *
   * @param dto - The update data transfer object
   * @returns A new Trip instance with updated values
   * @throws {ValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const updatedTrip = trip.update({
   *   name: 'New Trip Name',
   *   description: 'Updated description',
   * });
   * ```
   */
  public update(dto: ITripUpdateDTO): Trip {
    const newName = dto.name !== undefined ? dto.name : this.name;
    const newDescription = dto.description === null
      ? undefined
      : dto.description !== undefined
        ? dto.description
        : this.description;
    const newStartDate = dto.startDate !== undefined ? dto.startDate : this.startDate;
    const newEndDate = dto.endDate !== undefined ? dto.endDate : this.endDate;

    // Validate updated values
    if (dto.name !== undefined) {
      Trip.validateName(dto.name);
    }

    if (dto.description !== undefined && dto.description !== null) {
      Trip.validateDescription(dto.description);
    }

    if (dto.startDate !== undefined || dto.endDate !== undefined) {
      Trip.validateDateRange(newStartDate, newEndDate);
    }

    return new Trip({
      id: this.id,
      name: newName.trim(),
      description: newDescription?.trim(),
      startDate: newStartDate,
      endDate: newEndDate,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  /**
   * Gets the date range of the trip.
   *
   * @returns The trip's date range
   */
  public getDateRange(): IDateRange {
    return createDateRange(this.startDate, this.endDate);
  }

  /**
   * Gets the duration of the trip in days.
   *
   * @returns Number of days (inclusive)
   */
  public getDurationInDays(): number {
    return getDaysInRange(this.getDateRange());
  }

  /**
   * Checks if a given date falls within the trip's date range.
   *
   * @param date - The date to check
   * @returns True if the date is within the trip dates
   */
  public isDateWithinTrip(date: Date): boolean {
    return isDateInRange(date, this.getDateRange());
  }

  /**
   * Checks if the trip is currently active (today is within trip dates).
   *
   * @returns True if the trip is active
   */
  public isActive(): boolean {
    return this.isDateWithinTrip(new Date());
  }

  /**
   * Checks if the trip has started.
   *
   * @returns True if the trip has started
   */
  public hasStarted(): boolean {
    return new Date() >= this.startDate;
  }

  /**
   * Checks if the trip has ended.
   *
   * @returns True if the trip has ended
   */
  public hasEnded(): boolean {
    return new Date() > this.endDate;
  }

  /**
   * Checks if the trip is upcoming (hasn't started yet).
   *
   * @returns True if the trip is upcoming
   */
  public isUpcoming(): boolean {
    return new Date() < this.startDate;
  }

  /**
   * Converts the entity to a plain object for serialization.
   *
   * @returns Plain object representation of the trip
   */
  public toJSON(): ITripProps {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      startDate: this.startDate,
      endDate: this.endDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Validates the trip name.
   *
   * @param name - The name to validate
   * @throws {ValidationError} If name is invalid
   */
  private static validateName(name: string): void {
    if (!name || typeof name !== 'string') {
      throw ValidationError.required('name', 'Trip');
    }

    const trimmedName = name.trim();

    if (trimmedName.length < Trip.MIN_NAME_LENGTH) {
      throw ValidationError.invalidLength(
        'name',
        Trip.MIN_NAME_LENGTH,
        Trip.MAX_NAME_LENGTH,
        trimmedName.length
      );
    }

    if (trimmedName.length > Trip.MAX_NAME_LENGTH) {
      throw ValidationError.invalidLength(
        'name',
        Trip.MIN_NAME_LENGTH,
        Trip.MAX_NAME_LENGTH,
        trimmedName.length
      );
    }
  }

  /**
   * Validates the trip description.
   *
   * @param description - The description to validate
   * @throws {ValidationError} If description is invalid
   */
  private static validateDescription(description: string): void {
    if (description.length > Trip.MAX_DESCRIPTION_LENGTH) {
      throw ValidationError.invalidLength(
        'description',
        undefined,
        Trip.MAX_DESCRIPTION_LENGTH,
        description.length
      );
    }
  }

  /**
   * Validates the trip date range.
   *
   * @param startDate - The start date
   * @param endDate - The end date
   * @throws {ValidationError} If date range is invalid
   */
  private static validateDateRange(startDate: Date, endDate: Date): void {
    if (!startDate || !(startDate instanceof Date) || isNaN(startDate.getTime())) {
      throw ValidationError.required('startDate', 'Trip');
    }

    if (!endDate || !(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw ValidationError.required('endDate', 'Trip');
    }

    if (startDate > endDate) {
      throw ValidationError.invalidDateRange('startDate', 'endDate');
    }
  }

  /**
   * Compares this trip with another for equality.
   *
   * @param other - The other trip to compare
   * @returns True if the trips are equal (same ID)
   */
  public equals(other: Trip): boolean {
    if (!(other instanceof Trip)) {
      return false;
    }
    return this.id === other.id;
  }
}

/**
 * Type alias for backward compatibility with existing code.
 * @deprecated Use Trip class directly
 */
export type TripEntity = Trip;

/**
 * Type alias for create props - backward compatibility.
 * @deprecated Use ITripCreateDTO instead
 */
export type CreateTripProps = ITripCreateDTO & { id?: string };

/**
 * Factory function for backward compatibility.
 * @deprecated Use Trip.create() instead
 *
 * @param props - The trip creation properties
 * @returns A new Trip instance
 */
export function createTrip(props: CreateTripProps): Trip {
  return Trip.create({
    name: props.name,
    description: props.description,
    startDate: props.startDate,
    endDate: props.endDate,
  });
}
