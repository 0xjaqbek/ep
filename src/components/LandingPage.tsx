import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoEP from '../assets/logoEP.png';
import ambu1 from '../assets/ambu1.jpg';
import ambu2 from '../assets/ambu2.jpg';
import ambu3 from '../assets/ambu3.jpg';
import ambu4 from '../assets/ambu4.jpg';
import ambu5 from '../assets/ambu5.jpg';

const backgroundImages = [ambu1, ambu2, ambu3, ambu4, ambu5];

const LandingPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="relative min-h-screen flex flex-col bg-black">
      <div 
        className="absolute inset-0 w-full h-full bg-center bg-cover bg-no-repeat transition-all duration-1000"
        style={{
          backgroundImage: `url(${backgroundImages[currentIndex]})`,
          filter: 'blur(5px) brightness(0.4)',
          minHeight: '100vh'
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 text-center text-white">
        <img
          src={logoEP}
          alt="EP Logo"
          className="w-64 h-auto mb-1"
        />

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white leading-tight mb-1">
            Progres<span className="text-white">999</span>
          </h1>
          <p className="text-sm font-light text-gray-200">
            Twoja wiedza, ich życie
          </p>
          <p className="text-sm text-gray-300">
            –rozwijaj się z nami.
          </p>
        </div>

        <div className="max-w-2xl mb-12 space-y-4 text-lg">
          <p>Witamy na platformie edukacyjnej dedykowanej ratownikom medycznym, 
             oferującej specjalistyczne kursy internetowe z zakresu ratownictwa medycznego.</p>
          
          <p>Nasze kursy są prowadzone przez wykwalifikowaną kadrę dydaktyczną, 
             zapewniając najwyższy poziom kształcenia w dziedzinie ratownictwa medycznego.</p>
          
          <p>Po ukończeniu kursów uczestnicy otrzymują certyfikaty potwierdzające 
             zdobyte punkty edukacyjne.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link 
            to="/courses"
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-lg"
          >
            Przeglądaj kursy
          </Link>
          
          <Link 
            to="/register"
            className="bg-white/10 hover:bg-white/20 text-white text-lg px-8 py-4 rounded-lg"
          >
            Dołącz do nas
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;