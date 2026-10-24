import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";
import ConsentBanner from "@/components/ConsentBanner";
import AdSlot from "@/components/AdSlot";
import { getActiveAdMap } from "@/lib/ad-slot-queries";

export const metadata: Metadata = {
  title: {
    template: "%s | MyConnecticutKids",
    default: "MyConnecticutKids — Find things for kids in CT",
  },
  description:
    "Connecticut's family resource directory — find camps, classes, sports programs, childcare, birthday party venues, and things to do with kids near you.",
  openGraph: {
    siteName: "MyConnecticutKids",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "MyConnecticutKids — Find things for kids in CT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  metadataBase: new URL("https://myconnecticutkids.com"),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adMap = await getActiveAdMap();
  const sidebarCode = adMap["sidebar_300x600"] ?? "";

  return (
    <html lang="en">
      <body className="bg-white text-gray-900 font-sans antialiased">
        <ToastProvider>
          <Nav />
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
