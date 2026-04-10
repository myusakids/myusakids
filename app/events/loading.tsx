export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse mb-6" />
      <div className="flex gap-2 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-24 bg-gray-100 rounded-full animate-pulse" />
        ))}
      </div>
      <div className="h-72 bg-gray-100 rounded-2xl animate-pulse mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
