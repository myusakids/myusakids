import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 font-sans antialiased">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
