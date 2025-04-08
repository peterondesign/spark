import { Metadata } from "next";
import { getCanonicalUrl } from "../utils/canonicalUrl";

export const metadata: Metadata = {
  title: 'Date Preferences | Spark - Date Ideas',
  description: 'Set your date preferences to get personalized date ideas tailored to your interests and preferences.',
  alternates: {
    canonical: getCanonicalUrl('/preferences')
  }
};

export default function PreferencesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}