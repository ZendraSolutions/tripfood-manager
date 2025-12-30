/**
 * @fileoverview Data Transfer Object for Product response data.
 * Represents the product information returned to clients.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import type { ProductCategory, ProductUnit } from './CreateProductDTO';

/**
 * DTO representing product data in API responses.
 *
 * @description
 * This interface defines the structure of product data returned to clients.
 * It includes all product properties along with metadata.
 *
 * @example
 * ```typescript
 * const productResponse: ProductResponseDTO = {
 *   id: 'product-123',
 *   tripId: 'trip-456',
 *   name: 'Mineral Water',
 *   category: ProductCategory.BEVERAGES,
 *   unit: ProductUnit.BOTTLE,
 *   defaultQuantityPerPerson: 2,
 *   estimatedPrice: 1.50,
 *   brand: 'Spring Valley',
 *   notes: 'Store in cool place',
 *   isEssential: true,
 *   createdAt: new Date('2024-01-15'),
 *   updatedAt: new Date('2024-01-20'),
 * };
 * ```
 */
export interface ProductResponseDTO {
  /**
   * Unique identifier of the product.
   */
  readonly id: string;

  /**
   * ID of the trip this product belongs to.
   */
  readonly tripId: string;

  /**
   * Name of the product.
   */
  readonly name: string;

  /**
   * Category of the product.
   */
  readonly category: ProductCategory;

  /**
   * Unit of measurement.
   */
  readonly unit: ProductUnit;

  /**
   * Default quantity per person per day.
   */
  readonly defaultQuantityPerPerson: number;

  /**
   * Estimated price per unit.
   */
  readonly estimatedPrice?: number;

  /**
   * Brand preference.
   */
  readonly brand?: string;

  /**
   * Notes about the product.
   */
  readonly notes?: string;

  /**
   * Whether the product is essential.
   */
  readonly isEssential: boolean;

  /**
   * Timestamp when the product was created.
   */
  readonly createdAt: Date;

  /**
   * Timestamp when the product was last updated.
   */
  readonly updatedAt: Date;
}

/**
 * DTO for product with consumption summary.
 *
 * @description
 * Extended product response that includes consumption statistics.
 */
export interface ProductWithConsumptionDTO extends ProductResponseDTO {
  /**
   * Total quantity needed for the entire trip.
   */
  readonly totalQuantityNeeded: number;

  /**
   * Total estimated cost for this product.
   */
  readonly totalEstimatedCost: number;

  /**
   * Number of consumption records for this product.
   */
  readonly consumptionCount: number;
}
