/**
 * @fileoverview Participant entity for TripFood Manager.
 * Represents a person participating in a trip.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from '../errors';
import { isValidEmail } from '../types';

/**
 * Interface representing the data transfer object for creating a Participant.
 */
export interface IParticipantCreateDTO {
  /** ID of the trip this participant belongs to */
  readonly tripId: string;
  /** Name of the participant */
  readonly name: string;
  /** Optional email address */
  readonly email?: string | undefined;
  /** Optional notes about the participant */
  readonly notes?: string | undefined;
}

/**
 * Interface representing the data transfer object for updating a Participant.
 */
export interface IParticipantUpdateDTO {
  /** New name for the participant */
  readonly name?: string | undefined;
  /** New email for the participant (null to remove) */
  readonly email?: string | null | undefined;
  /** New notes for the participant (null to remove) */
  readonly notes?: string | null | undefined;
}

/**
 * Interface representing the Participant entity properties.
 */
export interface IParticipantProps {
  /** Unique identifier */
  readonly id: string;
  /** ID of the trip this participant belongs to */
  readonly tripId: string;
  /** Name of the participant */
  readonly name: string;
  /** Optional email address */
  readonly email?: string | undefined;
  /** Optional notes about the participant */
  readonly notes?: string | undefined;
  /** Timestamp when the participant was created */
  readonly createdAt: Date;
  /** Timestamp when the participant was last updated */
  readonly updatedAt?: Date | undefined;
}

/**
 * Participant entity representing a person in a trip.
 *
 * @description
 * The Participant entity represents an individual who participates
 * in a trip. Participants can have consumption records and availability
 * settings associated with them.
 *
 * All instances are immutable - updates return new instances.
 *
 * @example
 * ```typescript
 * // Create a new participant
 * const participant = Participant.create({
 *   tripId: 'trip-123',
 *   name: 'John Doe',
 *   email: 'john@example.com',
 * });
 *
 * // Update the participant
 * const updated = participant.update({ notes: 'Vegetarian' });
 * ```
 *
 * @implements {IParticipantProps}
 */
export class Participant implements IParticipantProps {
  /**
   * Minimum length for participant name.
   */
  public static readonly MIN_NAME_LENGTH = 2;

  /**
   * Maximum length for participant name.
   */
  public static readonly MAX_NAME_LENGTH = 100;

  /**
   * Maximum length for participant notes.
   */
  public static readonly MAX_NOTES_LENGTH = 500;

  /**
   * Unique identifier for the participant.
   * @readonly
   */
  public readonly id: string;

  /**
   * ID of the trip this participant belongs to.
   * @readonly
   */
  public readonly tripId: string;

  /**
   * Name of the participant.
   * @readonly
   */
  public readonly name: string;

  /**
   * Optional email address of the participant.
   * @readonly
   */
  public readonly email?: string | undefined;

  /**
   * Optional notes about the participant.
   * @readonly
   */
  public readonly notes?: string | undefined;

  /**
   * Timestamp when the participant was created.
   * @readonly
   */
  public readonly createdAt: Date;

  /**
   * Timestamp when the participant was last updated.
   * @readonly
   */
  public readonly updatedAt?: Date | undefined;

  /**
   * Private constructor to enforce factory method usage.
   *
   * @param props - The participant properties
   */
  private constructor(props: IParticipantProps) {
    this.id = props.id;
    this.tripId = props.tripId;
    this.name = props.name;
    this.email = props.email;
    this.notes = props.notes;
    this.createdAt = new Date(props.createdAt);
    this.updatedAt = props.updatedAt ? new Date(props.updatedAt) : undefined;

    // Freeze the object to ensure immutability
    Object.freeze(this);
  }

  /**
   * Creates a new Participant entity with validation.
   *
   * @param dto - The data transfer object containing participant data
   * @returns A new Participant instance
   * @throws {ValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const participant = Participant.create({
   *   tripId: 'trip-123',
   *   name: 'Jane Smith',
   *   email: 'jane@example.com',
   * });
   * ```
   */
  public static create(dto: IParticipantCreateDTO): Participant {
    // Validate tripId
    Participant.validateTripId(dto.tripId);

    // Validate name
    Participant.validateName(dto.name);

    // Validate email if provided
    if (dto.email !== undefined) {
      Participant.validateEmail(dto.email);
    }

    // Validate notes if provided
    if (dto.notes !== undefined) {
      Participant.validateNotes(dto.notes);
    }

    const now = new Date();

    return new Participant({
      id: uuidv4(),
      tripId: dto.tripId,
      name: dto.name.trim(),
      email: dto.email?.trim().toLowerCase(),
      notes: dto.notes?.trim(),
      createdAt: now,
    });
  }

  /**
   * Reconstructs a Participant entity from persistence data.
   *
   * @param props - The participant properties from persistence
   * @returns A Participant instance
   */
  public static fromPersistence(props: IParticipantProps): Participant {
    return new Participant(props);
  }

  /**
   * Updates the participant with new values, returning a new instance.
   *
   * @param dto - The update data transfer object
   * @returns A new Participant instance with updated values
   * @throws {ValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const updated = participant.update({
   *   name: 'Jane Doe',
   *   notes: 'Allergic to nuts',
   * });
   * ```
   */
  public update(dto: IParticipantUpdateDTO): Participant {
    const newName = dto.name !== undefined ? dto.name : this.name;
    const newEmail = dto.email === null
      ? undefined
      : dto.email !== undefined
        ? dto.email
        : this.email;
    const newNotes = dto.notes === null
      ? undefined
      : dto.notes !== undefined
        ? dto.notes
        : this.notes;

    // Validate updated values
    if (dto.name !== undefined) {
      Participant.validateName(dto.name);
    }

    if (dto.email !== undefined && dto.email !== null) {
      Participant.validateEmail(dto.email);
    }

    if (dto.notes !== undefined && dto.notes !== null) {
      Participant.validateNotes(dto.notes);
    }

    return new Participant({
      id: this.id,
      tripId: this.tripId,
      name: newName.trim(),
      email: newEmail?.trim().toLowerCase(),
      notes: newNotes?.trim(),
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  /**
   * Checks if the participant has an email address.
   *
   * @returns True if the participant has an email
   */
  public hasEmail(): boolean {
    return this.email !== undefined && this.email.length > 0;
  }

  /**
   * Checks if the participant has notes.
   *
   * @returns True if the participant has notes
   */
  public hasNotes(): boolean {
    return this.notes !== undefined && this.notes.length > 0;
  }

  /**
   * Checks if this participant belongs to a specific trip.
   *
   * @param tripId - The trip ID to check
   * @returns True if the participant belongs to the trip
   */
  public belongsToTrip(tripId: string): boolean {
    return this.tripId === tripId;
  }

  /**
   * Converts the entity to a plain object for serialization.
   *
   * @returns Plain object representation of the participant
   */
  public toJSON(): IParticipantProps {
    return {
      id: this.id,
      tripId: this.tripId,
      name: this.name,
      email: this.email,
      notes: this.notes,
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
      throw ValidationError.required('tripId', 'Participant');
    }
  }

  /**
   * Validates the participant name.
   *
   * @param name - The name to validate
   * @throws {ValidationError} If name is invalid
   */
  private static validateName(name: string): void {
    if (!name || typeof name !== 'string') {
      throw ValidationError.required('name', 'Participant');
    }

    const trimmedName = name.trim();

    if (trimmedName.length < Participant.MIN_NAME_LENGTH) {
      throw ValidationError.invalidLength(
        'name',
        Participant.MIN_NAME_LENGTH,
        Participant.MAX_NAME_LENGTH,
        trimmedName.length
      );
    }

    if (trimmedName.length > Participant.MAX_NAME_LENGTH) {
      throw ValidationError.invalidLength(
        'name',
        Participant.MIN_NAME_LENGTH,
        Participant.MAX_NAME_LENGTH,
        trimmedName.length
      );
    }
  }

  /**
   * Validates the email address.
   *
   * @param email - The email to validate
   * @throws {ValidationError} If email is invalid
   */
  private static validateEmail(email: string): void {
    const trimmedEmail = email.trim();

    if (trimmedEmail.length > 0 && !isValidEmail(trimmedEmail)) {
      throw ValidationError.invalidFormat('email', 'valid email address', email);
    }
  }

  /**
   * Validates the notes.
   *
   * @param notes - The notes to validate
   * @throws {ValidationError} If notes are invalid
   */
  private static validateNotes(notes: string): void {
    if (notes.length > Participant.MAX_NOTES_LENGTH) {
      throw ValidationError.invalidLength(
        'notes',
        undefined,
        Participant.MAX_NOTES_LENGTH,
        notes.length
      );
    }
  }

  /**
   * Compares this participant with another for equality.
   *
   * @param other - The other participant to compare
   * @returns True if the participants are equal (same ID)
   */
  public equals(other: Participant): boolean {
    if (!(other instanceof Participant)) {
      return false;
    }
    return this.id === other.id;
  }
}

/**
 * Type alias for backward compatibility.
 * @deprecated Use Participant class directly
 */
export type ParticipantEntity = Participant;

/**
 * Type alias for create props - backward compatibility.
 * @deprecated Use IParticipantCreateDTO instead
 */
export type CreateParticipantProps = IParticipantCreateDTO & { id?: string };

/**
 * Factory function for backward compatibility.
 * @deprecated Use Participant.create() instead
 *
 * @param props - The participant creation properties
 * @returns A new Participant instance
 */
export function createParticipant(props: CreateParticipantProps): Participant {
  return Participant.create({
    tripId: props.tripId,
    name: props.name,
    email: props.email,
    notes: props.notes,
  });
}
