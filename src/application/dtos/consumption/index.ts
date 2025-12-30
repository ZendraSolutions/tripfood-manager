/**
 * @fileoverview Barrel export for Consumption DTOs.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

export { MealType } from './CreateConsumptionDTO';
export type {
  CreateConsumptionDTO,
  BulkCreateConsumptionDTO,
} from './CreateConsumptionDTO';
export type { UpdateConsumptionDTO } from './UpdateConsumptionDTO';
export type {
  ConsumptionResponseDTO,
  ConsumptionByDateDTO,
  ConsumptionByParticipantDTO,
} from './ConsumptionResponseDTO';
