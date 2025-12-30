/**
 * @fileoverview Domain errors barrel export file.
 * Provides a single point of import for all domain error classes.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

export {
  DomainError,
  DomainErrorCode,
  type ISerializedDomainError,
} from './DomainError';

export {
  ValidationError,
  type IValidationFailure,
} from './ValidationError';

export { NotFoundError } from './NotFoundError';

export { DuplicateError } from './DuplicateError';
