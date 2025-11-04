'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Building,
  Calendar,
  Image,
  Star,
  UserCog,
  LogOut,
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: Home, path: '/owner/dashboard' },
  { name: 'Kos Saya', icon: Building, path: '/owner/kos' },
  { name: 'Booking', icon: Calendar, path: '/owner/kos/booking' },
  { name: 'Review', icon: Star, path: '/owner/kos/review' },
  { name: 'Gambar Kos', icon: Image, path: '/owner/kos/image' },
  { name: 'Profil', icon: UserCog, path: '/owner/profile' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-indigo-700 text-white flex flex-col">
      <div className="p-6 text-2xl font-bold border-b border-indigo-500">
        🏠 Kos Owner
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map(({ name, icon: Icon, path }) => (
          <Link
            key={path}
            href={path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              pathname === path
                ? 'bg-indigo-500 text-white'
                : 'text-indigo-100 hover:bg-indigo-600'
            }`}
          >
            <Icon className="w-5 h-5" />
            {name}
          </Link>
        ))}
      </nav>
      <button className="m-4 flex items-center gap-2 text-indigo-200 hover:text-white">
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </aside>
  );
}
