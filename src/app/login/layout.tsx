import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your MSI MOBILE.COM account to track orders and manage purchases.",
  alternates: {
    canonical: "/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
