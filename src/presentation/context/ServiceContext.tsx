/**
 * Service Context - Provides dependency injection for application services
 * @module presentation/context/ServiceContext
 */
import { createContext, useContext, useMemo } from 'react';
import type { FC, ReactNode } from 'react';
import { services, type ServiceContainer } from '@shared/di/container';

const ServiceContext = createContext<ServiceContainer | null>(null);

interface ServiceProviderProps {
  children: ReactNode;
}

/**
 * Provider component that makes services available throughout the app
 */
export const ServiceProvider: FC<ServiceProviderProps> = ({ children }) => {
  // Memoize to prevent unnecessary re-renders
  const value = useMemo(() => services, []);

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
};

/**
 * Hook to access application services
 * @throws Error if used outside of ServiceProvider
 */
export const useServices = (): ServiceContainer => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};

// Export individual service hooks for convenience
export const useTripService = () => useServices().tripService;
export const useParticipantService = () => useServices().participantService;
export const useProductService = () => useServices().productService;
export const useConsumptionService = () => useServices().consumptionService;
export const useAvailabilityService = () => useServices().availabilityService;
export const useShoppingService = () => useServices().shoppingService;

// Re-export ServiceContainer type
export type { ServiceContainer };
