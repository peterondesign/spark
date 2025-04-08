import { Metadata } from "next";
import { getCanonicalUrl } from "../utils/canonicalUrl";

export const metadata: Metadata = {
  title: 'Date Idea Generator | Spark - Date Ideas',
  description: 'Generate unique and personalized date ideas based on your preferences, budget, and location with our interactive date idea generator.',
  alternates: {
    canonical: getCanonicalUrl('/date-idea-generator')
  }
};

export default function DateIdeaGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}