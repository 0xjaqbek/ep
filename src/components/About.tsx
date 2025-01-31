import React from 'react';
import SEO from './SEO.tsx';

const About = () => {
  return (
    <><SEO 
    title="O Nas"
    description="Poznaj Progress999 - platformę edukacyjną stworzoną przez profesjonalistów z branży ratownictwa medycznego."
  />
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Kim jesteśmy</h1>
      <div className="prose lg:prose-lg">
        <p className="mb-4">
          Progress999 to platforma edukacyjna stworzona przez profesjonalistów z branży ratownictwa medycznego, 
          mająca na celu podnoszenie kwalifikacji ratowników medycznych poprzez wysokiej jakości kursy online.
        </p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Nasza misja</h2>
        <p className="mb-4">
          Naszą misją jest zapewnienie dostępu do profesjonalnej wiedzy z zakresu ratownictwa medycznego 
          w formie wygodnych kursów online. Wierzymy, że ciągłe doskonalenie umiejętności ratowników 
          przekłada się bezpośrednio na wyższą jakość pomocy medycznej i większe bezpieczeństwo pacjentów.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Co nas wyróżnia</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Doświadczona kadra instruktorska</li>
          <li>Praktyczne podejście do nauczania</li>
          <li>Certyfikowane kursy</li>
          <li>Elastyczny dostęp do materiałów</li>
          <li>Wsparcie merytoryczne</li>
        </ul>
      </div>
    </div>
    </>
  );
};

export default About;