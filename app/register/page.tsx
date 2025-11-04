'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'society', // default role
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('https://learn.smktelkom-mlg.sch.id/kos/api/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'MakerID': "1"
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess('Berhasil mendaftar! Silakan login.');
        setError('');
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          role: 'society',
        });
        setTimeout(() => router.push('/login'), 1500);
      } else {
        const data = await res.json();
        setError(data.message || 'Gagal mendaftar.');
        setSuccess('');
      }
    } catch {
      setError('Terjadi kesalahan saat mendaftar. (Periksa backend)');
      setSuccess('');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gray-900">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/KamarKos-Kos.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      {/* Form Container */}
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-4">
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-lg">
          <div className="flex flex-col items-center mb-6">
            <img
              src="/images/logo-koskosan.jpg"
              alt="RumahKos Logo"
              className="h-20 mb-3"
            />
            <h2 className="text-2xl font-bold text-gray-800">Daftar Akun</h2>
            <p className="text-gray-500 text-sm">
              Buat akun untuk mulai menggunakan aplikasi kos 🏠
            </p>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mb-3">{error}</p>
          )}
          {success && (
            <p className="text-green-600 text-sm text-center mb-3">{success}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="name"
                placeholder="Nama Lengkap"
                value={formData.name}
                onChange={handleChange}
                required
                className="flex-1 bg-transparent text-gray-800 outline-none text-sm"
              />
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="flex-1 bg-transparent text-gray-800 outline-none text-sm"
              />
            </div>

            {/* Password */}
            <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="flex-1 bg-transparent text-gray-800 outline-none text-sm"
              />
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3">
              <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                placeholder="Nomor Telepon"
                value={formData.phone}
                onChange={handleChange}
                required
                className="flex-1 bg-transparent text-gray-800 outline-none text-sm"
              />
            </div>

            {/* Role Selection */}
            <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3">
              <UserGroupIcon className="h-5 w-5 text-gray-400" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="flex-1 bg-transparent text-gray-800 outline-none text-sm"
              >
                <option value="society">Society</option>
                <option value="owner">Owner</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-md"
            >
              Daftar Sekarang
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Sudah punya akun?{' '}
            <span
              className="text-red-600 font-medium hover:underline cursor-pointer"
              onClick={() => router.push('/login')}
            >
              Login Sekarang
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
