'use client';

function Topbar() {
  return (
    <header className="bg-white border-b p-4">
      {/* simple fallback Topbar component */}
      Topbar
    </header>
  );
}

function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r p-4">
      {/* simple fallback Sidebar component */}
      Sidebar
    </aside>
  );
}

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
