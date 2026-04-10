export default function Loading() {
  return (
    <div>
      <div className="w-full h-56 md:h-80 bg-gray-100 animate-pulse" />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="h-8 w-64 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-10 w-28 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-2 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
