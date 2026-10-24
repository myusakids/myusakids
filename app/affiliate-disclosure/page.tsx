import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure & Advertising",
  description:
    "How MyConnecticutKids earns money — affiliate links, display advertising, and sponsored placements.",
  alternates: { canonical: "/affiliate-disclosure" },
};

export default function AffiliateDisclosurePage() {
  return (
    <article className="max-w-2xl mx-auto px-4 py-10 prose prose-sm">
      <h1 className="text-2xl font-bold text-gray-900">
        Affiliate Disclosure &amp; Advertising
      </h1>

      <p className="text-gray-700 mt-4">
        MyConnecticutKids is a free resource for Connecticut families. To keep the
        site running we use two forms of monetization: affiliate links and display
        advertising.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-6">
        Amazon Associates
      </h2>
      <p className="text-gray-700">
        As an Amazon Associate, MyConnecticutKids earns from qualifying purchases.
        When you click an Amazon link on this site and buy something, Amazon pays us
        a small commission at no extra cost to you.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-6">
        Display advertising (Google AdSense)
      </h2>
      <p className="text-gray-700">
        We use Google AdSense to show ads. Google and its partners may use cookies
        to serve ads based on your previous visits to this and other sites. You can
        opt out of personalized advertising by visiting{" "}
        <a
          href="https://www.google.com/settings/ads"
          className="text-brand-green underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google&apos;s Ads Settings
        </a>
        .
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-6">
        Editorial independence
      </h2>
      <p className="text-gray-700">
        Advertising and affiliate relationships never influence which businesses,
        events, or activities we list or recommend. Listings are selected on merit
        and community value, not on who pays us.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-6">
        Managing consent
      </h2>
      <p className="text-gray-700">
        You can withdraw advertising consent at any time by clearing{" "}
        <code>mck-consent</code> from your browser&apos;s site storage, then
        reloading the page.
      </p>
    </article>
  );
}
