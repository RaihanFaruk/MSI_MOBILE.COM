import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Customer Support & Store Locations",
  description:
    "Get in touch with MSI MOBILE.COM Bangladesh for product inquiries, order assistance, official warranty claims, and store directions.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
