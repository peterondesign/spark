import { Metadata } from "next";
import { getCanonicalUrl } from "../utils/canonicalUrl";

export const metadata: Metadata = {
  title: 'Terms & Conditions | Date Ideas',
  description: 'Terms and conditions for using Spark date ideas service. Read our policies on affiliate links, subscriptions, refunds, and more.',
  alternates: {
    canonical: getCanonicalUrl('/terms')
  }
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}