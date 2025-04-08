'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import auctionService from '@/services/auctionService';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    activeAuctions: 0,
    totalTiles: 0,
    registeredUsers: 0,
    pendingActions: 0
  });
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // In a real implementation, we'd fetch real stats from an API
    const fetchStats = async () => {
      setLoading(true);
      try {
        const auctions = await auctionService.getActiveAuctions();
        setStats(prev => ({
          ...prev,
          activeAuctions: auctions.length
        }));
        
        // Here we would fetch other stats from their respective services
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  const quickLinks = [
    { href: '/admin/auctions', label: 'Create Auction', description: 'Create and manage auctions' },
    { href: '/admin/tiles', label: 'Manage Tiles', description: 'Edit tile properties and ownership' },
    { href: '/admin/users', label: 'User Management', description: 'Manage user accounts and permissions' },
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-500">Active Auctions</h3>
            <p className="text-3xl font-bold mt-2">
              {loading ? '...' : stats.activeAuctions}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-500">Total Tiles</h3>
            <p className="text-3xl font-bold mt-2">
              {loading ? '...' : stats.totalTiles}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-500">Registered Users</h3>
            <p className="text-3xl font-bold mt-2">
              {loading ? '...' : stats.registeredUsers}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-500">Pending Actions</h3>
            <p className="text-3xl font-bold mt-2">
              {loading ? '...' : stats.pendingActions}
            </p>
          </div>
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-medium text-blue-600">{link.label}</h3>
              <p className="mt-2 text-gray-600">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Recent Activity - Placeholder */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 italic">
            No recent activities to display.
          </p>
        </div>
      </div>
    </div>
  );
} 