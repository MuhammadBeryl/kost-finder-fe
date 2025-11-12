'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCookies } from '../../../lib/client-cookie';
import {
  ChatBubbleLeftRightIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  UserCircleIcon,
  CalendarIcon,
} from '@heroicons/react/24/solid';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface Reply {
  id: number;
  review_id: number;
  user_id: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Review {
  id: number;
  kos_id: number;
  user_id: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  replies?: Reply[];
}

interface KosWithReviews {
  id: number;
  user_id: number;
  name: string;
  address: string;
  price_per_month: string;
  gender: string;
  created_at: string;
  updated_at: string;
  reviews: Review[];
}

export default function MyReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kosIdParam = searchParams.get('kos_id');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [kosList, setKosList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedKosId, setSelectedKosId] = useState<number | null>(
    kosIdParam ? parseInt(kosIdParam) : null
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReview, setNewReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch kos list for dropdown
  const fetchKosList = async () => {
    try {
      const token = getCookies('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(
        'https://learn.smktelkom-mlg.sch.id/kos/api/society/show_kos?search=',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            MakerID: '1',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const items = data?.data || [];
      setKosList(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Gagal mengambil daftar kos:', err);
    }
  };

  // Fetch reviews for specific kos
  const fetchReviews = async (kosId: number) => {
    setLoading(true);
    setError('');

    try {
      const token = getCookies('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(
        `https://learn.smktelkom-mlg.sch.id/kos/api/society/show_reviews/${kosId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            MakerID: '1',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const response = await res.json();
      console.log('Reviews response:', response);

      // API returns data as object with reviews array
      const kosData = response?.data;
      if (kosData && kosData.reviews) {
        setReviews(Array.isArray(kosData.reviews) ? kosData.reviews : []);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('Gagal mengambil review:', err);
      setError('Gagal mengambil review. Periksa koneksi atau server API.');
    } finally {
      setLoading(false);
    }
  };

  // Add new review
  const handleAddReview = async () => {
    if (!newReview.trim() || !selectedKosId) {
      alert('Mohon isi review Anda!');
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
        review: newReview.trim(),  // Try 'review' instead of 'comment'
      };

      console.log('Sending review:', requestBody);
      console.log('To URL:', `https://learn.smktelkom-mlg.sch.id/kos/api/society/store_reviews/${selectedKosId}`);
      console.log('Body string:', JSON.stringify(requestBody));

      const res = await fetch(
        `https://learn.smktelkom-mlg.sch.id/kos/api/society/store_reviews/${selectedKosId}`,
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
      console.log('Response:', responseData);

      if (!res.ok) {
        console.error('Error response:', responseData);
        console.error('Error message details:', JSON.stringify(responseData.message, null, 2));
        
        // Extract validation errors if they exist
        let errorMessage = 'Unknown error';
        if (responseData.message) {
          if (typeof responseData.message === 'object') {
            // If message is an object (validation errors)
            errorMessage = Object.entries(responseData.message)
              .map(([field, errors]: [string, any]) => {
                if (Array.isArray(errors)) {
                  return `${field}: ${errors.join(', ')}`;
                }
                return `${field}: ${errors}`;
              })
              .join('\n');
          } else {
            errorMessage = responseData.message;
          }
        }
        
        throw new Error(`HTTP ${res.status}: ${errorMessage}`);
      }

      alert('Review berhasil ditambahkan!');
      setNewReview('');
      setShowAddModal(false);
      fetchReviews(selectedKosId);
    } catch (err) {
      console.error('Gagal menambahkan review:', err);
      alert('Gagal menambahkan review. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Yakin ingin menghapus review ini?')) return;

    try {
      const token = getCookies('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(
        `https://learn.smktelkom-mlg.sch.id/kos/api/society/delete_review/${reviewId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            MakerID: '1',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      alert('Review berhasil dihapus!');
      if (selectedKosId) {
        fetchReviews(selectedKosId);
      }
    } catch (err) {
      console.error('Gagal menghapus review:', err);
      alert('Gagal menghapus review. Silakan coba lagi.');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    fetchKosList();
  }, []);

  useEffect(() => {
    if (selectedKosId) {
      fetchReviews(selectedKosId);
    }
  }, [selectedKosId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-7 w-7 text-indigo-600" />
              Review Saya
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Kelola review Anda untuk kos-kosan
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            disabled={!selectedKosId}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg"
          >
            <PlusIcon className="h-5 w-5" />
            Tambah Review
          </button>
        </div>

        {/* Kos Selection */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Kos untuk Melihat Review
          </label>
          <select
            value={selectedKosId || ''}
            onChange={(e) => setSelectedKosId(Number(e.target.value))}
            className="w-full md:w-1/2 border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">-- Pilih Kos --</option>
            {kosList.map((kos) => (
              <option key={kos.id} value={kos.id}>
                {kos.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {selectedKosId ? (
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Daftar Review
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat review...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <ChatBubbleLeftIcon className="h-16 w-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada review untuk kos ini</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Tambahkan review pertama
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
                >
                  {/* Main Review */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <UserCircleIcon className="h-12 w-12 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {review.user?.name || 'Pengguna'}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{formatDate(review.created_at)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                          title="Hapus review"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="text-gray-700 mt-3 leading-relaxed">
                        {review.comment}
                      </p>

                      {/* Nested Replies */}
                      {review.replies && review.replies.length > 0 && (
                        <div className="mt-4 pl-6 border-l-2 border-indigo-200 space-y-3">
                          {review.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="bg-indigo-50 rounded-lg p-4"
                            >
                              <div className="flex gap-3">
                                <div className="flex-shrink-0">
                                  <UserCircleIcon className="h-10 w-10 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-900 text-sm">
                                      {reply.user?.name || 'Admin/Owner'}
                                    </h4>
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                      Balasan
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    <span>{formatDate(reply.created_at)}</span>
                                  </div>
                                  <p className="text-gray-700 mt-2 text-sm leading-relaxed">
                                    {reply.comment}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl shadow-md text-center">
          <ChatBubbleLeftIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Pilih Kos Terlebih Dahulu
          </h3>
          <p className="text-gray-500">
            Silakan pilih kos dari dropdown di atas untuk melihat dan mengelola review
          </p>
        </div>
      )}

      {/* Add Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-600" />
                Tambah Review
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Selected Kos Info */}
              {selectedKosId && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Kos yang dipilih:</p>
                  <p className="font-semibold text-gray-900">
                    {kosList.find((k) => k.id === selectedKosId)?.name ||
                      'Tidak diketahui'}
                  </p>
                </div>
              )}

              {/* Review Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Anda <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Tulis review Anda tentang kos ini..."
                  rows={6}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimal 10 karakter
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddReview}
                  disabled={submitting || newReview.trim().length < 10}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
