import React from 'react';
import { Link } from 'react-router-dom';
import logoEP from '../../src/assets/logoEP.png';

const LandingPage = () => {
  return (
    <div className="h-full flex flex-col items-center pt-8 bg-gradient-to-b from-blue-50 to-white p-2">
      <div className="max-w-3xl text-center space-y-4">
        <img 
          src={logoEP}
          alt="EP Logo" 
          className="w-64 h-auto mx-auto mb-2"
        />
        
        <h1 className="text-3xl font-bold text-blue-900 mb-4">
          Platforma Edukacyjna dla Ratowników Medycznych
        </h1>
        
        <div className="space-y-4 text-lg text-gray-700">
          <p className="leading-relaxed">
            Witamy na platformie edukacyjnej dedykowanej ratownikom medycznym, 
            oferującej specjalistyczne kursy internetowe z zakresu ratownictwa medycznego.
          </p>
          
          <p className="leading-relaxed">
            Nasze kursy są prowadzone przez wykwalifikowaną kadrę dydaktyczną, 
            zapewniając najwyższy poziom kształcenia w dziedzinie ratownictwa medycznego.
          </p>
          
          <p className="leading-relaxed">
            Po ukończeniu kursów uczestnicy otrzymują certyfikaty potwierdzające 
            zdobyte punkty edukacyjne.
          </p>
        </div>

        <div className="flex justify-center gap-2 mt-4 mb-4">
          <Link 
            to="/courses"
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-lg transition-colors duration-200"
          >
            Przeglądaj kursy
          </Link>
          
          <Link 
            to="/register"
            className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 text-lg px-8 py-4 rounded-lg transition-colors duration-200"
          >
            Dołącz do nas
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;