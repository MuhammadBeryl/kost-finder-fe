'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookies } from '../../../lib/client-cookie';
import {
  CalendarIcon,
  ClockIcon,
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as PendingIcon,
  FunnelIcon,
  PrinterIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/solid';

interface Booking {
  id: number;
  id_booking?: number;
  kos_id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  name?: string;
  address?: string;
  price_per_month?: string;
  gender?: string;
  kos?: {
    id: number;
    name: string;
    address: string;
    price_per_month: string;
    gender: string;
  };
}

export default function MyBookingPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all'); // 'all', 'pending', 'accept', 'reject'
  const [printing, setPrinting] = useState<number | null>(null);

  // Fetch user's bookings
  const fetchBookings = async (status?: string) => {
    setLoading(true);
    setError('');

    try {
      const token = getCookies('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Build URL with query parameter if status is specified
      let url = 'https://learn.smktelkom-mlg.sch.id/kos/api/society/show_bookings';
      if (status && status !== 'all') {
        url += `?status=${status}`;
      }

      console.log('Fetching bookings from:', url);

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          MakerID: '1',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      console.log('Bookings response:', data);

      const bookingsData = data?.data || [];
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (err) {
      console.error('Gagal mengambil booking:', err);
      setError('Gagal mengambil data booking.');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    fetchBookings(status);
  };

  // Print nota booking
  const handlePrintNota = async (booking: Booking) => {
    const bookingId = booking.id_booking || booking.id;
    setPrinting(bookingId);

    try {
      const token = getCookies('token');
      if (!token) {
        router.push('/login');
        return;
      }

      console.log(`Printing nota for booking ID: ${bookingId}`);

      const res = await fetch(
        `https://learn.smktelkom-mlg.sch.id/kos/api/society/cetak_nota/${bookingId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            MakerID: '1',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log('Nota response:', data);

      // Open nota in new window for printing
      const notaWindow = window.open('', '_blank');
      if (notaWindow) {
        notaWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Nota Booking #${bookingId}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
              }
              .header h1 {
                margin: 0;
                color: #4F46E5;
              }
              .header p {
                margin: 5px 0;
                color: #666;
              }
              .section {
                margin: 20px 0;
              }
              .section h2 {
                color: #333;
                border-bottom: 1px solid #ddd;
                padding-bottom: 10px;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px dashed #eee;
              }
              .info-label {
                font-weight: bold;
                color: #666;
              }
              .info-value {
                color: #333;
              }
              .status {
                display: inline-block;
                padding: 5px 15px;
                border-radius: 20px;
                font-weight: bold;
                font-size: 14px;
              }
              .status.pending {
                background-color: #FEF3C7;
                color: #92400E;
              }
              .status.accept {
                background-color: #D1FAE5;
                color: #065F46;
              }
              .status.reject {
                background-color: #FEE2E2;
                color: #991B1B;
              }
              .total {
                margin-top: 30px;
                padding: 20px;
                background-color: #F3F4F6;
                border-radius: 8px;
                text-align: right;
              }
              .total h3 {
                margin: 0;
                font-size: 24px;
                color: #4F46E5;
              }
              .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 2px solid #333;
                text-align: center;
                color: #666;
                font-size: 12px;
              }
              @media print {
                body {
                  padding: 20px;
                }
                .no-print {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🏠 NOTA BOOKING KOS</h1>
              <p>Nomor Booking: #${bookingId}</p>
              <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>

            <div class="section">
              <h2>📋 Informasi Kos</h2>
              <div class="info-row">
                <span class="info-label">Nama Kos</span>
                <span class="info-value">${booking.name || booking.kos?.name || '-'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Alamat</span>
                <span class="info-value">${booking.address || booking.kos?.address || '-'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tipe</span>
                <span class="info-value">${booking.gender || booking.kos?.gender === 'male' ? 'Pria' : booking.gender || booking.kos?.gender === 'female' ? 'Wanita' : 'Campur'}</span>
              </div>
            </div>

            <div class="section">
              <h2>📅 Detail Booking</h2>
              <div class="info-row">
                <span class="info-label">Tanggal Mulai</span>
                <span class="info-value">${new Date(booking.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tanggal Selesai</span>
                <span class="info-value">${new Date(booking.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Durasi</span>
                <span class="info-value">${Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24))} hari</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status</span>
                <span class="info-value">
                  <span class="status ${booking.status.toLowerCase()}">
                    ${booking.status.toLowerCase() === 'accept' ? 'Diterima' : booking.status.toLowerCase() === 'reject' ? 'Ditolak' : 'Pending'}
                  </span>
                </span>
              </div>
            </div>

            <div class="total">
              <p style="margin: 0 0 10px 0; color: #666;">Harga per Bulan</p>
              <h3>Rp ${parseInt(booking.price_per_month || booking.kos?.price_per_month || '0').toLocaleString('id-ID')}</h3>
            </div>

            <div class="footer">
              <p>Terima kasih telah melakukan booking!</p>
              <p>Untuk informasi lebih lanjut, silakan hubungi pemilik kos.</p>
              <p style="margin-top: 10px;">Dokumen ini dicetak secara otomatis oleh sistem.</p>
            </div>

            <div class="no-print" style="text-align: center; margin-top: 30px;">
              <button onclick="window.print()" style="background-color: #4F46E5; color: white; padding: 12px 30px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-right: 10px;">
                🖨️ Cetak Nota
              </button>
              <button onclick="window.close()" style="background-color: #6B7280; color: white; padding: 12px 30px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
                ❌ Tutup
              </button>
            </div>
          </body>
          </html>
        `);
        notaWindow.document.close();
      } else {
        alert('Gagal membuka window baru. Mohon izinkan popup untuk mencetak nota.');
      }
    } catch (err: any) {
      console.error('Gagal mencetak nota:', err);
      alert(`Gagal mencetak nota: ${err.message || 'Silakan coba lagi.'}`);
    } finally {
      setPrinting(null);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'accept' || statusLower === 'approved' || statusLower === 'confirmed') {
      return (
        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
          <CheckCircleIcon className="h-4 w-4" />
          <span>Diterima</span>
        </div>
      );
    } else if (statusLower === 'reject' || statusLower === 'rejected' || statusLower === 'cancelled') {
      return (
        <div className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
          <XCircleIcon className="h-4 w-4" />
          <span>Ditolak</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
          <ClockIcon className="h-4 w-4" />
          <span>Pending</span>
        </div>
      );
    }
  };

  useEffect(() => {
    fetchBookings(filterStatus === 'all' ? undefined : filterStatus);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-7 w-7" />
          Booking Saya
        </h1>
        <p className="text-indigo-100 text-sm mt-1">
          Kelola semua booking kos Anda di sini
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <div className="flex items-center gap-2 mb-3">
          <FunnelIcon className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700">Filter Status:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'all'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => handleFilterChange('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 ${
              filterStatus === 'pending'
                ? 'bg-yellow-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ClockIcon className="h-4 w-4" />
            Pending
          </button>
          <button
            onClick={() => handleFilterChange('accept')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 ${
              filterStatus === 'accept'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CheckCircleIcon className="h-4 w-4" />
            Diterima
          </button>
          <button
            onClick={() => handleFilterChange('reject')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 ${
              filterStatus === 'reject'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <XCircleIcon className="h-4 w-4" />
            Ditolak
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-md text-center">
          <CalendarIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Belum Ada Booking
          </h3>
          <p className="text-gray-500 mb-6">
            Anda belum melakukan booking kos. Mulai cari kos favorit Anda!
          </p>
          <button
            onClick={() => router.push('/society/search')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg"
          >
            Cari Kos Sekarang
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Nama Kos
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tanggal Mulai
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tanggal Selesai
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Harga/Bulan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <HomeIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {booking.kos?.name || `Kos #${booking.kos_id}`}
                          </div>
                          {booking.kos?.address && (
                            <div className="text-xs text-gray-500">
                              {booking.kos.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(booking.start_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(booking.end_date)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {booking.kos?.price_per_month
                        ? `Rp ${parseInt(booking.kos.price_per_month).toLocaleString()}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {booking.status.toLowerCase() === 'accept' ? (
                        <button
                          onClick={() => handlePrintNota(booking)}
                          disabled={printing === (booking.id_booking || booking.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                        >
                          <PrinterIcon className="h-4 w-4" />
                          Cetak Nota
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400 italic">
                          Nota tersedia setelah diterima
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <HomeIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {booking.kos?.name || `Kos #${booking.kos_id}`}
                    </div>
                    {booking.kos?.address && (
                      <div className="text-xs text-gray-500 mt-1">
                        {booking.kos.address}
                      </div>
                    )}
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs mb-1">Tanggal Mulai</div>
                    <div className="text-gray-900">{formatDate(booking.start_date)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">Tanggal Selesai</div>
                    <div className="text-gray-900">{formatDate(booking.end_date)}</div>
                  </div>
                </div>

                {booking.kos?.price_per_month && (
                  <div className="text-sm">
                    <div className="text-gray-500 text-xs mb-1">Harga/Bulan</div>
                    <div className="font-semibold text-gray-900">
                      Rp {parseInt(booking.kos.price_per_month).toLocaleString()}
                    </div>
                  </div>
                )}

                {/* Print Button */}
                {booking.status.toLowerCase() === 'accept' && (
                  <button
                    onClick={() => handlePrintNota(booking)}
                    disabled={printing === (booking.id_booking || booking.id)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 mt-2"
                  >
                    <PrinterIcon className="h-5 w-5" />
                    Cetak Nota
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

