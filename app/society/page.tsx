'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookies } from '../../lib/client-cookie';

interface Kos {
  id: number;
  name: string;
  price_per_month: number;
  address: string;
  gender: string;
  kos_image?: any[];
  kos_facilities?: any[];
}

export default function SocietyDashboard() {
  const router = useRouter();
  const [kosList, setKosList] = useState<Kos[]>([]);
  const [loading, setLoading] = useState(true);

  const getRecommendedKos = async () => {
    setLoading(true);

    try {
      const token = getCookies('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const url = 'https://learn.smktelkom-mlg.sch.id/kos/api/society/show_kos?search=';

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
      // Take only first 3 for recommendations
      setKosList(normalized.slice(0, 3));
    } catch (err) {
      console.error('Gagal mengambil data kos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRecommendedKos();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard Society</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-gray-500 text-sm">Total Booking Saya</h3>
          <p className="text-3xl font-bold text-indigo-700 mt-2">5</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-gray-500 text-sm">Kos yang Diterima</h3>
          <p className="text-3xl font-bold text-indigo-700 mt-2">3</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-gray-500 text-sm">Review yang Dibuat</h3>
          <p className="text-3xl font-bold text-indigo-700 mt-2">2</p>
        </div>
      </div>

      {/* Section tambahan */}
      <div className="mt-8 bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Rekomendasi Kos untuk Anda</h2>
        {loading ? (
          <p className="text-gray-500">Memuat data kos...</p>
        ) : kosList.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada data kos.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kosList.map((kos) => (
              <div key={kos.id} className="border rounded-xl p-4 hover:shadow-md transition-all">
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
                <h3 className="font-semibold text-gray-800">{kos.name}</h3>
                <p className="text-gray-500 text-sm">📍 {kos.address}</p>
                <p className="text-indigo-700 font-bold mt-1">
                  Rp {kos.price_per_month.toLocaleString()} / bulan
                </p>
                <button
                  onClick={() => router.push(`/society/kos/${kos.id}`)}
                  className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg w-full"
                >
                  Lihat Detail
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
