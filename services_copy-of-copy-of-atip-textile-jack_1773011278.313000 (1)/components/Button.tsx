import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'red' | 'black' | 'gray';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant, children, className, ...props }) => {
  const baseClasses = "px-8 py-3 text-lg font-aboreto tracking-wider rounded-full shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-sm flex items-center justify-center";
  
  const variantClasses = {
    red: 'bg-red-button text-white border border-transparent hover:bg-red-button/90 focus:ring-red-button',
    black: 'bg-black-button text-black-button-text border border-subtitle/10 hover:bg-black-button/80 focus:ring-subtitle',
    gray: 'bg-black-button text-black border border-subtitle/20 hover:bg-black-button/70 focus:ring-subtitle', // Gris clair (via variable thème) et lettres noires
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;