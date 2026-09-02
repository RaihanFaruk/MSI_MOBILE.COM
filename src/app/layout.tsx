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
  title: "MSI MOBILE.COM — Premium Tech, Smartphones & Laptops in Bangladesh",
  description: "Official online store for authentic smartphones, gaming laptops, earbuds, smartwatches, and premium gadgets in Bangladesh with nationwide fast delivery and official warranty.",
  keywords: "MSI Mobile, smartphones Bangladesh, laptops, gadgets, Apple iPhone, Samsung Galaxy, gaming laptops, genuine tech Dhaka",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
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
