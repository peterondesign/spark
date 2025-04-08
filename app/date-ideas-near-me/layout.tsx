import { Metadata } from "next";
import { getCanonicalUrl } from "../utils/canonicalUrl";

export const metadata: Metadata = {
  title: 'Date Ideas Near Me | Spark - Date Ideas',
  description: 'Discover the best date spots and activities near your location. Find local date ideas perfectly suited for your area.',
  alternates: {
    canonical: getCanonicalUrl('/date-ideas-near-me')
  }
};

export default function DateIdeasNearMeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}