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
import type {
  ShoppingListDTO,
  ShoppingListItemDTO,
  ShoppingListByCategoryDTO,
  QuantityByDateDTO,
  GenerateShoppingListOptionsDTO,
} from '../dtos/shopping';
import type { ProductCategory, ProductUnit } from '../dtos/product';

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
      const dateIso = consumption.date.toISOString();
      const dateKey = dateIso.split('T')[0] ?? dateIso.substring(0, 10);

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
        const dateAvailabilities = availabilities.filter((a) => {
          const aDateIso = a.date.toISOString();
          const aDateKey = aDateIso.split('T')[0] ?? aDateIso.substring(0, 10);
          return aDateKey === dateKey;
        });
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

      // Check category filter - compare as strings to avoid type mismatch
      if (options?.categories) {
        const categoryStrings = options.categories.map((c) => String(c));
        if (!categoryStrings.includes(String(product.category))) continue;
      }

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

      // Create item - handle optional notes properly
      const item: ShoppingListItemDTO = {
        productId: product.id,
        productName: product.name,
        category: product.category as unknown as ProductCategory,
        totalQuantity,
        unit: product.unit as unknown as ProductUnit,
        isEssential: !!product.defaultQuantityPerPerson,
        byDate: byDate.sort((a, b) => a.date.getTime() - b.date.getTime()),
      };

      // Add optional notes if present
      if (product.notes !== undefined) {
        (item as { notes?: string }).notes = product.notes;
      }

      items.push(item);
    }

    // Sort items by category and name
    items.sort((a, b) => {
      if (a.category !== b.category) {
        return String(a.category).localeCompare(String(b.category));
      }
      return a.productName.localeCompare(b.productName);
    });

    // Group by category
    const byCategory: ShoppingListByCategoryDTO[] = [];
    const categoryMap = new Map<string, ShoppingListItemDTO[]>();

    for (const item of items) {
      const categoryKey = String(item.category);
      if (!categoryMap.has(categoryKey)) {
        categoryMap.set(categoryKey, []);
      }
      categoryMap.get(categoryKey)!.push(item);
    }

    for (const [categoryKey, categoryItems] of categoryMap) {
      const categoryTotalCost = categoryItems.reduce(
        (sum, item) => sum + (item.totalEstimatedCost ?? 0),
        0
      );

      byCategory.push({
        category: categoryKey as unknown as ProductCategory,
        categoryDisplayName: this.getCategoryDisplayName(categoryKey),
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
   * Gets a complete shopping list for a trip.
   * Alias for generate() method for API consistency.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to the complete shopping list DTO
   * @throws {NotFoundError} If the trip is not found
   *
   * @example
   * ```typescript
   * const shoppingList = await shoppingService.getShoppingList('trip-123');
   * console.log(`Total items: ${shoppingList.totalItems}`);
   * ```
   */
  public async getShoppingList(tripId: string): Promise<ShoppingListDTO> {
    return this.generate(tripId);
  }

  /**
   * Exports the shopping list to CSV format.
   *
   * @description
   * Generates a CSV string containing the shopping list with columns:
   * - Category
   * - Product Name
   * - Quantity
   * - Unit
   * - Notes (optional)
   * - Daily breakdown (optional)
   *
   * @param tripId - The trip's unique identifier
   * @param options - Export configuration options
   * @returns Promise resolving to CSV string
   * @throws {NotFoundError} If trip is not found
   *
   * @example
   * ```typescript
   * const csv = await shoppingService.exportToCSV('trip-123', {
   *   includeDailyBreakdown: true,
   *   includeNotes: true,
   *   sortByCategory: true,
   * });
   *
   * // Save to file
   * fs.writeFileSync('shopping-list.csv', csv);
   * ```
   */
  public async exportToCSV(
    tripId: string,
    options?: {
      includeDailyBreakdown?: boolean;
      includeNotes?: boolean;
      sortByCategory?: boolean;
      includeHeader?: boolean;
    }
  ): Promise<string> {
    const shoppingList = await this.generate(tripId);

    const includeNotes = options?.includeNotes ?? true;
    const includeDailyBreakdown = options?.includeDailyBreakdown ?? false;
    const sortByCategory = options?.sortByCategory ?? true;
    const includeHeader = options?.includeHeader ?? true;

    const lines: string[] = [];

    // Build header row
    if (includeHeader) {
      const headers = ['Categoria', 'Producto', 'Cantidad', 'Unidad'];
      if (includeNotes) {
        headers.push('Notas');
      }
      if (includeDailyBreakdown) {
        const dates = this.extractUniqueDates(shoppingList.items);
        for (const date of dates) {
          headers.push(this.formatDateForCSV(date));
        }
      }
      lines.push(this.escapeCSVRow(headers));
    }

    // Sort items
    let sortedItems = [...shoppingList.items];
    if (sortByCategory) {
      sortedItems.sort((a, b) => {
        if (a.category !== b.category) {
          return String(a.category).localeCompare(String(b.category));
        }
        return a.productName.localeCompare(b.productName);
      });
    }

    // Build data rows
    for (const item of sortedItems) {
      const categoryName = this.getCategoryDisplayName(item.category);
      const row: string[] = [
        categoryName,
        item.productName,
        item.totalQuantity.toString(),
        String(item.unit),
      ];

      if (includeNotes) {
        row.push(item.notes || '');
      }

      if (includeDailyBreakdown) {
        const dates = this.extractUniqueDates(shoppingList.items);
        for (const date of dates) {
          const dateData = item.byDate.find(
            (d) => this.normalizeDate(d.date) === this.normalizeDate(date)
          );
          row.push(dateData ? dateData.quantity.toString() : '0');
        }
      }

      lines.push(this.escapeCSVRow(row));
    }

    // Add summary section
    lines.push('');
    lines.push(this.escapeCSVRow(['--- RESUMEN ---']));
    lines.push(this.escapeCSVRow(['Viaje', shoppingList.tripName]));
    lines.push(this.escapeCSVRow(['Fecha inicio', this.formatDateForCSV(shoppingList.startDate)]));
    lines.push(this.escapeCSVRow(['Fecha fin', this.formatDateForCSV(shoppingList.endDate)]));
    lines.push(this.escapeCSVRow(['Total dias', shoppingList.totalDays.toString()]));
    lines.push(this.escapeCSVRow(['Participantes', shoppingList.participantCount.toString()]));
    lines.push(this.escapeCSVRow(['Total productos', shoppingList.totalItems.toString()]));
    lines.push(this.escapeCSVRow(['Productos esenciales', shoppingList.essentialItemsCount.toString()]));
    lines.push(this.escapeCSVRow(['Productos opcionales', shoppingList.optionalItemsCount.toString()]));
    lines.push(this.escapeCSVRow(['Generado', shoppingList.generatedAt.toISOString()]));

    return lines.join('\n');
  }

  /**
   * Exports the shopping list to JSON format.
   *
   * @param tripId - The trip's unique identifier
   * @param options - Export configuration options
   * @returns Promise resolving to JSON string
   * @throws {NotFoundError} If trip is not found
   *
   * @example
   * ```typescript
   * const json = await shoppingService.exportToJSON('trip-123');
   * fs.writeFileSync('shopping-list.json', json);
   * ```
   */
  public async exportToJSON(
    tripId: string,
    options?: {
      prettyPrint?: boolean;
    }
  ): Promise<string> {
    const shoppingList = await this.generate(tripId);
    const indent = options?.prettyPrint !== false ? 2 : 0;
    return JSON.stringify(shoppingList, null, indent);
  }

  /**
   * Gets products grouped by category for a trip's shopping list.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to array of category groups
   * @throws {NotFoundError} If trip is not found
   *
   * @example
   * ```typescript
   * const byCategory = await shoppingService.getShoppingListByCategory('trip-123');
   * byCategory.forEach(group => {
   *   console.log(`${group.categoryDisplayName}: ${group.itemCount} items`);
   * });
   * ```
   */
  public async getShoppingListByCategory(tripId: string): Promise<ShoppingListByCategoryDTO[]> {
    const shoppingList = await this.generate(tripId, { groupByCategory: true });
    return [...shoppingList.byCategory];
  }

  /**
   * Gets products that are running low based on consumption vs estimates.
   *
   * @param tripId - The trip's unique identifier
   * @param thresholdPercentage - Percentage threshold for low stock (default: 20)
   * @returns Promise resolving to array of low stock products
   *
   * @example
   * ```typescript
   * const lowStock = await shoppingService.getLowStockProducts('trip-123', 25);
   * lowStock.forEach(p => {
   *   console.log(`${p.productName}: ${p.remainingPercentage}% remaining`);
   * });
   * ```
   */
  public async getLowStockProducts(
    tripId: string,
    thresholdPercentage: number = 20
  ): Promise<
    Array<{
      productId: string;
      productName: string;
      remainingPercentage: number;
      currentQuantity: number;
      estimatedNeed: number;
      unit: string;
    }>
  > {
    const variances = await this.getConsumptionVariance(tripId);

    const lowStock = variances
      .filter((v) => {
        const remainingPercentage = v.estimated > 0
          ? ((v.estimated - v.actual) / v.estimated) * 100
          : 100;
        return remainingPercentage <= thresholdPercentage;
      })
      .map((v) => ({
        productId: v.productId,
        productName: v.productName,
        remainingPercentage: v.estimated > 0
          ? Math.round(((v.estimated - v.actual) / v.estimated) * 100 * 100) / 100
          : 100,
        currentQuantity: Math.max(0, v.estimated - v.actual),
        estimatedNeed: v.estimated,
        unit: v.unit,
      }));

    return lowStock.sort((a, b) => a.remainingPercentage - b.remainingPercentage);
  }

  /**
   * Gets a quick summary of the shopping list for dashboard display.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to summary data
   * @throws {NotFoundError} If trip is not found
   *
   * @example
   * ```typescript
   * const summary = await shoppingService.getShoppingListSummary('trip-123');
   * console.log(`Total products: ${summary.totalProducts}`);
   * ```
   */
  public async getShoppingListSummary(tripId: string): Promise<{
    tripId: string;
    tripName: string;
    totalProducts: number;
    essentialProducts: number;
    optionalProducts: number;
    totalEstimatedCost: number;
    categoryCounts: Array<{ category: string; count: number }>;
    generatedAt: Date;
  }> {
    const shoppingList = await this.generate(tripId);

    const categoryCounts = shoppingList.byCategory.map((group) => ({
      category: group.categoryDisplayName,
      count: group.itemCount,
    }));

    return {
      tripId: shoppingList.tripId,
      tripName: shoppingList.tripName,
      totalProducts: shoppingList.totalItems,
      essentialProducts: shoppingList.essentialItemsCount,
      optionalProducts: shoppingList.optionalItemsCount,
      totalEstimatedCost: shoppingList.totalEstimatedCost,
      categoryCounts,
      generatedAt: shoppingList.generatedAt,
    };
  }

  /**
   * Gets display name for a category.
   *
   * @param category - The category (string or enum)
   * @returns The display name
   */
  private getCategoryDisplayName(category: string | ProductCategory): string {
    const categoryStr = String(category);
    const displayNames: Record<string, string> = {
      food: 'Comida',
      beverage: 'Bebidas',
      alcohol: 'Alcohol',
      snack: 'Snacks',
      other: 'Otros',
      FOOD: 'Comida',
      BEVERAGE: 'Bebidas',
      BEVERAGES: 'Bebidas',
      ALCOHOL: 'Alcohol',
      SNACK: 'Snacks',
      SNACKS: 'Snacks',
      OTHER: 'Otros',
      MEAT: 'Carnes',
      SEAFOOD: 'Mariscos',
      DAIRY: 'Lacteos',
      PRODUCE: 'Frutas y Verduras',
      BAKERY: 'Panaderia',
      CONDIMENTS: 'Condimentos',
      FROZEN: 'Congelados',
      CANNED: 'Enlatados',
      DRY_GOODS: 'Secos',
    };
    return displayNames[categoryStr] || categoryStr;
  }

  /**
   * Extracts unique dates from shopping list items.
   *
   * @param items - Array of shopping list items (can be readonly)
   * @returns Array of unique dates sorted chronologically
   */
  private extractUniqueDates(items: ReadonlyArray<ShoppingListItemDTO>): Date[] {
    const dateSet = new Set<string>();

    for (const item of items) {
      for (const dateData of item.byDate) {
        dateSet.add(this.normalizeDate(dateData.date));
      }
    }

    return Array.from(dateSet)
      .map((d) => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());
  }

  /**
   * Normalizes a date to ISO date string (YYYY-MM-DD).
   *
   * @param date - The date to normalize
   * @returns Normalized date string
   */
  private normalizeDate(date: Date): string {
    const isoString = date.toISOString();
    const datePart = isoString.split('T')[0];
    return datePart ?? isoString.substring(0, 10);
  }

  /**
   * Formats a date for CSV export (YYYY-MM-DD).
   *
   * @param date - The date to format
   * @returns Formatted date string
   */
  private formatDateForCSV(date: Date): string {
    const isoString = date.toISOString();
    const datePart = isoString.split('T')[0];
    return datePart ?? isoString.substring(0, 10);
  }

  /**
   * Escapes a CSV row properly, handling special characters.
   *
   * @param row - Array of cell values
   * @returns Properly escaped CSV row string
   */
  private escapeCSVRow(row: string[]): string {
    return row
      .map((cell) => {
        const cellStr = String(cell);
        // If cell contains comma, quote, newline, or semicolon, wrap in quotes
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n') || cellStr.includes(';')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      })
      .join(',');
  }
}
