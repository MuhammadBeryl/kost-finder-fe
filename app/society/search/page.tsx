'use client';

export default function SearchKosPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Cari Kos</h1>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl shadow mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau alamat..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-300"
        />
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Semua Gender</option>
          <option value="male">Laki-laki</option>
          <option value="female">Perempuan</option>
          <option value="all">Campur</option>
        </select>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm">
          Cari
        </button>
      </div>

      {/* Daftar Kos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-2xl shadow hover:shadow-md transition-all"
          >
            <img
              src={`/images/kos-${i}.jpg`}
              alt="Kos"
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
            <h3 className="font-semibold text-gray-800">Kos Santai #{i}</h3>
            <p className="text-gray-500 text-sm">Rp 1.000.000 / bulan</p>
            <p className="text-gray-400 text-xs mt-1">Campur</p>
            <button className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg w-full">
              Lihat Detail
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
