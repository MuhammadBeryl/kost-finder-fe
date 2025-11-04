'use client';

export default function MyReviewPage() {
  const reviews = [
    { id: 1, kos: 'Kos Harapan', comment: 'Tempatnya bersih dan nyaman!' },
    { id: 2, kos: 'Kos Indah', comment: 'Cukup bagus, tapi sinyal agak lemah.' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Review Saya</h1>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white p-5 rounded-2xl shadow">
            <h3 className="font-semibold text-gray-700">{r.kos}</h3>
            <p className="text-gray-500 text-sm mt-1">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

