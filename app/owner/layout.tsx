'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  HomeIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  PhotoIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  StarIcon,
  CalendarDaysIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/solid';
import React from 'react';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', icon: <HomeIcon className="h-5 w-5" />, path: '/owner' },
    { name: 'Master Kos', icon: <BuildingOfficeIcon className="h-5 w-5" />, path: '/owner/kos' },
    { name: 'Fasilitas', icon: <Cog6ToothIcon className="h-5 w-5" />, path: '/owner/fasilitas' },
    { name: 'Image Kos', icon: <PhotoIcon className="h-5 w-5" />, path: '/owner/imagekos' },
    { name: 'Review', icon: <StarIcon className="h-5 w-5" />, path: '/owner/review' },
    { name: 'Booking', icon: <CalendarDaysIcon className="h-5 w-5" />, path: '/owner/booking' },
    { name: 'Profile', icon: <UserCircleIcon className="h-5 w-5" />, path: '/owner/profile' },
  ];

  // 🔹 Fungsi Logout
  const handleLogout = () => {
    // Hapus data login di localStorage / sessionStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // kalau kamu simpan data user
    sessionStorage.clear();

    // Redirect ke halaman login
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-800 text-white flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-indigo-700">
            <img src="/images/logo-koskosan.jpg" alt="Logo" className="h-10 w-10 rounded-full" />
            <h2 className="font-semibold text-lg">Owner Dashboard</h2>
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

        {/* 🔹 Tombol Logout */}
        <button
          onClick={handleLogout}
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
