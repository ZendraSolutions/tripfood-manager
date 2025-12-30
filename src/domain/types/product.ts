/**
 * @fileoverview Product type definitions for TripFood Manager.
 * Defines product categories, types, and units for food and beverage items.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

/**
 * Product categories for high-level classification.
 *
 * @description
 * Categories represent the broad classification of products:
 * - `food`: Edible items including meals, snacks, and ingredients
 * - `beverage`: Drinkable items including water, soft drinks, and alcohol
 * - `other`: Miscellaneous items that don't fit other categories
 */
export type ProductCategory = 'food' | 'beverage' | 'other';

/**
 * Array of all valid product categories.
 */
export const PRODUCT_CATEGORIES: ReadonlyArray<ProductCategory> = [
  'food',
  'beverage',
  'other',
] as const;

/**
 * Display names for product categories.
 */
export const PRODUCT_CATEGORY_DISPLAY_NAMES: Readonly<Record<ProductCategory, string>> = {
  food: 'Food',
  beverage: 'Beverage',
  other: 'Other',
} as const;

/**
 * Specific product types within each category.
 *
 * @description
 * Product types provide more granular classification:
 *
 * Food types:
 * - `meat`: Beef, pork, chicken, fish, etc.
 * - `dairy`: Milk, cheese, yogurt, etc.
 * - `vegetables`: Fresh or frozen vegetables
 * - `fruits`: Fresh or canned fruits
 * - `grains`: Bread, rice, pasta, cereals
 * - `snacks`: Chips, cookies, candy, etc.
 * - `condiments`: Sauces, spices, dressings
 * - `prepared_food`: Pre-made meals, deli items
 *
 * Beverage types:
 * - `water`: Plain or flavored water
 * - `soft_drink`: Sodas, juices, energy drinks
 * - `alcohol`: Beer, wine, spirits
 * - `hot_beverage`: Coffee, tea, hot chocolate
 *
 * Other:
 * - `miscellaneous`: Items that don't fit other categories
 */
export type ProductType =
  // Food types
  | 'meat'
  | 'dairy'
  | 'vegetables'
  | 'fruits'
  | 'grains'
  | 'snacks'
  | 'condiments'
  | 'prepared_food'
  // Beverage types
  | 'water'
  | 'soft_drink'
  | 'alcohol'
  | 'hot_beverage'
  // Other
  | 'miscellaneous';

/**
 * Array of all valid product types.
 */
export const PRODUCT_TYPES: ReadonlyArray<ProductType> = [
  'meat',
  'dairy',
  'vegetables',
  'fruits',
  'grains',
  'snacks',
  'condiments',
  'prepared_food',
  'water',
  'soft_drink',
  'alcohol',
  'hot_beverage',
  'miscellaneous',
] as const;

/**
 * Display names for product types.
 */
export const PRODUCT_TYPE_DISPLAY_NAMES: Readonly<Record<ProductType, string>> = {
  meat: 'Meat & Protein',
  dairy: 'Dairy Products',
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  grains: 'Grains & Bread',
  snacks: 'Snacks',
  condiments: 'Condiments & Sauces',
  prepared_food: 'Prepared Food',
  water: 'Water',
  soft_drink: 'Soft Drinks',
  alcohol: 'Alcoholic Beverages',
  hot_beverage: 'Hot Beverages',
  miscellaneous: 'Miscellaneous',
} as const;

/**
 * Maps product types to their parent category.
 */
export const PRODUCT_TYPE_TO_CATEGORY: Readonly<Record<ProductType, ProductCategory>> = {
  meat: 'food',
  dairy: 'food',
  vegetables: 'food',
  fruits: 'food',
  grains: 'food',
  snacks: 'food',
  condiments: 'food',
  prepared_food: 'food',
  water: 'beverage',
  soft_drink: 'beverage',
  alcohol: 'beverage',
  hot_beverage: 'beverage',
  miscellaneous: 'other',
} as const;

/**
 * Maps categories to their available product types.
 */
export const CATEGORY_TO_PRODUCT_TYPES: Readonly<Record<ProductCategory, ReadonlyArray<ProductType>>> = {
  food: ['meat', 'dairy', 'vegetables', 'fruits', 'grains', 'snacks', 'condiments', 'prepared_food'],
  beverage: ['water', 'soft_drink', 'alcohol', 'hot_beverage'],
  other: ['miscellaneous'],
} as const;

/**
 * Units of measurement for products.
 *
 * @description
 * Units represent how products are measured and tracked:
 *
 * Weight:
 * - `kg`: Kilograms
 * - `g`: Grams
 * - `lb`: Pounds
 * - `oz`: Ounces
 *
 * Volume:
 * - `l`: Liters
 * - `ml`: Milliliters
 * - `gal`: Gallons
 *
 * Count:
 * - `unit`: Individual items
 * - `pack`: Packages or packs
 * - `box`: Boxes
 * - `bottle`: Bottles
 * - `can`: Cans
 * - `bag`: Bags
 *
 * Portions:
 * - `serving`: Standard serving size
 * - `portion`: Generic portion
 * - `slice`: Slices (bread, pizza, etc.)
 * - `piece`: Individual pieces
 */
export type ProductUnit =
  // Weight
  | 'kg'
  | 'g'
  | 'lb'
  | 'oz'
  // Volume
  | 'l'
  | 'ml'
  | 'gal'
  // Count
  | 'unit'
  | 'pack'
  | 'box'
  | 'bottle'
  | 'can'
  | 'bag'
  // Portions
  | 'serving'
  | 'portion'
  | 'slice'
  | 'piece';

/**
 * Array of all valid product units.
 */
export const PRODUCT_UNITS: ReadonlyArray<ProductUnit> = [
  'kg',
  'g',
  'lb',
  'oz',
  'l',
  'ml',
  'gal',
  'unit',
  'pack',
  'box',
  'bottle',
  'can',
  'bag',
  'serving',
  'portion',
  'slice',
  'piece',
] as const;

/**
 * Display names for product units.
 */
export const PRODUCT_UNIT_DISPLAY_NAMES: Readonly<Record<ProductUnit, string>> = {
  kg: 'Kilograms',
  g: 'Grams',
  lb: 'Pounds',
  oz: 'Ounces',
  l: 'Liters',
  ml: 'Milliliters',
  gal: 'Gallons',
  unit: 'Units',
  pack: 'Packs',
  box: 'Boxes',
  bottle: 'Bottles',
  can: 'Cans',
  bag: 'Bags',
  serving: 'Servings',
  portion: 'Portions',
  slice: 'Slices',
  piece: 'Pieces',
} as const;

/**
 * Abbreviated display names for product units.
 */
export const PRODUCT_UNIT_ABBREVIATIONS: Readonly<Record<ProductUnit, string>> = {
  kg: 'kg',
  g: 'g',
  lb: 'lb',
  oz: 'oz',
  l: 'L',
  ml: 'ml',
  gal: 'gal',
  unit: 'u',
  pack: 'pk',
  box: 'bx',
  bottle: 'btl',
  can: 'can',
  bag: 'bag',
  serving: 'srv',
  portion: 'ptn',
  slice: 'sl',
  piece: 'pc',
} as const;

/**
 * Groups units by their measurement type.
 */
export const UNIT_GROUPS: Readonly<Record<string, ReadonlyArray<ProductUnit>>> = {
  weight: ['kg', 'g', 'lb', 'oz'],
  volume: ['l', 'ml', 'gal'],
  count: ['unit', 'pack', 'box', 'bottle', 'can', 'bag'],
  portion: ['serving', 'portion', 'slice', 'piece'],
} as const;

/**
 * Type guard to check if a value is a valid ProductCategory.
 *
 * @param value - The value to check
 * @returns True if the value is a valid ProductCategory
 */
export function isProductCategory(value: unknown): value is ProductCategory {
  return typeof value === 'string' && PRODUCT_CATEGORIES.includes(value as ProductCategory);
}

/**
 * Type guard to check if a value is a valid ProductType.
 *
 * @param value - The value to check
 * @returns True if the value is a valid ProductType
 */
export function isProductType(value: unknown): value is ProductType {
  return typeof value === 'string' && PRODUCT_TYPES.includes(value as ProductType);
}

/**
 * Type guard to check if a value is a valid ProductUnit.
 *
 * @param value - The value to check
 * @returns True if the value is a valid ProductUnit
 */
export function isProductUnit(value: unknown): value is ProductUnit {
  return typeof value === 'string' && PRODUCT_UNITS.includes(value as ProductUnit);
}

/**
 * Validates and returns a ProductCategory or throws an error.
 *
 * @param value - The value to validate
 * @returns The validated ProductCategory
 * @throws Error if the value is not a valid ProductCategory
 */
export function parseProductCategory(value: unknown): ProductCategory {
  if (!isProductCategory(value)) {
    throw new Error(
      `Invalid product category: '${String(value)}'. Valid categories are: ${PRODUCT_CATEGORIES.join(', ')}`
    );
  }
  return value;
}

/**
 * Validates and returns a ProductType or throws an error.
 *
 * @param value - The value to validate
 * @returns The validated ProductType
 * @throws Error if the value is not a valid ProductType
 */
export function parseProductType(value: unknown): ProductType {
  if (!isProductType(value)) {
    throw new Error(
      `Invalid product type: '${String(value)}'. Valid types are: ${PRODUCT_TYPES.join(', ')}`
    );
  }
  return value;
}

/**
 * Validates and returns a ProductUnit or throws an error.
 *
 * @param value - The value to validate
 * @returns The validated ProductUnit
 * @throws Error if the value is not a valid ProductUnit
 */
export function parseProductUnit(value: unknown): ProductUnit {
  if (!isProductUnit(value)) {
    throw new Error(
      `Invalid product unit: '${String(value)}'. Valid units are: ${PRODUCT_UNITS.join(', ')}`
    );
  }
  return value;
}

/**
 * Gets the category for a given product type.
 *
 * @param productType - The product type
 * @returns The corresponding product category
 */
export function getCategoryForType(productType: ProductType): ProductCategory {
  return PRODUCT_TYPE_TO_CATEGORY[productType];
}

/**
 * Gets available product types for a given category.
 *
 * @param category - The product category
 * @returns Array of product types in that category
 */
export function getTypesForCategory(category: ProductCategory): ReadonlyArray<ProductType> {
  return CATEGORY_TO_PRODUCT_TYPES[category];
}

/**
 * Validates that a product type belongs to the specified category.
 *
 * @param productType - The product type to validate
 * @param expectedCategory - The expected category
 * @returns True if the type belongs to the category
 */
export function isTypeInCategory(
  productType: ProductType,
  expectedCategory: ProductCategory
): boolean {
  return PRODUCT_TYPE_TO_CATEGORY[productType] === expectedCategory;
}
