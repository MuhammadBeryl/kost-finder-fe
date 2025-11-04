'use client';

import { Bell, User } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="flex justify-between items-center bg-white border-b px-6 py-3 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-700">Dashboard Owner</h1>
      <div className="flex items-center gap-4">
        <Bell className="text-gray-500 w-5 h-5 hover:text-indigo-600 cursor-pointer" />
        <div className="flex items-center gap-2">
          <User className="text-gray-600" />
          <span className="font-medium text-gray-700">Owner</span>
        </div>
      </div>
    </header>
  );
}
