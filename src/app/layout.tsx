import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
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

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://msi-mobile-com.vercel.app"),
  title: {
    default: "MSI MOBILE.COM — Premium Tech, Smartphones & Laptops in Bangladesh",
    template: "%s | MSI MOBILE.COM",
  },
  description: "Official online store for authentic smartphones, gaming laptops, earbuds, smartwatches, and premium gadgets in Bangladesh with nationwide fast delivery and official warranty.",
  keywords: "MSI Mobile, smartphones Bangladesh, laptops, gadgets, Apple iPhone, Samsung Galaxy, gaming laptops, genuine tech Dhaka",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MSI MOBILE.COM — Premium Tech, Smartphones & Laptops in Bangladesh",
    description: "Official online store for authentic smartphones, gaming laptops, and accessories in Bangladesh.",
    url: "https://msi-mobile-com.vercel.app",
    siteName: "MSI MOBILE.COM",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MSI MOBILE.COM — Premium Tech in Bangladesh",
    description: "Official store for authentic smartphones, laptops, and gadgets in Bangladesh.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    name: "MSI MOBILE.COM",
    url: "https://msi-mobile-com.vercel.app",
    telephone: "+8801999600222",
    priceRange: "৳৳৳",
    address: {
      "@type": "PostalAddress",
      streetAddress: "4th Floor, Sena Shopping Complex",
      addressLocality: "Savar",
      addressRegion: "Dhaka",
      addressCountry: "BD",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "09:00",
        closes: "22:00",
      },
    ],
  };

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased font-sans bg-bg-white text-text-primary selection:bg-brand-primary selection:text-white min-h-screen flex flex-col justify-between">
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
