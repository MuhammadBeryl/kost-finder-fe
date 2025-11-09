"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getCookies } from '../../../../lib/client-cookie';

export default function EditKosPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [formData, setFormData] = useState({
    nama_kos: '',
    harga_kos: '',
    lokasi_kos: '',
    deskripsi_kos: '',
  });

  const getKosDetail = async () => {
    // Try remote API first, then fallback to localhost
    const remoteUrl = `https://learn.smktelkom-mlg.sch.id/kos/api/show_kos/${id}`;
    const localUrl = `http://localhost:3000/kos/${id}`;
    try {
      let res = await fetch(remoteUrl, { headers: { MakerID: '1' } });
      if (!res.ok) {
        // fallback
        res = await fetch(localUrl);
      }
      const data = await res.json().catch(() => null);
      // support different shapes: { data: {...} } or direct object
      const payload = (data && (data.data || data)) || {};
      setFormData({
        nama_kos: payload.nama_kos ?? payload.name ?? '',
        harga_kos: String(payload.harga_kos ?? payload.price ?? ''),
        lokasi_kos: payload.lokasi_kos ?? payload.location ?? '',
        deskripsi_kos: payload.deskripsi_kos ?? payload.description ?? '',
      });
    } catch (err) {
      console.warn('Gagal memuat data kos:', err);
      alert('Gagal memuat data kos.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure token is present
    const token = getCookies('token');
    if (!token) {
      alert('Token tidak ditemukan. Silakan login ulang.');
      router.push('/login');
      return;
    }

    const url = `https://learn.smktelkom-mlg.sch.id/kos/api/update_kos/${id}`;

    try {
      // Many PHP/CodeIgniter style APIs expect multipart/form-data for file/text updates.
      const form = new FormData();
      form.append('id_kos', String(id));
      form.append('nama_kos', formData.nama_kos || '');
      form.append('harga_kos', formData.harga_kos || '0');
      form.append('lokasi_kos', formData.lokasi_kos || '');
      form.append('deskripsi_kos', formData.deskripsi_kos || '');

      // Try POST multipart/form-data first
      let res = await fetch(url, {
        method: 'POST',
        headers: {
          MakerID: '1',
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      let rawText = await res.text().catch(() => null);
      let data: any = null;
      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch (e) {
          data = null;
        }
      }

      // If POST fails, try PUT with JSON as a fallback
      if (!res.ok) {
        console.debug('POST multipart failed, trying PUT JSON', { status: res.status, rawText, data });
        const putRes = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            MakerID: '1',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...formData, id_kos: id }),
        });

        rawText = await putRes.text().catch(() => null);
        try {
          data = rawText ? JSON.parse(rawText) : null;
        } catch (e) {
          data = null;
        }
        res = putRes;
      }

      console.debug('Update response', { status: res.status, rawText, data });

      const msg = data?.message || rawText || `Status ${res.status}`;
      if (res.ok || data?.success || (msg && String(msg).toLowerCase().includes('berhasil'))) {
        alert('Kos berhasil diperbarui!');
        router.push('/owner/kos');
      } else {
        console.warn('Gagal memperbarui kos:', msg);
        alert(`Gagal memperbarui kos: ${msg}`);
      }
    } catch (err) {
      console.error('Error saat update kos:', err);
      alert('Terjadi kesalahan koneksi ke server.');
    }
  };

  useEffect(() => {
    getKosDetail();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Data Kos</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="nama_kos"
          placeholder="Nama Kos"
          value={formData.nama_kos}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm"
        />
        <input
          name="harga_kos"
          type="number"
          placeholder="Harga Kos"
          value={formData.harga_kos}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm"
        />
        <input
          name="lokasi_kos"
          placeholder="Lokasi Kos"
          value={formData.lokasi_kos}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm"
        />
        <textarea
          name="deskripsi_kos"
          placeholder="Deskripsi Kos"
          value={formData.deskripsi_kos}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm resize-none"
        />

        <button
          type="submit"
          className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-2 rounded-xl font-semibold transition-all"
        >
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
