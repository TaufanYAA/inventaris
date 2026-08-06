import React from 'react';
import { Providers } from './providers';
import AppRouter from './router';
import ErrorBoundary from '../shared/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <AppRouter />
      </Providers>
    </ErrorBoundary>
  );
}
