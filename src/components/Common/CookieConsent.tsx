import React, { useState, useEffect } from 'react';

const COOKIE_TYPES = {
  necessary: {
    name: 'Niezbędne',
    description: 'Konieczne do działania strony. Nie można ich wyłączyć.',
    required: true
  },
  functional: {
    name: 'Funkcjonalne',
    description: 'Używane do zapamiętywania preferencji i ustawień.',
    required: false
  },
  analytics: {
    name: 'Analityczne',
    description: 'Pomagają nam zrozumieć, jak użytkownicy korzystają z witryny.',
    required: false
  },
  marketing: {
    name: 'Marketingowe',
    description: 'Używane do personalizacji reklam i treści.',
    required: false
  }
};

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consents, setConsents] = useState({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem('cookieConsent');
    if (!savedConsent) {
      setTimeout(() => setShowConsent(true), 1000);
    } else {
      setConsents(JSON.parse(savedConsent));
    }
  }, []);

  const handleAcceptAll = () => {
    const allConsents = Object.keys(COOKIE_TYPES).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {});
    
    saveConsents(allConsents);
  };

  const handleAcceptSelected = () => {
    saveConsents(consents);
  };

  const handleReject = () => {
    const minimalConsents = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    saveConsents(minimalConsents);
  };

  const saveConsents = (selectedConsents) => {
    localStorage.setItem('cookieConsent', JSON.stringify(selectedConsents));
    setConsents(selectedConsents);
    setShowConsent(false);

    // Przykład implementacji Google Analytics
    if (selectedConsents.analytics) {
      // Włącz GA
      window['ga-disable-GA_MEASUREMENT_ID'] = false;
    } else {
      // Wyłącz GA
      window['ga-disable-GA_MEASUREMENT_ID'] = true;
    }
  };

  if (!showConsent) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />

      {/* Cookie consent modal */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col space-y-4">
            {!showDetails ? (
              // Simple view
              <>
                <div className="prose">
                  <h2 className="text-xl font-semibold mb-2">Dbamy o Twoją prywatność</h2>
                  <p className="text-gray-600">
                    Używamy plików cookies i podobnych technologii w celu zapewnienia prawidłowego działania strony, 
                    analizy ruchu oraz personalizacji treści. Możesz zarządzać szczegółowymi ustawieniami cookies 
                    lub zaakceptować wszystkie.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowDetails(true)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Ustawienia szczegółowe
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Odrzuć opcjonalne
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Akceptuj wszystkie
                  </button>
                </div>
              </>
            ) : (
              // Detailed view
              <>
                <div className="prose">
                  <h2 className="text-xl font-semibold mb-2">Ustawienia plików cookies</h2>
                  <p className="text-gray-600">
                    Wybierz, które rodzaje plików cookies chcesz zaakceptować. Niektóre funkcje strony 
                    mogą być ograniczone w zależności od wybranych ustawień.
                  </p>
                </div>

                <div className="space-y-4">
                  {Object.entries(COOKIE_TYPES).map(([key, { name, description, required }]) => (
                    <div key={key} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="pt-0.5">
                        <input
                          type="checkbox"
                          id={key}
                          checked={consents[key]}
                          onChange={(e) => setConsents(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          disabled={required}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor={key} className="font-medium text-gray-900">
                          {name} {required && <span className="text-sm text-gray-500">(wymagane)</span>}
                        </label>
                        <p className="text-sm text-gray-500">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Wróć
                  </button>
                  <button
                    onClick={handleAcceptSelected}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Zapisz ustawienia
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;