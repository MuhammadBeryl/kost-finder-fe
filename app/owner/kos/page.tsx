'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookies } from '../../../lib/client-cookie';
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
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const getKos = async (q: string = '') => {
    setLoading(true);
    setError('');
    try {
      const token = getCookies('token');
      if (!token) {
        alert('Token tidak ditemukan. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const params = q ? `?search=${encodeURIComponent(q)}` : '';
      const url = `https://learn.smktelkom-mlg.sch.id/kos/api/admin/show_kos${params}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'MakerID': '1',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        alert('Token tidak valid atau kedaluwarsa. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const data = await res.json().catch(() => null);

      // API may return { data: [...] } or directly an array
      const rawItems = (data && (data.data || data)) || [];

      const normalized = Array.isArray(rawItems)
        ? rawItems.map((it: any) => {
            const id = it.id_kos ?? it.id ?? it.kos_id ?? it.idKos ?? 0;
            const name = it.nama_kos ?? it.name ?? it.title ?? it.nama ?? '';
            const price = Number(it.harga_kos ?? it.price_per_month ?? it.price ?? it.harga ?? 0) || 0;
            const location = it.lokasi_kos ?? it.address ?? it.location ?? it.lokasi ?? '';
            const desc = it.deskripsi_kos ?? it.description ?? it.deskripsi ?? it.desc ?? '';
            return {
              id_kos: id,
              nama_kos: String(name),
              harga_kos: price,
              lokasi_kos: String(location),
              deskripsi_kos: String(desc),
            } as Kos;
          })
        : [];

      setKosList(normalized);
    } catch (err) {
      console.error('Gagal mengambil data kos:', err);
      setError('Gagal mengambil data kos. Cek koneksi atau token.');
    } finally {
      setLoading(false);
    }
  };

const deleteKos = async (kosId: number) => {
  if (!confirm('Apakah Anda yakin ingin menghapus kos ini?')) return;

  try {
    const token = getCookies('token');
    if (!token) {
      alert('Token tidak ditemukan. Silakan login ulang.');
      router.push('/login');
      return;
    }

    const res = await fetch(`https://learn.smktelkom-mlg.sch.id/kos/api/delete_kos/${kosId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'MakerID': '1',
        'Authorization': `Bearer ${token}`,
      },
    });

    const text = await res.text();
    console.log('Delete response:', res.status, text);

    if (res.ok) {
      alert('Kos berhasil dihapus');
      getKos();
    } else if (res.status === 404) {
      alert('Endpoint tidak ditemukan. Pastikan URL benar: /kos/api/delete_kos/{id}');
    } else {
      alert(`Gagal menghapus kos: ${text || res.statusText}`);
    }
  } catch (err) {
    console.error('Error saat hapus kos:', err);
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-5 gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Daftar Kos</h2>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kos"
            className="border border-gray-300 rounded-xl px-3 py-2 text-black"
          />
          <button
            onClick={() => getKos(search)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-lg text-sm"
          >
            Cari
          </button>
          <button
            onClick={() => router.push('/owner/kos/tambah')}
            className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg"
          >
            <PlusIcon className="h-5 w-5" />
            Tambah Kos
          </button>
        </div>
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
