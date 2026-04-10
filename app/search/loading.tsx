export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="h-12 bg-gray-100 rounded-xl animate-pulse mb-6 max-w-2xl" />
      <div className="flex gap-6">
        <div className="w-56 shrink-0 space-y-3">
          <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
          <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-4 w-16 bg-gray-100 rounded animate-pulse mt-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
