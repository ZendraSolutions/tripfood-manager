/**
 * @fileoverview Consumption Application Service.
 * Handles business logic and orchestration for Consumption operations.
 * Follows SOLID principles with single responsibility and dependency injection.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 * @module application/services/ConsumptionService
 */

import type { Consumption } from '@domain/entities/Consumption';
import type { IConsumptionRepository } from '@domain/interfaces/repositories/IConsumptionRepository';
import type { IParticipantRepository } from '@domain/interfaces/repositories/IParticipantRepository';
import type { IProductRepository } from '@domain/interfaces/repositories/IProductRepository';
import type { ITripRepository } from '@domain/interfaces/repositories/ITripRepository';
import { NotFoundError, ValidationError } from '@domain/errors';
import type { MealType } from '@domain/types';
import type {
  ConsumptionResponseDTO,
  ConsumptionByDateDTO,
  ConsumptionByParticipantDTO,
} from '../dtos/consumption';

/**
 * DTO for creating a consumption (legacy compatibility).
 */
export interface CreateConsumptionDTO {
  /** Trip ID */
  readonly tripId: string;
  /** Participant ID */
  readonly participantId: string;
  /** Product ID */
  readonly productId: string;
  /** Date of consumption */
  readonly date: Date;
  /** Meal type */
  readonly meal: MealType;
  /** Quantity consumed */
  readonly quantity: number;
}

/**
 * DTO for updating a consumption (legacy compatibility).
 */
export interface UpdateConsumptionDTO {
  /** Updated date */
  readonly date?: Date;
  /** Updated meal type */
  readonly meal?: MealType;
  /** Updated quantity */
  readonly quantity?: number;
}

/**
 * Application service for Consumption operations.
 *
 * @description
 * This service provides the application layer interface for Consumption operations.
 * It handles:
 * - CRUD operations for consumption records
 * - Validation of participant and product existence
 * - Aggregation of consumption data by date and participant
 * - Business rule validation
 *
 * @example
 * ```typescript
 * const consumptionService = new ConsumptionService(
 *   consumptionRepository,
 *   participantRepository,
 *   productRepository,
 *   tripRepository
 * );
 *
 * const consumption = await consumptionService.create({
 *   tripId: 'trip-123',
 *   participantId: 'participant-456',
 *   productId: 'product-789',
 *   date: new Date('2024-07-15'),
 *   meal: 'lunch',
 *   quantity: 2,
 * });
 * ```
 */
export class ConsumptionService {
  /**
   * Creates a new ConsumptionService instance.
   *
   * @param consumptionRepository - Repository for Consumption persistence operations
   * @param participantRepository - Repository for Participant operations (for existence validation)
   * @param productRepository - Repository for Product operations (for existence validation)
   * @param tripRepository - Repository for Trip operations (optional, for date validation)
   */
  constructor(
    private readonly consumptionRepository: IConsumptionRepository,
    private readonly participantRepository: IParticipantRepository,
    private readonly productRepository: IProductRepository,
    private readonly tripRepository?: ITripRepository
  ) {
    // Mark private methods as intentionally kept for future use
    void this._toResponseDTO;
  }

  /**
   * Creates a new consumption record.
   *
   * @param dto - The consumption creation data
   * @returns Promise resolving to the created consumption
   * @throws {NotFoundError} If participant or product is not found
   * @throws {ValidationError} If validation fails
   *
   * @example
   * ```typescript
   * const consumption = await consumptionService.create({
   *   tripId: 'trip-123',
   *   participantId: 'participant-456',
   *   productId: 'product-789',
   *   date: new Date('2024-07-15'),
   *   meal: 'lunch',
   *   quantity: 2,
   * });
   * ```
   */
  public async create(dto: CreateConsumptionDTO): Promise<Consumption> {
    // Validate input
    this.validateCreateDTO(dto);

    // Verify participant exists
    const participantExists = await this.participantRepository.exists(dto.participantId);
    if (!participantExists) {
      throw NotFoundError.withId('Participant', dto.participantId);
    }

    // Verify product exists
    const productExists = await this.productRepository.exists(dto.productId);
    if (!productExists) {
      throw NotFoundError.withId('Product', dto.productId);
    }

    // Validate date is within trip range if we have trip repository
    if (this.tripRepository) {
      const trip = await this.tripRepository.findById(dto.tripId);
      if (trip) {
        const consumptionDate = new Date(dto.date);
        if (consumptionDate < trip.startDate || consumptionDate > trip.endDate) {
          throw ValidationError.invalidDateRange('date', 'trip dates');
        }
      }
    }

    // Create domain entity
    const { Consumption } = await import('@domain/entities/Consumption');
    const consumption = Consumption.create({
      tripId: dto.tripId,
      participantId: dto.participantId,
      productId: dto.productId,
      date: dto.date,
      meal: dto.meal,
      quantity: dto.quantity,
    });

    return this.consumptionRepository.save(consumption);
  }

  /**
   * Creates a new consumption using the legacy DTO interface.
   *
   * @param dto - The consumption creation data
   * @returns Promise resolving to the created consumption
   * @throws {NotFoundError} If participant or product is not found
   */
  public async createConsumption(dto: CreateConsumptionDTO): Promise<Consumption> {
    // Verify participant exists
    const participantExists = await this.participantRepository.exists(dto.participantId);
    if (!participantExists) {
      throw NotFoundError.withId('Participant', dto.participantId);
    }

    // Verify product exists
    const productExists = await this.productRepository.exists(dto.productId);
    if (!productExists) {
      throw NotFoundError.withId('Product', dto.productId);
    }

    const { Consumption } = await import('@domain/entities/Consumption');
    const consumption = Consumption.create({
      tripId: dto.tripId,
      participantId: dto.participantId,
      productId: dto.productId,
      date: dto.date,
      meal: dto.meal,
      quantity: dto.quantity,
    });
    return this.consumptionRepository.save(consumption);
  }

  /**
   * Creates multiple consumption records in bulk.
   *
   * @param tripId - The trip ID for all consumptions
   * @param consumptions - Array of consumption data
   * @returns Promise resolving to array of created consumptions
   */
  public async createBulk(
    tripId: string,
    consumptions: ReadonlyArray<Omit<CreateConsumptionDTO, 'tripId'>>
  ): Promise<Consumption[]> {
    const { Consumption } = await import('@domain/entities/Consumption');
    const created: Consumption[] = [];

    for (const dto of consumptions) {
      const consumption = Consumption.create({
        tripId,
        participantId: dto.participantId,
        productId: dto.productId,
        date: dto.date,
        meal: dto.meal,
        quantity: dto.quantity,
      });
      created.push(consumption);
    }

    return this.consumptionRepository.saveMany(created);
  }

  /**
   * Retrieves a consumption by its ID.
   *
   * @param id - The consumption's unique identifier
   * @returns Promise resolving to the consumption if found, null otherwise
   */
  public async getById(id: string): Promise<Consumption | null> {
    return this.consumptionRepository.findById(id);
  }

  /**
   * Retrieves a consumption by ID, throwing if not found.
   *
   * @param id - The consumption's unique identifier
   * @returns Promise resolving to the consumption
   * @throws {NotFoundError} If the consumption is not found
   */
  public async getConsumptionById(id: string): Promise<Consumption> {
    const consumption = await this.consumptionRepository.findById(id);
    if (!consumption) {
      throw NotFoundError.withId('Consumption', id);
    }
    return consumption;
  }

  /**
   * Retrieves all consumptions for a trip.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to array of consumptions
   */
  public async getByTripId(tripId: string): Promise<Consumption[]> {
    return this.consumptionRepository.findByTripId(tripId);
  }

  /**
   * Retrieves all consumptions for a trip (alias for getByTripId).
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to array of consumptions
   */
  public async getConsumptionsByTripId(tripId: string): Promise<Consumption[]> {
    return this.consumptionRepository.findByTripId(tripId);
  }

  /**
   * Retrieves consumptions for a trip on a specific date.
   *
   * @param tripId - The trip's unique identifier
   * @param date - The date to filter by
   * @returns Promise resolving to array of consumptions
   */
  public async getByTripIdAndDate(tripId: string, date: Date): Promise<Consumption[]> {
    return this.consumptionRepository.findByTripIdAndDate(tripId, date);
  }

  /**
   * Retrieves consumptions for a trip on a specific date (alias).
   *
   * @param tripId - The trip's unique identifier
   * @param date - The date to filter by
   * @returns Promise resolving to array of consumptions
   */
  public async getConsumptionsByTripIdAndDate(tripId: string, date: Date): Promise<Consumption[]> {
    return this.consumptionRepository.findByTripIdAndDate(tripId, date);
  }

  /**
   * Retrieves consumptions for a participant.
   *
   * @param participantId - The participant's unique identifier
   * @returns Promise resolving to array of consumptions
   */
  public async getByParticipantId(participantId: string): Promise<Consumption[]> {
    return this.consumptionRepository.findByParticipantId(participantId);
  }

  /**
   * Retrieves consumptions for a participant (alias).
   *
   * @param participantId - The participant's unique identifier
   * @returns Promise resolving to array of consumptions
   */
  public async getConsumptionsByParticipantId(participantId: string): Promise<Consumption[]> {
    return this.consumptionRepository.findByParticipantId(participantId);
  }

  /**
   * Retrieves consumptions for a product.
   *
   * @param productId - The product's unique identifier
   * @returns Promise resolving to array of consumptions
   */
  public async getByProductId(productId: string): Promise<Consumption[]> {
    return this.consumptionRepository.findByProductId(productId);
  }

  /**
   * Retrieves consumptions for a product (alias).
   *
   * @param productId - The product's unique identifier
   * @returns Promise resolving to array of consumptions
   */
  public async getConsumptionsByProductId(productId: string): Promise<Consumption[]> {
    return this.consumptionRepository.findByProductId(productId);
  }

  /**
   * Gets consumption summary grouped by date.
   *
   * @param tripId - The trip ID to get summary for
   * @returns Promise resolving to array of consumption summaries by date
   */
  public async getSummaryByDate(tripId: string): Promise<ConsumptionByDateDTO[]> {
    const consumptions = await this.consumptionRepository.findByTripId(tripId);

    const byDate = new Map<string, {
      date: Date;
      participants: Set<string>;
      count: number;
      byMeal: Map<MealType, number>;
    }>();

    for (const consumption of consumptions) {
      const dateKey = consumption.date.toISOString().split('T')[0] ?? '';

      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, {
          date: consumption.date,
          participants: new Set(),
          count: 0,
          byMeal: new Map(),
        });
      }

      const entry = byDate.get(dateKey);
      if (entry) {
        entry.participants.add(consumption.participantId);
        entry.count++;
        entry.byMeal.set(consumption.meal, (entry.byMeal.get(consumption.meal) ?? 0) + 1);
      }
    }

    const summaries: ConsumptionByDateDTO[] = [];
    for (const [, data] of byDate) {
      summaries.push({
        date: data.date,
        participantCount: data.participants.size,
        totalConsumptions: data.count,
        byMealType: Array.from(data.byMeal.entries()).map(([mealType, count]) => ({
          mealType: mealType as MealType,
          count,
        })),
      });
    }

    return summaries.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Gets consumption summary grouped by participant.
   *
   * @param tripId - The trip ID to get summary for
   * @returns Promise resolving to array of consumption summaries by participant
   */
  public async getSummaryByParticipant(tripId: string): Promise<ConsumptionByParticipantDTO[]> {
    const consumptions = await this.consumptionRepository.findByTripId(tripId);

    const byParticipant = new Map<string, {
      count: number;
      products: Map<string, number>;
    }>();

    for (const consumption of consumptions) {
      if (!byParticipant.has(consumption.participantId)) {
        byParticipant.set(consumption.participantId, {
          count: 0,
          products: new Map(),
        });
      }

      const entry = byParticipant.get(consumption.participantId)!;
      entry.count++;
      entry.products.set(
        consumption.productId,
        (entry.products.get(consumption.productId) || 0) + consumption.quantity
      );
    }

    const summaries: ConsumptionByParticipantDTO[] = [];
    for (const [participantId, data] of byParticipant) {
      const participant = await this.participantRepository.findById(participantId);

      const products: Array<{ productId: string; productName: string; totalQuantity: number }> = [];
      for (const [productId, quantity] of data.products) {
        const product = await this.productRepository.findById(productId);
        products.push({
          productId,
          productName: product?.name || 'Unknown',
          totalQuantity: quantity,
        });
      }

      summaries.push({
        participantId,
        participantName: participant?.name || 'Unknown',
        totalConsumptions: data.count,
        products,
      });
    }

    return summaries;
  }

  /**
   * Updates an existing consumption.
   *
   * @param id - The consumption's unique identifier
   * @param dto - The update data
   * @returns Promise resolving to the updated consumption
   * @throws {NotFoundError} If the consumption is not found
   * @throws {ValidationError} If validation fails
   */
  public async update(id: string, dto: UpdateConsumptionDTO): Promise<Consumption> {
    const consumption = await this.getConsumptionById(id);

    // Validate update
    this.validateUpdateDTO(dto);

    const updatedConsumption = consumption.update(dto);
    return this.consumptionRepository.save(updatedConsumption);
  }

  /**
   * Updates an existing consumption using domain DTO.
   *
   * @param id - The consumption's unique identifier
   * @param dto - The update data
   * @returns Promise resolving to the updated consumption
   * @throws {NotFoundError} If consumption is not found
   */
  public async updateConsumption(id: string, dto: UpdateConsumptionDTO): Promise<Consumption> {
    const consumption = await this.getConsumptionById(id);
    const updatedConsumption = consumption.update(dto);
    return this.consumptionRepository.save(updatedConsumption);
  }

  /**
   * Deletes a consumption by ID.
   *
   * @param id - The consumption's unique identifier
   * @returns Promise resolving when deletion is complete
   * @throws {NotFoundError} If the consumption is not found
   */
  public async delete(id: string): Promise<void> {
    const exists = await this.consumptionRepository.exists(id);
    if (!exists) {
      throw NotFoundError.withId('Consumption', id);
    }
    await this.consumptionRepository.delete(id);
  }

  /**
   * Deletes a consumption by ID (alias for delete).
   *
   * @param id - The consumption's unique identifier
   * @returns Promise resolving when deletion is complete
   * @throws {NotFoundError} If consumption is not found
   */
  public async deleteConsumption(id: string): Promise<void> {
    const exists = await this.consumptionRepository.exists(id);
    if (!exists) {
      throw NotFoundError.withId('Consumption', id);
    }
    await this.consumptionRepository.delete(id);
  }

  /**
   * Deletes all consumptions for a trip.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to the number of consumptions deleted
   */
  public async deleteByTripId(tripId: string): Promise<number> {
    return this.consumptionRepository.deleteByTripId(tripId);
  }

  /**
   * Deletes all consumptions for a trip (alias for deleteByTripId).
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to the number of consumptions deleted
   */
  public async deleteConsumptionsByTripId(tripId: string): Promise<number> {
    return this.consumptionRepository.deleteByTripId(tripId);
  }

  /**
   * Deletes all consumptions for a participant.
   *
   * @param participantId - The participant's unique identifier
   * @returns Promise resolving to the number of consumptions deleted
   */
  public async deleteByParticipantId(participantId: string): Promise<number> {
    return this.consumptionRepository.deleteByParticipantId(participantId);
  }

  /**
   * Deletes all consumptions for a participant (alias).
   *
   * @param participantId - The participant's unique identifier
   * @returns Promise resolving to the number of consumptions deleted
   */
  public async deleteConsumptionsByParticipantId(participantId: string): Promise<number> {
    return this.consumptionRepository.deleteByParticipantId(participantId);
  }

  /**
   * Checks if a consumption exists.
   *
   * @param id - The consumption's unique identifier
   * @returns Promise resolving to true if the consumption exists
   */
  public async exists(id: string): Promise<boolean> {
    return this.consumptionRepository.exists(id);
  }

  /**
   * Gets the total count of consumptions.
   *
   * @returns Promise resolving to the count
   */
  public async count(): Promise<number> {
    return this.consumptionRepository.count();
  }

  /**
   * Gets the total count of consumptions (alias for count).
   *
   * @returns Promise resolving to the count
   */
  public async getConsumptionCount(): Promise<number> {
    return this.consumptionRepository.count();
  }

  /**
   * Validates the create DTO.
   *
   * @param dto - The DTO to validate
   * @throws {ValidationError} If validation fails
   */
  private validateCreateDTO(dto: CreateConsumptionDTO): void {
    if (!dto.tripId || dto.tripId.trim().length === 0) {
      throw ValidationError.required('tripId', 'Consumption');
    }

    if (!dto.participantId || dto.participantId.trim().length === 0) {
      throw ValidationError.required('participantId', 'Consumption');
    }

    if (!dto.productId || dto.productId.trim().length === 0) {
      throw ValidationError.required('productId', 'Consumption');
    }

    if (!dto.date) {
      throw ValidationError.required('date', 'Consumption');
    }

    if (!dto.meal) {
      throw ValidationError.required('meal', 'Consumption');
    }

    if (dto.quantity === undefined || dto.quantity < 0) {
      throw ValidationError.outOfRange('quantity', 0, undefined, dto.quantity);
    }
  }

  /**
   * Validates the update DTO.
   *
   * @param dto - The DTO to validate
   * @throws {ValidationError} If validation fails
   */
  private validateUpdateDTO(dto: UpdateConsumptionDTO): void {
    if (dto.quantity !== undefined && dto.quantity < 0) {
      throw ValidationError.outOfRange('quantity', 0, undefined, dto.quantity);
    }
  }

  /**
   * Transforms a Consumption entity to a response DTO.
   *
   * @param consumption - The consumption entity
   * @param participantName - Name of the participant
   * @param productName - Name of the product
   * @returns The response DTO
   */
  private _toResponseDTO(
    consumption: Consumption,
    participantName: string,
    productName: string
  ): ConsumptionResponseDTO {
    return {
      id: consumption.id,
      tripId: consumption.tripId,
      participantId: consumption.participantId,
      participantName,
      productId: consumption.productId,
      productName,
      date: consumption.date,
      quantity: consumption.quantity,
      mealType: consumption.meal,
      createdAt: consumption.createdAt,
      updatedAt: consumption.updatedAt ?? consumption.createdAt,
    };
  }
}
