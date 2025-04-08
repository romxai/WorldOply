"use client";

import React, { Suspense } from "react";
import AuthButton from './components/UI/AuthButton';
import OnlineCounter from './components/UI/OnlineCounter';
import ConnectionStatus from './components/UI/ConnectionStatus';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-900 text-white relative">
      {/* Authentication button */}
      <AuthButton />
      
      {/* Online players counter */}
      <OnlineCounter />
      
      {/* Connection status indicator */}
      <ConnectionStatus />
      
      <div className="flex-1 p-0 overflow-hidden flex justify-center items-center">
        <h1 className="text-4xl font-pixel text-amber-500">Welcome to WorldOply</h1>
      </div>
    </main>
  );
}
