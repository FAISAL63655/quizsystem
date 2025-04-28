import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
}) => {
  const baseStyles = 'px-4 py-2 rounded-md font-medium transition-all focus:outline-none shadow-sm hover:shadow';

  const variantStyles = {
    primary: 'bg-[#1A2B5F] text-white hover:bg-[#152348] active:translate-y-0.5',
    secondary: 'bg-white text-[#1A2B5F] border border-[#1A2B5F] hover:bg-gray-50 active:translate-y-0.5',
    danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] active:translate-y-0.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
