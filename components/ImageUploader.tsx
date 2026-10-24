"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { supabaseBrowser as _sb } from "@/lib/supabase-browser";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseBrowser = _sb as any;
import type { ListingImage } from "@/lib/types";

interface Props {
  listingId: string;
  initialImages: ListingImage[];
  onSaved?: (images: ListingImage[]) => void;
}

const BUCKET = "listing-images";
const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export default function ImageUploader({ listingId, initialImages, onSaved }: Props) {
  const [images, setImages] = useState<ListingImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList) {
    setError("");
    if (images.length >= MAX_FILES) {
      setError(`Maximum ${MAX_FILES} photos allowed.`);
      return;
    }

    setUploading(true);
    const newImages: ListingImage[] = [];

    for (const file of Array.from(files)) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Only JPG, PNG, or WebP files allowed.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError("Each photo must be under 5 MB.");
        continue;
      }
      if (images.length + newImages.length >= MAX_FILES) break;

      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${listingId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabaseBrowser.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        continue;
      }

      const { data: urlData } = supabaseBrowser.storage.from(BUCKET).getPublicUrl(path);
      const isPrimary = images.length === 0 && newImages.length === 0;
      const sort_order = images.length + newImages.length;

      const { data: imgRow, error: dbError } = await supabaseBrowser
        .from("listing_images")
        .insert({
          listing_id: listingId,
          url: urlData.publicUrl,
          is_primary: isPrimary,
          sort_order,
        })
        .select("*")
        .single();

      if (dbError || !imgRow) {
        setError(`Failed to save image: ${dbError?.message}`);
        continue;
      }

      newImages.push(imgRow as ListingImage);
    }

    const updated = [...images, ...newImages];
    setImages(updated);
    onSaved?.(updated);
    setUploading(false);
  }

  async function deleteImage(img: ListingImage) {
    // Extract storage path from URL
    const url = new URL(img.url);
    const pathMatch = url.pathname.match(new RegExp(`/storage/v1/object/public/${BUCKET}/(.+)$`));
    const storagePath = pathMatch?.[1];

    if (storagePath) {
      await supabaseBrowser.storage.from(BUCKET).remove([storagePath]);
    }

    await supabaseBrowser.from("listing_images").delete().eq("id", img.id);

    // If deleted image was primary, make the first remaining one primary
    const remaining = images.filter((i) => i.id !== img.id);
    if (img.is_primary && remaining.length > 0) {
      await supabaseBrowser
        .from("listing_images")
        .update({ is_primary: true })
        .eq("id", remaining[0].id);
      remaining[0] = { ...remaining[0], is_primary: true };
    }

    setImages(remaining);
    onSaved?.(remaining);
  }

  async function setPrimary(img: ListingImage) {
    await supabaseBrowser
      .from("listing_images")
      .update({ is_primary: false })
      .eq("listing_id", listingId);

    await supabaseBrowser
      .from("listing_images")
      .update({ is_primary: true })
      .eq("id", img.id);

    setImages((prev) =>
      prev.map((i) => ({ ...i, is_primary: i.id === img.id }))
    );
  }

  return (
    <div className="space-y-4">
      {/* Grid of existing images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative rounded-xl overflow-hidden border border-gray-100 group aspect-video bg-gray-50">
              <Image src={img.url} alt="Listing photo" fill className="object-cover" sizes="200px" />

              {/* Primary badge */}
              {img.is_primary && (
                <span className="absolute top-2 left-2 text-xs bg-brand-green text-white px-2 py-0.5 rounded-full font-medium">
                  Primary
                </span>
              )}

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.is_primary && (
                  <button
                    onClick={() => setPrimary(img)}
                    className="text-xs bg-white text-gray-800 px-2.5 py-1 rounded-lg font-medium hover:bg-brand-green hover:text-white transition-colors"
                  >
                    Set primary
                  </button>
                )}
                <button
                  onClick={() => deleteImage(img)}
                  className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {images.length < MAX_FILES && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && upload(e.target.files)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 border-2 border-dashed border-gray-200 hover:border-brand-green rounded-xl px-5 py-4 text-sm text-gray-500 hover:text-brand-green transition-colors w-full justify-center disabled:opacity-40"
          >
            {uploading ? (
              <>
                <span className="animate-spin">⏳</span> Uploading…
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload photo ({images.length}/{MAX_FILES})
              </>
            )}
          </button>
          <p className="text-xs text-gray-400 mt-1 text-center">JPG, PNG, or WebP · max 5 MB each</p>
        </div>
      )}

      {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
    </div>
  );
}
