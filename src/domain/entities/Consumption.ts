/**
 * @fileoverview Consumption entity for TripFood Manager.
 * Represents a record of product consumption by a participant.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from '../errors';
import { MealType, isMealType, MEAL_TYPES, normalizeToStartOfDay } from '../types';

/**
 * Interface representing the data transfer object for creating a Consumption.
 */
export interface IConsumptionCreateDTO {
  /** ID of the trip */
  readonly tripId: string;
  /** ID of the participant who consumed */
  readonly participantId: string;
  /** ID of the product consumed */
  readonly productId: string;
  /** Date of consumption */
  readonly date: Date;
  /** Meal type */
  readonly meal: MealType;
  /** Quantity consumed */
  readonly quantity: number;
}

/**
 * Interface representing the data transfer object for updating a Consumption.
 */
export interface IConsumptionUpdateDTO {
  /** New date for the consumption */
  readonly date?: Date;
  /** New meal type */
  readonly meal?: MealType;
  /** New quantity */
  readonly quantity?: number;
}

/**
 * Interface representing the Consumption entity properties.
 */
export interface IConsumptionProps {
  /** Unique identifier */
  readonly id: string;
  /** ID of the trip */
  readonly tripId: string;
  /** ID of the participant who consumed */
  readonly participantId: string;
  /** ID of the product consumed */
  readonly productId: string;
  /** Date of consumption */
  readonly date: Date;
  /** Meal type */
  readonly meal: MealType;
  /** Quantity consumed */
  readonly quantity: number;
  /** Timestamp when the record was created */
  readonly createdAt: Date;
  /** Timestamp when the record was last updated */
  readonly updatedAt?: Date;
}

/**
 * Consumption entity representing a consumption record.
 *
 * @description
 * The Consumption entity tracks when a participant consumes a product
 * during a trip. It records the date, meal type, and quantity consumed.
 *
 * All instances are immutable - updates return new instances.
 *
 * @example
 * ```typescript
 * // Create a new consumption record
 * const consumption = Consumption.create({
 *   tripId: 'trip-123',
 *   participantId: 'participant-456',
 *   productId: 'product-789',
 *   date: new Date('2024-07-15'),
 *   meal: 'lunch',
 *   quantity: 2,
 * });
 *
 * // Update the consumption
 * const updated = consumption.update({ quantity: 3 });
 * ```
 *
 * @implements {IConsumptionProps}
 */
export class Consumption implements IConsumptionProps {
  /**
   * Minimum quantity that can be consumed.
   */
  public static readonly MIN_QUANTITY = 0.01;

  /**
   * Maximum quantity that can be consumed.
   */
  public static readonly MAX_QUANTITY = 10000;

  /**
   * Unique identifier for the consumption record.
   * @readonly
   */
  public readonly id: string;

  /**
   * ID of the trip this consumption belongs to.
   * @readonly
   */
  public readonly tripId: string;

  /**
   * ID of the participant who consumed.
   * @readonly
   */
  public readonly participantId: string;

  /**
   * ID of the product consumed.
   * @readonly
   */
  public readonly productId: string;

  /**
   * Date of consumption.
   * @readonly
   */
  public readonly date: Date;

  /**
   * Meal type (breakfast, lunch, dinner, snack).
   * @readonly
   */
  public readonly meal: MealType;

  /**
   * Quantity consumed.
   * @readonly
   */
  public readonly quantity: number;

  /**
   * Timestamp when the record was created.
   * @readonly
   */
  public readonly createdAt: Date;

  /**
   * Timestamp when the record was last updated.
   * @readonly
   */
  public readonly updatedAt?: Date;

  /**
   * Private constructor to enforce factory method usage.
   *
   * @param props - The consumption properties
   */
  private constructor(props: IConsumptionProps) {
    this.id = props.id;
    this.tripId = props.tripId;
    this.participantId = props.participantId;
    this.productId = props.productId;
    this.date = normalizeToStartOfDay(new Date(props.date));
    this.meal = props.meal;
    this.quantity = props.quantity;
    this.createdAt = new Date(props.createdAt);
    this.updatedAt = props.updatedAt ? new Date(props.updatedAt) : undefined;

    // Freeze the object to ensure immutability
    Object.freeze(this);
  }

  /**
   * Creates a new Consumption entity with validation.
   *
   * @param dto - The data transfer object containing consumption data
   * @returns A new Consumption instance
   * @throws {ValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const consumption = Consumption.create({
   *   tripId: 'trip-123',
   *   participantId: 'participant-456',
   *   productId: 'product-789',
   *   date: new Date('2024-07-15'),
   *   meal: 'dinner',
   *   quantity: 1,
   * });
   * ```
   */
  public static create(dto: IConsumptionCreateDTO): Consumption {
    // Validate tripId
    Consumption.validateTripId(dto.tripId);

    // Validate participantId
    Consumption.validateParticipantId(dto.participantId);

    // Validate productId
    Consumption.validateProductId(dto.productId);

    // Validate date
    Consumption.validateDate(dto.date);

    // Validate meal
    Consumption.validateMeal(dto.meal);

    // Validate quantity
    Consumption.validateQuantity(dto.quantity);

    const now = new Date();

    return new Consumption({
      id: uuidv4(),
      tripId: dto.tripId,
      participantId: dto.participantId,
      productId: dto.productId,
      date: dto.date,
      meal: dto.meal,
      quantity: dto.quantity,
      createdAt: now,
    });
  }

  /**
   * Reconstructs a Consumption entity from persistence data.
   *
   * @param props - The consumption properties from persistence
   * @returns A Consumption instance
   */
  public static fromPersistence(props: IConsumptionProps): Consumption {
    return new Consumption(props);
  }

  /**
   * Updates the consumption with new values, returning a new instance.
   *
   * @param dto - The update data transfer object
   * @returns A new Consumption instance with updated values
   * @throws {ValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const updated = consumption.update({
   *   meal: 'dinner',
   *   quantity: 2.5,
   * });
   * ```
   */
  public update(dto: IConsumptionUpdateDTO): Consumption {
    const newDate = dto.date !== undefined ? dto.date : this.date;
    const newMeal = dto.meal !== undefined ? dto.meal : this.meal;
    const newQuantity = dto.quantity !== undefined ? dto.quantity : this.quantity;

    // Validate updated values
    if (dto.date !== undefined) {
      Consumption.validateDate(dto.date);
    }

    if (dto.meal !== undefined) {
      Consumption.validateMeal(dto.meal);
    }

    if (dto.quantity !== undefined) {
      Consumption.validateQuantity(dto.quantity);
    }

    return new Consumption({
      id: this.id,
      tripId: this.tripId,
      participantId: this.participantId,
      productId: this.productId,
      date: newDate,
      meal: newMeal,
      quantity: newQuantity,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  /**
   * Checks if this consumption belongs to a specific trip.
   *
   * @param tripId - The trip ID to check
   * @returns True if the consumption belongs to the trip
   */
  public belongsToTrip(tripId: string): boolean {
    return this.tripId === tripId;
  }

  /**
   * Checks if this consumption was made by a specific participant.
   *
   * @param participantId - The participant ID to check
   * @returns True if the consumption was made by the participant
   */
  public isFromParticipant(participantId: string): boolean {
    return this.participantId === participantId;
  }

  /**
   * Checks if this consumption is for a specific product.
   *
   * @param productId - The product ID to check
   * @returns True if the consumption is for the product
   */
  public isForProduct(productId: string): boolean {
    return this.productId === productId;
  }

  /**
   * Checks if this consumption occurred on a specific date.
   *
   * @param date - The date to check
   * @returns True if the consumption occurred on the date
   */
  public isOnDate(date: Date): boolean {
    const normalizedInput = normalizeToStartOfDay(date);
    return this.date.getTime() === normalizedInput.getTime();
  }

  /**
   * Checks if this consumption was for a specific meal.
   *
   * @param meal - The meal type to check
   * @returns True if the consumption was for the meal
   */
  public isForMeal(meal: MealType): boolean {
    return this.meal === meal;
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
   * @returns Plain object representation of the consumption
   */
  public toJSON(): IConsumptionProps {
    return {
      id: this.id,
      tripId: this.tripId,
      participantId: this.participantId,
      productId: this.productId,
      date: this.date,
      meal: this.meal,
      quantity: this.quantity,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Validates the trip ID.
   *
   * @param tripId - The trip ID to validate
   * @throws {ValidationError} If tripId is invalid
   */
  private static validateTripId(tripId: string): void {
    if (!tripId || typeof tripId !== 'string' || tripId.trim().length === 0) {
      throw ValidationError.required('tripId', 'Consumption');
    }
  }

  /**
   * Validates the participant ID.
   *
   * @param participantId - The participant ID to validate
   * @throws {ValidationError} If participantId is invalid
   */
  private static validateParticipantId(participantId: string): void {
    if (!participantId || typeof participantId !== 'string' || participantId.trim().length === 0) {
      throw ValidationError.required('participantId', 'Consumption');
    }
  }

  /**
   * Validates the product ID.
   *
   * @param productId - The product ID to validate
   * @throws {ValidationError} If productId is invalid
   */
  private static validateProductId(productId: string): void {
    if (!productId || typeof productId !== 'string' || productId.trim().length === 0) {
      throw ValidationError.required('productId', 'Consumption');
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
      throw ValidationError.required('date', 'Consumption');
    }
  }

  /**
   * Validates the meal type.
   *
   * @param meal - The meal to validate
   * @throws {ValidationError} If meal is invalid
   */
  private static validateMeal(meal: MealType): void {
    if (!isMealType(meal)) {
      throw new ValidationError(
        `Invalid meal type: '${String(meal)}'. Valid types are: ${MEAL_TYPES.join(', ')}`,
        'meal',
        'enum'
      );
    }
  }

  /**
   * Validates the quantity.
   *
   * @param quantity - The quantity to validate
   * @throws {ValidationError} If quantity is invalid
   */
  private static validateQuantity(quantity: number): void {
    if (typeof quantity !== 'number' || isNaN(quantity)) {
      throw ValidationError.invalidFormat('quantity', 'number');
    }

    if (quantity < Consumption.MIN_QUANTITY || quantity > Consumption.MAX_QUANTITY) {
      throw ValidationError.outOfRange(
        'quantity',
        Consumption.MIN_QUANTITY,
        Consumption.MAX_QUANTITY,
        quantity
      );
    }
  }

  /**
   * Compares this consumption with another for equality.
   *
   * @param other - The other consumption to compare
   * @returns True if the consumptions are equal (same ID)
   */
  public equals(other: Consumption): boolean {
    if (!(other instanceof Consumption)) {
      return false;
    }
    return this.id === other.id;
  }
}

/**
 * Type alias for backward compatibility.
 * @deprecated Use Consumption class directly
 */
export type ConsumptionEntity = Consumption;

/**
 * Re-export MealType from types for backward compatibility.
 * @deprecated Import from '../types' instead
 */
export type { MealType } from '../types';

/**
 * Type alias for create props - backward compatibility.
 * @deprecated Use IConsumptionCreateDTO instead
 */
export interface CreateConsumptionProps {
  id?: string;
  tripId: string;
  participantId: string;
  productId: string;
  date: Date;
  meal: MealType;
  quantity: number;
}

/**
 * Factory function for backward compatibility.
 * @deprecated Use Consumption.create() instead
 *
 * @param props - The consumption creation properties
 * @returns A new Consumption instance
 */
export function createConsumption(props: CreateConsumptionProps): Consumption {
  return Consumption.create({
    tripId: props.tripId,
    participantId: props.participantId,
    productId: props.productId,
    date: props.date,
    meal: props.meal,
    quantity: props.quantity,
  });
}
