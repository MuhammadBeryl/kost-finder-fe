'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getCookies } from '../../../../../lib/client-cookie';
import Input from '../../../../components/Ui/Input';
import Button from '../../../../components/Ui/Button';
import { 
  ArrowLeftIcon, 
  SparklesIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function EditFasilitasPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id;
  const kosIdFromQuery = searchParams.get('kos_id');
  
  const [formData, setFormData] = useState({
    facility_name: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ facility_name?: string }>({});

  const getFasilitasDetail = async () => {
    setLoading(true);
    try {
      const token = getCookies('token');
      if (!token) {
        alert('Token tidak ditemukan. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const res = await fetch(
        `https://learn.smktelkom-mlg.sch.id/kos/api/admin/detail_facility/${id}`,
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
        facility_name: payload.nama_fasilitas ?? payload.facility_name ?? payload.name ?? '',
      });
    } catch (err) {
      console.error('Gagal memuat data fasilitas:', err);
      alert('Gagal memuat data fasilitas. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { facility_name?: string } = {};
    
    if (!formData.facility_name.trim()) {
      newErrors.facility_name = 'Nama fasilitas wajib diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error saat user mengetik
    if (errors[name as keyof typeof errors]) {
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

      const url = `https://learn.smktelkom-mlg.sch.id/kos/api/admin/update_facility/${id}`;

      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'MakerID': '1',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          facility_name: formData.facility_name.trim(),
        }),
      });

      if (res.status === 401 || res.status === 403) {
        alert('Token tidak valid atau kedaluwarsa. Silakan login ulang.');
        router.push('/login');
        return;
      }

      const data = await res.json().catch(() => null);
      
      if (res.ok) {
        const msg = data?.message || 'Fasilitas berhasil diperbarui!';
        alert(msg);
        router.push('/owner/fasilitas');
      } else {
        const errMsg = data?.message || data?.error || 'Gagal memperbarui fasilitas';
        alert(errMsg);
      }
    } catch (err) {
      console.error('Error saat update fasilitas:', err);
      alert('Terjadi kesalahan koneksi ke server. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (id) {
      getFasilitasDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-3xl mx-auto">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Memuat data fasilitas...</p>
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
            <SparklesIcon className="h-7 w-7 text-indigo-600" />
            Edit Fasilitas
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Perbarui informasi fasilitas kos Anda
          </p>
        </div>
        <button
          onClick={() => router.push('/owner/fasilitas')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Kembali</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama Fasilitas */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nama Fasilitas <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SparklesIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              name="facility_name"
              placeholder="Contoh: AC, WiFi, Parkir Motor, Kamar Mandi Dalam"
              value={formData.facility_name}
              onChange={handleChange}
              error={errors.facility_name}
              className="pl-10"
              required
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Informasi</p>
            <p className="text-xs text-blue-700 mt-1">
              Pastikan nama fasilitas jelas dan mudah dipahami oleh calon penyewa kos.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/owner/fasilitas')}
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
