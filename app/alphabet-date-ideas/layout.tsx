import { Metadata } from "next";
import { getCanonicalUrl } from "../utils/canonicalUrl";

export const metadata: Metadata = {
  title: 'Alphabet Date Ideas | Date Ideas',
  description: 'Explore our A-Z Alphabet Date Ideas ideas to add creativity and structure to your date nights with one activity for each letter.',
  alternates: {
    canonical: getCanonicalUrl('/alphabet-date-ideas')
  }
};

export default function AlphabetDatingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}