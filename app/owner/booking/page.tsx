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
  UserCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/solid';

interface Booking {
  id: number;
  id_booking?: number; // Field yang benar dari API!
  booking_id?: number; // Backup field name
  kos_id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  name?: string; // Kos name from joined data
  address?: string; // Kos address from joined data
  price_per_month?: string; // Kos price from joined data
  gender?: string; // Kos gender from joined data
  kos?: {
    id: number;
    name: string;
    address: string;
    price_per_month: string;
    gender: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function OwnerBookingPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [updating, setUpdating] = useState<number | null>(null);

  // Fetch bookings
  const fetchBookings = async (status?: string, date?: string) => {
    setLoading(true);
    setError('');

    try {
      const token = getCookies('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Build URL with query parameters
      let url = 'https://learn.smktelkom-mlg.sch.id/kos/api/admin/show_bookings?';
      const params = [];
      
      if (status && status !== 'all') {
        params.push(`status=${status}`);
      }
      
      if (date) {
        params.push(`tgl=${date}`);
      }
      
      url += params.join('&');

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
      
      // Log COMPLETE first booking to see ALL fields
      if (bookingsData.length > 0) {
        console.log('COMPLETE first booking:', JSON.stringify(bookingsData[0], null, 2));
        console.log('Booking ID field:', bookingsData[0].id_booking);
      }
      
      // Remove duplicates using id_booking (the correct booking ID field!)
      const uniqueBookings = Array.isArray(bookingsData) 
        ? bookingsData.filter((booking: any, index: number, self: any[]) => {
            const uniqueId = booking.id_booking || booking.booking_id || booking.id;
            return index === self.findIndex((b: any) => 
              (b.id_booking || b.booking_id || b.id) === uniqueId
            );
          })
        : [];
      
      console.log('Unique bookings:', uniqueBookings.length, 'out of', bookingsData.length);
      console.log('Booking IDs:', uniqueBookings.map((b: any) => ({ 
        id_booking: b.id_booking,
        kos_id: b.kos_id,
        id: b.id
      })));
      
      setBookings(uniqueBookings);
    } catch (err) {
      console.error('Gagal mengambil booking:', err);
      setError('Gagal mengambil data booking.');
    } finally {
      setLoading(false);
    }
  };

  // Update booking status
  const updateBookingStatus = async (booking: Booking, newStatus: string) => {
    // Use id_booking (the correct field from API!)
    const bookingId = booking.id_booking || booking.booking_id || booking.id;
    
    if (!confirm(`Yakin ingin ${newStatus === 'accept' ? 'menerima' : 'menolak'} booking ini?`)) {
      return;
    }

    setUpdating(bookingId);

    try {
      const token = getCookies('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const requestBody = {
        status: newStatus,
      };

      console.log(`Updating booking:`, {
        id_booking: booking.id_booking,
        booking_id: booking.booking_id,
        id: booking.id,
        kos_id: booking.kos_id,
        'USING ID': bookingId
      });
      console.log('Request URL:', `https://learn.smktelkom-mlg.sch.id/kos/api/admin/update_status_booking/${bookingId}`);
      console.log('Request body:', requestBody);

      const res = await fetch(
        `https://learn.smktelkom-mlg.sch.id/kos/api/admin/update_status_booking/${bookingId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            MakerID: '1',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log('Update response status:', res.status);
      console.log('Update response ok:', res.ok);

      // Check if response has content
      const contentType = res.headers.get('content-type');
      console.log('Response content-type:', contentType);

      let responseData = null;
      if (contentType && contentType.includes('application/json')) {
        responseData = await res.json();
        console.log('Response data:', responseData);
      } else {
        console.log('No JSON response body');
      }

      if (!res.ok) {
        if (responseData) {
          console.error('Error response:', responseData);
          throw new Error(responseData.message || `HTTP ${res.status}`);
        } else {
          throw new Error(`HTTP ${res.status}: Booking tidak ditemukan atau tidak bisa diupdate`);
        }
      }

      alert(`Booking berhasil ${newStatus === 'accept' ? 'diterima' : 'ditolak'}!`);
      
      // Refresh bookings
      fetchBookings(
        filterStatus === 'all' ? undefined : filterStatus,
        filterDate || undefined
      );
    } catch (err: any) {
      console.error('Gagal update status:', err);
      alert(`Gagal update status: ${err.message || 'Silakan coba lagi.'}`);
    } finally {
      setUpdating(null);
    }
  };

  // Handle filter change
  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    fetchBookings(status === 'all' ? undefined : status, filterDate || undefined);
  };

  // Handle date filter change
  const handleDateFilter = () => {
    fetchBookings(
      filterStatus === 'all' ? undefined : filterStatus,
      filterDate || undefined
    );
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
    fetchBookings();
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
          Kelola Booking
        </h1>
        <p className="text-indigo-100 text-sm mt-1">
          Konfirmasi atau tolak booking dari penghuni
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-md p-4 space-y-4">
        {/* Status Filter */}
        <div>
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

        {/* Date Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CalendarIcon className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Filter Tanggal:</span>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Pilih tanggal"
            />
            <button
              onClick={handleDateFilter}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              Cari
            </button>
            {filterDate && (
              <button
                onClick={() => {
                  setFilterDate('');
                  fetchBookings(filterStatus === 'all' ? undefined : filterStatus);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
              >
                Reset
              </button>
            )}
          </div>
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
          <p className="text-gray-500">
            {filterStatus !== 'all' || filterDate
              ? 'Tidak ada booking dengan filter yang dipilih'
              : 'Belum ada booking masuk untuk kos Anda'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Penghuni
                  </th>
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
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => {
                  console.log('Rendering booking:', { id: booking.id, status: booking.status, kos_id: booking.kos_id });
                  return (
                  <tr key={`booking-${booking.id}`} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserCircleIcon className="h-10 w-10 text-indigo-600" />
                        <div>
                          <div className="font-semibold text-gray-900">
                            {booking.user?.name || `User #${booking.user_id}`}
                          </div>
                          {booking.user?.email && (
                            <div className="text-xs text-gray-500">
                              {booking.user.email}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            Booking ID: {booking.id_booking || booking.booking_id || booking.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <HomeIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {booking.name || booking.kos?.name || `Kos #${booking.kos_id}`}
                          </div>
                          {(booking.address || booking.kos?.address) && (
                            <div className="text-xs text-gray-500">
                              {booking.address || booking.kos?.address}
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
                    <td className="px-6 py-4">
                      {booking.status.toLowerCase() === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateBookingStatus(booking, 'accept')}
                            disabled={updating === (booking.id_booking || booking.booking_id || booking.id)}
                            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            Terima
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking, 'reject')}
                            disabled={updating === (booking.id_booking || booking.booking_id || booking.id)}
                            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1"
                          >
                            <XCircleIcon className="h-4 w-4" />
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">
                          Sudah diproses
                        </span>
                      )}
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-gray-200">
            {bookings.map((booking) => (
              <div key={`booking-mobile-${booking.id}`} className="p-4 space-y-4">
                {/* User Info */}
                <div className="flex items-start gap-3">
                  <UserCircleIcon className="h-12 w-12 text-indigo-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {booking.user?.name || `User #${booking.user_id}`}
                    </div>
                    {booking.user?.email && (
                      <div className="text-xs text-gray-500">
                        {booking.user.email}
                      </div>
                    )}
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                {/* Kos Info */}
                <div className="flex items-center gap-2 text-sm">
                  <HomeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {booking.name || booking.kos?.name || `Kos #${booking.kos_id}`}
                    </div>
                    {(booking.address || booking.kos?.address) && (
                      <div className="text-xs text-gray-500">
                        {booking.address || booking.kos?.address}
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates */}
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

                {/* Actions */}
                {booking.status.toLowerCase() === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => updateBookingStatus(booking, 'accept')}
                      disabled={updating === (booking.id_booking || booking.booking_id || booking.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Terima
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking, 'reject')}
                      disabled={updating === (booking.id_booking || booking.booking_id || booking.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
