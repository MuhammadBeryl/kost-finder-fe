export default function SocietyDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard Society</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-gray-500 text-sm">Total Booking Saya</h3>
          <p className="text-3xl font-bold text-indigo-700 mt-2">5</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-gray-500 text-sm">Kos yang Diterima</h3>
          <p className="text-3xl font-bold text-indigo-700 mt-2">3</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-gray-500 text-sm">Review yang Dibuat</h3>
          <p className="text-3xl font-bold text-indigo-700 mt-2">2</p>
        </div>
      </div>

      {/* Section tambahan */}
      <div className="mt-8 bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Rekomendasi Kos untuk Anda</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-xl p-4 hover:shadow-md transition-all">
              <img
                src={`/images/kos-${i}.jpg`}
                alt="Kos"
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
              <h3 className="font-semibold text-gray-800">Kos Nyaman #{i}</h3>
              <p className="text-gray-500 text-sm">Rp 1.200.000 / bulan</p>
              <button className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg">
                Lihat Detail
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
