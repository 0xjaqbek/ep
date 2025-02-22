// Enhanced Header Component
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { CartButton } from '../Cart/CartButton.tsx';

export const Header: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (location.pathname === '/') {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50 mt-2.5 pb-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section - Keeping Original Style */}
          <Link to="/" className="flex flex-col">
            <div className="text-2xl font-extrabold text-blue-600 leading-tight">
              Progres<span className="text-blue-800">999</span>
            </div>
            <p className="text-sm font-light text-gray-900 tracking-tighter">
              Twoja wiedza, ich życie
            </p>
            <p className="text-sm text-gray-600 tracking-wide">
              –rozwijaj się z nami
            </p>
          </Link>

          {/* Navigation & Actions */}
          <div className="flex items-center space-x-6">
            {currentUser ? (
              <>
                <CartButton />
                <div className="relative">
                  <button
                    ref={buttonRef}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden md:block text-gray-700">
                      {currentUser.displayName || 'Użytkownik'}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        showUserMenu ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <div 
                      ref={menuRef}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {currentUser.displayName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {currentUser.email}
                        </p>
                      </div>

                      <Link
                        to="/account"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Moje dane
                      </Link>
                      
                      <Link
                        to="/courses"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Moje kursy
                      </Link>

                      {currentUser.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Panel Admina
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          navigate('/login');
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Wyloguj się
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Zaloguj
                </Link>
                <Link 
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Zarejestruj się
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};