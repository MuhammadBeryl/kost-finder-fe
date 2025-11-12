'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getCookies } from '../../../../../lib/client-cookie';
import Button from '../../../../components/Ui/Button';
import { 
  ArrowLeftIcon, 
  PhotoIcon,
  InformationCircleIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

export default function EditImageKosPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id;
  const kosIdFromQuery = searchParams.get('kos_id');
  
  const [currentImage, setCurrentImage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Ambil detail gambar yang akan diupdate
  useEffect(() => {
    const fetchImageDetail = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const token = getCookies('token');
        if (!token) {
          alert('Token tidak ditemukan. Silakan login ulang.');
          router.push('/login');
          return;
        }

        const res = await fetch(
          `https://learn.smktelkom-mlg.sch.id/kos/api/admin/detail_image/${id}`,
          {
            headers: {
              'MakerID': '1',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          const imageData = data.data || data;
          const imageFile = imageData.file ?? imageData.image_url ?? imageData.url ?? '';
          
          if (imageFile) {
            const fullUrl = imageFile.startsWith('http') 
              ? imageFile 
              : `https://learn.smktelkom-mlg.sch.id/kos/${imageFile}`;
            setCurrentImage(fullUrl);
          }
        }
      } catch (err) {
        console.error('Gagal memuat detail gambar:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImageDetail();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validasi ukuran file (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('Ukuran file terlalu besar! Maksimal 5MB');
        return;
      }

      // Validasi tipe file
      if (!selectedFile.type.startsWith('image/')) {
        alert('File harus berupa gambar!');
        return;
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      alert('Pilih gambar baru terlebih dahulu!');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = getCookies('token');
      if (!token) {
        alert('Token tidak ditemukan. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const url = `https://learn.smktelkom-mlg.sch.id/kos/api/admin/update_image/${id}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'MakerID': '1',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.status === 401 || res.status === 403) {
        alert('Token tidak valid atau kedaluwarsa. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const data = await res.json().catch(() => null);

      if (res.ok) {
        const msg = data?.message || 'Gambar berhasil diperbarui!';
        alert(msg);
        router.push('/owner/imagekos');
      } else {
        const errMsg = data?.message || data?.error || 'Gagal memperbarui gambar.';
        alert(errMsg);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Terjadi kesalahan koneksi ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-3xl mx-auto">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <PhotoIcon className="h-7 w-7 text-indigo-600" />
            Update Gambar Kos
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Ganti gambar dengan yang baru
          </p>
        </div>
        <button
          onClick={() => router.push('/owner/imagekos')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Kembali</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Gambar Saat Ini */}
        {currentImage && (
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Gambar Saat Ini
            </label>
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <img
                src={currentImage}
                alt="Current"
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                }}
              />
              <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                Gambar Lama
              </div>
            </div>
          </div>
        )}

        {/* File Upload */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pilih Gambar Baru <span className="text-red-500">*</span>
          </label>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-indigo-400 transition-colors">
            <div className="text-center">
              <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Klik untuk upload gambar baru
                </span>
                <span className="text-gray-500"> atau drag & drop</span>
              </label>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG (max. 5MB)</p>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                required
              />
            </div>
          </div>
        </div>

        {/* Preview Gambar Baru */}
        {preview && (
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Preview Gambar Baru
            </label>
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                Gambar Baru
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview('');
                }}
                className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition"
              >
                Hapus
              </button>
            </div>
            {file && (
              <p className="text-xs text-gray-500 mt-2">
                File: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Informasi</p>
            <p className="text-xs text-blue-700 mt-1">
              Gambar lama akan diganti dengan gambar baru yang Anda pilih. Pastikan gambar berkualitas baik dan relevan dengan kos.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/owner/imagekos')}
            className="flex-1"
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={submitting || !file}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Memperbarui...
              </span>
            ) : (
              'Update Gambar'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
