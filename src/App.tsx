import type { FC } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ServiceProvider } from '@presentation/context/ServiceContext';
import { AppRouter } from '@presentation/routes/AppRouter';

/**
 * Root application component.
 * Sets up providers and routing for the entire application.
 */
export const App: FC = () => {
  return (
    <BrowserRouter basename="/tripfood-manager">
      <ServiceProvider>
        <AppRouter />
      </ServiceProvider>
    </BrowserRouter>
  );
};
