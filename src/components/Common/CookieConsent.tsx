import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Small delay to ensure animation plays after mount
      setTimeout(() => {
        setShowConsent(true);
      }, 100);
    }
    setIsInitialized(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'false');
    setShowConsent(false);
  };

  if (!isInitialized) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-in-out z-40
          ${showConsent ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Cookie consent popup */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-lg z-50 transition-transform duration-500 ease-in-out
          ${showConsent ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 text-sm text-gray-700 mr-4 mb-4 md:mb-0">
              <p className="font-semibold text-base">
                Nasza strona używa plików cookies i podobnych technologii w celach:
              </p>
              <ul className="list-disc ml-6 mt-2">
                <li>świadczenia usług i poprawy ich jakości</li>
                <li>statystycznych</li>
                <li>marketingowych</li>
                <li>dopasowania treści do Twoich zainteresowań</li>
              </ul>
              <p className="mt-2">
                Klikając „Akceptuję wszystkie", wyrażasz zgodę na używanie przez nas wszystkich plików cookie. 
                Klikając „Odrzuć", będziemy używać tylko niezbędnych plików cookie. 
                Możesz też przejść do szczegółowych ustawień, aby zarządzać swoimi preferencjami.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Odrzuć
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Akceptuję wszystkie
              </button>
              <button
                onClick={() => {
                  // TODO: Implement detailed settings modal
                  handleAccept();
                }}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Ustawienia szczegółowe
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;