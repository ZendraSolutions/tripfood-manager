/**
 * Dependency Injection barrel export
 * @module shared/di
 */

export {
  services,
  tripService,
  participantService,
  productService,
  consumptionService,
  availabilityService,
  shoppingService,
  database,
} from './container';

export type { ServiceContainer } from './container';
