'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

interface RegisterModalProps {
  onClose: () => void;
  switchToLogin?: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, switchToLogin }) => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      await register(username, email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="bg-amber-100 border-4 border-amber-800 p-6 rounded-lg w-full max-w-md relative">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-amber-800 hover:text-red-600"
        >
          <span className="text-2xl font-pixel">×</span>
        </button>
        
        <h2 className="text-xl font-pixel text-amber-800 mb-6 text-center">Join WorldOply</h2>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-pixel text-amber-800 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border-2 border-amber-600 bg-amber-50 rounded focus:outline-none focus:border-amber-800 text-amber-900"
            />
          </div>
          
          <div className="mb-4">
            <label className="block font-pixel text-amber-800 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border-2 border-amber-600 bg-amber-50 rounded focus:outline-none focus:border-amber-800 text-amber-900"
            />
          </div>
          
          <div className="mb-4">
            <label className="block font-pixel text-amber-800 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border-2 border-amber-600 bg-amber-50 rounded focus:outline-none focus:border-amber-800 text-amber-900"
            />
          </div>
          
          <div className="mb-6">
            <label className="block font-pixel text-amber-800 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border-2 border-amber-600 bg-amber-50 rounded focus:outline-none focus:border-amber-800 text-amber-900"
            />
          </div>
          
          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded font-pixel ${
                loading 
                  ? 'bg-amber-400 cursor-not-allowed' 
                  : 'bg-amber-600 hover:bg-amber-700'
              } text-white transition-colors`}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
            
            {switchToLogin && (
              <button
                type="button"
                onClick={switchToLogin}
                className="w-full py-2 bg-transparent border-2 border-amber-600 text-amber-800 rounded font-pixel hover:bg-amber-200 transition-colors"
              >
                Already have an account? Login
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal; 