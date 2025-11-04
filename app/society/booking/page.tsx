export default function MyBookingPage() {
  const bookings = [
    { id: 1, kos: 'Kos Harapan', start: '2025-10-01', end: '2026-01-01', status: 'pending' },
    { id: 2, kos: 'Kos Merdeka', start: '2025-08-01', end: '2025-09-01', status: 'accept' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Booking Saya</h1>
      <div className="bg-white rounded-2xl shadow p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">Nama Kos</th>
              <th className="pb-2">Tanggal Mulai</th>
              <th className="pb-2">Tanggal Selesai</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b last:border-none">
                <td className="py-3">{b.kos}</td>
                <td>{b.start}</td>
                <td>{b.end}</td>
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      b.status === 'accept'
                        ? 'bg-green-100 text-green-700'
                        : b.status === 'reject'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
