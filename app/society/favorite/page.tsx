export default function FavoritePage() {
  const favorites = [
    { id: 1, name: 'Kos Elite', price: 'Rp 1.500.000' },
    { id: 2, name: 'Kos Santai', price: 'Rp 950.000' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Kos Favorit</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {favorites.map((f) => (
          <div key={f.id} className="bg-white p-5 rounded-2xl shadow hover:shadow-md">
            <img
              src={`/images/kos-${f.id}.jpg`}
              alt={f.name}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
            <h3 className="font-semibold text-gray-800">{f.name}</h3>
            <p className="text-gray-500 text-sm">{f.price} / bulan</p>
            <button className="mt-3 bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg w-full">
              Hapus dari Favorit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
