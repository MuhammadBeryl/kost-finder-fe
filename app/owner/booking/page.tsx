'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../components/Ui/Card';
import BookingTable from '../../components/Kos/BookingTable';

const toast = { success: (msg: string) => console.log(msg) };

// 🧩 Tambahkan tipe Booking
interface Booking {
  id: number;
  tenantName: string;
  kosName: string;
  date: string;
  duration: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled'; // ✅ union type
}

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 1,
      tenantName: 'Budi Santoso',
      kosName: 'Kos Mawar Indah',
      date: '2025-10-20',
      duration: '3 bulan',
      totalPrice: 3000000,
      status: 'pending', // ✅ harus pakai literal union
    },
    {
      id: 2,
      tenantName: 'Siti Rahma',
      kosName: 'Kos Melati Asri',
      date: '2025-10-22',
      duration: '1 bulan',
      totalPrice: 1000000,
      status: 'confirmed',
    },
  ]);

  const handleUpdate = (
    id: number,
    status: 'pending' | 'confirmed' | 'cancelled'
  ) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
    toast.success(
      `Booking ${
        status === 'confirmed' ? 'dikonfirmasi' : status === 'cancelled' ? 'dibatalkan' : 'diproses'
      }`
    );
  };

    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card className="shadow-xl border-0 rounded-2xl">
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingTable bookings={bookings} onUpdate={handleUpdate} />
          </CardContent>
        </Card>
      </div>
    );
  }
