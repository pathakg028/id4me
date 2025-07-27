import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

const baseStyles =
  'py-2 px-4 rounded-md font-medium focus:outline-none transition-colors';

const variantStyles = {
  primary: 'bg-green-500 text-white hover:bg-green-600',
  secondary: 'bg-gray-500 text-white hover:bg-gray-600',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => (
  <button
    className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
