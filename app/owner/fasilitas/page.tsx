'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PencilSquareIcon, TrashIcon, PlusIcon, SparklesIcon, HomeIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { getCookies } from '../../../lib/client-cookie';

interface Kos {
  id_kos: number;
  nama_kos: string;
}

interface Fasilitas {
  id_fasilitas: number;
  facility_id?: number;
  nama_fasilitas: string;
  facility_name?: string;
  id_kos?: number;
  kos_id?: number;
}

export default function FasilitasPage() {
  const router = useRouter();
  const [kosList, setKosList] = useState<Kos[]>([]);
  const [fasilitasList, setFasilitasList] = useState<Fasilitas[]>([]);
  const [selectedKos, setSelectedKos] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const makerID = 1;

  // ✅ GET data kos owner
  const getKos = async () => {
    setLoading(true);
    try {
      const token = getCookies('token');
      if (!token) {
        alert('Token tidak ditemukan. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const res = await fetch('https://learn.smktelkom-mlg.sch.id/kos/api/admin/show_kos', {
        headers: {
          'Content-Type': 'application/json',
          'MakerID': String(makerID),
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        alert('Token tidak valid atau kedaluwarsa. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const data = await res.json();
      const raw = data.data || data || [];
      const mapped = Array.isArray(raw)
        ? raw.map((it: any) => ({
            id_kos: it.id_kos ?? it.id ?? 0,
            nama_kos: it.nama_kos ?? it.name ?? it.nama ?? '',
          }))
        : [];
      setKosList(mapped);
    } catch (err) {
      console.error('Gagal mengambil data kos:', err);
      setError('Gagal mengambil data kos.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ GET data fasilitas berdasarkan kos yang dipilih
  const getFasilitas = async (kosId: number, q: string = '') => {
    setLoadingFacilities(true);
    setError('');
    try {
      const token = getCookies('token');
      if (!token) {
        alert('Token tidak ditemukan. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const params = q ? `?search=${encodeURIComponent(q)}` : '';
      const url = `https://learn.smktelkom-mlg.sch.id/kos/api/admin/show_facilities/${kosId}${params}`;
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'MakerID': String(makerID),
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        alert('Token tidak valid atau kedaluwarsa. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const data = await res.json().catch(() => null);
      const rawItems = (data && (data.facilities || data.data || data)) || [];

      const normalized = Array.isArray(rawItems)
        ? rawItems.map((it: any) => ({
            id_fasilitas: it.id_fasilitas ?? it.facility_id ?? it.id ?? 0,
            nama_fasilitas: it.nama_fasilitas ?? it.facility_name ?? it.name ?? it.nama ?? '',
            id_kos: it.id_kos ?? it.kos_id ?? kosId,
          }))
        : [];

      setFasilitasList(normalized);
    } catch (err) {
      console.error('Gagal mengambil data fasilitas:', err);
      setError('Gagal mengambil data fasilitas. Cek koneksi atau token.');
    } finally {
      setLoadingFacilities(false);
    }
  };

  // ✅ DELETE fasilitas
  const deleteFasilitas = async (id: number) => {
    if (!confirm('Yakin ingin menghapus fasilitas ini?')) return;

    try {
      const token = getCookies('token');
      if (!token) {
        alert('Token tidak ditemukan. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const res = await fetch(`https://learn.smktelkom-mlg.sch.id/kos/api/admin/delete_facility/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'MakerID': String(makerID),
          'Authorization': `Bearer ${token}`,
        },
      });

      const text = await res.text();
      console.log('Delete response:', res.status, text);

      if (res.ok) {
        alert('Fasilitas berhasil dihapus');
        getFasilitas();
      } else if (res.status === 404) {
        alert('Endpoint tidak ditemukan. Pastikan URL benar: /kos/api/admin/delete_facility/{id}');
      } else {
        alert(`Gagal menghapus fasilitas: ${text || res.statusText}`);
      }
    } catch (err) {
      console.error('Error saat menghapus fasilitas:', err);
      alert('Terjadi kesalahan saat menghapus fasilitas.');
    }
  };

  useEffect(() => {
    getKos();
  }, []);

  // Ketika kos dipilih, ambil fasilitas kos tersebut
  useEffect(() => {
    if (selectedKos) {
      getFasilitas(Number(selectedKos));
    } else {
      setFasilitasList([]);
    }
  }, [selectedKos]);

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-md">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  const selectedKosData = kosList.find((k) => k.id_kos === Number(selectedKos));

  return (
    <div className="space-y-6">
      {/* Header & Pilihan Kos */}
      <div className="bg-white p-8 rounded-2xl shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <HomeIcon className="h-8 w-8 text-indigo-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Kelola Fasilitas Kos</h2>
            <p className="text-sm text-gray-500 mt-1">
              Pilih kos untuk menambah dan mengelola fasilitas
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Dropdown Pilih Kos */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Pilih Kos <span className="text-red-500">*</span>
          </label>
          {kosList.length > 0 ? (
            <div className="relative">
              <select
                value={selectedKos}
                onChange={(e) => setSelectedKos(e.target.value ? Number(e.target.value) : '')}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              >
                <option value="">-- Pilih Kos untuk Melihat Fasilitas --</option>
                {kosList.map((kos) => (
                  <option key={kos.id_kos} value={kos.id_kos}>
                    {kos.nama_kos}
                  </option>
                ))}
              </select>
              {selectedKos && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ Belum ada kos terdaftar. Silakan tambah kos terlebih dahulu.
              </p>
              <button
                onClick={() => router.push('/owner/kos/tambah')}
                className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                → Tambah Kos Sekarang
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Daftar Fasilitas */}
      {selectedKos && (
        <div className="bg-white p-8 rounded-2xl shadow-md">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <SparklesIcon className="h-6 w-6 text-indigo-600" />
                Fasilitas: {selectedKosData?.nama_kos}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Kelola fasilitas yang tersedia di kos ini
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari fasilitas..."
                className="border border-gray-300 rounded-xl px-3 py-2 text-black text-sm"
              />
              <button
                onClick={() => selectedKos && getFasilitas(Number(selectedKos), search)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-lg text-sm"
              >
                Cari
              </button>
              <button
                onClick={() => router.push(`/owner/fasilitas/tambah?kos_id=${selectedKos}`)}
                className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <PlusIcon className="h-5 w-5" />
                Tambah Fasilitas
              </button>
            </div>
          </div>

          {loadingFacilities ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600 ml-3">Memuat fasilitas...</p>
            </div>
          ) : fasilitasList.length === 0 ? (
            <div className="text-center py-12">
              <SparklesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Belum ada fasilitas</p>
              <p className="text-gray-400 text-sm mt-2">
                Tambahkan fasilitas untuk kos ini
              </p>
              <button
                onClick={() => router.push(`/owner/fasilitas/tambah?kos_id=${selectedKos}`)}
                className="mt-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium"
              >
                <PlusIcon className="h-5 w-5" />
                Tambah Fasilitas Pertama
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {fasilitasList.map((fasilitas) => (
                <div
                  key={fasilitas.id_fasilitas}
                  className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-indigo-600 p-2 rounded-lg">
                        <SparklesIcon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                    {fasilitas.nama_fasilitas}
                  </h3>

                  <div className="flex justify-between items-center gap-2 mt-4 pt-4 border-t border-indigo-200">
                    <button
                      onClick={() => router.push(`/owner/fasilitas/edit/${fasilitas.id_fasilitas}?kos_id=${selectedKos}`)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      <PencilSquareIcon className="h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => deleteFasilitas(fasilitas.id_fasilitas)}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
