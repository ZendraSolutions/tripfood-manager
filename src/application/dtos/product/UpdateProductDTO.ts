/**
 * @fileoverview Data Transfer Object for updating an existing Product.
 * All fields are optional to support partial updates.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import type { ProductCategory, ProductUnit } from './CreateProductDTO';

/**
 * DTO for updating an existing product in the system.
 *
 * @description
 * This interface defines the contract for product update requests.
 * All fields are optional, allowing for partial updates.
 * Note: tripId cannot be updated after creation.
 *
 * @example
 * ```typescript
 * // Update price
 * const updatePriceDto: UpdateProductDTO = {
 *   estimatedPrice: 2.00,
 * };
 *
 * // Update quantity and notes
 * const updateDetailsDto: UpdateProductDTO = {
 *   defaultQuantityPerPerson: 3,
 *   notes: 'Updated storage instructions',
 * };
 * ```
 */
export interface UpdateProductDTO {
  /**
   * Updated name of the product.
   * If provided, must be non-empty.
   * @minLength 1
   * @maxLength 100
   */
  readonly name?: string;

  /**
   * Updated category of the product.
   */
  readonly category?: ProductCategory;

  /**
   * Updated unit of measurement.
   */
  readonly unit?: ProductUnit;

  /**
   * Updated default quantity per person per day.
   * @minimum 0
   */
  readonly defaultQuantityPerPerson?: number;

  /**
   * Updated estimated price per unit.
   * @minimum 0
   */
  readonly estimatedPrice?: number;

  /**
   * Updated brand preference.
   */
  readonly brand?: string;

  /**
   * Updated notes about the product.
   * @maxLength 500
   */
  readonly notes?: string;

  /**
   * Updated essential status.
   */
  readonly isEssential?: boolean;
}
