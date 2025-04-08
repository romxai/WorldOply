'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import AuthModal from '../Auth/AuthModal';

const AuthButton: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'register'>('login');

  const handleLoginClick = () => {
    setModalMode('login');
    setShowModal(true);
  };

  const handleRegisterClick = () => {
    setModalMode('register');
    setShowModal(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="absolute top-4 left-4 bg-amber-100 px-4 py-2 rounded-md border-2 border-amber-600 shadow-md">
        <div className="w-6 h-6 border-t-2 border-amber-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show user menu if logged in
  if (user) {
    return (
      <div className="absolute top-4 left-4 flex items-center">
        <div className="bg-amber-100 px-4 py-2 rounded-l-md border-2 border-r-0 border-amber-600 shadow-md">
          <p className="font-pixel text-sm text-amber-900">
            {user.username}
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-amber-700 px-3 py-2 rounded-r-md border-2 border-amber-600 shadow-md font-pixel text-sm text-white hover:bg-amber-800"
        >
          Logout
        </button>
      </div>
    );
  }

  // Show login/register buttons if not logged in
  return (
    <>
      <div className="absolute top-4 left-4 flex space-x-2">
        <button
          onClick={handleLoginClick}
          className="bg-amber-600 px-4 py-2 rounded-md border-2 border-amber-700 shadow-md font-pixel text-sm text-white hover:bg-amber-700"
        >
          Login
        </button>
        <button
          onClick={handleRegisterClick}
          className="bg-amber-500 px-4 py-2 rounded-md border-2 border-amber-600 shadow-md font-pixel text-sm text-white hover:bg-amber-600"
        >
          Register
        </button>
      </div>

      {showModal && (
        <AuthModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          initialMode={modalMode}
        />
      )}
    </>
  );
};

export default AuthButton; 