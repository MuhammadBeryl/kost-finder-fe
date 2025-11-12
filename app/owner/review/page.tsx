'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookies } from '../../../lib/client-cookie';
import {
  ChatBubbleLeftRightIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  UserCircleIcon,
  CalendarIcon,
  HomeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
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

export default function ReviewKosPage() {
  const router = useRouter();
  const [kosList, setKosList] = useState<KosWithReviews[]>([]);
  const [expandedKos, setExpandedKos] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [selectedKosId, setSelectedKosId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch all kos with their reviews
  const fetchAllKosReviews = async () => {
    setLoading(true);
    setError('');

    try {
      const token = getCookies('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // First, get all kos owned by this user
      const resKos = await fetch(
        'https://learn.smktelkom-mlg.sch.id/kos/api/admin/show_kos',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            MakerID: '1',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!resKos.ok) throw new Error(`HTTP ${resKos.status}`);

      const dataKos = await resKos.json();
      console.log('Kos list response:', dataKos);

      const kosItems = dataKos?.data || [];
      
      if (!Array.isArray(kosItems) || kosItems.length === 0) {
        setKosList([]);
        setLoading(false);
        return;
      }

      // For each kos, fetch its reviews
      const kosWithReviewsPromises = kosItems.map(async (kos: any) => {
        try {
          const resReviews = await fetch(
            `https://learn.smktelkom-mlg.sch.id/kos/api/admin/show_reviews/${kos.id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                MakerID: '1',
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (resReviews.ok) {
            const dataReviews = await resReviews.json();
            console.log(`Reviews for kos ${kos.id}:`, dataReviews);
            
            const reviewsData = dataReviews?.data?.reviews || [];
            console.log(`Raw reviews for kos ${kos.id}:`, reviewsData);
            
            // Group reviews: owner reviews become replies to society reviews
            // Owner user_id is the same as kos.user_id
            const ownerUserId = kos.user_id;
            
            // Separate society reviews and owner replies
            const societyReviews: any[] = [];
            const ownerReplies: any[] = [];
            
            reviewsData.forEach((review: any) => {
              if (review.user_id === ownerUserId) {
                // This is an owner reply
                ownerReplies.push(review);
              } else {
                // This is a society review
                societyReviews.push(review);
              }
            });
            
            console.log(`Society reviews:`, societyReviews.length);
            console.log(`Owner replies:`, ownerReplies.length);
            
            // Create nested structure: attach owner replies to society reviews
            // Strategy: Latest owner replies are responses to latest society reviews
            const nestedReviews = societyReviews.map((review, index) => {
              return {
                ...review,
                replies: ownerReplies.slice(index, index + 10), // Attach relevant replies
              };
            });
            
            console.log(`Nested reviews:`, nestedReviews);
            
            return {
              ...kos,
              reviews: nestedReviews,
            };
          }
          
          return { ...kos, reviews: [] };
        } catch (err) {
          console.error(`Error fetching reviews for kos ${kos.id}:`, err);
          return { ...kos, reviews: [] };
        }
      });

      const kosWithReviews = await Promise.all(kosWithReviewsPromises);
      setKosList(kosWithReviews);
    } catch (err) {
      console.error('Gagal mengambil data:', err);
      setError('Gagal mengambil data kos dan review.');
    } finally {
      setLoading(false);
    }
  };

  // Add reply to review
  const handleAddReply = async () => {
    if (!replyText.trim() || !selectedKosId) {
      alert('Mohon isi balasan Anda!');
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
        review: replyText.trim(),
      };

      console.log('Sending reply:', requestBody);
      console.log('To kos_id:', selectedKosId);

      const res = await fetch(
        `https://learn.smktelkom-mlg.sch.id/kos/api/admin/store_reviews/${selectedKosId}`,
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
      console.log('Reply response:', responseData);
      console.log('Response status:', res.status);
      console.log('Response message:', responseData.message);
      console.log('Response errors:', responseData.errors);

      if (!res.ok) {
        console.error('Error response:', responseData);
        if (responseData.message) {
          console.error('Error message:', JSON.stringify(responseData.message, null, 2));
        }
        if (responseData.errors) {
          console.error('Validation errors:', JSON.stringify(responseData.errors, null, 2));
        }
        
        // Format error message for display
        let errorMsg = 'Gagal menambahkan balasan';
        if (typeof responseData.message === 'object') {
          errorMsg += ':\n' + JSON.stringify(responseData.message, null, 2);
        } else if (typeof responseData.message === 'string') {
          errorMsg += ': ' + responseData.message;
        }
        
        throw new Error(errorMsg);
      }

      alert('Balasan berhasil ditambahkan!');
      setReplyText('');
      setShowReplyModal(false);
      setSelectedReviewId(null);
      setSelectedKosId(null);
      fetchAllKosReviews();
    } catch (err: any) {
      console.error('Gagal menambahkan balasan:', err);
      alert(`Gagal menambahkan balasan: ${err.message || 'Silakan coba lagi.'}`);
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
      fetchAllKosReviews();
    } catch (err) {
      console.error('Gagal menghapus review:', err);
      alert('Gagal menghapus review. Silakan coba lagi.');
    }
  };

  // Toggle kos expansion
  const toggleKosExpansion = (kosId: number) => {
    setExpandedKos((prev) =>
      prev.includes(kosId)
        ? prev.filter((id) => id !== kosId)
        : [...prev, kosId]
    );
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
    fetchAllKosReviews();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat review...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-7 w-7 text-indigo-600" />
              Review Kos
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Kelola review dari penghuni untuk setiap kos Anda
            </p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Kos List with Reviews */}
      {kosList.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-md text-center">
          <HomeIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Belum Ada Kos
          </h3>
          <p className="text-gray-500">
            Anda belum memiliki kos untuk mengelola review
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {kosList.map((kos) => {
            const isExpanded = expandedKos.includes(kos.id);
            const reviewCount = kos.reviews?.length || 0;

            return (
              <div
                key={kos.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
              >
                {/* Kos Header - Clickable */}
                <button
                  onClick={() => toggleKosExpansion(kos.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-lg">
                      <HomeIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-lg font-bold text-gray-900">
                        {kos.name}
                      </h2>
                      <p className="text-sm text-gray-500">{kos.address}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                          {reviewCount} Review{reviewCount !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-gray-500">
                          Rp {parseInt(kos.price_per_month).toLocaleString()}/bulan
                        </span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUpIcon className="h-6 w-6 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-6 w-6 text-gray-400" />
                  )}
                </button>

                {/* Reviews Section - Expandable */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-6">
                    {reviewCount === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <ChatBubbleLeftIcon className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                          Belum ada review untuk kos ini
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {kos.reviews.map((review) => (
                          <div
                            key={review.id}
                            className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
                          >
                            {/* Main Review (Society) */}
                            <div className="flex gap-4">
                              <div className="flex-shrink-0">
                                <UserCircleIcon className="h-12 w-12 text-indigo-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold text-gray-900">
                                        Pengguna #{review.user_id}
                                      </h3>
                                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                                        Society
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                      <CalendarIcon className="h-4 w-4" />
                                      <span>{formatDate(review.created_at)}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setSelectedReviewId(review.id);
                                        setSelectedKosId(kos.id);
                                        setShowReplyModal(true);
                                      }}
                                      className="text-indigo-600 hover:text-indigo-700 p-2 hover:bg-indigo-50 rounded-lg transition flex items-center gap-1 text-sm"
                                      title="Balas review"
                                    >
                                      <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                      <span>Balas</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteReview(review.id)}
                                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                                      title="Hapus review"
                                    >
                                      <TrashIcon className="h-5 w-5" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-gray-700 mt-3 leading-relaxed">
                                  {review.comment}
                                </p>

                                {/* Nested Replies (Owner) */}
                                {review.replies && review.replies.length > 0 && (
                                  <div className="mt-4 pl-6 border-l-4 border-purple-300 space-y-3">
                                    {review.replies.map((reply: any) => (
                                      <div
                                        key={reply.id}
                                        className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 shadow-sm"
                                      >
                                        <div className="flex gap-3">
                                          <div className="flex-shrink-0">
                                            <div className="bg-purple-600 rounded-full p-2">
                                              <UserCircleIcon className="h-8 w-8 text-white" />
                                            </div>
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <h4 className="font-semibold text-gray-900 text-sm">
                                                Owner Kos
                                              </h4>
                                              <span className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full font-medium">
                                                ✓ Balasan Owner
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                              <CalendarIcon className="h-3 w-3" />
                                              <span>{formatDate(reply.created_at)}</span>
                                            </div>
                                            <p className="text-gray-700 mt-2 text-sm leading-relaxed">
                                              {reply.comment}
                                            </p>
                                            <button
                                              onClick={() => handleDeleteReview(reply.id)}
                                              className="mt-2 text-red-500 hover:text-red-700 text-xs flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition"
                                              title="Hapus balasan"
                                            >
                                              <TrashIcon className="h-4 w-4" />
                                              <span>Hapus balasan</span>
                                            </button>
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
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-600" />
                Balas Review
              </h2>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                  setSelectedReviewId(null);
                  setSelectedKosId(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Reply Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Balasan Anda <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Tulis balasan Anda untuk review ini..."
                  rows={6}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimal 5 karakter
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyText('');
                    setSelectedReviewId(null);
                    setSelectedKosId(null);
                  }}
                  disabled={submitting}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddReply}
                  disabled={submitting || replyText.trim().length < 5}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Balasan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
