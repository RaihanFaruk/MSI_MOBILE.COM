import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "View and manage items in your shopping cart on MSI MOBILE.COM Bangladesh.",
  alternates: {
    canonical: "/cart",
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
