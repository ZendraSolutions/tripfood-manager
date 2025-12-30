/**
 * @fileoverview Product Repository Interface.
 * Defines the contract for Product persistence operations following DDD principles.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import { Product, IProductUpdateDTO } from '../../entities/Product';
import { ProductCategory, ProductType, ProductUnit } from '../../types';
import { IBaseRepository } from './IBaseRepository';

/**
 * Product-specific query filters.
 */
export interface IProductQueryFilters {
  /** Filter by category */
  readonly category?: ProductCategory;
  /** Filter by type */
  readonly type?: ProductType;
  /** Filter by unit */
  readonly unit?: ProductUnit;
  /** Filter by name (partial match, case-insensitive) */
  readonly name?: string;
  /** Filter products that have a default quantity */
  readonly hasDefaultQuantity?: boolean;
}

/**
 * Repository interface for Product entity persistence operations.
 *
 * @description
 * This interface extends the base repository with Product-specific
 * query methods. Products are global entities (not trip-specific)
 * and can be reused across multiple trips.
 *
 * @example
 * ```typescript
 * // Usage in application service
 * class ProductService {
 *   constructor(private readonly productRepository: IProductRepository) {}
 *
 *   async getBeverages(): Promise<Product[]> {
 *     return this.productRepository.findByCategory('beverage');
 *   }
 * }
 * ```
 *
 * @extends {IBaseRepository<Product>}
 */
export interface IProductRepository extends IBaseRepository<Product> {
  /**
   * Finds products by category.
   *
   * @param category - The category to filter by
   * @returns Promise resolving to array of products in the category
   *
   * @example
   * ```typescript
   * const foods = await productRepository.findByCategory('food');
   * const beverages = await productRepository.findByCategory('beverage');
   * ```
   */
  findByCategory(category: ProductCategory): Promise<Product[]>;

  /**
   * Finds products by type.
   *
   * @param type - The product type to filter by
   * @returns Promise resolving to array of products of that type
   *
   * @example
   * ```typescript
   * const dairy = await productRepository.findByType('dairy');
   * const alcohol = await productRepository.findByType('alcohol');
   * ```
   */
  findByType(type: ProductType): Promise<Product[]>;

  /**
   * Finds products by unit of measurement.
   *
   * @param unit - The unit to filter by
   * @returns Promise resolving to array of products with that unit
   *
   * @example
   * ```typescript
   * const bottledProducts = await productRepository.findByUnit('bottle');
   * ```
   */
  findByUnit(unit: ProductUnit): Promise<Product[]>;

  /**
   * Finds products by name using partial matching (case-insensitive).
   *
   * @param name - The name or partial name to search for
   * @returns Promise resolving to array of matching products
   *
   * @example
   * ```typescript
   * const products = await productRepository.findByName('water');
   * ```
   */
  findByName(name: string): Promise<Product[]>;

  /**
   * Finds products that have a default quantity per person defined.
   *
   * @returns Promise resolving to array of products with default quantities
   *
   * @example
   * ```typescript
   * const productsWithDefaults = await productRepository.findWithDefaultQuantity();
   * ```
   */
  findWithDefaultQuantity(): Promise<Product[]>;

  /**
   * Partially updates a product with the given fields.
   *
   * @param id - The product's unique identifier
   * @param updates - Object containing fields to update
   * @returns Promise resolving to the updated product, or null if not found
   *
   * @example
   * ```typescript
   * const updated = await productRepository.partialUpdate('product-123', {
   *   name: 'Updated Product Name',
   *   defaultQuantityPerPerson: 2.5,
   * });
   * ```
   */
  partialUpdate(id: string, updates: IProductUpdateDTO): Promise<Product | null>;

  /**
   * Checks if a product with the given name already exists.
   *
   * @param name - The product name to check
   * @param excludeId - Optional product ID to exclude (for updates)
   * @returns Promise resolving to true if product exists
   *
   * @example
   * ```typescript
   * if (await productRepository.existsByName('Bottled Water')) {
   *   throw new DuplicateError('Product', 'name', 'Bottled Water');
   * }
   * ```
   */
  existsByName(name: string, excludeId?: string): Promise<boolean>;

  /**
   * Finds products using complex filters.
   *
   * @param filters - The filter criteria
   * @returns Promise resolving to array of matching products
   *
   * @example
   * ```typescript
   * const products = await productRepository.findWithFilters({
   *   category: 'beverage',
   *   type: 'alcohol',
   *   hasDefaultQuantity: true,
   * });
   * ```
   */
  findWithFilters(filters: IProductQueryFilters): Promise<Product[]>;

  /**
   * Gets all products ordered by name.
   *
   * @returns Promise resolving to array of products sorted by name
   *
   * @example
   * ```typescript
   * const sortedProducts = await productRepository.findAllOrderedByName();
   * ```
   */
  findAllOrderedByName(): Promise<Product[]>;

  /**
   * Gets all products grouped by category.
   *
   * @returns Promise resolving to a map of category to products
   *
   * @example
   * ```typescript
   * const grouped = await productRepository.findAllGroupedByCategory();
   * console.log(grouped.get('food')); // Food products
   * console.log(grouped.get('beverage')); // Beverage products
   * ```
   */
  findAllGroupedByCategory(): Promise<Map<ProductCategory, Product[]>>;

  /**
   * Counts products by category.
   *
   * @param category - The category to count
   * @returns Promise resolving to the count of products in the category
   *
   * @example
   * ```typescript
   * const foodCount = await productRepository.countByCategory('food');
   * ```
   */
  countByCategory(category: ProductCategory): Promise<number>;

  /**
   * Counts products by type.
   *
   * @param type - The type to count
   * @returns Promise resolving to the count of products of that type
   *
   * @example
   * ```typescript
   * const dairyCount = await productRepository.countByType('dairy');
   * ```
   */
  countByType(type: ProductType): Promise<number>;
}
