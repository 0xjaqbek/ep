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

const LandingPage: React.FC = () => {
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
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <img 
              src={logoEP} 
              alt="Progres999 Logo" 
              className="mx-auto w-48 h-auto opacity-70"
            />
          </div>
          <p className="text-xl font-light tracking-wider animate-bounce">
            Ładowanie...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Strona Główna | Progres999"
        description="Platforma edukacyjna dla Ratowników Medycznych. Zdobywaj punkty edukacyjne, certyfikaty i rozwijaj swoje umiejętności ratownicze online."
        keywords="ratownictwo medyczne, kursy online, punkty edukacyjne, certyfikaty, szkolenia medyczne"
        ogType="website"
        ogImage="/logo.png"
      />
      <div className="relative min-h-screen overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-full bg-center bg-cover transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${backgroundImages[currentIndex]})`,
            filter: 'brightness(0.5) contrast(1.1) opacity(85%) blur(3px)',
            transform: 'scale(1.05)',
            backgroundBlendMode: 'multiply',
          }}
        />

        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-indigo-900/20 
          mix-blend-overlay"
        />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div 
              className="mb-8 transform transition-all duration-700 
              hover:scale-105 hover:rotate-2"
            >
              <img
                src={logoEP}
                alt="Progres999 Logo"
                className="mx-auto w-64 h-auto shadow-2xl rounded-xl"
              />
            </div>

            <div className="mb-10 space-y-4">
              <h1 className="text-3xl md:text-4xl font-serif font-bold 
              text-white">
                Twoja wiedza, ich życie
              </h1>
              <h2 className="text-2xl md:text-3xl font-serif font-light italic 
              text-blue-200">
                – rozwijaj się z nami
              </h2>
            </div>

            <div className="max-w-4xl mx-auto mb-12 space-y-4 text-base md:text-lg">
              <p className="text-white/90 leading-relaxed">
                Witamy na platformie edukacyjnej dla ratowników medycznych, oferującej specjalistyczne kursy internetowe z zakresu ratownictwa medycznego, umożliwiające uzyskanie punktów edukacyjnych.
              </p>
              <p className="text-white/90 leading-relaxed">
                Nasze kursy są prowadzone przez wykwalifikowaną kadrę dydaktyczną, zapewniając najwyższy poziom kształcenia w dziedzinie ratownictw medycznego.
              </p>
              <p className="text-white/90 leading-relaxed">
                Po ukończeniu kursów uczestnicy otrzymują certyfikaty potwierdzające zdobyte umiejętności i punkty edukacyjne.
              </p>
            </div>

            {/* CTA Buttons moved before Feature Highlights */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link 
                to="/courses"
                className="px-8 py-3 bg-blue-600 text-white 
                rounded-full font-semibold tracking-wide
                hover:bg-blue-700 transition-all duration-300
                transform hover:scale-105 hover:shadow-xl"
              >
                Odkryj Kursy
              </Link>
              <Link 
                to="/register"
                className="px-8 py-3 border-2 border-white text-white 
                rounded-full font-semibold tracking-wide
                hover:bg-white hover:text-blue-900 
                transition-all duration-300
                transform hover:scale-105"
              >
                Dołącz Teraz
              </Link>
              <button
                onClick={() => setShowOpinions(true)}
                className="px-8 py-3 bg-yellow-500 text-black 
                rounded-full font-semibold tracking-wide
                hover:bg-yellow-600 transition-all duration-300
                transform hover:scale-105 hover:shadow-xl"
              >
                Opinie Użytkowników
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                { 
                  title: "Certyfikowane Kursy", 
                  icon: "🏆",
                  description: "Zdobądź punkty edukacyjne" 
                },
                { 
                  title: "Elastyczna Nauka", 
                  icon: "🕒",
                  description: "Ucz się w dowolnym czasie" 
                },
                { 
                  title: "Isntruktorzy", 
                  icon: "🚑",
                  description: "Z wieloletnim doświadczeniem zawodowym" 
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 
                  border border-white/20 hover:border-white/40 
                  transition-all duration-300 transform hover:-translate-y-2 
                  hover:shadow-2xl"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Suspense fallback={null}>
          {showOpinions && <OpinionsDialog isOpen={showOpinions} onClose={() => setShowOpinions(false)} />}
        </Suspense>
      </div>
    </>
  );
};

export default LandingPage;