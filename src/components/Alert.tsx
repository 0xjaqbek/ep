import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'warning';
  className?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'default',
  className = '',
  onClose
}) => {
  const baseStyles = 'p-4 rounded-lg flex justify-between items-center';
  
  const variantStyles = {
    default: 'bg-blue-50 text-blue-800',
    destructive: 'bg-red-50 text-red-800',
    warning: 'bg-yellow-50 text-yellow-800'
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      <div>{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      )}
    </div>
  );
};