import React from "react";
import { useCart } from "../../contexts/CartContext.tsx";

// src/components/Cart/CartSummary.tsx
export const CartSummary: React.FC = () => {
    const { state, removeFromCart } = useCart();
  
    if (state.items.length === 0) {
      return <div className="text-gray-500 text-center p-4">Koszyk jest pusty</div>;
    }
  
    return (
      <div className="space-y-4">
        {state.items.map(item => (
          <div key={item.courseId} className="flex justify-between items-center p-4 bg-white rounded-lg shadow">
            <div>
              <h3 className="font-medium">{item.courseTitle}</h3>
              <p className="text-gray-600">{item.price} PLN</p>
            </div>
            <button
              onClick={() => removeFromCart(item.courseId)}
              className="text-red-600 hover:text-red-800"
            >
              Usuń
            </button>
          </div>
        ))}
        <div className="border-t pt-4">
          <div className="flex justify-between font-bold">
            <span>Razem:</span>
            <span>{state.total} PLN</span>
          </div>
        </div>
      </div>
    );
  };
  
  