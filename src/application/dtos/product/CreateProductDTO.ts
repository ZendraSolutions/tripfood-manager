/**
 * @fileoverview Data Transfer Object for creating a new Product.
 * Contains all required and optional fields for product creation.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

/**
 * Product category enumeration.
 * Categorizes products for better organization and filtering.
 */
export enum ProductCategory {
  /** Alcoholic beverages */
  ALCOHOL = 'ALCOHOL',
  /** Non-alcoholic beverages */
  BEVERAGES = 'BEVERAGES',
  /** Meat products */
  MEAT = 'MEAT',
  /** Seafood products */
  SEAFOOD = 'SEAFOOD',
  /** Dairy products */
  DAIRY = 'DAIRY',
  /** Fruits and vegetables */
  PRODUCE = 'PRODUCE',
  /** Bread and bakery items */
  BAKERY = 'BAKERY',
  /** Snacks and chips */
  SNACKS = 'SNACKS',
  /** Condiments and sauces */
  CONDIMENTS = 'CONDIMENTS',
  /** Frozen foods */
  FROZEN = 'FROZEN',
  /** Canned goods */
  CANNED = 'CANNED',
  /** Dry goods and pasta */
  DRY_GOODS = 'DRY_GOODS',
  /** Other items */
  OTHER = 'OTHER',
}

/**
 * Unit of measurement for products.
 */
export enum ProductUnit {
  /** Individual items */
  UNIT = 'UNIT',
  /** Kilograms */
  KILOGRAM = 'KILOGRAM',
  /** Grams */
  GRAM = 'GRAM',
  /** Liters */
  LITER = 'LITER',
  /** Milliliters */
  MILLILITER = 'MILLILITER',
  /** Packages */
  PACKAGE = 'PACKAGE',
  /** Bottles */
  BOTTLE = 'BOTTLE',
  /** Cans */
  CAN = 'CAN',
  /** Boxes */
  BOX = 'BOX',
  /** Dozen */
  DOZEN = 'DOZEN',
}

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
