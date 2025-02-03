import React, { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './components/Auth/AuthProvider.tsx';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary.tsx';
import { Header } from './components/Layout/Header.tsx';
import { Footer } from './components/Layout/Footer.tsx';
import { CartProvider } from './contexts/CartContext.tsx';
import { HelmetProvider } from 'react-helmet-async';
import LazyLoadedRoutes from './components/LazyLoadedRoutes.tsx';

// Lazy load CookieConsent
const CookieConsent = React.lazy(() => import('./components/Common/CookieConsent.tsx'));

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <AuthProvider>
            <CartProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <Suspense>
                    <LazyLoadedRoutes />
                  </Suspense>
                </main>
                <Suspense fallback={null}>
                  <CookieConsent />
                </Suspense>
                <Footer />
              </div>
            </CartProvider>
          </AuthProvider>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;