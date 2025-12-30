/**
 * @fileoverview Repository interfaces barrel export
 * @module domain/interfaces/repositories
 */

export type { IBaseRepository, IQueryOptions, IPaginatedRepository } from './IBaseRepository';
export type { ITripRepository, ITripQueryFilters } from './ITripRepository';
export type { IParticipantRepository, IParticipantQueryFilters } from './IParticipantRepository';
export type { IProductRepository, IProductQueryFilters } from './IProductRepository';
export type { IConsumptionRepository, IConsumptionQueryFilters, IConsumptionSummary } from './IConsumptionRepository';
export type { IAvailabilityRepository, IAvailabilityQueryFilters, IAvailabilitySummary } from './IAvailabilityRepository';
