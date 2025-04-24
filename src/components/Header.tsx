import React from 'react';
import Link from 'next/link';

interface HeaderProps {
  title: string;
  showLogout?: boolean;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showLogout = false, onLogout }) => {
  return (
    <header className="bg-[#007B5E] text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center py-3 px-4">
        <Link href="/" className="text-xl font-bold hover:opacity-90 transition-opacity">
          {title}
        </Link>
        {showLogout && onLogout && (
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-white text-[#007B5E] rounded-md hover:bg-gray-100 transition-colors font-medium"
          >
            تسجيل الخروج
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
