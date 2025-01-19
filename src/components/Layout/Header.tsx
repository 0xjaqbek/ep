// src/components/Layout/Header.tsx
import React from 'react';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config.ts';

export const Header: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              Platforma Edukacyjna
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <span className="text-gray-700">
                  {currentUser.email}
                </span>
                {currentUser.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Panel Admina
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Wyloguj
                </button>
              </>
            ) : (
              <div className="space-x-4">
                <Link 
                  to="/login"
                  className="text-blue-600 hover:text-blue-800"
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