'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Ui/Card';
import Button from '../../components/Ui/Button';
import { Star, Trash } from 'lucide-react';

/**
 * Local fallback toast implementation to avoid requiring the 'sonner' package.
 * Replace this with your preferred toast library (e.g. react-hot-toast, sonner) when available.
 */
const toast = {
  info: (msg: string) => {
    if (typeof window !== 'undefined') {
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          // show a native notification if permission is granted
          // eslint-disable-next-line no-new
          new Notification(msg);
          return;
        }
      } catch {
        // ignore notification errors
      }
      // fallback to alert for minimal user feedback
      alert(msg);
    } else {
      // server-side or non-window fallback
      // eslint-disable-next-line no-console
      console.log('Toast info:', msg);
    }
  },
};

interface Review {
  id: number;
  name: string;
  comment: string;
  rating: number;
  date: string;
}

export default function ReviewKosPage() {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      name: 'Budi Santoso',
      comment: 'Kamar bersih dan fasilitas lengkap, sangat nyaman!',
      rating: 5,
      date: '2025-10-18',
    },
    {
      id: 2,
      name: 'Siti Rahma',
      comment: 'Lokasi strategis tapi agak bising di malam hari.',
      rating: 4,
      date: '2025-10-20',
    },
  ]);

  const deleteReview = (id: number) => {
    setReviews(reviews.filter(r => r.id !== id));
    toast.info('Review berhasil dihapus');
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Card className="shadow-xl border-0 rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">
            Review & Rating Kos
          </CardTitle>
          <p className="text-gray-500 mt-2">
            Lihat dan kelola ulasan penghuni kos kamu ✨
          </p>
        </CardHeader>

        <CardContent>
          {/* Rata-rata rating */}
          <div className="flex justify-center items-center gap-2 mb-6">
            <Star className="text-yellow-400 w-6 h-6" />
            <span className="text-3xl font-bold">{averageRating}</span>
            <span className="text-gray-500 text-sm">/ 5.0</span>
          </div>

          {/* Daftar Review */}
          <div className="grid gap-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-100 p-5 rounded-xl shadow-sm"
              >
                <div>
                  <h3 className="font-semibold text-lg">{review.name}</h3>
                  <p className="text-yellow-500 flex items-center gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-gray-600 ml-2">{review.rating}/5</span>
                  </p>
                  <p className="text-gray-700 mt-2">{review.comment}</p>
                  <p className="text-sm text-gray-500 mt-1">{review.date}</p>
                </div>

                <Button
                  onClick={() => deleteReview(review.id)}
                  variant="danger"
                  className="mt-3 md:mt-0"
                >
                  <Trash className="w-4 h-4 mr-1" /> Hapus
                </Button>
              </div>
            ))}

            {reviews.length === 0 && (
              <p className="text-center text-gray-500 mt-4">
                Belum ada review untuk kos ini.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
