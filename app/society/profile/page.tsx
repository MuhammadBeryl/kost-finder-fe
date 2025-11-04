'use client';

import { useState } from 'react';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Beryl Maulana',
    email: 'beryl@example.com',
    phone: '08123456789',
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Profil Saya</h1>
      <div className="bg-white p-6 rounded-2xl shadow w-full md:w-1/2">
        <label className="block mb-3">
          <span className="text-gray-600 text-sm">Nama</span>
          <input
            value={profile.name}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </label>
        <label className="block mb-3">
          <span className="text-gray-600 text-sm">Email</span>
          <input
            value={profile.email}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </label>
        <label className="block mb-4">
          <span className="text-gray-600 text-sm">Nomor Telepon</span>
          <input
            value={profile.phone}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </label>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm">
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}
