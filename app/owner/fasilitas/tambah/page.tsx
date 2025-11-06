// ...existing code...
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookies } from '../../../../lib/client-cookie'

export default function TambahFasilitasPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    facility_name: '',
    deskripsi: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ambil token dan id dari cookie (ubah key jika berbeda)
      const token = getCookies('token');
      const id = getCookies('kos_id') || getCookies('user_id') || '1';

      if (!token) {
        alert('Token tidak ditemukan. Silakan login ulang.');
        router.push('/login');
        setLoading(false);
        return;
      }

      const url = `https://learn.smktelkom-mlg.sch.id/kos/api/store_facility/${id}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'MakerID': '1',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.status === 401 || res.status === 403) {
        alert('Token tidak valid atau kedaluwarsa. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const data = await res.json().catch(() => null);

      if (res.ok) {
        const msg = data && (data.message || data.success) ? (data.message || data.success) : 'Fasilitas berhasil ditambahkan!';
        alert(msg);
        router.push('/owner/fasilitas');
      } else {
        const errMsg = data && (data.error || data.message) ? (data.error || data.message) : `Gagal menambahkan fasilitas (status ${res.status})`;
        alert(errMsg);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Tambah Fasilitas</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="facility_name"
          placeholder="Nama Fasilitas"
          value={formData.facility_name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-black"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-2 rounded-xl font-semibold transition-all"
        >
          {loading ? 'Menyimpan...' : 'Tambah Fasilitas'}
        </button>
      </form>
    </div>
  );
}
// ...existing code...