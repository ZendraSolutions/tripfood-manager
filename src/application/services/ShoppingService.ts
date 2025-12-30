/**
 * @fileoverview Shopping Application Service
 * Calculates shopping lists based on consumptions and availability
 * @module application/services/ShoppingService
 */

import type { IConsumptionRepository } from '@domain/interfaces/repositories/IConsumptionRepository';
import type { IProductRepository } from '@domain/interfaces/repositories/IProductRepository';
import type { IAvailabilityRepository } from '@domain/interfaces/repositories/IAvailabilityRepository';
import type { Product } from '@domain/entities/Product';

/**
 * Shopping list item
 */
export interface ShoppingListItem {
  product: Product;
  totalQuantity: number;
  unit: string;
}

/**
 * Complete shopping list
 */
export interface ShoppingList {
  tripId: string;
  items: ShoppingListItem[];
  generatedAt: Date;
}

/**
 * Consumption summary by product
 */
export interface ProductConsumptionSummary {
  productId: string;
  productName: string;
  totalQuantity: number;
  unit: string;
  consumptionCount: number;
}

/**
 * Application service for Shopping operations
 */
export class ShoppingService {
  constructor(
    private readonly consumptionRepository: IConsumptionRepository,
    private readonly productRepository: IProductRepository,
    private readonly availabilityRepository: IAvailabilityRepository
  ) {}

  /**
   * Generates a shopping list for a trip based on consumptions
   */
  async generateShoppingList(tripId: string): Promise<ShoppingList> {
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
   * Gets consumption summary grouped by product for a trip
   */
  async getConsumptionSummaryByProduct(tripId: string): Promise<ProductConsumptionSummary[]> {
    const consumptions = await this.consumptionRepository.findByTripId(tripId);

    // Group by product
    const productData = new Map<
      string,
      { quantity: number; count: number }
    >();

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
   * Calculates estimated quantities based on participants and availability
   */
  async calculateEstimatedQuantities(
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
   * Gets the difference between estimated and actual consumption
   */
  async getConsumptionVariance(tripId: string): Promise<
    Array<{
      productId: string;
      productName: string;
      estimated: number;
      actual: number;
      variance: number;
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
    const variances = [];

    for (const product of products) {
      if (product.defaultQuantityPerPerson) {
        const estimated = product.defaultQuantityPerPerson * totalParticipantMeals;
        const actual = actualByProduct.get(product.id) || 0;
        const variance = actual - estimated;

        variances.push({
          productId: product.id,
          productName: product.name,
          estimated,
          actual,
          variance,
          unit: product.unit,
        });
      }
    }

    // Sort by absolute variance descending
    variances.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));

    return variances;
  }
}
