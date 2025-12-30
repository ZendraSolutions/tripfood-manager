/**
 * TripContext - Context for the currently selected trip
 */
import { createContext, useContext, useState, useCallback, useMemo, useEffect, type FC, type ReactNode } from 'react';
import type { Trip } from '../hooks/useTrips';
import type { Participant } from '../hooks/useParticipants';
import type { Product } from '../hooks/useProducts';

// Availability entry interface
export interface AvailabilityEntry {
  participantId: string;
  productId: string;
  available: boolean;
}

// Trip statistics
export interface TripStats {
  totalParticipants: number;
  activeParticipants: number;
  totalProducts: number;
  purchasedProducts: number;
  pendingProducts: number;
  estimatedTotal: number;
  completionPercentage: number;
}

// Context state
export interface TripContextState {
  /** Current trip data */
  trip: Trip | null;
  /** Trip participants */
  participants: Participant[];
  /** Trip products */
  products: Product[];
  /** Availability matrix */
  availability: AvailabilityEntry[];
  /** Computed statistics */
  stats: TripStats;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
}

// Context actions
export interface TripContextActions {
  /** Set the current trip */
  setTrip: (trip: Trip | null) => void;
  /** Set participants */
  setParticipants: (participants: Participant[]) => void;
  /** Set products */
  setProducts: (products: Product[]) => void;
  /** Update availability */
  setAvailability: (availability: AvailabilityEntry[]) => void;
  /** Toggle product availability for a participant */
  toggleAvailability: (participantId: string, productId: string) => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set error */
  setError: (error: string | null) => void;
  /** Clear trip data */
  clearTrip: () => void;
}

export type TripContextValue = TripContextState & TripContextActions;

// Calculate default stats
function calculateStats(
  participants: Participant[],
  products: Product[]
): TripStats {
  const activeParticipants = participants.filter((p) => p.isActive).length;
  const purchasedProducts = products.filter((p) => p.isPurchased).length;
  const pendingProducts = products.length - purchasedProducts;
  const estimatedTotal = products.reduce(
    (sum, p) => sum + (p.estimatedPrice ?? 0) * p.quantity,
    0
  );
  const completionPercentage =
    products.length > 0 ? Math.round((purchasedProducts / products.length) * 100) : 0;

  return {
    totalParticipants: participants.length,
    activeParticipants,
    totalProducts: products.length,
    purchasedProducts,
    pendingProducts,
    estimatedTotal,
    completionPercentage,
  };
}

// Initial state
const initialState: TripContextState = {
  trip: null,
  participants: [],
  products: [],
  availability: [],
  stats: {
    totalParticipants: 0,
    activeParticipants: 0,
    totalProducts: 0,
    purchasedProducts: 0,
    pendingProducts: 0,
    estimatedTotal: 0,
    completionPercentage: 0,
  },
  isLoading: false,
  error: null,
};

// Context
const TripContext = createContext<TripContextValue | null>(null);

// Provider props
interface TripProviderProps {
  children: ReactNode;
  tripId?: string;
}

/**
 * TripProvider - Provides current trip context
 */
export const TripProvider: FC<TripProviderProps> = ({ children, tripId }) => {
  const [trip, setTripState] = useState<Trip | null>(null);
  const [participants, setParticipantsState] = useState<Participant[]>([]);
  const [products, setProductsState] = useState<Product[]>([]);
  const [availability, setAvailabilityState] = useState<AvailabilityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);

  // Computed stats
  const stats = useMemo(
    () => calculateStats(participants, products),
    [participants, products]
  );

  // Actions
  const setTrip = useCallback((newTrip: Trip | null) => {
    setTripState(newTrip);
  }, []);

  const setParticipants = useCallback((newParticipants: Participant[]) => {
    setParticipantsState(newParticipants);
  }, []);

  const setProducts = useCallback((newProducts: Product[]) => {
    setProductsState(newProducts);
  }, []);

  const setAvailability = useCallback((newAvailability: AvailabilityEntry[]) => {
    setAvailabilityState(newAvailability);
  }, []);

  const toggleAvailability = useCallback((participantId: string, productId: string) => {
    setAvailabilityState((prev) => {
      const existingIndex = prev.findIndex(
        (a) => a.participantId === participantId && a.productId === productId
      );

      if (existingIndex >= 0) {
        // Toggle existing entry
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          available: !updated[existingIndex].available,
        };
        return updated;
      } else {
        // Add new entry
        return [...prev, { participantId, productId, available: true }];
      }
    });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const setError = useCallback((err: string | null) => {
    setErrorState(err);
  }, []);

  const clearTrip = useCallback(() => {
    setTripState(null);
    setParticipantsState([]);
    setProductsState([]);
    setAvailabilityState([]);
    setErrorState(null);
  }, []);

  // Load trip data when tripId changes
  useEffect(() => {
    if (tripId) {
      // TODO: Load trip data from services
      // This will be implemented when services are available
      setIsLoading(true);

      // Simulate loading
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      clearTrip();
    }
  }, [tripId, clearTrip]);

  const value = useMemo<TripContextValue>(
    () => ({
      trip,
      participants,
      products,
      availability,
      stats,
      isLoading,
      error,
      setTrip,
      setParticipants,
      setProducts,
      setAvailability,
      toggleAvailability,
      setLoading,
      setError,
      clearTrip,
    }),
    [
      trip,
      participants,
      products,
      availability,
      stats,
      isLoading,
      error,
      setTrip,
      setParticipants,
      setProducts,
      setAvailability,
      toggleAvailability,
      setLoading,
      setError,
      clearTrip,
    ]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

/**
 * Hook to access trip context
 * @throws Error if used outside of TripProvider
 */
export function useTrip(): TripContextValue {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}
