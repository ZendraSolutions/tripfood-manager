/**
 * @fileoverview Common type definitions for TripFood Manager.
 * Contains shared types, interfaces, and utility types used across the domain.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

/**
 * Branded type for UUID strings.
 * Provides type safety for ID values.
 *
 * @description
 * This type uses TypeScript's branded types pattern to ensure
 * that UUID strings are explicitly marked and cannot be confused
 * with regular strings.
 *
 * @example
 * ```typescript
 * const id: UUID = 'abc-123' as UUID;
 * const regularString: string = 'abc-123';
 * // These are not interchangeable without explicit casting
 * ```
 */
export type UUID = string & { readonly __brand: 'UUID' };

/**
 * Type guard to check if a string is a valid UUID v4 format.
 *
 * @param value - The value to check
 * @returns True if the value matches UUID v4 format
 */
export function isUUID(value: unknown): value is UUID {
  if (typeof value !== 'string') {
    return false;
  }

  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(value);
}

/**
 * Represents a date range with start and end dates.
 *
 * @description
 * Used for trip duration and date-based queries.
 * Both dates are inclusive.
 */
export interface IDateRange {
  /** Start date of the range (inclusive) */
  readonly startDate: Date;
  /** End date of the range (inclusive) */
  readonly endDate: Date;
}

/**
 * Creates a date range and validates that startDate is before or equal to endDate.
 *
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @returns A validated IDateRange
 * @throws Error if startDate is after endDate
 */
export function createDateRange(startDate: Date, endDate: Date): IDateRange {
  if (startDate > endDate) {
    throw new Error('Start date must be before or equal to end date');
  }

  return {
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  };
}

/**
 * Checks if a date falls within a date range.
 *
 * @param date - The date to check
 * @param range - The date range to check against
 * @returns True if the date is within the range (inclusive)
 */
export function isDateInRange(date: Date, range: IDateRange): boolean {
  const dateTime = date.getTime();
  return dateTime >= range.startDate.getTime() && dateTime <= range.endDate.getTime();
}

/**
 * Gets the number of days in a date range.
 *
 * @param range - The date range
 * @returns Number of days (inclusive)
 */
export function getDaysInRange(range: IDateRange): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const diffInMilliseconds = range.endDate.getTime() - range.startDate.getTime();
  return Math.floor(diffInMilliseconds / millisecondsPerDay) + 1;
}

/**
 * Generates an array of dates within a date range.
 *
 * @param range - The date range
 * @returns Array of dates within the range
 */
export function getDatesInRange(range: IDateRange): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(range.startDate);

  while (currentDate <= range.endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

/**
 * Represents pagination parameters for queries.
 */
export interface IPaginationParams {
  /** Page number (1-based) */
  readonly page: number;
  /** Number of items per page */
  readonly pageSize: number;
}

/**
 * Represents a paginated result set.
 *
 * @typeParam T - The type of items in the result
 */
export interface IPaginatedResult<T> {
  /** Array of items in the current page */
  readonly items: ReadonlyArray<T>;
  /** Total number of items across all pages */
  readonly totalItems: number;
  /** Total number of pages */
  readonly totalPages: number;
  /** Current page number (1-based) */
  readonly currentPage: number;
  /** Number of items per page */
  readonly pageSize: number;
  /** Whether there are more pages after the current one */
  readonly hasNextPage: boolean;
  /** Whether there are pages before the current one */
  readonly hasPreviousPage: boolean;
}

/**
 * Creates a paginated result from an array of items.
 *
 * @typeParam T - The type of items
 * @param items - All items to paginate
 * @param params - Pagination parameters
 * @returns Paginated result
 */
export function paginateItems<T>(
  items: ReadonlyArray<T>,
  params: IPaginationParams
): IPaginatedResult<T> {
  const { page, pageSize } = params;
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentPage = Math.min(Math.max(1, page), Math.max(1, totalPages));

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pageItems = items.slice(startIndex, endIndex);

  return {
    items: pageItems,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

/**
 * Sorting direction for queries.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Represents sorting parameters for queries.
 *
 * @typeParam T - The type being sorted (for type-safe field names)
 */
export interface ISortParams<T> {
  /** Field to sort by */
  readonly field: keyof T;
  /** Sort direction */
  readonly direction: SortDirection;
}

/**
 * Base interface for entity timestamps.
 * All entities should have these timestamps.
 */
export interface ITimestamps {
  /** When the entity was created */
  readonly createdAt: Date;
  /** When the entity was last updated (optional) */
  readonly updatedAt?: Date | undefined;
}

/**
 * Base interface for all domain entities.
 * Provides common structure for entities.
 */
export interface IEntity extends ITimestamps {
  /** Unique identifier for the entity */
  readonly id: string;
}

/**
 * Type for deep readonly objects.
 * Makes all properties and nested properties readonly.
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Utility type to make specific properties optional.
 *
 * @typeParam T - The base type
 * @typeParam K - Keys to make optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility type to make specific properties required.
 *
 * @typeParam T - The base type
 * @typeParam K - Keys to make required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Represents the result of an operation that can fail.
 * Provides a functional approach to error handling.
 *
 * @typeParam T - The type of the success value
 * @typeParam E - The type of the error (defaults to Error)
 */
export type Result<T, E = Error> =
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly error: E };

/**
 * Creates a successful result.
 *
 * @typeParam T - The type of the value
 * @param value - The success value
 * @returns A successful Result
 */
export function success<T>(value: T): Result<T, never> {
  return { success: true, value };
}

/**
 * Creates a failed result.
 *
 * @typeParam E - The type of the error
 * @param error - The error
 * @returns A failed Result
 */
export function failure<E>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Type guard to check if a result is successful.
 *
 * @typeParam T - The success value type
 * @typeParam E - The error type
 * @param result - The result to check
 * @returns True if the result is successful
 */
export function isSuccess<T, E>(
  result: Result<T, E>
): result is { readonly success: true; readonly value: T } {
  return result.success === true;
}

/**
 * Type guard to check if a result is a failure.
 *
 * @typeParam T - The success value type
 * @typeParam E - The error type
 * @param result - The result to check
 * @returns True if the result is a failure
 */
export function isFailure<T, E>(
  result: Result<T, E>
): result is { readonly success: false; readonly error: E } {
  return result.success === false;
}

/**
 * Email format validation regex.
 * Basic email validation pattern.
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates an email address format.
 *
 * @param email - The email to validate
 * @returns True if the email format is valid
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Normalizes a date to the start of the day (00:00:00.000).
 *
 * @param date - The date to normalize
 * @returns A new Date set to the start of the day
 */
export function normalizeToStartOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Normalizes a date to the end of the day (23:59:59.999).
 *
 * @param date - The date to normalize
 * @returns A new Date set to the end of the day
 */
export function normalizeToEndOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(23, 59, 59, 999);
  return normalized;
}

/**
 * Formats a date as ISO date string (YYYY-MM-DD).
 *
 * @param date - The date to format
 * @returns ISO date string
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

/**
 * Parses an ISO date string to a Date object.
 *
 * @param dateString - The ISO date string (YYYY-MM-DD)
 * @returns Parsed Date object
 * @throws Error if the date string is invalid
 */
export function parseISODateString(dateString: string): Date {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: '${dateString}'`);
  }

  return date;
}
