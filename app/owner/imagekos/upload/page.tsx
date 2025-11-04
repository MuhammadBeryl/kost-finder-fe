'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadImageKosPage() {
  const router = useRouter();
  const [idKos, setIdKos] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Pilih gambar terlebih dahulu!');
    setLoading(true);

    const formData = new FormData();
    formData.append('id_kos', idKos);
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:8000/imagekos/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('Gambar berhasil diupload!');
        router.push('/owner/imagekos');
      } else {
        alert('Gagal mengupload gambar.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Gambar Kos</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ID Kos */}
        <input
          type="number"
          name="id_kos"
          placeholder="Masukkan ID Kos"
          value={idKos}
          onChange={(e) => setIdKos(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm"
        />

        {/* File input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm bg-gray-50"
          required
        />

        {preview && (
          <div className="mt-3">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-xl shadow"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-2 rounded-xl font-semibold transition-all"
        >
          {loading ? 'Mengupload...' : 'Upload Gambar'}
        </button>
      </form>
    </div>
  );
}
