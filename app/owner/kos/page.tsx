'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';

interface Kos {
  id_kos: number;
  nama_kos: string;
  harga_kos: number;
  lokasi_kos: string;
  deskripsi_kos: string;
}

export default function MasterKosPage() {
  const router = useRouter();
  const [kosList, setKosList] = useState<Kos[]>([]);
  const [loading, setLoading] = useState(true);

  const getKos = async () => {
    try {
      const res = await fetch('http://localhost:8000/kos');
      const data = await res.json();
      setKosList(data.data || []);
    } catch (err) {
      console.error('Gagal mengambil data kos:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteKos = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kos ini?')) return;

    try {
      const res = await fetch(`http://localhost:8000/kos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Kos berhasil dihapus');
        getKos();
      } else {
        alert('Gagal menghapus kos');
      }
    } catch {
      alert('Terjadi kesalahan saat menghapus kos.');
    }
  };

  useEffect(() => {
    getKos();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Memuat data kos...</p>;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-gray-800">Daftar Kos</h2>
        <button
          onClick={() => router.push('/owner/kos/tambah')}
          className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg"
        >
          <PlusIcon className="h-5 w-5" />
          Tambah Kos
        </button>
      </div>

      {kosList.length === 0 ? (
        <p className="text-gray-500 text-sm">Belum ada data kos.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kosList.map((kos) => (
            <div key={kos.id_kos} className="bg-gray-50 border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold text-gray-900 text-lg">{kos.nama_kos}</h3>
              <p className="text-gray-600 text-sm mt-1">📍 {kos.lokasi_kos}</p>
              <p className="text-indigo-700 font-bold mt-2">Rp {kos.harga_kos.toLocaleString()}</p>
              <p className="text-gray-500 text-sm mt-2 line-clamp-2">{kos.deskripsi_kos}</p>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => router.push(`/owner/kos/edit/${kos.id_kos}`)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <PencilSquareIcon className="h-4 w-4" /> Edit
                </button>
                <button
                  onClick={() => deleteKos(kos.id_kos)}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
