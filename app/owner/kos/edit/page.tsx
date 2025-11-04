'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditKosPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [formData, setFormData] = useState({
    nama_kos: '',
    harga_kos: '',
    lokasi_kos: '',
    deskripsi_kos: '',
  });

  const getKosDetail = async () => {
    try {
      const res = await fetch(`http://localhost:8000/kos/${id}`);
      const data = await res.json();
      setFormData(data.data || {});
    } catch {
      alert('Gagal memuat data kos.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8000/kos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Kos berhasil diperbarui!');
        router.push('/owner/kos');
      } else {
        alert('Gagal memperbarui kos');
      }
    } catch {
      alert('Terjadi kesalahan koneksi ke server.');
    }
  };

  useEffect(() => {
    getKosDetail();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Data Kos</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="nama_kos"
          placeholder="Nama Kos"
          value={formData.nama_kos}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm"
        />
        <input
          name="harga_kos"
          type="number"
          placeholder="Harga Kos"
          value={formData.harga_kos}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm"
        />
        <input
          name="lokasi_kos"
          placeholder="Lokasi Kos"
          value={formData.lokasi_kos}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm"
        />
        <textarea
          name="deskripsi_kos"
          placeholder="Deskripsi Kos"
          value={formData.deskripsi_kos}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm resize-none"
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
