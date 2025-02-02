import React from 'react';
import { Link } from 'react-router-dom';
import logoEP from '../../assets/logoEP.webp';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="flex flex-col">
            <div className="mb-2">
              <img
                src={logoEP}
                alt="EP Logo"
                className="w-32 h-auto" // Adjusted size to be more appropriate for footer
              />
            </div>
            <p className="text-sm font-light text-gray-400">
              Twoja wiedza, ich życie
            </p>
            <p className="text-sm text-gray-500">
              –rozwijaj się z nami.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4">Kursy</h3>
            <ul className="space-y-2">
              <li><Link to="/courses" className="text-gray-400 hover:text-white">Wszystkie kursy</Link></li>
              <li><Link to="/courses" className="text-gray-400 hover:text-white">Ratownictwo medyczne</Link></li>
              <li><Link to="/courses" className="text-gray-400 hover:text-white">Pierwsza pomoc</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">O nas</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white">Kim jesteśmy</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Kontakt</Link></li>
              <li><Link to="/regulations" className="text-gray-400 hover:text-white">Regulamin</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Kontakt</h3>
            <p className="text-gray-400 mb-2">Email: jaqbek.eth@gmail.com</p>
            <p className="text-gray-400 mb-4">Tel: +48 607 999 313</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
              <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
          © {new Date().getFullYear()} <img src={logoEP} alt="EP Logo" className="inline-block h-4 w-auto mx-1" /> Wszelkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  );
};