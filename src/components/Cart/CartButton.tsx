// src/components/Cart/CartButton.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext.tsx';
import { useAuth } from '../Auth/AuthProvider.tsx';

export const CartButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { state, removeFromCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  const handleCartClick = () => {
    if (!currentUser) {
      navigate('/login', { 
        state: { 
          from: '/checkout',
          message: 'Zaloguj się, aby zobaczyć koszyk' 
        } 
      });
      return;
    }
    setIsOpen(!isOpen);
  };

  if (!currentUser) {
    return null; // Don't render anything if user is not logged in
  }

  return (
    <div className="relative">
      <button
        onClick={handleCartClick}
        className="flex items-center space-x-1 px-4 py-2 text-white rounded-lg bg-blue-600 hover:bg-blue-700"
      >
        <span>Koszyk</span>
        <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-sm">
          {state.items.length}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
          <div className="p-4">
            {state.items.length === 0 ? (
              <p className="text-gray-500 text-center">Koszyk jest pusty</p>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {state.items.map(item => (
                    <div key={item.courseId} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.courseTitle}</p>
                        <p className="text-sm text-gray-500">{item.price} PLN</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.courseId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Usuń
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold mb-4">
                    <span>Razem:</span>
                    <span>{state.total} PLN</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                  >
                    Przejdź do kasy
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};