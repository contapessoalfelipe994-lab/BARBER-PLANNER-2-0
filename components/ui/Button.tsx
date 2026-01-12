
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  fullWidth?: boolean;
  // Added optional icon prop to the interface
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  // Destructured icon to prevent it from being passed to the native button element via ...props
  icon,
  ...props 
}) => {
  const baseStyles = 'px-4 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-[#f59e0b] text-black hover:bg-[#d97706]',
    secondary: 'bg-zinc-800 text-white hover:bg-zinc-700',
    outline: 'border-2 border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b] hover:text-black',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {/* Render icon if provided before children */}
      {icon}
      {children}
    </button>
  );
};
