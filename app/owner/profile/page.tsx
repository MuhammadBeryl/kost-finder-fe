'use client';

import { useState } from 'react';

export default function EditProfile() {
  const [profile, setProfile] = useState({
    name: 'name',
    email: 'email',
    phone: 'phone',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Profil</h2>
      <div className="flex items-center gap-6 mb-6">

      </div>
      <form className="space-y-4">
        <input
          type="text"
          name="name"
          value={profile.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm"
          placeholder="Nama Lengkap"
        />
        <input
          type="email"
          name="email"
          value={profile.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm"
          placeholder="Email"
        />
        <input
          type="tel"
          name="phone"
          value={profile.phone}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm"
          placeholder="Nomor Telepon"
        />
        <button
          type="submit"
          className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-2 rounded-xl font-semibold transition-all"
        >
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
