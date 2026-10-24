import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";
import ConsentBanner from "@/components/ConsentBanner";
import AdSlot from "@/components/AdSlot";
import { getActiveAdMap } from "@/lib/ad-slot-queries";
import { getStateConfig } from "@/lib/state-context";

export async function generateMetadata(): Promise<Metadata> {
  const { siteName, abbr, name, domain } = getStateConfig();
  return {
    title: {
      template: `%s | ${siteName}`,
      default: `${siteName} — Find things for kids in ${abbr}`,
    },
    description: `${name}'s family resource directory — find camps, classes, sports programs, childcare, birthday party venues, and things to do with kids near you.`,
    openGraph: {
      siteName,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: "/og-default.png",
          width: 1200,
          height: 630,
          alt: `${siteName} — Find things for kids in ${abbr}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
    },
    metadataBase: new URL(`https://${domain}`),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { siteName } = getStateConfig();
  const adMap = await getActiveAdMap();
  const sidebarCode = adMap["sidebar_300x600"] ?? "";

  return (
    <html lang="en">
      <body className="bg-white text-gray-900 font-sans antialiased">
        <ToastProvider>
          <Nav siteName={siteName} />
          <main>{children}</main>
          {sidebarCode && (
            <aside
              aria-label="Sponsored"
              className="hidden xl:block fixed right-4 top-28 w-[300px] z-30"
            >
              <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
                Advertisement
              </p>
              <AdSlot code={sidebarCode} minHeight={600} />
            </aside>
          )}
          <Footer />
          <ConsentBanner />
        </ToastProvider>
      </body>
    </html>
  );
}
