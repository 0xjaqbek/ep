import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { CartButton } from '../Cart/CartButton.tsx';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config.ts';

export const Header: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showReferrals, setShowReferrals] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const checkSettings = async () => {
      try {
        const settingsRef = doc(db, 'appSettings', 'global');
        const settingsDoc = await getDoc(settingsRef);
        if (settingsDoc.exists()) {
          setShowReferrals(settingsDoc.data().showReferrals);
        }
      } catch (error) {
        console.error('Error checking settings:', error);
      }
    };

    checkSettings();
  }, []);

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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Błąd podczas wylogowywania:', error);
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-5 py-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <Link 
              to="/" 
              className="text-2xl font-extrabold text-blue-600 leading-tight"
            >
              Progres<span className="text-blue-800 inline-block">999</span>
              <p className="text-sm font-light text-gray-900 tracking-tighter">
                Twoja wiedza, ich życie
              </p>
              <p className="text-sm text-gray-600 tracking-wide">
                –rozwijaj się z nami
              </p>
            </Link>
          </div>
         
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {currentUser ? (
              <>
                <div className="order-1 sm:order-none">
                  <CartButton />
                </div>
                <div className="relative order-2 sm:order-none">
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
                      className={`h-5 w-5 transform transition-transform ${
                        showUserMenu ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
  
                  {showUserMenu && (
                    <div ref={menuRef} className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-xl z-50 border border-gray-100">
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
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Moje dane
                      </Link>
                      <Link
                        to="/courses"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Moje kursy
                      </Link>
                      {showReferrals && (
                        <Link
                          to="/referrals"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Program poleceń
                        </Link>
                      )}
                      {currentUser.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Panel Admina
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleLogout();
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
              <div className="flex flex-col space-y-2">
                <Link 
                  to="/login"
                  className="text-sm border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50"
                >
                  Zaloguj
                </Link>
                <Link 
                  to="/register"
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Zarejestruj
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};