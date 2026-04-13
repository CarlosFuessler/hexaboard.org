'use client';

export default function Page() {
  return (
    <main className="min-h-screen text-white py-20 px-6 relative">
      <div className="max-w-3xl mx-auto relative z-10">
        <p className="mono text-green-400 mb-4">// studio</p>
        <h1 className="text-3xl font-bold mb-4">Hexaboard Studio</h1>
        <p className="text-sm text-white/70 mb-6">
          The Studio experience is currently being rebuilt.
        </p>

        <div className="glass-card p-6">
          <div className="rounded-lg border border-green-900/50 bg-black/40 p-6">
            <p className="text-lg font-semibold text-green-300">In progress...</p>
            <p className="mt-2 text-sm text-white/65">
              Macro editing and layout configuration will return soon.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
