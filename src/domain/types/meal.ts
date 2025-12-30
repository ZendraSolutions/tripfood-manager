/**
 * @fileoverview Meal type definitions for TripFood Manager.
 * Defines the different meal types supported by the application.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

/**
 * Represents the different meal types in a day.
 *
 * @description
 * This type defines all possible meal types that can be tracked
 * in the application. Each meal represents a different eating
 * occasion during the day.
 *
 * - `breakfast`: Morning meal
 * - `lunch`: Midday meal
 * - `dinner`: Evening meal
 * - `snack`: Between-meal eating occasion
 */
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/**
 * Array of all valid meal types.
 * Useful for validation and iteration.
 *
 * @example
 * ```typescript
 * if (MEAL_TYPES.includes(userInput as MealType)) {
 *   // valid meal type
 * }
 * ```
 */
export const MEAL_TYPES: ReadonlyArray<MealType> = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
] as const;

/**
 * Display names for each meal type.
 * Useful for UI rendering.
 *
 * @example
 * ```typescript
 * const displayName = MEAL_TYPE_DISPLAY_NAMES['breakfast']; // 'Breakfast'
 * ```
 */
export const MEAL_TYPE_DISPLAY_NAMES: Readonly<Record<MealType, string>> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
} as const;

/**
 * Order of meals in a day.
 * Useful for sorting and displaying meals in chronological order.
 */
export const MEAL_TYPE_ORDER: Readonly<Record<MealType, number>> = {
  breakfast: 1,
  lunch: 2,
  snack: 3,
  dinner: 4,
} as const;

/**
 * Type guard to check if a value is a valid MealType.
 *
 * @param value - The value to check
 * @returns True if the value is a valid MealType
 *
 * @example
 * ```typescript
 * const input: unknown = 'breakfast';
 * if (isMealType(input)) {
 *   // input is now typed as MealType
 *   console.log(input.toUpperCase());
 * }
 * ```
 */
export function isMealType(value: unknown): value is MealType {
  return typeof value === 'string' && MEAL_TYPES.includes(value as MealType);
}

/**
 * Validates and returns a MealType or throws an error.
 *
 * @param value - The value to validate
 * @returns The validated MealType
 * @throws Error if the value is not a valid MealType
 *
 * @example
 * ```typescript
 * const meal = parseMealType('lunch'); // MealType
 * const invalid = parseMealType('brunch'); // throws Error
 * ```
 */
export function parseMealType(value: unknown): MealType {
  if (!isMealType(value)) {
    throw new Error(
      `Invalid meal type: '${String(value)}'. Valid types are: ${MEAL_TYPES.join(', ')}`
    );
  }
  return value;
}

/**
 * Sorts meals by their chronological order in a day.
 *
 * @param meals - Array of meal types to sort
 * @returns Sorted array of meal types
 *
 * @example
 * ```typescript
 * const meals: MealType[] = ['dinner', 'breakfast', 'lunch'];
 * const sorted = sortMealsByOrder(meals); // ['breakfast', 'lunch', 'dinner']
 * ```
 */
export function sortMealsByOrder(meals: ReadonlyArray<MealType>): MealType[] {
  return [...meals].sort((a, b) => MEAL_TYPE_ORDER[a] - MEAL_TYPE_ORDER[b]);
}
