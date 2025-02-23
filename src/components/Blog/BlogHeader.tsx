// src/components/Blog/BlogHeader.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider.tsx';

export const BlogHeader: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50 mt-2.5 pb-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link to="https://blog.progres999.pl" className="flex flex-col">
            <div className="text-2xl font-extrabold text-blue-600 leading-tight">
              Progres<span className="text-blue-800">999</span>
            </div>
            <p className="text-sm font-light text-gray-900 tracking-tighter">
              Ratownictwo medyczne
            </p>
            <p className="text-sm text-gray-600 tracking-wide">
              –edukacja i rozwój
            </p>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="https://blog.progres999.pl"
              className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              Strona główna
            </Link>
            <Link 
              to="https://progres999.pl/courses"
              className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              Kursy
            </Link>
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">{currentUser.displayName}</span>
                <Link 
                  to="https://progres999.pl/courses" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Kursy
                </Link>
              </div>
            ) : (
              <div>
                <Link 
                  to="https://progres999.pl/login"
                  className="text-blue-600 hover:text-blue-800 px-3 py-2 text-sm font-medium"
                >
                  Zaloguj się
                </Link>
                <Link 
                  to="https://progres999.pl/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ml-4"
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

export default BlogHeader;