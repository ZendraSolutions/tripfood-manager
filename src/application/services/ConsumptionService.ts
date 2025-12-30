/**
 * @fileoverview Consumption Application Service
 * Orchestrates consumption-related use cases
 * @module application/services/ConsumptionService
 */

import type { Consumption } from '@domain/entities/Consumption';
import type { IConsumptionRepository } from '@domain/interfaces/repositories/IConsumptionRepository';
import type { IParticipantRepository } from '@domain/interfaces/repositories/IParticipantRepository';
import type { IProductRepository } from '@domain/interfaces/repositories/IProductRepository';
import { NotFoundError } from '@domain/errors';
import type { MealType } from '@domain/types';

/**
 * DTO for creating a consumption
 */
export interface CreateConsumptionDTO {
  tripId: string;
  participantId: string;
  productId: string;
  date: Date;
  meal: MealType;
  quantity: number;
}

/**
 * DTO for updating a consumption
 */
export interface UpdateConsumptionDTO {
  date?: Date;
  meal?: MealType;
  quantity?: number;
}

/**
 * Application service for Consumption operations
 */
export class ConsumptionService {
  constructor(
    private readonly consumptionRepository: IConsumptionRepository,
    private readonly participantRepository: IParticipantRepository,
    private readonly productRepository: IProductRepository
  ) {}

  /**
   * Gets all consumptions for a trip
   */
  async getConsumptionsByTripId(tripId: string): Promise<Consumption[]> {
    return this.consumptionRepository.findByTripId(tripId);
  }

  /**
   * Gets consumptions for a trip on a specific date
   */
  async getConsumptionsByTripIdAndDate(tripId: string, date: Date): Promise<Consumption[]> {
    return this.consumptionRepository.findByTripIdAndDate(tripId, date);
  }

  /**
   * Gets consumptions for a participant
   */
  async getConsumptionsByParticipantId(participantId: string): Promise<Consumption[]> {
    return this.consumptionRepository.findByParticipantId(participantId);
  }

  /**
   * Gets consumptions for a product
   */
  async getConsumptionsByProductId(productId: string): Promise<Consumption[]> {
    return this.consumptionRepository.findByProductId(productId);
  }

  /**
   * Gets a consumption by ID
   * @throws {NotFoundError} If consumption is not found
   */
  async getConsumptionById(id: string): Promise<Consumption> {
    const consumption = await this.consumptionRepository.findById(id);
    if (!consumption) {
      throw NotFoundError.withId('Consumption', id);
    }
    return consumption;
  }

  /**
   * Creates a new consumption
   * @throws {NotFoundError} If participant or product is not found
   */
  async createConsumption(dto: CreateConsumptionDTO): Promise<Consumption> {
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
   * Updates an existing consumption
   * @throws {NotFoundError} If consumption is not found
   */
  async updateConsumption(id: string, dto: UpdateConsumptionDTO): Promise<Consumption> {
    const consumption = await this.getConsumptionById(id);
    const updatedConsumption = consumption.update(dto);
    return this.consumptionRepository.save(updatedConsumption);
  }

  /**
   * Deletes a consumption by ID
   * @throws {NotFoundError} If consumption is not found
   */
  async deleteConsumption(id: string): Promise<void> {
    const exists = await this.consumptionRepository.exists(id);
    if (!exists) {
      throw NotFoundError.withId('Consumption', id);
    }
    await this.consumptionRepository.delete(id);
  }

  /**
   * Deletes all consumptions for a trip
   */
  async deleteConsumptionsByTripId(tripId: string): Promise<number> {
    return this.consumptionRepository.deleteByTripId(tripId);
  }

  /**
   * Deletes all consumptions for a participant
   */
  async deleteConsumptionsByParticipantId(participantId: string): Promise<number> {
    return this.consumptionRepository.deleteByParticipantId(participantId);
  }

  /**
   * Gets the total count of consumptions
   */
  async getConsumptionCount(): Promise<number> {
    return this.consumptionRepository.count();
  }
}
