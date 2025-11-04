'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/solid';

interface GambarKos {
  id_image: number;
  id_kos: number;
  image_url: string;
}

export default function ImageKosPage() {
  const router = useRouter();
  const [images, setImages] = useState<GambarKos[]>([]);
  const [loading, setLoading] = useState(true);

  const getImages = async () => {
    try {
      const res = await fetch('http://localhost:8000/imagekos');
      const data = await res.json();
      setImages(data.data || []);
    } catch (err) {
      console.error('Gagal memuat gambar kos:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (id: number) => {
    if (!confirm('Yakin ingin menghapus gambar ini?')) return;

    try {
      const res = await fetch(`http://localhost:8000/imagekos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert('Gambar berhasil dihapus!');
        getImages();
      } else {
        alert('Gagal menghapus gambar.');
      }
    } catch {
      alert('Terjadi kesalahan saat menghapus gambar.');
    }
  };

  useEffect(() => {
    getImages();
  }, []);

  if (loading)
    return <p className="text-gray-500 text-center">Memuat gambar kos...</p>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-gray-800">Galeri Gambar Kos</h2>
        <button
          onClick={() => router.push('/owner/imagekos/upload')}
          className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg"
        >
          <PlusIcon className="h-5 w-5" /> Upload
        </button>
      </div>

      {images.length === 0 ? (
        <p className="text-gray-500 text-sm">Belum ada gambar kos diunggah.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {images.map((img) => (
            <div
              key={img.id_image}
              className="relative bg-gray-100 rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all"
            >
              <img
                src={`http://localhost:8000/uploads/${img.image_url}`}
                alt="Gambar Kos"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => deleteImage(img.id_image)}
                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
