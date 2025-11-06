// ...existing code...
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookies } from '../../../../lib/client-cookie';

export default function TambahKosPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    user_id: '', // akan diisi dari cookie
    name: '',
    address: '',
    price_per_month: '',
    gender: 'male',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const uid = getCookies('user_id');
    setFormData((prev) => ({ ...prev, user_id: uid || '' }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ambil token dari cookie
      const token = getCookies('token');
      if (!token) {
        alert('Token tidak ditemukan. Silakan login ulang.');
        router.push('/login');
        setLoading(false);
        return;
      }

      const payload = {
        user_id: formData.user_id || getCookies('user_id') || '1',
        name: formData.name,
        address: formData.address,
        price_per_month: Number(formData.price_per_month),
        gender: formData.gender,
      };

      const res = await fetch('https://learn.smktelkom-mlg.sch.id/kos/api/admin/store_kos/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'MakerID': '1'
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401 || res.status === 403) {
        alert('Token tidak valid atau kedaluwarsa. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const data = await res.json().catch(() => null);

      if (res.ok) {
        const msg = data && (data.message || data.success) ? (data.message || data.success) : 'Kos berhasil ditambahkan!';
        alert(msg);
        router.push('/owner/kos');
      } else {
        const errMsg = data && (data.error || data.message) ? (data.error || data.message) : 'Gagal menambahkan kos';
        alert(errMsg);
      }
    } catch {
      alert('Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Tambah Kos Baru</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Nama Kos"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-black"
        />

        <input
          name="price_per_month"
          placeholder="Harga per bulan"
          type="number"
          value={formData.price_per_month}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-black"
        />

        <input
          name="address"
          placeholder="Alamat / Lokasi"
          value={formData.address}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-black"
        />

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-black"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="all">All</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-2 rounded-xl font-semibold transition-all"
        >
          {loading ? 'Menyimpan...' : 'Tambah Kos'}
        </button>
      </form>
    </div>
  );
}