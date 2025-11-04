'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditFasilitasPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [formData, setFormData] = useState({
    nama_fasilitas: '',
    deskripsi: '',
  });

  const getFasilitasDetail = async () => {
    try {
      const res = await fetch(`http://localhost:8000/fasilitas/${id}`);
      const data = await res.json();
      setFormData(data.data || {});
    } catch {
      alert('Gagal memuat data fasilitas.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8000/fasilitas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert('Fasilitas berhasil diperbarui!');
        router.push('/owner/fasilitas');
      } else {
        alert('Gagal memperbarui fasilitas');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  useEffect(() => {
    getFasilitasDetail();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Fasilitas</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="nama_fasilitas"
          placeholder="Nama Fasilitas"
          value={formData.nama_fasilitas}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm"
        />
        <textarea
          name="deskripsi"
          placeholder="Deskripsi Fasilitas"
          value={formData.deskripsi}
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
