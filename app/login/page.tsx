'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { storeCookies } from '../../lib/client-cookie';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!email || !password) {
        setError('Email dan password harus diisi!');
        return;
      }

      const res = await fetch('https://learn.smktelkom-mlg.sch.id/kos/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'MakerID': '1',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.message || data?.error || 'Login gagal';
        setError(String(msg));
        return;
      }

      // Ambil token dan user data dari response
      const token =
        data?.token ||
        data?.access_token ||
        data?.data?.token ||
        data?.data?.access_token ||
        data?.data?.accessToken;

      const user = data?.user || data?.data?.user || data?.data || {};
      const userId = user?.id;
      const userRole = user?.role || 'society'; // default kalau role tidak ada

      console.log('Login response:', data);
      console.log('Extracted user:', user);
      console.log('Token:', token);

      if (!token) {
        setError('Token tidak diterima dari server.');
        return;
      }

      // Simpan ke cookie
      storeCookies('token', token);
      if (userId) storeCookies('user_id', String(userId));
      storeCookies('user_role', userRole);
      
      // Simpan user object lengkap
      if (user && user.id) {
        storeCookies('user', JSON.stringify(user));
        console.log('User data saved to cookie:', user);
      }

      setSuccess('Login berhasil! Mengalihkan...');

      // 🔹 Redirect berdasarkan role
      setTimeout(() => {
        if (userRole === 'owner') {
          router.push('/owner');
        } else if (userRole === 'society') {
          router.push('/society');
        } else {
          router.push('/'); // fallback default
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan saat login.');
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
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <img
              src="/images/logo-koskosan.jpg"
              alt="RumahKos-Logo"
              className="h-12 mb-3"
            />
            <h2 className="text-2xl font-bold text-gray-800">Selamat Datang 👋</h2>
            <p className="text-gray-500 text-sm">
              Masuk untuk melanjutkan ke akun RumahKos kamu
            </p>
          </div>

          {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center mb-3">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3 shadow-sm">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent text-gray-800 outline-none text-sm"
                required
              />
            </div>

            {/* Password */}
            <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3 shadow-sm">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent text-gray-800 outline-none text-sm"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-md"
            >
              Masuk Sekarang
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Belum punya akun?{' '}
            <span
              className="text-red-600 font-medium hover:underline cursor-pointer"
              onClick={() => router.push('/register')}
            >
              Daftar Sekarang
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
