'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  StarIcon,
  UserCircleIcon,
  HeartIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/solid';
import React from 'react';

export default function SocietyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', icon: <HomeIcon className="h-5 w-5" />, path: '/society' },
    { name: 'Cari Kos', icon: <MagnifyingGlassIcon className="h-5 w-5" />, path: '/society/search' },
    { name: 'Booking Saya', icon: <ClipboardDocumentListIcon className="h-5 w-5" />, path: '/society/booking' },
    { name: 'Review Saya', icon: <StarIcon className="h-5 w-5" />, path: '/society/review' },
    { name: 'Favorit', icon: <HeartIcon className="h-5 w-5" />, path: '/society/favorite' },
    { name: 'Profile', icon: <UserCircleIcon className="h-5 w-5" />, path: '/society/profile' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-800 text-white flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-indigo-700">
            <img src="/images/logo-koskosan.jpg" alt="Logo" className="h-10 w-10 rounded-full" />
            <h2 className="font-semibold text-lg">Society Page</h2>
          </div>
          <nav className="mt-4">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-all ${
                  pathname === item.path
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-indigo-700 text-gray-200'
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="flex items-center gap-3 px-5 py-3 bg-indigo-900 hover:bg-red-700 transition-all text-sm"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
