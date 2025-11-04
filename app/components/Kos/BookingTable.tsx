'use client';

import Button from '../Ui/Button';

interface Booking {
  id: number;
  tenantName: string;
  kosName: string;
  date: string;
  duration: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

interface BookingTableProps {
  bookings: Booking[];
  onUpdate: (id: number, status: 'pending' | 'confirmed' | 'cancelled') => void;
}

export default function BookingTable({ bookings, onUpdate }: BookingTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm text-gray-700">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Penyewa</th>
            <th className="p-3 text-left">Kos</th>
            <th className="p-3 text-left">Tanggal</th>
            <th className="p-3 text-left">Durasi</th>
            <th className="p-3 text-right">Total Harga</th>
            <th className="p-3 text-center">Status</th>
            <th className="p-3 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{b.tenantName}</td>
              <td className="p-3">{b.kosName}</td>
              <td className="p-3">{b.date}</td>
              <td className="p-3">{b.duration}</td>
              <td className="p-3 text-right">
                Rp{b.totalPrice.toLocaleString('id-ID')}
              </td>
              <td
                className={`p-3 text-center font-medium ${
                  b.status === 'pending'
                    ? 'text-yellow-600'
                    : b.status === 'confirmed'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {b.status}
              </td>
              <td className="p-3 text-center space-x-2">
                <Button
                  variant="primary"
                  onClick={() => onUpdate(b.id, 'confirmed')}
                >
                  Konfirmasi
                </Button>
                <Button
                  variant="danger"
                  onClick={() => onUpdate(b.id, 'cancelled')}
                >
                  Batalkan
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
