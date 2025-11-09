'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookies } from '../../../lib/client-cookie';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/solid';

interface Kos {
  id_kos: number;
  nama_kos: string;
  harga_kos: number;
  lokasi_kos: string;
  deskripsi_kos: string;
}

export default function SearchKosPage() {
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

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const items = (data && (data.data || data)) || [];

      const normalized = Array.isArray(items)
        ? items.map((it: any) => ({
            id_kos: it.id_kos ?? it.id ?? 0,
            nama_kos: it.nama_kos ?? it.nama ?? 'Tanpa Nama',
            harga_kos: Number(it.harga_kos ?? it.harga ?? 0),
            lokasi_kos: it.lokasi_kos ?? it.lokasi ?? 'Tidak diketahui',
            deskripsi_kos: it.deskripsi_kos ?? it.deskripsi ?? '-',
          }))
        : [];

      setKosList(normalized);
    } catch (err) {
      console.error('Gagal mengambil data kos:', err);
      setError('Gagal mengambil data kos. Periksa koneksi atau server API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getKos();
  }, []);

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
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat data kos...</p>
      ) : kosList.length === 0 ? (
        <p className="text-gray-500 text-sm">Belum ada data kos.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kosList.map((kos) => (
            <div
              key={kos.id_kos}
              className="bg-gray-50 border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-semibold text-gray-900 text-lg">{kos.nama_kos}</h3>
              <p className="text-gray-600 text-sm mt-1">📍 {kos.lokasi_kos}</p>
              <p className="text-indigo-700 font-bold mt-2">
                Rp {kos.harga_kos.toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                {kos.deskripsi_kos}
              </p>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => router.push(`/owner/fasilitas/${kos.id_kos}`)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  <WrenchScrewdriverIcon className="h-5 w-5" />
                  Kelola Fasilitas
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
