'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/solid';

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

      // Ganti URL ini dengan API login backend kamu
      // const res = await fetch('http://localhost:8000/user/login', {...});

      setSuccess('Login berhasil! Mengalihkan...');
      setTimeout(() => router.push('/'), 1500);
    } catch {
      setError('Terjadi kesalahan saat login.');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gray-900">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/KamarKos-Kos.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        {/* Overlay hitam transparan */}
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

          {error && (
            <p className="text-red-500 text-sm text-center mb-3">{error}</p>
          )}
          {success && (
            <p className="text-green-600 text-sm text-center mb-3">{success}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3 shadow-sm transition-all focus-within:border-indigo-500">
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
            <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3 shadow-sm transition-all focus-within:border-indigo-500">
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

            {/* Forgot Password */}
            <div className="text-right text-sm">
              <button
                type="button"
                className="text-indigo-600 hover:underline font-medium"
                onClick={() => alert('Fitur lupa password belum diaktifkan')}
              >
                Lupa Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-md"
            >
              Masuk Sekarang
            </button>
          </form>

          {/* Link ke register */}
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
