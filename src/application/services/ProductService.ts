/**
 * @fileoverview Product Application Service.
 * Handles business logic and orchestration for Product operations.
 * Follows SOLID principles with single responsibility and dependency injection.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 * @module application/services/ProductService
 */

import type { Product, IProductCreateDTO, IProductUpdateDTO } from '@domain/entities/Product';
import type { IProductRepository } from '@domain/interfaces/repositories/IProductRepository';
import type { IConsumptionRepository } from '@domain/interfaces/repositories/IConsumptionRepository';
import { NotFoundError, ValidationError, DomainError, DomainErrorCode } from '@domain/errors';
import type { ProductCategory, ProductType, ProductUnit } from '@domain/types';
import type {
  CreateProductDTO,
  UpdateProductDTO,
  ProductResponseDTO,
  ProductWithConsumptionDTO,
} from '../dtos/product';

/**
 * Filter options for product queries.
 */
export interface ProductFilterOptions {
  /** Filter by category */
  readonly category?: ProductCategory;
  /** Filter by type */
  readonly type?: ProductType;
  /** Filter by name (partial match) */
  readonly name?: string;
  /** Filter by whether product has default quantity */
  readonly hasDefaultQuantity?: boolean;
}

/**
 * Application service for Product operations.
 *
 * @description
 * This service provides the application layer interface for Product operations.
 * It handles:
 * - CRUD operations for products
 * - Filtering by category and type
 * - Business rule validation
 * - Data transformation between DTOs and domain entities
 *
 * @example
 * ```typescript
 * const productService = new ProductService(productRepository, consumptionRepository);
 *
 * const product = await productService.create({
 *   name: 'Bottled Water',
 *   category: 'beverage',
 *   type: 'water',
 *   unit: 'bottle',
 *   defaultQuantityPerPerson: 2,
 * });
 * ```
 */
export class ProductService {
  /**
   * Creates a new ProductService instance.
   *
   * @param productRepository - Repository for Product persistence operations
   * @param consumptionRepository - Repository for Consumption operations (optional, for dependency checks)
   */
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly consumptionRepository?: IConsumptionRepository
  ) {}

  /**
   * Creates a new product.
   *
   * @param dto - The product creation data
   * @returns Promise resolving to the created product
   * @throws {ValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const product = await productService.create({
   *   name: 'Fresh Bread',
   *   category: 'food',
   *   type: 'grains',
   *   unit: 'unit',
   *   defaultQuantityPerPerson: 2,
   * });
   * ```
   */
  public async create(dto: IProductCreateDTO): Promise<Product> {
    // Validate input
    this.validateCreateDTO(dto);

    // Create domain entity (entity performs its own validation)
    const { Product } = await import('@domain/entities/Product');
    const product = Product.create(dto);

    return this.productRepository.save(product);
  }

  /**
   * Creates a new product using domain DTO.
   *
   * @param dto - The product creation data using domain DTO
   * @returns Promise resolving to the created product
   */
  public async createProduct(dto: IProductCreateDTO): Promise<Product> {
    const { Product } = await import('@domain/entities/Product');
    const product = Product.create(dto);
    return this.productRepository.save(product);
  }

  /**
   * Retrieves a product by its ID.
   *
   * @param id - The product's unique identifier
   * @returns Promise resolving to the product if found, null otherwise
   */
  public async getById(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  /**
   * Retrieves a product by ID, throwing if not found.
   *
   * @param id - The product's unique identifier
   * @returns Promise resolving to the product
   * @throws {NotFoundError} If the product is not found
   */
  public async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw NotFoundError.withId('Product', id);
    }
    return product;
  }

  /**
   * Retrieves all products.
   *
   * @returns Promise resolving to array of products
   */
  public async getAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  /**
   * Retrieves all products (alias for getAll).
   *
   * @returns Promise resolving to array of products
   */
  public async getAllProducts(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  /**
   * Retrieves products with optional filters.
   *
   * @param filters - Filter options for the query
   * @returns Promise resolving to array of filtered products
   *
   * @example
   * ```typescript
   * const beverages = await productService.getFiltered({ category: 'beverage' });
   * const waterProducts = await productService.getFiltered({ type: 'water' });
   * ```
   */
  public async getFiltered(filters: ProductFilterOptions): Promise<Product[]> {
    let products = await this.productRepository.findAll();

    if (filters.category) {
      products = products.filter((p) => p.category === filters.category);
    }

    if (filters.type) {
      products = products.filter((p) => p.type === filters.type);
    }

    if (filters.name) {
      const searchName = filters.name.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(searchName));
    }

    if (filters.hasDefaultQuantity !== undefined) {
      products = products.filter((p) =>
        filters.hasDefaultQuantity
          ? p.defaultQuantityPerPerson !== undefined && p.defaultQuantityPerPerson > 0
          : p.defaultQuantityPerPerson === undefined || p.defaultQuantityPerPerson === 0
      );
    }

    return products;
  }

  /**
   * Retrieves products by category.
   *
   * @param category - The category to filter by
   * @returns Promise resolving to array of products in the category
   *
   * @example
   * ```typescript
   * const beverages = await productService.getByCategory('beverage');
   * ```
   */
  public async getByCategory(category: string): Promise<Product[]> {
    return this.productRepository.findByCategory(category);
  }

  /**
   * Retrieves products by category (alias for getByCategory).
   *
   * @param category - The category to filter by
   * @returns Promise resolving to array of products
   */
  public async getProductsByCategory(category: string): Promise<Product[]> {
    return this.productRepository.findByCategory(category);
  }

  /**
   * Retrieves products by type.
   *
   * @param type - The type to filter by
   * @returns Promise resolving to array of products of the type
   *
   * @example
   * ```typescript
   * const waterProducts = await productService.getByType('water');
   * ```
   */
  public async getByType(type: string): Promise<Product[]> {
    return this.productRepository.findByType(type);
  }

  /**
   * Retrieves products by type (alias for getByType).
   *
   * @param type - The type to filter by
   * @returns Promise resolving to array of products
   */
  public async getProductsByType(type: string): Promise<Product[]> {
    return this.productRepository.findByType(type);
  }

  /**
   * Retrieves products grouped by category.
   *
   * @returns Promise resolving to products grouped by category
   */
  public async getGroupedByCategory(): Promise<Map<ProductCategory, Product[]>> {
    const products = await this.productRepository.findAll();
    const grouped = new Map<ProductCategory, Product[]>();

    for (const product of products) {
      const category = product.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(product);
    }

    return grouped;
  }

  /**
   * Retrieves products with consumption statistics.
   *
   * @param tripId - The trip ID to get consumption stats for
   * @returns Promise resolving to products with consumption data
   */
  public async getProductsWithConsumption(tripId: string): Promise<ProductWithConsumptionDTO[]> {
    const products = await this.productRepository.findAll();

    if (!this.consumptionRepository) {
      return products.map((p) => this.toWithConsumptionDTO(p, 0, 0));
    }

    const consumptions = await this.consumptionRepository.findByTripId(tripId);
    const consumptionByProduct = new Map<string, { totalQuantity: number; count: number }>();

    for (const consumption of consumptions) {
      const current = consumptionByProduct.get(consumption.productId) || { totalQuantity: 0, count: 0 };
      consumptionByProduct.set(consumption.productId, {
        totalQuantity: current.totalQuantity + consumption.quantity,
        count: current.count + 1,
      });
    }

    return products.map((product) => {
      const stats = consumptionByProduct.get(product.id) || { totalQuantity: 0, count: 0 };
      return this.toWithConsumptionDTO(product, stats.totalQuantity, stats.count);
    });
  }

  /**
   * Searches products by name.
   *
   * @param name - The name or partial name to search
   * @returns Promise resolving to array of matching products
   */
  public async searchByName(name: string): Promise<Product[]> {
    return this.productRepository.findByName(name);
  }

  /**
   * Searches products by name (alias for searchByName).
   *
   * @param name - The name or partial name to search
   * @returns Promise resolving to array of matching products
   */
  public async searchProductsByName(name: string): Promise<Product[]> {
    return this.productRepository.findByName(name);
  }

  /**
   * Updates an existing product.
   *
   * @param id - The product's unique identifier
   * @param dto - The update data
   * @returns Promise resolving to the updated product
   * @throws {NotFoundError} If the product is not found
   * @throws {ValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const updated = await productService.update('product-123', {
   *   name: 'Mineral Water',
   *   defaultQuantityPerPerson: 3,
   * });
   * ```
   */
  public async update(id: string, dto: IProductUpdateDTO): Promise<Product> {
    const product = await this.getProductById(id);

    // Validate update
    this.validateUpdateDTO(dto);

    const updatedProduct = product.update(dto);
    return this.productRepository.save(updatedProduct);
  }

  /**
   * Updates an existing product using domain DTO.
   *
   * @param id - The product's unique identifier
   * @param dto - The update data using domain DTO
   * @returns Promise resolving to the updated product
   * @throws {NotFoundError} If product is not found
   */
  public async updateProduct(id: string, dto: IProductUpdateDTO): Promise<Product> {
    const product = await this.getProductById(id);
    const updatedProduct = product.update(dto);
    return this.productRepository.save(updatedProduct);
  }

  /**
   * Deletes a product by ID.
   *
   * @param id - The product's unique identifier
   * @param force - If true, deletes even if product has consumptions
   * @returns Promise resolving when deletion is complete
   * @throws {NotFoundError} If the product is not found
   * @throws {DomainError} If product has consumptions and force is false
   *
   * @example
   * ```typescript
   * // Safe delete
   * await productService.delete('product-123');
   *
   * // Force delete
   * await productService.delete('product-123', true);
   * ```
   */
  public async delete(id: string, force: boolean = false): Promise<void> {
    const exists = await this.productRepository.exists(id);
    if (!exists) {
      throw NotFoundError.withId('Product', id);
    }

    // Check for dependencies if we have consumption repository
    if (this.consumptionRepository && !force) {
      const consumptions = await this.consumptionRepository.findByProductId(id);
      if (consumptions.length > 0) {
        throw new DomainError(
          `Cannot delete product with ${consumptions.length} consumption record(s). Use force=true to delete.`,
          DomainErrorCode.BUSINESS_RULE_ERROR,
          { productId: id, consumptionCount: consumptions.length }
        );
      }
    }

    await this.productRepository.delete(id);
  }

  /**
   * Deletes a product by ID (simple version without force option).
   *
   * @param id - The product's unique identifier
   * @returns Promise resolving when deletion is complete
   * @throws {NotFoundError} If product is not found
   */
  public async deleteProduct(id: string): Promise<void> {
    const exists = await this.productRepository.exists(id);
    if (!exists) {
      throw NotFoundError.withId('Product', id);
    }
    await this.productRepository.delete(id);
  }

  /**
   * Checks if a product exists.
   *
   * @param id - The product's unique identifier
   * @returns Promise resolving to true if the product exists
   */
  public async exists(id: string): Promise<boolean> {
    return this.productRepository.exists(id);
  }

  /**
   * Gets the total count of products.
   *
   * @returns Promise resolving to the count
   */
  public async count(): Promise<number> {
    return this.productRepository.count();
  }

  /**
   * Gets the total count of products (alias for count).
   *
   * @returns Promise resolving to the count
   */
  public async getProductCount(): Promise<number> {
    return this.productRepository.count();
  }

  /**
   * Validates the create DTO.
   *
   * @param dto - The DTO to validate
   * @throws {ValidationError} If validation fails
   */
  private validateCreateDTO(dto: IProductCreateDTO): void {
    if (!dto.name || dto.name.trim().length === 0) {
      throw ValidationError.required('name', 'Product');
    }

    if (!dto.category) {
      throw ValidationError.required('category', 'Product');
    }

    if (!dto.type) {
      throw ValidationError.required('type', 'Product');
    }

    if (!dto.unit) {
      throw ValidationError.required('unit', 'Product');
    }

    if (dto.defaultQuantityPerPerson !== undefined && dto.defaultQuantityPerPerson < 0) {
      throw ValidationError.outOfRange('defaultQuantityPerPerson', 0, undefined, dto.defaultQuantityPerPerson);
    }
  }

  /**
   * Validates the update DTO.
   *
   * @param dto - The DTO to validate
   * @throws {ValidationError} If validation fails
   */
  private validateUpdateDTO(dto: IProductUpdateDTO): void {
    if (dto.name !== undefined && dto.name.trim().length === 0) {
      throw ValidationError.invalidLength('name', 1, undefined, 0);
    }

    if (dto.defaultQuantityPerPerson !== undefined && dto.defaultQuantityPerPerson !== null && dto.defaultQuantityPerPerson < 0) {
      throw ValidationError.outOfRange('defaultQuantityPerPerson', 0, undefined, dto.defaultQuantityPerPerson);
    }
  }

  /**
   * Transforms a Product entity to a response DTO.
   *
   * @param product - The product entity
   * @returns The response DTO
   */
  private toResponseDTO(product: Product): ProductResponseDTO {
    return {
      id: product.id,
      tripId: '', // Products are global, not trip-specific
      name: product.name,
      category: product.category as ProductCategory,
      unit: product.unit as ProductUnit,
      defaultQuantityPerPerson: product.defaultQuantityPerPerson ?? 0,
      notes: product.notes,
      isEssential: true,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt ?? product.createdAt,
    };
  }

  /**
   * Transforms a Product entity to a response DTO with consumption stats.
   *
   * @param product - The product entity
   * @param totalQuantityNeeded - Total quantity consumed
   * @param consumptionCount - Number of consumption records
   * @returns The response DTO with consumption stats
   */
  private toWithConsumptionDTO(
    product: Product,
    totalQuantityNeeded: number,
    consumptionCount: number
  ): ProductWithConsumptionDTO {
    return {
      ...this.toResponseDTO(product),
      totalQuantityNeeded,
      totalEstimatedCost: 0, // Price calculation would require price data
      consumptionCount,
    };
  }
}
