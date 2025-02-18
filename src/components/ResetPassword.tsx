import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/config.ts';
import { LoadingSpinner } from './Loading/LoadingSpinner.tsx';
import SEO from './SEO.tsx';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'auth/user-not-found':
            setError('Nie znaleziono użytkownika z tym adresem email');
            break;
          case 'auth/invalid-email':
            setError('Nieprawidłowy adres email');
            break;
          default:
            setError('Wystąpił błąd podczas resetowania hasła');
        }
      } else {
        setError('Wystąpił nieoczekiwany błąd');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Link został wysłany!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sprawdź swoją skrzynkę email i postępuj zgodnie z instrukcjami aby zresetować hasło.
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Wróć do logowania
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Reset hasła"
        description="Zresetuj swoje hasło do platformy Progres999"
      />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Zresetuj hasło
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Wprowadź swój adres email, a my wyślemy Ci link do zresetowania hasła.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">
                Adres email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Adres email"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {loading ? <LoadingSpinner size="small" /> : 'Wyślij link resetujący'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Wróć do logowania
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;