import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { StoreProvider } from "@/context/StoreContext";
import { CartDrawer } from "@/components/header/CartDrawer";
import { MobileDrawer } from "@/components/header/MobileDrawer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://msi-mobile-com.vercel.app"),
  title: {
    default: "MSI MOBILE.COM — Luxury Tech, Flagship Smartphones & Laptops in Bangladesh",
    template: "%s | MSI MOBILE.COM",
  },
  description: "Exclusive online boutique for authentic flagship smartphones, high-performance laptops, and premium audio & wearable tech in Bangladesh with official warranty and white-glove delivery.",
  keywords: "MSI Mobile, luxury smartphones, iPhone 16 Pro Max, Samsung Galaxy Ultra, gaming laptops, premium audio, flagship gadgets Dhaka",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MSI MOBILE.COM — Luxury Tech & Flagships in Bangladesh",
    description: "Exclusive boutique for authentic smartphones, gaming workstations, and luxury gadgets.",
    url: "https://msi-mobile-com.vercel.app",
    siteName: "MSI MOBILE.COM",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MSI MOBILE.COM — Luxury Tech in Bangladesh",
    description: "Official boutique for authentic smartphones, laptops, and luxury tech in Bangladesh.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased font-sans bg-bg-white text-text-primary selection:bg-gold-500 selection:text-obsidian-950 min-h-screen flex flex-col justify-between">
        <AuthProvider>
          <StoreProvider>
            {children}
            <CartDrawer />
            <MobileDrawer />
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
