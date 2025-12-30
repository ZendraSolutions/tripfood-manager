/**
 * @fileoverview Data Transfer Object for creating a new Product.
 * Contains all required and optional fields for product creation.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import type { ProductCategory, ProductUnit } from '@domain/types';

// Re-export domain types for consumers of this DTO
export type { ProductCategory, ProductType, ProductUnit } from '@domain/types';

/**
 * DTO for creating a new product in the system.
 *
 * @description
 * This interface defines the contract for product creation requests.
 * Products represent items that can be consumed during a trip.
 *
 * @example
 * ```typescript
 * const createProductDto: CreateProductDTO = {
 *   tripId: 'trip-123',
 *   name: 'Mineral Water',
 *   category: ProductCategory.BEVERAGES,
 *   unit: ProductUnit.BOTTLE,
 *   defaultQuantityPerPerson: 2,
 *   estimatedPrice: 1.50,
 * };
 * ```
 */
export interface CreateProductDTO {
  /**
   * ID of the trip this product belongs to.
   * Must reference an existing trip.
   */
  readonly tripId: string;

  /**
   * Name of the product.
   * Must be non-empty and descriptive.
   * @minLength 1
   * @maxLength 100
   */
  readonly name: string;

  /**
   * Category of the product for organization.
   */
  readonly category: ProductCategory;

  /**
   * Unit of measurement for the product.
   */
  readonly unit: ProductUnit;

  /**
   * Default quantity to allocate per person per day.
   * Used as a base for calculating shopping lists.
   * @minimum 0
   */
  readonly defaultQuantityPerPerson: number;

  /**
   * Estimated price per unit.
   * Used for budget calculations.
   * @minimum 0
   */
  readonly estimatedPrice?: number;

  /**
   * Optional brand preference.
   */
  readonly brand?: string;

  /**
   * Optional notes about the product.
   * Can include preparation instructions, storage info, etc.
   * @maxLength 500
   */
  readonly notes?: string;

  /**
   * Whether this product is essential (must-have) or optional.
   * Default is true (essential).
   */
  readonly isEssential?: boolean;
}
