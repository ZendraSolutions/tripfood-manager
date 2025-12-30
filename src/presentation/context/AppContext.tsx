/**
 * AppContext - Global application state and configuration
 */
import { createContext, useContext, useReducer, useCallback, useMemo, type FC, type ReactNode } from 'react';

// Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface AppState {
  /** Current theme */
  theme: 'light' | 'dark';
  /** Whether the app is in offline mode */
  isOffline: boolean;
  /** Active notifications */
  notifications: Notification[];
  /** Whether the app is initializing */
  isInitializing: boolean;
}

type AppAction =
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_OFFLINE'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_INITIALIZING'; payload: boolean };

export interface AppContextValue extends AppState {
  /** Toggle theme between light and dark */
  toggleTheme: () => void;
  /** Set offline mode */
  setOffline: (offline: boolean) => void;
  /** Show a notification */
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  /** Remove a notification */
  removeNotification: (id: string) => void;
  /** Clear all notifications */
  clearNotifications: () => void;
}

// Initial state
const initialState: AppState = {
  theme: 'light',
  isOffline: false,
  notifications: [],
  isInitializing: true,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_OFFLINE':
      return { ...state, isOffline: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'SET_INITIALIZING':
      return { ...state, isInitializing: action.payload };
    default:
      return state;
  }
}

// Context
const AppContext = createContext<AppContextValue | null>(null);

// Provider props
interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider - Provides global application state
 */
export const AppProvider: FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const toggleTheme = useCallback(() => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'light' ? 'dark' : 'light' });
  }, [state.theme]);

  const setOffline = useCallback((offline: boolean) => {
    dispatch({ type: 'SET_OFFLINE', payload: offline });
  }, []);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const fullNotification: Notification = { ...notification, id };

    dispatch({ type: 'ADD_NOTIFICATION', payload: fullNotification });

    // Auto remove after duration (default 5 seconds)
    const duration = notification.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      toggleTheme,
      setOffline,
      showNotification,
      removeNotification,
      clearNotifications,
    }),
    [state, toggleTheme, setOffline, showNotification, removeNotification, clearNotifications]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Hook to access app context
 * @throws Error if used outside of AppProvider
 */
export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
