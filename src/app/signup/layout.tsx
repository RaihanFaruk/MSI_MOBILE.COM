import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Register for an account on MSI MOBILE.COM Bangladesh for quick checkout and live order updates.",
  alternates: {
    canonical: "/signup",
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
