export default function OwnerDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard Owner</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-gray-500 text-sm">Total Kos</h3>
          <p className="text-3xl font-bold text-indigo-700 mt-2">8</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-gray-500 text-sm">Total Booking</h3>
          <p className="text-3xl font-bold text-indigo-700 mt-2">12</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-gray-500 text-sm">Rating Rata-rata</h3>
          <p className="text-3xl font-bold text-indigo-700 mt-2">4.6 ⭐</p>
        </div>
      </div>
    </div>
  );
}
