// src/components/Layout/Header.tsx
import React, { useState } from 'react';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../firebase/config.ts';

export const Header: React.FC = () => {
 const { currentUser } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();
 const [showUserMenu, setShowUserMenu] = useState(false);

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
                Progres<span 
                  className="text-blue-800 inline-block"
                >
                  999
                </span>
                <p className="text-sm font-light text-gray-900">
                  Twoja wiedza, ich życie
                </p>
                <p className="text-sm text-gray-600">
                   –rozwijaj się z nami.
                </p>
              </Link>
            </div>
         
         <div className="flex items-center space-x-4">
           {currentUser ? (
             <div className="relative">
               <button
                 onClick={() => setShowUserMenu(!showUserMenu)}
                 className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
               >
                 <span>Moje konto</span>
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
                 <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-xl z-50">
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
                     className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                   >
                     Wyloguj się
                   </button>
                 </div>
               )}
             </div>
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