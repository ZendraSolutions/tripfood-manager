/**
 * @fileoverview Availability entity for TripFood Manager.
 * Represents a participant's availability for meals on a specific date.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from '../errors';
import { MealType, isMealType, MEAL_TYPES, normalizeToStartOfDay, sortMealsByOrder } from '../types';

/**
 * Interface representing the data transfer object for creating an Availability.
 */
export interface IAvailabilityCreateDTO {
  /** ID of the participant */
  readonly participantId: string;
  /** ID of the trip */
  readonly tripId: string;
  /** Date of availability */
  readonly date: Date;
  /** Array of meals the participant will be present for */
  readonly meals: ReadonlyArray<MealType>;
}

/**
 * Interface representing the data transfer object for updating an Availability.
 */
export interface IAvailabilityUpdateDTO {
  /** New date for the availability */
  readonly date?: Date;
  /** New meals array */
  readonly meals?: ReadonlyArray<MealType>;
}

/**
 * Interface representing the Availability entity properties.
 */
export interface IAvailabilityProps {
  /** Unique identifier */
  readonly id: string;
  /** ID of the participant */
  readonly participantId: string;
  /** ID of the trip */
  readonly tripId: string;
  /** Date of availability */
  readonly date: Date;
  /** Array of meals the participant will be present for */
  readonly meals: ReadonlyArray<MealType>;
  /** Timestamp when the availability was created */
  readonly createdAt: Date;
  /** Timestamp when the availability was last updated */
  readonly updatedAt?: Date;
}

/**
 * Availability entity representing when a participant is available for meals.
 *
 * @description
 * The Availability entity tracks which meals a participant will attend
 * on a specific date during a trip. This information is used to calculate
 * how much food/beverages are needed.
 *
 * All instances are immutable - updates return new instances.
 *
 * @example
 * ```typescript
 * // Create a new availability record
 * const availability = Availability.create({
 *   participantId: 'participant-123',
 *   tripId: 'trip-456',
 *   date: new Date('2024-07-15'),
 *   meals: ['breakfast', 'lunch', 'dinner'],
 * });
 *
 * // Update the availability
 * const updated = availability.update({ meals: ['lunch', 'dinner'] });
 * ```
 *
 * @implements {IAvailabilityProps}
 */
export class Availability implements IAvailabilityProps {
  /**
   * Unique identifier for the availability record.
   * @readonly
   */
  public readonly id: string;

  /**
   * ID of the participant.
   * @readonly
   */
  public readonly participantId: string;

  /**
   * ID of the trip.
   * @readonly
   */
  public readonly tripId: string;

  /**
   * Date of availability.
   * @readonly
   */
  public readonly date: Date;

  /**
   * Array of meals the participant will be present for.
   * @readonly
   */
  public readonly meals: ReadonlyArray<MealType>;

  /**
   * Timestamp when the availability was created.
   * @readonly
   */
  public readonly createdAt: Date;

  /**
   * Timestamp when the availability was last updated.
   * @readonly
   */
  public readonly updatedAt?: Date;

  /**
   * Private constructor to enforce factory method usage.
   *
   * @param props - The availability properties
   */
  private constructor(props: IAvailabilityProps) {
    this.id = props.id;
    this.participantId = props.participantId;
    this.tripId = props.tripId;
    this.date = normalizeToStartOfDay(new Date(props.date));
    // Sort and deduplicate meals
    this.meals = Object.freeze(
      sortMealsByOrder([...new Set(props.meals)])
    );
    this.createdAt = new Date(props.createdAt);
    this.updatedAt = props.updatedAt ? new Date(props.updatedAt) : undefined;

    // Freeze the object to ensure immutability
    Object.freeze(this);
  }

  /**
   * Creates a new Availability entity with validation.
   *
   * @param dto - The data transfer object containing availability data
   * @returns A new Availability instance
   * @throws {ValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const availability = Availability.create({
   *   participantId: 'participant-123',
   *   tripId: 'trip-456',
   *   date: new Date('2024-07-15'),
   *   meals: ['breakfast', 'dinner'],
   * });
   * ```
   */
  public static create(dto: IAvailabilityCreateDTO): Availability {
    // Validate participantId
    Availability.validateParticipantId(dto.participantId);

    // Validate tripId
    Availability.validateTripId(dto.tripId);

    // Validate date
    Availability.validateDate(dto.date);

    // Validate meals
    Availability.validateMeals(dto.meals);

    const now = new Date();

    return new Availability({
      id: uuidv4(),
      participantId: dto.participantId,
      tripId: dto.tripId,
      date: dto.date,
      meals: dto.meals,
      createdAt: now,
    });
  }

  /**
   * Reconstructs an Availability entity from persistence data.
   *
   * @param props - The availability properties from persistence
   * @returns An Availability instance
   */
  public static fromPersistence(props: IAvailabilityProps): Availability {
    return new Availability(props);
  }

  /**
   * Updates the availability with new values, returning a new instance.
   *
   * @param dto - The update data transfer object
   * @returns A new Availability instance with updated values
   * @throws {ValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const updated = availability.update({
   *   meals: ['breakfast', 'lunch'],
   * });
   * ```
   */
  public update(dto: IAvailabilityUpdateDTO): Availability {
    const newDate = dto.date !== undefined ? dto.date : this.date;
    const newMeals = dto.meals !== undefined ? dto.meals : this.meals;

    // Validate updated values
    if (dto.date !== undefined) {
      Availability.validateDate(dto.date);
    }

    if (dto.meals !== undefined) {
      Availability.validateMeals(dto.meals);
    }

    return new Availability({
      id: this.id,
      participantId: this.participantId,
      tripId: this.tripId,
      date: newDate,
      meals: newMeals,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  /**
   * Checks if the participant is available for a specific meal.
   *
   * @param meal - The meal to check
   * @returns True if the participant is available for the meal
   */
  public isAvailableForMeal(meal: MealType): boolean {
    return this.meals.includes(meal);
  }

  /**
   * Checks if the participant is available for all meals.
   *
   * @returns True if the participant is available for all meals
   */
  public isAvailableForAllMeals(): boolean {
    return MEAL_TYPES.every((meal) => this.meals.includes(meal));
  }

  /**
   * Checks if the participant is not available for any meals.
   *
   * @returns True if the participant is not available for any meals
   */
  public isNotAvailable(): boolean {
    return this.meals.length === 0;
  }

  /**
   * Gets the number of meals the participant is available for.
   *
   * @returns The count of meals
   */
  public getMealCount(): number {
    return this.meals.length;
  }

  /**
   * Adds a meal to the availability, returning a new instance.
   *
   * @param meal - The meal to add
   * @returns A new Availability instance with the meal added
   */
  public addMeal(meal: MealType): Availability {
    if (this.isAvailableForMeal(meal)) {
      return this; // Already available for this meal
    }

    return this.update({
      meals: [...this.meals, meal],
    });
  }

  /**
   * Removes a meal from the availability, returning a new instance.
   *
   * @param meal - The meal to remove
   * @returns A new Availability instance with the meal removed
   */
  public removeMeal(meal: MealType): Availability {
    if (!this.isAvailableForMeal(meal)) {
      return this; // Not available for this meal anyway
    }

    return this.update({
      meals: this.meals.filter((m) => m !== meal),
    });
  }

  /**
   * Sets availability for all meals.
   *
   * @returns A new Availability instance with all meals
   */
  public setAvailableForAllMeals(): Availability {
    return this.update({
      meals: [...MEAL_TYPES],
    });
  }

  /**
   * Clears all meal availability.
   *
   * @returns A new Availability instance with no meals
   */
  public clearAllMeals(): Availability {
    return this.update({
      meals: [],
    });
  }

  /**
   * Checks if this availability belongs to a specific trip.
   *
   * @param tripId - The trip ID to check
   * @returns True if the availability belongs to the trip
   */
  public belongsToTrip(tripId: string): boolean {
    return this.tripId === tripId;
  }

  /**
   * Checks if this availability is for a specific participant.
   *
   * @param participantId - The participant ID to check
   * @returns True if the availability is for the participant
   */
  public isForParticipant(participantId: string): boolean {
    return this.participantId === participantId;
  }

  /**
   * Checks if this availability is for a specific date.
   *
   * @param date - The date to check
   * @returns True if the availability is for the date
   */
  public isOnDate(date: Date): boolean {
    const normalizedInput = normalizeToStartOfDay(date);
    return this.date.getTime() === normalizedInput.getTime();
  }

  /**
   * Gets a formatted string representation of the date.
   *
   * @returns ISO date string (YYYY-MM-DD)
   */
  public getDateString(): string {
    return this.date.toISOString().split('T')[0];
  }

  /**
   * Converts the entity to a plain object for serialization.
   *
   * @returns Plain object representation of the availability
   */
  public toJSON(): IAvailabilityProps {
    return {
      id: this.id,
      participantId: this.participantId,
      tripId: this.tripId,
      date: this.date,
      meals: [...this.meals],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Validates the participant ID.
   *
   * @param participantId - The participant ID to validate
   * @throws {ValidationError} If participantId is invalid
   */
  private static validateParticipantId(participantId: string): void {
    if (!participantId || typeof participantId !== 'string' || participantId.trim().length === 0) {
      throw ValidationError.required('participantId', 'Availability');
    }
  }

  /**
   * Validates the trip ID.
   *
   * @param tripId - The trip ID to validate
   * @throws {ValidationError} If tripId is invalid
   */
  private static validateTripId(tripId: string): void {
    if (!tripId || typeof tripId !== 'string' || tripId.trim().length === 0) {
      throw ValidationError.required('tripId', 'Availability');
    }
  }

  /**
   * Validates the date.
   *
   * @param date - The date to validate
   * @throws {ValidationError} If date is invalid
   */
  private static validateDate(date: Date): void {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      throw ValidationError.required('date', 'Availability');
    }
  }

  /**
   * Validates the meals array.
   *
   * @param meals - The meals to validate
   * @throws {ValidationError} If meals are invalid
   */
  private static validateMeals(meals: ReadonlyArray<MealType>): void {
    if (!Array.isArray(meals)) {
      throw new ValidationError(
        'meals must be an array',
        'meals',
        'type'
      );
    }

    for (const meal of meals) {
      if (!isMealType(meal)) {
        throw new ValidationError(
          `Invalid meal type: '${String(meal)}'. Valid types are: ${MEAL_TYPES.join(', ')}`,
          'meals',
          'enum'
        );
      }
    }
  }

  /**
   * Compares this availability with another for equality.
   *
   * @param other - The other availability to compare
   * @returns True if the availabilities are equal (same ID)
   */
  public equals(other: Availability): boolean {
    if (!(other instanceof Availability)) {
      return false;
    }
    return this.id === other.id;
  }
}

/**
 * Type alias for backward compatibility.
 * @deprecated Use Availability class directly
 */
export type AvailabilityEntity = Availability;

/**
 * Type alias for create props - backward compatibility.
 * @deprecated Use IAvailabilityCreateDTO instead
 */
export interface CreateAvailabilityProps {
  id?: string;
  participantId: string;
  tripId: string;
  date: Date;
  meals: MealType[];
}

/**
 * Factory function for backward compatibility.
 * @deprecated Use Availability.create() instead
 *
 * @param props - The availability creation properties
 * @returns A new Availability instance
 */
export function createAvailability(props: CreateAvailabilityProps): Availability {
  return Availability.create({
    participantId: props.participantId,
    tripId: props.tripId,
    date: props.date,
    meals: props.meals,
  });
}
