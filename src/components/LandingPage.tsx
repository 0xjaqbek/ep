import React, { Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoEP from '../assets/logoEP.webp';
import ambu1 from '../assets/ambu1.webp';
import ambu2 from '../assets/ambu2.webp';
import ambu3 from '../assets/ambu3.webp';
import ambu4 from '../assets/ambu4.webp';
import ambu5 from '../assets/ambu5.webp';
import SEO from './SEO.tsx';

const OpinionsDialog = React.lazy(() => import('../components/OpinionsDialog.tsx'));
const backgroundImages = [ambu1, ambu2, ambu3, ambu4, ambu5];

const LandingPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showOpinions, setShowOpinions] = useState(false);

  useEffect(() => {
    Promise.all(
      [logoEP, ...backgroundImages].map(src => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      })
    ).then(() => setIsLoading(false));

    const timer = setInterval(() => {
      setCurrentIndex(current => (current + 1) % backgroundImages.length);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
    <SEO 
  title="Strona Główna"
  description="Platforma edukacyjna dla zawodów medycznych. Twoja wiedza, ich życie – rozwijaj się z nami."
/>

      <div className="relative min-h-screen flex flex-col bg-black">
        {/* Background Image */}
        <div 
          className="absolute inset-0 w-full h-full bg-center bg-cover transition-all duration-1000"
          style={{
            backgroundImage: `url(${backgroundImages[currentIndex]})`,
            filter: 'blur(5px) brightness(0.4)',
          }}
        />

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4 py-12 text-center text-white">
          {/* Optimized Logo */}
          <img
            src={logoEP}
            alt="EP Logo"
            width="256"
            height="auto"
            className="w-64 h-auto mb-4"
            loading="eager"
            fetchPriority="high"
          />

          {/* Headline */}
          <div className="mb-6">
            <h1 className="text-xl font-light text-gray-200">Twoja wiedza, ich życie</h1>
            <h2 className="text-lg font-bold text-gray-300">– rozwijaj się z nami.</h2>
          </div>

          {/* Description */}
          <div className="max-w-2xl mb-8 space-y-4 text-lg">
            <p>
              Witamy na platformie edukacyjnej dedykowanej ratownikom medycznym,
              oferującej specjalistyczne kursy internetowe z zakresu ratownictwa medycznego.
            </p>
            <p>
              Nasze kursy są prowadzone przez wykwalifikowaną kadrę dydaktyczną,
              zapewniając najwyższy poziom kształcenia w dziedzinie ratownictwa medycznego.
            </p>
            <p>
              Po ukończeniu kursów uczestnicy otrzymują certyfikaty potwierdzające zdobyte punkty edukacyjne.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link 
              to="/courses"
              className="bg-blue-600 hover:bg-blue-800 text-white text-lg px-8 py-4 rounded-lg transition-all"
            >
              Przeglądaj kursy
            </Link>

            <Link 
              to="/register"
              className="bg-white/10 hover:bg-white/20 text-white text-lg px-8 py-4 rounded-lg transition-all"
            >
              Dołącz do nas
            </Link>

            <button
              onClick={() => setShowOpinions(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white text-lg px-8 py-4 rounded-lg transition-all"
            >
              Zobacz opinie
            </button>
          </div>
        </div>

        {/* Lazy load opinions dialog */}
        <Suspense fallback={<div className="text-white">Ładowanie...</div>}>
          {showOpinions && <OpinionsDialog isOpen={showOpinions} onClose={() => setShowOpinions(false)} />}
        </Suspense>
      </div>
    </>
  );
};

export default LandingPage;
