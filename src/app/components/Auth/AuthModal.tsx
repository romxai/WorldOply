'use client';

import React, { useState } from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

export type ModalMode = 'login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: ModalMode;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<ModalMode>(initialMode);
  
  if (!isOpen) return null;
  
  // Switch between login and register modes
  const switchToLogin = () => setMode('login');
  const switchToRegister = () => setMode('register');
  
  return (
    <>
      {mode === 'login' ? (
        <LoginModal 
          onClose={onClose} 
          switchToRegister={switchToRegister} 
        />
      ) : (
        <RegisterModal 
          onClose={onClose} 
          switchToLogin={switchToLogin} 
        />
      )}
    </>
  );
};

export default AuthModal; 