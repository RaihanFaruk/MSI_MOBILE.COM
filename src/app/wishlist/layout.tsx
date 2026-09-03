import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "Saved devices and gadgets in your wishlist at MSI MOBILE.COM Bangladesh.",
  alternates: {
    canonical: "/wishlist",
  },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
