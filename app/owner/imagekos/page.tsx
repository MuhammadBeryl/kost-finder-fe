'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrashIcon, PlusIcon, PhotoIcon, HomeIcon, CheckCircleIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import { getCookies } from '../../../lib/client-cookie';

interface Kos {
  id_kos: number;
  nama_kos: string;
}

interface GambarKos {
  id_image: number;
  image_id?: number;
  id_kos: number;
  kos_id?: number;
  image_url: string;
  url?: string;
}

export default function ImageKosPage() {
  const router = useRouter();
  const [kosList, setKosList] = useState<Kos[]>([]);
  const [images, setImages] = useState<GambarKos[]>([]);
  const [selectedKos, setSelectedKos] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState('');
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

  // ✅ GET gambar berdasarkan kos yang dipilih
  const getImages = async (kosId: number) => {
    setLoadingImages(true);
    setError('');
    try {
      const token = getCookies('token');
      if (!token) {
        alert('Token tidak ditemukan. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const res = await fetch(
        `https://learn.smktelkom-mlg.sch.id/kos/api/admin/show_image/${kosId}`,
        {
          headers: {
            'MakerID': String(makerID),
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401 || res.status === 403) {
        alert('Token tidak valid atau kedaluwarsa. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const data = await res.json().catch(() => null);
      console.log('Response data:', data); // Debug
      
      const rawItems = (data && (data.images || data.data || data)) || [];
      console.log('Raw items:', rawItems); // Debug

      const normalized: GambarKos[] = Array.isArray(rawItems)
        ? rawItems
            .map((it: any) => {
              console.log('Processing item:', it); // Debug detail setiap item
              const imageUrl = it.file ?? it.image_url ?? it.url ?? it.image ?? it.path ?? it.file_name ?? it.filename ?? '';
              console.log('Extracted image URL:', imageUrl); // Debug
              
              // Validasi imageUrl tidak kosong
              if (!imageUrl || imageUrl.trim() === '') {
                console.warn('Empty image URL for item:', it);
                return null; // Skip item dengan URL kosong
              }
              
              return {
                id_image: it.id ?? it.id_image ?? it.image_id ?? 0,
                id_kos: it.kos_id ?? it.id_kos ?? kosId,
                image_url: imageUrl.startsWith('http') 
                  ? imageUrl 
                  : `https://learn.smktelkom-mlg.sch.id/kos/${imageUrl}`,
              };
            })
            .filter((item): item is GambarKos => item !== null) // Type guard untuk remove null
        : [];

      console.log('Normalized images:', normalized); // Debug
      setImages(normalized);
    } catch (err) {
      console.error('Gagal memuat gambar kos:', err);
      setError('Gagal memuat gambar kos.');
    } finally {
      setLoadingImages(false);
    }
  };

  // ✅ DELETE gambar
  const deleteImage = async (id: number) => {
    if (!confirm('Yakin ingin menghapus gambar ini?')) return;

    try {
      const token = getCookies('token');
      if (!token) {
        alert('Token tidak ditemukan. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const res = await fetch(
        `https://learn.smktelkom-mlg.sch.id/kos/api/admin/delete_image/${id}`,
        {
          method: 'DELETE',
          headers: {
            'MakerID': String(makerID),
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const text = await res.text();
      console.log('Delete response:', res.status, text);

      if (res.ok) {
        alert('Gambar berhasil dihapus!');
        if (selectedKos) {
          getImages(Number(selectedKos));
        }
      } else if (res.status === 404) {
        alert('Endpoint tidak ditemukan. Pastikan URL benar: /kos/api/admin/delete_image/{id}');
      } else {
        alert(`Gagal menghapus gambar: ${text || res.statusText}`);
      }
    } catch (err) {
      console.error('Terjadi kesalahan saat menghapus gambar:', err);
      alert('Terjadi kesalahan saat menghapus gambar.');
    }
  };

  useEffect(() => {
    getKos();
  }, []);

  // Ketika kos dipilih, ambil gambar kos tersebut
  useEffect(() => {
    if (selectedKos) {
      getImages(Number(selectedKos));
    } else {
      setImages([]);
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
          <PhotoIcon className="h-8 w-8 text-indigo-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Galeri Gambar Kos</h2>
            <p className="text-sm text-gray-500 mt-1">
              Pilih kos untuk mengelola gambar
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
                <option value="">-- Pilih Kos untuk Melihat Gambar --</option>
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

      {/* Galeri Gambar */}
      {selectedKos && (
        <div className="bg-white p-8 rounded-2xl shadow-md">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <PhotoIcon className="h-6 w-6 text-indigo-600" />
                Gambar: {selectedKosData?.nama_kos}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Kelola gambar yang ditampilkan untuk kos ini
              </p>
            </div>

            <button
              onClick={() => router.push(`/owner/imagekos/upload?kos_id=${selectedKos}`)}
              className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <PlusIcon className="h-5 w-5" />
              Upload Gambar
            </button>
          </div>

          {loadingImages ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600 ml-3">Memuat gambar...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <PhotoIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Belum ada gambar</p>
              <p className="text-gray-400 text-sm mt-2">
                Upload gambar pertama untuk kos ini
              </p>
              <button
                onClick={() => router.push(`/owner/imagekos/upload?kos_id=${selectedKos}`)}
                className="mt-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium"
              >
                <PlusIcon className="h-5 w-5" />
                Upload Gambar Pertama
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {images.map((img) => (
                <div
                  key={img.id_image}
                  className="relative bg-gray-100 rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative w-full h-48 bg-gray-200">
                    <img
                      src={img.image_url}
                      alt={`Gambar Kos ${img.id_image}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onLoad={(e) => {
                        console.log('Image loaded successfully:', img.image_url);
                        e.currentTarget.classList.remove('opacity-0');
                      }}
                      onError={(e) => {
                        console.error('Failed to load image:', img.image_url);
                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Error';
                        e.currentTarget.alt = 'Gagal memuat gambar';
                      }}
                    />
                    {/* Loading indicator */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <div className="animate-pulse text-gray-400 text-xs">Loading...</div>
                    </div>
                  </div>
                  
                  {/* Debug URL - hapus setelah fix */}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded max-w-full truncate opacity-0 group-hover:opacity-100 z-10">
                    ID: {img.id_image}
                  </div>
                  
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"></div>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 z-10">
                    <button
                      onClick={() => router.push(`/owner/imagekos/edit/${img.id_image}?kos_id=${selectedKos}`)}
                      className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition shadow-lg"
                      title="Edit Gambar"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteImage(img.id_image)}
                      className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition shadow-lg"
                      title="Hapus Gambar"
                    >
                      <TrashIcon className="h-4 w-4" />
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
