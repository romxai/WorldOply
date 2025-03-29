import React from "react";
import Image from "next/image";

interface LogoutProps {
  onConfirm: () => void;
}

const Logout: React.FC<LogoutProps> = ({ onConfirm }) => {
  return (
    <div className="font-pixel text-sm">
      <h1 className="pixel-heading text-xl mb-6">Logout Confirmation</h1>

      <div className="pixel-panel mb-6">
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 border-4 border-yellow-800 bg-red-200 flex items-center justify-center">
            <span className="text-4xl text-red-600">!</span>
          </div>
        </div>

        <p className="text-center text-yellow-900 mb-6">
          Are you sure you want to log out of the game?
        </p>

        <p className="text-center text-xxs text-yellow-800 mb-8">
          Your progress is automatically saved, but any ongoing activities will
          be canceled.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            className="pixel-button bg-red-500 text-white"
            onClick={onConfirm}
          >
            Yes, Log Out
          </button>
          <button
            className="pixel-button"
            onClick={onConfirm} // In real app, this would just close the dialog
          >
            No, Continue Playing
          </button>
        </div>
      </div>

      <div className="text-center text-xxs text-yellow-800 mb-8">
        Remember: Your account and all your tiles will be waiting for you when
        you return!
      </div>

      <div className="flex justify-center">
        <button
          className="text-xs text-yellow-900 underline"
          onClick={() => console.log("Help clicked")}
        >
          Need help? Contact Support
        </button>
      </div>
    </div>
  );
};

export default Logout;
