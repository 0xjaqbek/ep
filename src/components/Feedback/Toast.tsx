// components/Feedback/Toast.tsx
import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow time for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const baseClasses = `
    fixed bottom-4 right-4 
    px-4 py-2 
    rounded-lg 
    shadow-lg 
    transition-opacity duration-300
    ${isVisible ? 'opacity-100' : 'opacity-0'}
  `;

  const typeClasses = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  const typeIcons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]} flex items-center gap-2`}>
      <span>{typeIcons[type]}</span>
      {message}
    </div>
  );
};