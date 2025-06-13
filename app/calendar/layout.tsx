import { Metadata } from "next";
import { getCanonicalUrl } from "../utils/canonicalUrl";

export const metadata: Metadata = {
  title: 'Date Night Calendar | Date Ideas',
  description: 'Plan and schedule your date nights with our interactive calendar. Keep track of your upcoming dates and never miss a special moment.',
  alternates: {
    canonical: getCanonicalUrl('/calendar')
  }
};

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}