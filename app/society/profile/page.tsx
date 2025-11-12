'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookies, removeCookies, storeCookies } from '../../../lib/client-cookie';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ArrowRightOnRectangleIcon,
  IdentificationIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/solid';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  role?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Get token and user from cookies
    const token = getCookies('token');
    const userCookie = getCookies('user');
    
    console.log('Token exists:', !!token);
    console.log('User cookie exists:', !!userCookie);
    console.log('User cookie value:', userCookie);
    
    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/login');
      return;
    }

    if (!userCookie) {
      console.log('No user cookie found, but token exists');
      // Token exists but no user data, set loading to false
      setLoading(false);
      return;
    }

    try {
      const userData = JSON.parse(userCookie);
      console.log('User data from cookie:', userData);
      setUser(userData);
    } catch (err) {
      console.error('Failed to parse user data:', err);
      // Don't redirect on parse error, just show empty state
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    if (confirm('Yakin ingin keluar?')) {
      removeCookies('token');
      removeCookies('user');
      router.push('/login');
    }
  };

  const handleEditProfile = () => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setShowEditModal(true);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      alert('Nama dan email wajib diisi!');
      return;
    }

    setSubmitting(true);

    try {
      const token = getCookies('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const requestBody = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
      };

      console.log('Update profile request:', requestBody);

      const res = await fetch(
        'https://learn.smktelkom-mlg.sch.id/kos/api/society/update_profile',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            MakerID: '1',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const responseData = await res.json();
      console.log('Update profile response:', responseData);

      if (!res.ok) {
        console.error('Error response:', responseData);
        if (responseData.errors) {
          console.error('Validation errors:', JSON.stringify(responseData.errors, null, 2));
        }
        
        let errorMsg = 'Gagal mengupdate profil';
        if (typeof responseData.message === 'object') {
          errorMsg += ':\n' + JSON.stringify(responseData.message, null, 2);
        } else if (typeof responseData.message === 'string') {
          errorMsg += ': ' + responseData.message;
        }
        
        throw new Error(errorMsg);
      }

      // Update user state with new data
      const updatedUser = {
        ...user,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
      };
      
      setUser(updatedUser as User);
      
      // Update user cookie
      storeCookies('user', JSON.stringify(updatedUser));

      alert('Profil berhasil diupdate!');
      setShowEditModal(false);
    } catch (err: any) {
      console.error('Gagal update profil:', err);
      alert(`Gagal update profil: ${err.message || 'Silakan coba lagi.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-md text-center">
        <UserCircleIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Data Profil Tidak Tersedia
        </h3>
        <p className="text-gray-500 mb-4">
          Data profil Anda belum tersimpan. Silakan login ulang.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
        >
          Login Ulang
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl shadow-lg text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
            <UserCircleIcon className="h-24 w-24 text-white" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            <p className="text-indigo-100 flex items-center gap-2 justify-center md:justify-start">
              <EnvelopeIcon className="h-5 w-5" />
              {user.email}
            </p>
            {user.role && (
              <p className="mt-2 text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
                {user.role === 'society' ? '👤 Society' : '🏠 Owner'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Informasi Profil</h2>
        </div>
        
        <div className="p-6 space-y-4">
          {/* ID */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <IdentificationIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">User ID</p>
              <p className="font-semibold text-gray-900">{user.id}</p>
            </div>
          </div>

          {/* Name */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <UserCircleIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Nama Lengkap</p>
              <p className="font-semibold text-gray-900">{user.name}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="bg-purple-100 p-3 rounded-lg">
              <EnvelopeIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="font-semibold text-gray-900">{user.email}</p>
            </div>
          </div>

          {/* Phone (if available) */}
          {user.phone && (
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="bg-green-100 p-3 rounded-lg">
                <PhoneIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Nomor Telepon</p>
                <p className="font-semibold text-gray-900">{user.phone}</p>
              </div>
            </div>
          )}

          {/* Created At */}
          {user.created_at && (
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="bg-blue-100 p-3 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Bergabung Sejak</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(user.created_at)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Aksi</h3>
        <div className="space-y-3">
          <button
            onClick={handleEditProfile}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg hover:shadow-xl"
          >
            <PencilSquareIcon className="h-5 w-5" />
            Edit Profil
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg hover:shadow-xl"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Keluar dari Akun
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <PencilSquareIcon className="h-6 w-6" />
                Edit Profil
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Masukkan email"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="Masukkan nomor telepon"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={submitting}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdateProfile}
                  disabled={submitting || !editForm.name.trim() || !editForm.email.trim()}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    'Menyimpan...'
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
