import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { LoadingSpinner } from '../Loading/LoadingSpinner.tsx';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { auth, db } from '../../firebase/config.ts';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [searchParams] = useSearchParams();
  const [referralValid, setReferralValid] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phoneNumber: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Poland',
    nip: '',
    additionalInfo: '',
    gdprConsent: false,
    marketingConsent: false,
    referralCode: searchParams.get('ref') || '', // Get referral code from URL params
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate a unique referral code for the user
  const generateReferralCode = (uid: string): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const prefix = uid.substring(0, 3).toUpperCase();
    const random = Array(4)
      .fill(0)
      .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
      .join('');
    return `${prefix}${random}`;
  };

  // Validate Referral Code
  useEffect(() => {
    const validateReferralCode = async () => {
      if (!formData.referralCode) {
        setReferralValid(null); // No referral code provided
        return;
      }

      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referralCode', '==', formData.referralCode));
        const querySnapshot = await getDocs(q);
        setReferralValid(!querySnapshot.empty); // Check if the referral code exists
      } catch (error) {
        console.error('Error validating referral code:', error);
        setReferralValid(false);
      }
    };

    validateReferralCode();
  }, [formData.referralCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleGoogleSignUp = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();

      if (formData.referralCode && auth.currentUser && referralValid) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referralCode', '==', formData.referralCode));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const referrer = snapshot.docs[0];
          await updateDoc(doc(db, 'users', referrer.id), {
            referralPoints: increment(1),
            referrals: arrayUnion(auth.currentUser.uid), // Add the new user's UID to the referrer's referrals
          });

          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            referralPoints: 1, // Reward the referred user
            referredBy: formData.referralCode,
          });
        }
      }

      navigate('/courses');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error during Google sign up');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.gdprConsent) {
        throw new Error('Musisz wyrazić zgodę na przetwarzanie danych osobowych');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Hasła nie są identyczne');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      const referralCode = generateReferralCode(userCredential.user.uid);
      let referralPoints = 0;
      let referredBy: string | null = null;

      if (formData.referralCode && referralValid) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referralCode', '==', formData.referralCode));
        const snapshot = await getDocs(q);
      
        if (!snapshot.empty) {
          const referrer = snapshot.docs[0];
      
          // Save who referred the user but do not give points yet
          referredBy = formData.referralCode;
      
          await updateDoc(doc(db, 'users', referrer.id), {
            referrals: arrayUnion(userCredential.user.uid), // Track the referred user
          });
        }
      }
      

      // Create the new user document
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: formData.email,
        displayName: formData.displayName,
        role: 'student',
        phoneNumber: formData.phoneNumber,
        address: {
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        nip: formData.nip || null,
        additionalInfo: formData.additionalInfo,
        purchasedCourses: [],
        completedCourses: [],
        createdAt: new Date(),
        referralCode,
        referredBy,
        referralPoints,
        referrals: [], // Initialize empty referrals list
      });

      navigate('/courses');
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'auth/email-already-in-use':
            setError('Ten adres email jest już zajęty');
            break;
          case 'auth/weak-password':
            setError('Hasło jest za słabe. Użyj minimum 6 znaków');
            break;
          default:
            setError(error.message || 'Wystąpił błąd podczas rejestracji');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Zarejestruj się
          </h2>
        </div>

        <div className="flex flex-col items-center">
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? <LoadingSpinner size="small" /> : 'Zarejestruj się przez Google'}
          </button>

          <div className="my-4 flex items-center justify-between w-full">
            <div className="border-t border-gray-300 flex-grow"></div>
            <span className="px-4 text-gray-500 text-sm">lub</span>
            <div className="border-t border-gray-300 flex-grow"></div>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                Imię i nazwisko *
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                value={formData.displayName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Hasło *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Potwierdź hasło *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Numer telefonu *
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700">
                Kod polecający (opcjonalnie)
              </label>
              <input
                id="referralCode"
                name="referralCode"
                type="text"
                value={formData.referralCode}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  referralValid === true ? 'border-green-500' : 
                  referralValid === false ? 'border-red-500' : 
                  'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {referralValid === false && (
                <p className="mt-1 text-sm text-red-600">
                  Nieprawidłowy kod polecający
                </p>
              )}
              {referralValid === true && (
                <p className="mt-1 text-sm text-green-600">
                  Poprawny kod polecający
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Wpisz kod polecający, aby otrzymać punkt startowy
              </p>
            </div>

            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                Ulica i numer *
              </label>
              <input
                id="street"
                name="street"
                type="text"
                required
                value={formData.street}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                  Kod pocztowy *
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  Miasto *
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="nip" className="block text-sm font-medium text-gray-700">
                NIP (opcjonalnie)
              </label>
              <input
                id="nip"
                name="nip"
                type="text"
                value={formData.nip}
                onChange={handleChange}
className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">
                Dodatkowe informacje (opcjonalnie)
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Consents */}
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="gdprConsent"
                    name="gdprConsent"
                    type="checkbox"
                    required
                    checked={formData.gdprConsent}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="gdprConsent" className="font-medium text-gray-700">
                    Wyrażam zgodę na przetwarzanie moich danych osobowych *
                  </label>
                  <p className="text-gray-500">
                    Zgodnie z art. 13 ust. 1 i 2 RODO informujemy, że administratorem Twoich danych osobowych jest nasza firma. 
                    Dane będą przetwarzane w celu realizacji usług edukacyjnych. Masz prawo dostępu do swoich danych, ich sprostowania, 
                    usunięcia lub ograniczenia przetwarzania.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="marketingConsent"
                    name="marketingConsent"
                    type="checkbox"
                    checked={formData.marketingConsent}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="marketingConsent" className="font-medium text-gray-700">
                    Wyrażam zgodę na otrzymywanie informacji marketingowych
                  </label>
                  <p className="text-gray-500">
                    Możesz otrzymywać od nas informacje o nowych kursach, promocjach i wydarzeniach. 
                    Zgodę możesz wycofać w każdym czasie.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? <LoadingSpinner size="small" /> : 'Zarejestruj się'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link 
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Masz już konto? Zaloguj się
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;