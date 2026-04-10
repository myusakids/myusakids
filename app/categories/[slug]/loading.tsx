export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="h-10 w-56 bg-gray-100 rounded-lg animate-pulse mb-6" />
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-gray-100 rounded-full animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
