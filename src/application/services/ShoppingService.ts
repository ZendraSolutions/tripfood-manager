/**
 * @fileoverview Shopping Application Service.
 * Calculates shopping lists based on consumptions and availability.
 * Follows SOLID principles with single responsibility and dependency injection.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 * @module application/services/ShoppingService
 */

import type { IConsumptionRepository } from '@domain/interfaces/repositories/IConsumptionRepository';
import type { IProductRepository } from '@domain/interfaces/repositories/IProductRepository';
import type { IAvailabilityRepository } from '@domain/interfaces/repositories/IAvailabilityRepository';
import type { ITripRepository } from '@domain/interfaces/repositories/ITripRepository';
import type { IParticipantRepository } from '@domain/interfaces/repositories/IParticipantRepository';
import type { Product } from '@domain/entities/Product';
import { NotFoundError } from '@domain/errors';
import type { ProductCategory } from '@domain/types';
import type {
  ShoppingListDTO,
  ShoppingListItemDTO,
  ShoppingListByCategoryDTO,
  QuantityByDateDTO,
  GenerateShoppingListOptionsDTO,
} from '../dtos/shopping';

/**
 * Shopping list item (legacy compatibility).
 */
export interface ShoppingListItem {
  /** The product entity */
  readonly product: Product;
  /** Total quantity needed */
  readonly totalQuantity: number;
  /** Unit of measurement */
  readonly unit: string;
}

/**
 * Complete shopping list (legacy compatibility).
 */
export interface ShoppingList {
  /** Trip ID */
  readonly tripId: string;
  /** List items */
  readonly items: ShoppingListItem[];
  /** Generation timestamp */
  readonly generatedAt: Date;
}

/**
 * Consumption summary by product.
 */
export interface ProductConsumptionSummary {
  /** Product ID */
  readonly productId: string;
  /** Product name */
  readonly productName: string;
  /** Total quantity */
  readonly totalQuantity: number;
  /** Unit of measurement */
  readonly unit: string;
  /** Number of consumption records */
  readonly consumptionCount: number;
}

/**
 * Application service for Shopping operations.
 *
 * @description
 * This service provides shopping list generation and analysis for trips.
 * It handles:
 * - Generating comprehensive shopping lists based on consumptions
 * - Calculating quantities by date and participant availability
 * - Grouping products by category
 * - Estimating costs and quantities
 * - Comparing estimated vs actual consumption
 *
 * @example
 * ```typescript
 * const shoppingService = new ShoppingService(
 *   consumptionRepository,
 *   productRepository,
 *   availabilityRepository,
 *   tripRepository,
 *   participantRepository
 * );
 *
 * const shoppingList = await shoppingService.generateShoppingList('trip-123');
 * console.log(`Total items: ${shoppingList.totalItems}`);
 * console.log(`Estimated cost: $${shoppingList.totalEstimatedCost}`);
 * ```
 */
export class ShoppingService {
  /**
   * Creates a new ShoppingService instance.
   *
   * @param consumptionRepository - Repository for Consumption operations
   * @param productRepository - Repository for Product operations
   * @param availabilityRepository - Repository for Availability operations
   * @param tripRepository - Repository for Trip operations (optional)
   * @param participantRepository - Repository for Participant operations (optional)
   */
  constructor(
    private readonly consumptionRepository: IConsumptionRepository,
    private readonly productRepository: IProductRepository,
    private readonly availabilityRepository: IAvailabilityRepository,
    private readonly tripRepository?: ITripRepository,
    private readonly participantRepository?: IParticipantRepository
  ) {}

  /**
   * Generates a comprehensive shopping list for a trip.
   *
   * @param tripId - The trip ID to generate shopping list for
   * @param options - Optional generation options
   * @returns Promise resolving to the complete shopping list DTO
   * @throws {NotFoundError} If the trip is not found
   *
   * @example
   * ```typescript
   * const shoppingList = await shoppingService.generate('trip-123', {
   *   essentialOnly: false,
   *   groupByCategory: true,
   *   quantityMultiplier: 1.1, // 10% buffer
   * });
   * ```
   */
  public async generate(
    tripId: string,
    options?: Partial<GenerateShoppingListOptionsDTO>
  ): Promise<ShoppingListDTO> {
    // Verify trip exists if we have trip repository
    let trip = null;
    let tripName = 'Unknown Trip';
    let startDate = new Date();
    let endDate = new Date();
    let totalDays = 1;

    if (this.tripRepository) {
      trip = await this.tripRepository.findById(tripId);
      if (!trip) {
        throw NotFoundError.withId('Trip', tripId);
      }
      tripName = trip.name;
      startDate = trip.startDate;
      endDate = trip.endDate;
      totalDays = trip.getDurationInDays();
    }

    // Get participant count
    let participantCount = 0;
    if (this.participantRepository) {
      participantCount = await this.participantRepository.countByTripId(tripId);
    }

    // Get all consumptions and availabilities for the trip
    const consumptions = await this.consumptionRepository.findByTripId(tripId);
    const availabilities = await this.availabilityRepository.findByTripId(tripId);

    // Calculate quantities by product
    const productQuantities = new Map<string, {
      quantity: number;
      byDate: Map<string, { quantity: number; participantCount: number }>;
    }>();

    for (const consumption of consumptions) {
      const dateKey = consumption.date.toISOString().split('T')[0];

      if (!productQuantities.has(consumption.productId)) {
        productQuantities.set(consumption.productId, {
          quantity: 0,
          byDate: new Map(),
        });
      }

      const entry = productQuantities.get(consumption.productId)!;
      entry.quantity += consumption.quantity;

      if (!entry.byDate.has(dateKey)) {
        // Count participants available on this date
        const dateAvailabilities = availabilities.filter(
          (a) => a.date.toISOString().split('T')[0] === dateKey
        );
        entry.byDate.set(dateKey, {
          quantity: 0,
          participantCount: dateAvailabilities.length,
        });
      }

      const dateEntry = entry.byDate.get(dateKey)!;
      dateEntry.quantity += consumption.quantity;
    }

    // Build shopping list items
    const items: ShoppingListItemDTO[] = [];
    const products = await this.productRepository.findAll();
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const [productId, data] of productQuantities) {
      const product = productMap.get(productId);
      if (!product) continue;

      // Apply filters
      if (options?.essentialOnly && !product.defaultQuantityPerPerson) continue;
      if (options?.categories && !options.categories.includes(product.category as ProductCategory)) continue;

      // Apply quantity multiplier
      const multiplier = options?.quantityMultiplier ?? 1.0;
      const totalQuantity = Math.ceil(data.quantity * multiplier);

      // Build byDate array
      const byDate: QuantityByDateDTO[] = [];
      for (const [dateKey, dateData] of data.byDate) {
        byDate.push({
          date: new Date(dateKey),
          quantity: Math.ceil(dateData.quantity * multiplier),
          participantCount: dateData.participantCount,
        });
      }

      items.push({
        productId: product.id,
        productName: product.name,
        category: product.category as ProductCategory,
        totalQuantity,
        unit: product.unit,
        isEssential: !!product.defaultQuantityPerPerson,
        notes: product.notes,
        byDate: byDate.sort((a, b) => a.date.getTime() - b.date.getTime()),
      });
    }

    // Sort items by category and name
    items.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.productName.localeCompare(b.productName);
    });

    // Group by category
    const byCategory: ShoppingListByCategoryDTO[] = [];
    const categoryMap = new Map<ProductCategory, ShoppingListItemDTO[]>();

    for (const item of items) {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, []);
      }
      categoryMap.get(item.category)!.push(item);
    }

    for (const [category, categoryItems] of categoryMap) {
      const categoryTotalCost = categoryItems.reduce(
        (sum, item) => sum + (item.totalEstimatedCost ?? 0),
        0
      );

      byCategory.push({
        category,
        categoryDisplayName: this.getCategoryDisplayName(category),
        items: categoryItems,
        categoryTotalCost,
        itemCount: categoryItems.length,
      });
    }

    // Calculate totals
    const essentialItemsCount = items.filter((i) => i.isEssential).length;
    const optionalItemsCount = items.filter((i) => !i.isEssential).length;
    const totalEstimatedCost = items.reduce(
      (sum, item) => sum + (item.totalEstimatedCost ?? 0),
      0
    );

    return {
      tripId,
      tripName,
      startDate,
      endDate,
      totalDays,
      participantCount,
      items,
      byCategory,
      totalItems: items.length,
      totalEstimatedCost,
      essentialItemsCount,
      optionalItemsCount,
      generatedAt: new Date(),
    };
  }

  /**
   * Generates a shopping list for a trip (legacy method).
   *
   * @param tripId - The trip ID
   * @returns Promise resolving to the shopping list
   */
  public async generateShoppingList(tripId: string): Promise<ShoppingList> {
    const consumptions = await this.consumptionRepository.findByTripId(tripId);

    // Group consumptions by product and sum quantities
    const productQuantities = new Map<string, number>();

    for (const consumption of consumptions) {
      const current = productQuantities.get(consumption.productId) || 0;
      productQuantities.set(consumption.productId, current + consumption.quantity);
    }

    // Fetch product details and build shopping list items
    const items: ShoppingListItem[] = [];

    for (const [productId, totalQuantity] of productQuantities) {
      const product = await this.productRepository.findById(productId);
      if (product) {
        items.push({
          product,
          totalQuantity,
          unit: product.unit,
        });
      }
    }

    // Sort items by category and name
    items.sort((a, b) => {
      if (a.product.category !== b.product.category) {
        return a.product.category.localeCompare(b.product.category);
      }
      return a.product.name.localeCompare(b.product.name);
    });

    return {
      tripId,
      items,
      generatedAt: new Date(),
    };
  }

  /**
   * Gets consumption summary grouped by product for a trip.
   *
   * @param tripId - The trip ID
   * @returns Promise resolving to array of product consumption summaries
   */
  public async getConsumptionSummaryByProduct(tripId: string): Promise<ProductConsumptionSummary[]> {
    const consumptions = await this.consumptionRepository.findByTripId(tripId);

    // Group by product
    const productData = new Map<string, { quantity: number; count: number }>();

    for (const consumption of consumptions) {
      const current = productData.get(consumption.productId) || { quantity: 0, count: 0 };
      productData.set(consumption.productId, {
        quantity: current.quantity + consumption.quantity,
        count: current.count + 1,
      });
    }

    // Build summary with product details
    const summaries: ProductConsumptionSummary[] = [];

    for (const [productId, data] of productData) {
      const product = await this.productRepository.findById(productId);
      if (product) {
        summaries.push({
          productId,
          productName: product.name,
          totalQuantity: data.quantity,
          unit: product.unit,
          consumptionCount: data.count,
        });
      }
    }

    // Sort by total quantity descending
    summaries.sort((a, b) => b.totalQuantity - a.totalQuantity);

    return summaries;
  }

  /**
   * Calculates estimated quantities based on participants and availability.
   *
   * @param tripId - The trip ID
   * @param date - The date to calculate for
   * @returns Promise resolving to map of product ID to estimated quantity
   */
  public async calculateEstimatedQuantities(
    tripId: string,
    date: Date
  ): Promise<Map<string, number>> {
    const availabilities = await this.availabilityRepository.findByTripIdAndDate(tripId, date);
    const products = await this.productRepository.findAll();

    const estimates = new Map<string, number>();

    // Count participants per meal
    const mealCounts = new Map<string, number>();
    for (const availability of availabilities) {
      for (const meal of availability.meals) {
        const current = mealCounts.get(meal) || 0;
        mealCounts.set(meal, current + 1);
      }
    }

    // Calculate total expected participants across all meals
    let totalMealParticipants = 0;
    for (const count of mealCounts.values()) {
      totalMealParticipants += count;
    }

    // Estimate quantities per product based on default quantities
    for (const product of products) {
      if (product.defaultQuantityPerPerson) {
        const estimatedQuantity = product.defaultQuantityPerPerson * totalMealParticipants;
        estimates.set(product.id, estimatedQuantity);
      }
    }

    return estimates;
  }

  /**
   * Calculates estimated quantities for the entire trip.
   *
   * @param tripId - The trip ID
   * @returns Promise resolving to map of product ID to estimated quantity
   */
  public async calculateTotalEstimatedQuantities(tripId: string): Promise<Map<string, number>> {
    const availabilities = await this.availabilityRepository.findByTripId(tripId);
    const products = await this.productRepository.findAll();

    const estimates = new Map<string, number>();

    // Calculate total participant-meals across entire trip
    let totalParticipantMeals = 0;
    for (const availability of availabilities) {
      totalParticipantMeals += availability.meals.length;
    }

    // Estimate quantities per product based on default quantities
    for (const product of products) {
      if (product.defaultQuantityPerPerson) {
        const estimatedQuantity = product.defaultQuantityPerPerson * totalParticipantMeals;
        estimates.set(product.id, estimatedQuantity);
      }
    }

    return estimates;
  }

  /**
   * Gets the difference between estimated and actual consumption.
   *
   * @param tripId - The trip ID
   * @returns Promise resolving to array of variance data
   */
  public async getConsumptionVariance(tripId: string): Promise<
    Array<{
      productId: string;
      productName: string;
      estimated: number;
      actual: number;
      variance: number;
      variancePercentage: number;
      unit: string;
    }>
  > {
    const consumptions = await this.consumptionRepository.findByTripId(tripId);
    const products = await this.productRepository.findAll();
    const availabilities = await this.availabilityRepository.findByTripId(tripId);

    // Calculate total participants across all availability records
    const totalParticipantMeals = availabilities.reduce(
      (sum, a) => sum + a.meals.length,
      0
    );

    // Group actual consumption by product
    const actualByProduct = new Map<string, number>();
    for (const consumption of consumptions) {
      const current = actualByProduct.get(consumption.productId) || 0;
      actualByProduct.set(consumption.productId, current + consumption.quantity);
    }

    // Calculate variance for each product with default quantity
    const variances: Array<{
      productId: string;
      productName: string;
      estimated: number;
      actual: number;
      variance: number;
      variancePercentage: number;
      unit: string;
    }> = [];

    for (const product of products) {
      if (product.defaultQuantityPerPerson) {
        const estimated = product.defaultQuantityPerPerson * totalParticipantMeals;
        const actual = actualByProduct.get(product.id) || 0;
        const variance = actual - estimated;
        const variancePercentage = estimated > 0
          ? Math.round((variance / estimated) * 100 * 100) / 100
          : 0;

        variances.push({
          productId: product.id,
          productName: product.name,
          estimated,
          actual,
          variance,
          variancePercentage,
          unit: product.unit,
        });
      }
    }

    // Sort by absolute variance descending
    variances.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));

    return variances;
  }

  /**
   * Gets shopping suggestions based on consumption patterns.
   *
   * @param tripId - The trip ID
   * @returns Promise resolving to array of suggestions
   */
  public async getShoppingSuggestions(tripId: string): Promise<
    Array<{
      productId: string;
      productName: string;
      suggestion: string;
      priority: 'high' | 'medium' | 'low';
      suggestedQuantity: number;
      unit: string;
    }>
  > {
    const variances = await this.getConsumptionVariance(tripId);
    const suggestions: Array<{
      productId: string;
      productName: string;
      suggestion: string;
      priority: 'high' | 'medium' | 'low';
      suggestedQuantity: number;
      unit: string;
    }> = [];

    for (const variance of variances) {
      if (variance.variance > 0) {
        // Over consumption
        const priority = variance.variancePercentage > 50 ? 'high' : variance.variancePercentage > 20 ? 'medium' : 'low';
        suggestions.push({
          productId: variance.productId,
          productName: variance.productName,
          suggestion: `Consider increasing stock by ${Math.ceil(variance.variance)} ${variance.unit}`,
          priority,
          suggestedQuantity: Math.ceil(variance.estimated * 1.2),
          unit: variance.unit,
        });
      } else if (variance.variance < -variance.estimated * 0.3) {
        // Significant under consumption
        suggestions.push({
          productId: variance.productId,
          productName: variance.productName,
          suggestion: `Consider reducing stock - ${Math.abs(variance.variance)} ${variance.unit} unused`,
          priority: 'low',
          suggestedQuantity: Math.ceil(variance.actual * 1.1),
          unit: variance.unit,
        });
      }
    }

    return suggestions;
  }

  /**
   * Gets display name for a category.
   *
   * @param category - The category
   * @returns The display name
   */
  private getCategoryDisplayName(category: ProductCategory): string {
    const displayNames: Record<string, string> = {
      food: 'Food',
      beverage: 'Beverages',
      other: 'Other',
    };
    return displayNames[category] || category;
  }
}
