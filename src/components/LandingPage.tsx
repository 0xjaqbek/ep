import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoEP from '../assets/logoEP.png';
import ambu1 from '../assets/ambu1.jpg';
import ambu2 from '../assets/ambu2.jpg';
import ambu3 from '../assets/ambu3.jpg';
import ambu4 from '../assets/ambu4.jpg';
import ambu5 from '../assets/ambu5.jpg';

const backgroundImages = [ambu1, ambu2, ambu3, ambu4, ambu5];

const preloadImages = (images: string[]) => {
  return Promise.all(
    images.map((src) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => reject();
      });
    })
  );
};

const LandingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Preload all background images and the logo
    preloadImages([logoEP, ...backgroundImages])
      .then(() => {
        console.log('Images preloaded successfully!');
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error preloading images:', error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % backgroundImages.length);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    // Display a loading spinner or skeleton while preloading images
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* Background image */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${backgroundImages[currentIndex]})`,
          filter: 'blur(8px) brightness(0.7)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center pt-8 px-4">
        <div className="max-w-3xl text-center space-y-4 bg-black/20 p-8 rounded-lg backdrop-blur-sm">
          <img
            src={logoEP}
            alt="EP Logo"
            className="w-64 h-auto mx-auto mb-2 drop-shadow-lg"
          />

          <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            Platforma Edukacyjna dla Ratowników Medycznych
          </h1>

          <div className="space-y-4 text-lg text-white">
            <p className="leading-relaxed drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              Witamy na platformie edukacyjnej dedykowanej ratownikom medycznym, 
              oferującej specjalistyczne kursy internetowe z zakresu ratownictwa medycznego.
            </p>
            
            <p className="leading-relaxed drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              Nasze kursy są prowadzone przez wykwalifikowaną kadrę dydaktyczną, 
              zapewniając najwyższy poziom kształcenia w dziedzinie ratownictwa medycznego.
            </p>
            
            <p className="leading-relaxed drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              Po ukończeniu kursów uczestnicy otrzymują certyfikaty potwierdzające 
              zdobyte punkty edukacyjne.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Link 
              to="/courses"
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Przeglądaj kursy
            </Link>
            
            <Link 
              to="/register"
              className="bg-white/90 hover:bg-white text-blue-600 border-2 border-blue-600 text-lg px-8 py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Dołącz do nas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
