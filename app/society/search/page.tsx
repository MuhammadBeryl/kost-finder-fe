'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookies } from '../../../lib/client-cookie';

interface Kos {
  id: number;
  name: string;
  price_per_month: number;
  address: string;
  gender: string;
  kos_image?: any[];
  kos_facilities?: any[];
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

      const params = q ? `?search=${encodeURIComponent(q)}` : '?search=';
      const url = `https://learn.smktelkom-mlg.sch.id/kos/api/society/show_kos${params}`;

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
      console.log('API Response:', data);
      
      const items = (data && (data.data || data)) || [];

      const normalized = Array.isArray(items)
        ? items.map((it: any) => ({
            id: it.id ?? 0,
            name: it.name ?? 'Tanpa Nama',
            price_per_month: Number(it.price_per_month ?? 0),
            address: it.address ?? 'Tidak diketahui',
            gender: it.gender ?? '-',
            kos_image: it.kos_image ?? [],
            kos_facilities: it.kos_facilities ?? [],
          }))
        : [];

      console.log('Normalized data:', normalized);
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
              key={kos.id}
              className="bg-gray-50 border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition"
            >
              {/* Image Preview */}
              {kos.kos_image && kos.kos_image.length > 0 ? (
                <img
                  src={`https://learn.smktelkom-mlg.sch.id/kos/${kos.kos_image[0].file}`}
                  alt={kos.name}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-4xl">🏠</span>
                </div>
              )}
              
              <h3 className="font-semibold text-gray-900 text-lg">{kos.name}</h3>
              <p className="text-gray-600 text-sm mt-1">📍 {kos.address}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-700">
                  {kos.gender === 'male' ? '👨 Pria' : kos.gender === 'female' ? '👩 Wanita' : '👥 Campur'}
                </span>
              </div>
              <p className="text-indigo-700 font-bold mt-2">
                Rp {kos.price_per_month.toLocaleString()} / bulan
              </p>
              
              {/* Facilities Preview */}
              {kos.kos_facilities && kos.kos_facilities.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    ✨ {kos.kos_facilities.length} Fasilitas
                  </p>
                </div>
              )}

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => router.push(`/society/kos/${kos.id}`)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
