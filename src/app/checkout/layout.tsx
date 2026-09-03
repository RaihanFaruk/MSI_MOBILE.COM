import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Checkout",
  description: "Complete your authentic gadget purchase with fast delivery across Bangladesh.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
