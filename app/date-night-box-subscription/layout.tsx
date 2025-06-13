import { Metadata } from "next";
import { getCanonicalUrl } from "../utils/canonicalUrl";

export const metadata: Metadata = {
  title: 'Date Night Box Subscription | Date Ideas',
  description: 'Get curated date night boxes delivered to your door with our subscription service. Perfect for couples looking to keep their relationship fresh and exciting.',
  alternates: {
    canonical: getCanonicalUrl('/date-night-box-subscription')
  }
};

export default function DateNightBoxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}