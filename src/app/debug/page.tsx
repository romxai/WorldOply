'use client';

import React from 'react';
import WebSocketTester from '../components/Debug/WebSocketTester';

export default function DebugPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Debug Tools</h1>
      
      <div className="mb-8">
        <WebSocketTester />
      </div>
    </div>
  );
} 