/**
 * @fileoverview Data Transfer Object for updating an existing Consumption record.
 * All fields are optional to support partial updates.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import type { MealType } from './CreateConsumptionDTO';

/**
 * DTO for updating an existing consumption record.
 *
 * @description
 * This interface defines the contract for consumption update requests.
 * Only quantity, mealType, and notes can be updated.
 * Participant, product, and date are immutable after creation.
 *
 * @example
 * ```typescript
 * // Update quantity
 * const updateQuantityDto: UpdateConsumptionDTO = {
 *   quantity: 3,
 * };
 *
 * // Update meal type and notes
 * const updateMealDto: UpdateConsumptionDTO = {
 *   mealType: MealType.DINNER,
 *   notes: 'Changed from lunch to dinner',
 * };
 * ```
 */
export interface UpdateConsumptionDTO {
  /**
   * Updated quantity of the product.
   * @minimum 0
   */
  readonly quantity?: number;

  /**
   * Updated meal type.
   */
  readonly mealType?: MealType;

  /**
   * Updated notes about the consumption.
   * @maxLength 200
   */
  readonly notes?: string;
}
