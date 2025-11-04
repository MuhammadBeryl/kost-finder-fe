'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';

interface Fasilitas {
  id_fasilitas: number;
  nama_fasilitas: string;
  deskripsi: string;
}

export default function FasilitasPage() {
  const router = useRouter();
  const [fasilitasList, setFasilitasList] = useState<Fasilitas[]>([]);
  const [loading, setLoading] = useState(true);

  const getFasilitas = async () => {
    try {
      const res = await fetch('http://localhost:8000/fasilitas');
      const data = await res.json();
      setFasilitasList(data.data || []);
    } catch (err) {
      console.error('Gagal mengambil data fasilitas:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteFasilitas = async (id: number) => {
    if (!confirm('Yakin ingin menghapus fasilitas ini?')) return;

    try {
      const res = await fetch(`http://localhost:8000/fasilitas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Fasilitas berhasil dihapus');
        getFasilitas();
      } else {
        alert('Gagal menghapus fasilitas');
      }
    } catch {
      alert('Terjadi kesalahan saat menghapus fasilitas.');
    }
  };

  useEffect(() => {
    getFasilitas();
  }, []);

  if (loading) return <p className="text-gray-500">Memuat data fasilitas...</p>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-gray-800">Daftar Fasilitas Kos</h2>
        <button
          onClick={() => router.push('/owner/fasilitas/tambah')}
          className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg"
        >
          <PlusIcon className="h-5 w-5" /> Tambah
        </button>
      </div>

      {fasilitasList.length === 0 ? (
        <p className="text-gray-500 text-sm">Belum ada fasilitas terdaftar.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fasilitasList.map((fasilitas) => (
            <div
              key={fasilitas.id_fasilitas}
              className="bg-gray-50 border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-semibold text-gray-900 text-lg">{fasilitas.nama_fasilitas}</h3>
              <p className="text-gray-600 text-sm mt-1">{fasilitas.deskripsi}</p>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => router.push(`/owner/fasilitas/edit/${fasilitas.id_fasilitas}`)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <PencilSquareIcon className="h-4 w-4" /> Edit
                </button>
                <button
                  onClick={() => deleteFasilitas(fasilitas.id_fasilitas)}
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
