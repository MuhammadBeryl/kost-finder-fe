'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCookies } from '../../../../lib/client-cookie';
import {
  HomeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UsersIcon,
  SparklesIcon,
  PhotoIcon,
  StarIcon,
  ArrowLeftIcon,
  HeartIcon,
  CalendarIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';

interface KosDetail {
  id: number;
  name: string;
  price_per_month: number;
  address: string;
  gender: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
  kos_image?: Image[];
  kos_facilities?: Facility[];
}

interface Facility {
  id: number;
  kos_id: number;
  facility_name: string;
  created_at?: string;
  updated_at?: string;
}

interface Image {
  id: number;
  kos_id: number;
  file: string;
  created_at?: string;
  updated_at?: string;
}

export default function DetailKosPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [kos, setKos] = useState<KosDetail | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Booking modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchKosDetail = async () => {
    setLoading(true);
    setError('');

    try {
      const token = getCookies('token');
      if (!token) {
        alert('Token tidak ditemukan. Silakan login ulang.');
        router.push('/login');
        return;
      }

      // Fetch kos detail
      const resDetail = await fetch(
        `https://learn.smktelkom-mlg.sch.id/kos/api/society/detail_kos/${id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'MakerID': '1',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!resDetail.ok) {
        throw new Error(`HTTP ${resDetail.status}`);
      }

      const dataDetail = await resDetail.json();
      console.log('Detail API Response:', dataDetail);
      
      const kosData = dataDetail?.data || dataDetail;

      const normalized: KosDetail = {
        id: kosData.id ?? 0,
        name: kosData.name ?? 'Tanpa Nama',
        price_per_month: Number(kosData.price_per_month ?? 0),
        address: kosData.address ?? 'Tidak diketahui',
        gender: kosData.gender ?? '-',
        user_id: kosData.user_id,
        created_at: kosData.created_at,
        updated_at: kosData.updated_at,
        kos_image: kosData.kos_image ?? [],
        kos_facilities: kosData.kos_facilities ?? [],
      };

      console.log('Normalized kos:', normalized);
      setKos(normalized);
      
      // Set images and facilities from the main response if available
      if (normalized.kos_image && normalized.kos_image.length > 0) {
        setImages(normalized.kos_image);
      }
      if (normalized.kos_facilities && normalized.kos_facilities.length > 0) {
        setFacilities(normalized.kos_facilities);
      }
    } catch (err) {
      console.error('Gagal mengambil detail kos:', err);
      setError('Gagal mengambil detail kos. Periksa koneksi atau server API.');
    } finally {
      setLoading(false);
    }
  };

  // Handle booking submission
  const handleBooking = async () => {
    if (!startDate || !endDate) {
      alert('Mohon isi tanggal mulai dan selesai!');
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      alert('Tanggal selesai harus setelah tanggal mulai!');
      return;
    }

    setSubmitting(true);

    try {
      const token = getCookies('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const requestBody = {
        kos_id: kos?.id,
        start_date: startDate,
        end_date: endDate,
      };

      console.log('Booking request:', requestBody);

      const res = await fetch(
        'https://learn.smktelkom-mlg.sch.id/kos/api/society/booking',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            MakerID: '1',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const responseData = await res.json();
      console.log('Booking response:', responseData);

      if (!res.ok) {
        console.error('Error response:', responseData);
        if (responseData.message) {
          console.error('Error message:', JSON.stringify(responseData.message, null, 2));
        }
        if (responseData.errors) {
          console.error('Validation errors:', JSON.stringify(responseData.errors, null, 2));
        }
        
        let errorMsg = 'Gagal melakukan booking';
        if (typeof responseData.message === 'object') {
          errorMsg += ':\n' + JSON.stringify(responseData.message, null, 2);
        } else if (typeof responseData.message === 'string') {
          errorMsg += ': ' + responseData.message;
        }
        
        throw new Error(errorMsg);
      }

      alert('Booking berhasil! Menunggu konfirmasi dari pemilik kos.');
      setShowBookingModal(false);
      setStartDate('');
      setEndDate('');
      
      // Redirect to booking list
      router.push('/society/booking');
    } catch (err: any) {
      console.error('Gagal melakukan booking:', err);
      alert(`Gagal melakukan booking: ${err.message || 'Silakan coba lagi.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchKosDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat detail kos...</p>
        </div>
      </div>
    );
  }

  if (error || !kos) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error || 'Data kos tidak ditemukan'}</p>
          <button
            onClick={() => router.push('/society/search')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
          >
            Kembali ke Pencarian
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Kembali</span>
        </button>
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-red-400 transition"
        >
          {isFavorite ? (
            <>
              <HeartIcon className="h-5 w-5 text-red-500" />
              <span className="text-red-500">Favorit</span>
            </>
          ) : (
            <>
              <HeartOutlineIcon className="h-5 w-5 text-gray-600" />
              <span className="text-gray-600">Tambah ke Favorit</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-4">
            {images.slice(0, 3).map((img, idx) => (
              <div key={img.id} className={idx === 0 ? 'md:col-span-2 md:row-span-2' : ''}>
                <img
                  src={`https://learn.smktelkom-mlg.sch.id/kos/${img.file}`}
                  alt={`${kos.name} - ${idx + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                  style={{ minHeight: idx === 0 ? '400px' : '196px' }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Kos Information */}
        <div className="p-6 space-y-6">
          {/* Title and Price */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{kos.name}</h1>
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <MapPinIcon className="h-5 w-5" />
              <span>{kos.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="h-6 w-6" />
                  <span className="text-2xl font-bold">
                    Rp {kos.price_per_month.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-indigo-100 mt-1">per bulan</p>
              </div>
              {kos.gender && (
                <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-xl">
                  <UsersIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700 font-medium">
                    {kos.gender === 'male' ? 'Pria' : kos.gender === 'female' ? 'Wanita' : 'Campur'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description - Note: API doesn't return description field, removing this section */}
          {/* Uncomment below if description field is added to API response */}
          {/*
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <HomeIcon className="h-6 w-6 text-indigo-600" />
              Deskripsi
            </h2>
            <p className="text-gray-700 leading-relaxed">{kos.description}</p>
          </div>
          */}

          {/* Facilities */}
          {facilities.length > 0 && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <SparklesIcon className="h-6 w-6 text-indigo-600" />
                Fasilitas
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {facilities.map((facility) => (
                  <div
                    key={facility.id}
                    className="flex items-center gap-2 bg-gradient-to-br from-indigo-50 to-purple-50 px-4 py-3 rounded-lg border border-indigo-100"
                  >
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">{facility.facility_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Images Gallery */}
          {images.length > 3 && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PhotoIcon className="h-6 w-6 text-indigo-600" />
                Galeri Foto
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {images.slice(3).map((img) => (
                  <img
                    key={img.id}
                    src={`https://learn.smktelkom-mlg.sch.id/kos/${img.file}`}
                    alt={kos.name}
                    className="w-full h-32 object-cover rounded-lg hover:opacity-80 transition cursor-pointer"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t pt-6">
            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={() => setShowBookingModal(true)}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold text-lg transition shadow-lg hover:shadow-xl"
              >
                Booking Sekarang
              </button>
              <button
                onClick={() => router.push(`/society/review?kos_id=${kos.id}`)}
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-4 rounded-xl font-semibold border-2 border-gray-300 transition"
              >
                <StarIcon className="h-5 w-5 text-yellow-500" />
                Lihat Review
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CalendarIcon className="h-6 w-6" />
                Booking Kos
              </h2>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Kos Info */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-3 mb-2">
                  <HomeIcon className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">{kos?.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">{kos?.address}</p>
                <div className="text-lg font-bold text-indigo-600">
                  Rp {kos?.price_per_month.toLocaleString()} / bulan
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Catatan:</strong> Booking Anda akan menunggu konfirmasi dari pemilik kos. 
                  Anda akan menerima notifikasi setelah booking dikonfirmasi.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setStartDate('');
                    setEndDate('');
                  }}
                  disabled={submitting}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleBooking}
                  disabled={submitting || !startDate || !endDate}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg"
                >
                  {submitting ? 'Memproses...' : 'Konfirmasi Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
