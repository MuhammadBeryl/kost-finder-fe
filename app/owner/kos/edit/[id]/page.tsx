"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getCookies } from '../../../../../lib/client-cookie';
import Input from '../../../../components/Ui/Input';
import Button from '../../../../components/Ui/Button';
import { 
  ArrowLeftIcon, 
  HomeIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  UsersIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

interface FormData {
  user_id: string;
  name: string;
  address: string;
  price_per_month: string;
  gender: 'male' | 'female' | 'all';
}

export default function EditKosPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  
  const [formData, setFormData] = useState<FormData>({
    user_id: '',
    name: '',
    address: '',
    price_per_month: '',
    gender: 'all',
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const getKosDetail = async () => {
    setLoading(true);
    try {
      const token = getCookies('token');
      if (!token) {
        alert('Token tidak ditemukan. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const res = await fetch(
        `https://learn.smktelkom-mlg.sch.id/kos/api/admin/show_kos/${id}`,
        {
          headers: {
            'MakerID': '1',
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
      const payload = (data && (data.data || data)) || {};
      
      setFormData({
        user_id: String(payload.user_id ?? payload.id_user ?? getCookies('user_id') ?? '1'),
        name: payload.nama_kos ?? payload.name ?? '',
        address: payload.lokasi_kos ?? payload.address ?? '',
        price_per_month: String(payload.harga_kos ?? payload.price_per_month ?? payload.price ?? ''),
        gender: payload.gender ?? payload.jenis_kelamin ?? 'all',
      });
    } catch (err) {
      console.error('Gagal memuat data kos:', err);
      alert('Gagal memuat data kos. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama kos wajib diisi';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Alamat wajib diisi';
    }
    
    if (!formData.price_per_month || Number(formData.price_per_month) <= 0) {
      newErrors.price_per_month = 'Harga harus lebih dari 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error saat user mulai mengetik
    if (errors[name as keyof FormData]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const token = getCookies('token');
      if (!token) {
        alert('Token tidak ditemukan. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const payload = {
        user_id: formData.user_id || getCookies('user_id') || '1',
        name: formData.name.trim(),
        address: formData.address.trim(),
        price_per_month: Number(formData.price_per_month),
        gender: formData.gender,
      };

      const url = `https://learn.smktelkom-mlg.sch.id/kos/api/admin/update_kos/${id}`;

      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'MakerID': '1',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401 || res.status === 403) {
        alert('Token tidak valid atau kedaluwarsa. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const data = await res.json().catch(() => null);
      
      if (res.ok) {
        const msg = data?.message || 'Kos berhasil diperbarui!';
        alert(msg);
        router.push('/owner/kos');
      } else {
        const errMsg = data?.message || data?.error || 'Gagal memperbarui kos';
        alert(errMsg);
      }
    } catch (err) {
      console.error('Error saat update kos:', err);
      alert('Terjadi kesalahan koneksi ke server. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (id) {
      getKosDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-3xl mx-auto">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Memuat data kos...</p>
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
            <HomeIcon className="h-7 w-7 text-indigo-600" />
            Edit Data Kos
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Perbarui informasi kos Anda dengan data yang akurat
          </p>
        </div>
        <button
          onClick={() => router.push('/owner/kos')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Kembali</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama Kos */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nama Kos <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HomeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              name="name"
              placeholder="Contoh: Kos Biru Sejahtera"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              className="pl-10"
              required
            />
          </div>
        </div>

        {/* Alamat */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Alamat / Lokasi <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              name="address"
              placeholder="Contoh: Jl. Veteran No. 123, Malang"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              className="pl-10"
              required
            />
          </div>
        </div>

        {/* Harga & Gender Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Harga */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Harga per Bulan <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                name="price_per_month"
                type="number"
                placeholder="1000000"
                value={formData.price_per_month}
                onChange={handleChange}
                error={errors.price_per_month}
                className="pl-10"
                min="0"
                required
              />
            </div>
            {formData.price_per_month && Number(formData.price_per_month) > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Rp {Number(formData.price_per_month).toLocaleString('id-ID')}
              </p>
            )}
          </div>

          {/* Gender */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipe Penghuni <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UsersIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full pl-10 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-white"
                required
              >
                <option value="male">Putra</option>
                <option value="female">Putri</option>
                <option value="all">Campur (Putra & Putri)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <DocumentTextIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Informasi</p>
            <p className="text-xs text-blue-700 mt-1">
              Pastikan semua data yang Anda masukkan sudah benar sebelum menyimpan perubahan. 
              Data yang akurat akan membantu pencari kos menemukan properti Anda.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/owner/kos')}
            className="flex-1"
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Menyimpan...
              </span>
            ) : (
              'Simpan Perubahan'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
