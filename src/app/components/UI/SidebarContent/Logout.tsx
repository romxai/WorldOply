import React from "react";
import Image from "next/image";

interface LogoutProps {
  onConfirm: () => void;
}

const Logout: React.FC<LogoutProps> = ({ onConfirm }) => {
  return (
    <div className="font-pixel text-xs">
      <h1 className="pixel-heading text-sm mb-3">Logout Confirmation</h1>

      <div className="pixel-panel p-3 mb-3">
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 border-2 border-yellow-800 bg-red-200 flex items-center justify-center">
            <span className="text-2xl text-red-600">!</span>
          </div>
        </div>

        <p className="text-center text-yellow-900 mb-3 text-xs">
          Are you sure you want to log out of the game?
        </p>

        <p className="text-center text-xxs text-yellow-800 mb-4">
          Your progress is automatically saved, but any ongoing activities will
          be canceled.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-2">
          <button
            className="pixel-button text-xxs py-1 px-2 bg-red-500 text-yellow-100"
            onClick={onConfirm}
          >
            Yes, Log Out
          </button>
          <button
            className="pixel-button text-xxs py-1 px-2"
            onClick={onConfirm} // In real app, this would just close the dialog
          >
            No, Continue
          </button>
        </div>
      </div>

      <div className="text-center text-xxs text-yellow-800 mb-3">
        Your account and tiles will be waiting when you return!
      </div>

      <div className="flex justify-center">
        <button
          className="text-xxs text-yellow-900 underline"
          onClick={() => console.log("Help clicked")}
        >
          Need help? Contact Support
        </button>
      </div>
    </div>
  );
};

export default Logout;
