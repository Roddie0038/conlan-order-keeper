
export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
          <p className="mt-4 text-gray-400">Loading approved treads...</p>
        </div>
      </div>
    </div>
  );
}
