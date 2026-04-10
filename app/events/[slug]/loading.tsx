export default function Loading() {
  return (
    <div>
      <div className="bg-brand-green px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
          <div className="h-8 w-80 bg-white/20 rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-white/20 rounded animate-pulse" />
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-10 w-28 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-2 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
