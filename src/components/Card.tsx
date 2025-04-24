import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
