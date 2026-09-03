import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
  description: "Customer profile, delivery addresses, and purchase history at MSI MOBILE.COM Bangladesh.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
