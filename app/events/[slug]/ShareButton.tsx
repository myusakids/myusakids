"use client";

interface Props {
  title: string;
}

export default function ShareButton({ title }: Props) {
  function handleShare() {
    if (navigator.share) {
      navigator.share({ title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert("Link copied to clipboard!");
      });
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl hover:border-brand-green hover:text-brand-green transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      Share
    </button>
  );
}
