'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';
import { getCookies } from '../../../lib/client-cookie';

interface Fasilitas {
  id_fasilitas: number;
  nama_fasilitas: string;
  deskripsi: string;
}

interface Kos {
  id_kos: number;
  nama_kos: string;
}

export default function FasilitasPage() {
  const router = useRouter();
  const [fasilitasList, setFasilitasList] = useState<Fasilitas[]>([]);
  const [kosList, setKosList] = useState<Kos[]>([]);
  const [selectedKos, setSelectedKos] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const makerID = 1;

  // ✅ GET data KOS (untuk tampilan daftar kos)
  const getKos = async () => {
    try {
      const token = getCookies('token');
      const res = await fetch(`https://learn.smktelkom-mlg.sch.id/kos/api/admin/show_kos`, {
        headers: {
          'Content-Type': 'application/json',
          'MakerID': String(makerID),
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const raw = data.data || data || [];
      const mapped = Array.isArray(raw)
        ? raw.map((it: any) => ({
            id_kos: it.id_kos ?? it.id ?? 0,
            nama_kos: it.nama_kos ?? it.nama ?? '',
          }))
        : [];
      setKosList(mapped);
    } catch (err) {
      console.error('Gagal mengambil data kos:', err);
    }
  };

  // ✅ GET data fasilitas
  const getFasilitas = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getCookies('token');
      if (!token) {
        alert('Token tidak ditemukan. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const url = `https://learn.smktelkom-mlg.sch.id/kos/api/admin/show_facilities/${makerID}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'MakerID': String(makerID),
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);
      const rawItems = (data && (data.facilities || data.data || data)) || [];

      const normalized = Array.isArray(rawItems)
        ? rawItems.map((it: any) => ({
            id_fasilitas: it.id_fasilitas ?? it.id ?? 0,
            nama_fasilitas: it.nama_fasilitas ?? it.nama ?? '',
            deskripsi: it.deskripsi ?? it.keterangan ?? '',
          }))
        : [];

      setFasilitasList(normalized);
    } catch (err) {
      console.error('Gagal mengambil data fasilitas:', err);
      setError('Gagal mengambil data fasilitas. Cek koneksi atau token.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE fasilitas
  const deleteFasilitas = async (id: number) => {
    if (!confirm('Yakin ingin menghapus fasilitas ini?')) return;

    try {
      const token = getCookies('token');
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
    getFasilitas();
  }, []);

  if (loading) return <p className="text-gray-500">Memuat data...</p>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md space-y-6">
      {/* === Bagian KOS === */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Pilih Kos</h2>
        {kosList.length > 0 ? (
          <select
            value={selectedKos}
            onChange={(e) => setSelectedKos(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full text-gray-700"
          >
            <option value="">-- Pilih Kos --</option>
            {kosList.map((kos) => (
              <option key={kos.id_kos} value={kos.id_kos}>
                {kos.nama_kos}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-gray-500 text-sm">Belum ada kos terdaftar.</p>
        )}
      </div>

      {/* === Bagian FASILITAS === */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-800">Daftar Fasilitas Kos</h2>
          <button
            onClick={() => router.push('/owner/fasilitas/tambah')}
            className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg"
          >
            <PlusIcon className="h-5 w-5" /> Tambah
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

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
    </div>
  );
}
