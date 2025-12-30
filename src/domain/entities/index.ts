/**
 * @fileoverview Domain entities barrel export file.
 * Provides a single point of import for all domain entities.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

// ============================================================================
// Trip Entity
// ============================================================================

export {
  Trip,
  type ITripCreateDTO,
  type ITripUpdateDTO,
  type ITripProps,
  // Backward compatibility
  type TripEntity,
  type CreateTripProps,
  createTrip,
} from './Trip';

// ============================================================================
// Participant Entity
// ============================================================================

export {
  Participant,
  type IParticipantCreateDTO,
  type IParticipantUpdateDTO,
  type IParticipantProps,
  // Backward compatibility
  type ParticipantEntity,
  type CreateParticipantProps,
  createParticipant,
} from './Participant';

// ============================================================================
// Product Entity
// ============================================================================

export {
  Product,
  type IProductCreateDTO,
  type IProductUpdateDTO,
  type IProductProps,
  // Backward compatibility
  type ProductEntity,
  type CreateProductProps,
  createProduct,
} from './Product';

// ============================================================================
// Consumption Entity
// ============================================================================

export {
  Consumption,
  type IConsumptionCreateDTO,
  type IConsumptionUpdateDTO,
  type IConsumptionProps,
  // Backward compatibility
  type ConsumptionEntity,
  type CreateConsumptionProps,
  createConsumption,
} from './Consumption';

// ============================================================================
// Availability Entity
// ============================================================================

export {
  Availability,
  type IAvailabilityCreateDTO,
  type IAvailabilityUpdateDTO,
  type IAvailabilityProps,
  // Backward compatibility
  type AvailabilityEntity,
  type CreateAvailabilityProps,
  createAvailability,
} from './Availability';
