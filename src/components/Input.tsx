import React from 'react';

interface InputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error,
  className = '',
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-[#1E293B] mb-2">
        {label} {required && <span className="text-[#EF4444]">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2 border ${error ? 'border-[#EF4444]' : 'border-[#E2E8F0]'} bg-white rounded-md shadow-sm focus:outline-none focus:border-[#007B5E] focus:ring-2 focus:ring-[#007B5E]/20 transition-all rtl-fix text-base`}
        style={{ fontFamily: 'var(--font-noto-sans-arabic), "Noto Sans Arabic", Arial, sans-serif' }}
      />
      {error && <p className="mt-2 text-sm text-[#EF4444]">{error}</p>}
    </div>
  );
};

export default Input;
