/**
 * @fileoverview Data Transfer Objects for Shopping List functionality.
 * Contains DTOs for shopping list generation and display.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import type { ProductCategory, ProductUnit } from '../product';

/**
 * DTO for a single quantity by date entry.
 *
 * @description
 * Represents the quantity needed for a specific date.
 */
export interface QuantityByDateDTO {
  /**
   * The date for this quantity.
   */
  readonly date: Date;

  /**
   * Quantity needed for this date.
   */
  readonly quantity: number;

  /**
   * Number of participants available on this date.
   */
  readonly participantCount: number;
}

/**
 * DTO for a single item in the shopping list.
 *
 * @description
 * Represents a product with its total quantity needed and breakdown by date.
 *
 * @example
 * ```typescript
 * const shoppingItem: ShoppingListItemDTO = {
 *   productId: 'product-123',
 *   productName: 'Mineral Water',
 *   category: ProductCategory.BEVERAGES,
 *   totalQuantity: 42,
 *   unit: ProductUnit.BOTTLE,
 *   estimatedPrice: 1.50,
 *   totalEstimatedCost: 63.00,
 *   isEssential: true,
 *   byDate: [
 *     { date: new Date('2024-07-15'), quantity: 14, participantCount: 7 },
 *     { date: new Date('2024-07-16'), quantity: 14, participantCount: 7 },
 *     { date: new Date('2024-07-17'), quantity: 14, participantCount: 7 },
 *   ],
 * };
 * ```
 */
export interface ShoppingListItemDTO {
  /**
   * Unique identifier of the product.
   */
  readonly productId: string;

  /**
   * Name of the product.
   */
  readonly productName: string;

  /**
   * Category of the product.
   */
  readonly category: ProductCategory;

  /**
   * Total quantity needed for the entire trip.
   */
  readonly totalQuantity: number;

  /**
   * Unit of measurement.
   */
  readonly unit: ProductUnit;

  /**
   * Estimated price per unit.
   */
  readonly estimatedPrice?: number;

  /**
   * Total estimated cost (quantity * price).
   */
  readonly totalEstimatedCost?: number;

  /**
   * Whether this is an essential item.
   */
  readonly isEssential: boolean;

  /**
   * Brand preference, if any.
   */
  readonly brand?: string;

  /**
   * Notes about the product.
   */
  readonly notes?: string;

  /**
   * Breakdown of quantities by date.
   */
  readonly byDate: ReadonlyArray<QuantityByDateDTO>;
}

/**
 * DTO for shopping list items grouped by category.
 *
 * @description
 * Groups shopping list items by their product category.
 */
export interface ShoppingListByCategoryDTO {
  /**
   * Product category for this group.
   */
  readonly category: ProductCategory;

  /**
   * Display name of the category.
   */
  readonly categoryDisplayName: string;

  /**
   * Items in this category.
   */
  readonly items: ReadonlyArray<ShoppingListItemDTO>;

  /**
   * Total estimated cost for this category.
   */
  readonly categoryTotalCost: number;

  /**
   * Number of items in this category.
   */
  readonly itemCount: number;
}

/**
 * DTO for the complete shopping list.
 *
 * @description
 * Represents the complete shopping list for a trip,
 * including all items, totals, and metadata.
 *
 * @example
 * ```typescript
 * const shoppingList: ShoppingListDTO = {
 *   tripId: 'trip-123',
 *   tripName: 'Summer Beach Trip',
 *   startDate: new Date('2024-07-15'),
 *   endDate: new Date('2024-07-20'),
 *   totalDays: 6,
 *   participantCount: 7,
 *   items: [...],
 *   byCategory: [...],
 *   totalItems: 25,
 *   totalEstimatedCost: 450.00,
 *   essentialItemsCount: 20,
 *   optionalItemsCount: 5,
 *   generatedAt: new Date(),
 * };
 * ```
 */
export interface ShoppingListDTO {
  /**
   * ID of the trip this shopping list is for.
   */
  readonly tripId: string;

  /**
   * Name of the trip.
   */
  readonly tripName: string;

  /**
   * Start date of the trip.
   */
  readonly startDate: Date;

  /**
   * End date of the trip.
   */
  readonly endDate: Date;

  /**
   * Total number of days in the trip.
   */
  readonly totalDays: number;

  /**
   * Total number of participants.
   */
  readonly participantCount: number;

  /**
   * Flat list of all shopping items.
   */
  readonly items: ReadonlyArray<ShoppingListItemDTO>;

  /**
   * Items grouped by category.
   */
  readonly byCategory: ReadonlyArray<ShoppingListByCategoryDTO>;

  /**
   * Total number of unique items.
   */
  readonly totalItems: number;

  /**
   * Total estimated cost for all items.
   */
  readonly totalEstimatedCost: number;

  /**
   * Count of essential items.
   */
  readonly essentialItemsCount: number;

  /**
   * Count of optional items.
   */
  readonly optionalItemsCount: number;

  /**
   * Timestamp when the list was generated.
   */
  readonly generatedAt: Date;
}

/**
 * DTO for shopping list generation options.
 *
 * @description
 * Options to customize shopping list generation.
 */
export interface GenerateShoppingListOptionsDTO {
  /**
   * ID of the trip to generate the list for.
   */
  readonly tripId: string;

  /**
   * Whether to include only essential items.
   * Default is false (include all items).
   */
  readonly essentialOnly?: boolean;

  /**
   * Specific date range to consider (subset of trip dates).
   */
  readonly dateRange?: {
    readonly startDate: Date;
    readonly endDate: Date;
  };

  /**
   * Specific categories to include.
   * If not provided, all categories are included.
   */
  readonly categories?: ReadonlyArray<ProductCategory>;

  /**
   * Whether to group items by category in the output.
   * Default is true.
   */
  readonly groupByCategory?: boolean;

  /**
   * Multiplier for quantities (e.g., 1.1 for 10% buffer).
   * Default is 1.0 (no buffer).
   */
  readonly quantityMultiplier?: number;
}

/**
 * DTO for shopping list export options.
 *
 * @description
 * Options for exporting the shopping list to different formats.
 */
export interface ExportShoppingListOptionsDTO {
  /**
   * Format to export to.
   */
  readonly format: 'json' | 'csv' | 'pdf' | 'print';

  /**
   * Whether to include price information.
   */
  readonly includePrices?: boolean;

  /**
   * Whether to include daily breakdown.
   */
  readonly includeDailyBreakdown?: boolean;

  /**
   * Whether to include notes.
   */
  readonly includeNotes?: boolean;

  /**
   * Whether to sort by category.
   */
  readonly sortByCategory?: boolean;
}
