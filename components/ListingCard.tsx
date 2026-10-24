import Link from "next/link";
import Image from "next/image";
import type { ListingCard as ListingCardType } from "@/lib/types";

interface Props {
  listing: ListingCardType;
}

export default function ListingCard({ listing }: Props) {
  const primaryCat = listing.categories[0];

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group block bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-brand-green hover:shadow-sm transition-all"
    >
      {/* Image */}
      <div className="relative h-44 bg-brand-green-light">
        {listing.primary_image ? (
          <Image
            src={listing.primary_image.url}
            alt={listing.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-4xl">{primaryCat?.icon ?? "📍"}</span>
          </div>
        )}

        {/* Free badge */}
        {listing.is_free && (
          <span className="absolute top-2 left-2 bg-brand-green text-white text-xs font-medium px-2 py-0.5 rounded-full">
            Free
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category pills */}
        {listing.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {listing.categories.slice(0, 2).map((cat) => (
              <span
                key={cat.slug}
                className="text-xs text-brand-green-dark bg-brand-green-light px-2 py-0.5 rounded-full"
              >
                {cat.icon} {cat.name}
              </span>
            ))}
          </div>
        )}

        <h3 className="font-medium text-gray-900 text-base leading-snug group-hover:text-brand-green transition-colors line-clamp-1">
          {listing.name}
        </h3>

        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {listing.town}
        </p>

        {listing.short_desc && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
            {listing.short_desc}
          </p>
        )}

        {listing.cost_description && (
          <p className="text-xs text-gray-400 mt-2">{listing.cost_description}</p>
        )}
      </div>
    </Link>
  );
}
