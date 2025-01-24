import React from 'react';
import { Link } from 'react-router-dom';
import logoEP from '../../assets/logoEP.png';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <img src={logoEP} alt="Progress999 Logo" className="h-16 mb-4" />
          <p className="text-gray-400">Twoja wiedza, ich życie – rozwijaj się z nami.</p>
        </div>

        <div>
          <h3 className="font-bold mb-4">Kursy</h3>
          <ul className="space-y-2">
            <li><Link to="/courses" className="hover:text-blue-400 transition-colors">Wszystkie kursy</Link></li>
            <li><Link to="/courses" className="hover:text-blue-400 transition-colors">Ratownictwo medyczne</Link></li>
            <li><Link to="/courses" className="hover:text-blue-400 transition-colors">Pierwsza pomoc</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">O nas</h3>
          <ul className="space-y-2">
            <li><Link to="/about" className="hover:text-blue-400 transition-colors">Kim jesteśmy</Link></li>
            <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Kontakt</Link></li>
            <li><Link to="/regulations" className="hover:text-blue-400 transition-colors">Regulamin</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">Kontakt</h3>
          <p className="text-gray-400 mb-2">Email: kontakt@progres999.pl</p>
          <p className="text-gray-400 mb-2">Tel: +48 000 000 000</p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="text-gray-400 hover:text-blue-400">Facebook</a>
            <a href="#" className="text-gray-400 hover:text-blue-400">LinkedIn</a>
            <a href="#" className="text-gray-400 hover:text-blue-400">Instagram</a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-8 pt-6 text-center">
        <p className="text-gray-500">
          © {new Date().getFullYear()} Progress999. Wszelkie prawa zastrzeżone.
        </p>
      </div>
    </footer>
  );
};