'use client';

import { Star, Trash } from 'lucide-react';
import Button from '../Ui/Button';

interface ReviewCardProps {
  id: number;
  name: string;
  comment: string;
  rating: number;
  date: string;
  onDelete: (id: number) => void;
}

export default function ReviewCard({
  id,
  name,
  comment,
  rating,
  date,
  onDelete,
}: ReviewCardProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-gray-200 p-5 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200">
      {/* Bagian kiri: informasi review */}
      <div className="w-full md:w-4/5">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg text-gray-800">{name}</h3>
          <p className="text-sm text-gray-500">{date}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
        </div>

        {/* Komentar */}
        <p className="text-gray-700 mt-3 leading-relaxed">{comment}</p>
      </div>

      {/* Bagian kanan: tombol hapus */}
      <div className="flex justify-end w-full md:w-auto mt-4 md:mt-0">
        <Button
          variant="danger"
          onClick={() => onDelete(id)}
          className="flex items-center gap-1"
        >
          <Trash className="w-4 h-4" /> Hapus
        </Button>
      </div>
    </div>
  );
}
