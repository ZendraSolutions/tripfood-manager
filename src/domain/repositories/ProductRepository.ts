/**
 * @fileoverview Product Repository Interface
 * Defines the contract for product data persistence operations
 * @module domain/repositories/ProductRepository
 */

import type { Product } from '@domain/entities/Product';

/**
 * Interface for Product repository operations
 * Following Repository pattern for domain-driven design
 */
export interface ProductRepository {
  /**
   * Finds a product by its unique identifier
   * @param id - The product's unique identifier
   * @returns The product if found, null otherwise
   */
  findById(id: string): Promise<Product | null>;

  /**
   * Retrieves all products
   * @returns Array of all products
   */
  findAll(): Promise<Product[]>;

  /**
   * Retrieves products by category
   * @param category - The product category
   * @returns Array of products in the category
   */
  findByCategory(category: string): Promise<Product[]>;

  /**
   * Retrieves products by type (food or beverage)
   * @param type - The product type
   * @returns Array of products of the type
   */
  findByType(type: string): Promise<Product[]>;

  /**
   * Saves a new product
   * @param product - The product entity to save
   * @returns The saved product
   */
  save(product: Product): Promise<Product>;

  /**
   * Updates an existing product
   * @param product - The product entity with updated data
   * @returns The updated product
   */
  update(product: Product): Promise<Product>;

  /**
   * Deletes a product by its identifier
   * @param id - The product's unique identifier
   * @returns True if deleted successfully
   */
  delete(id: string): Promise<boolean>;

  /**
   * Checks if a product exists
   * @param id - The product's unique identifier
   * @returns True if the product exists
   */
  exists(id: string): Promise<boolean>;
}
