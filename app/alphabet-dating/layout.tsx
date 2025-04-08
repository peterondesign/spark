import { Metadata } from "next";
import { getCanonicalUrl } from "../utils/canonicalUrl";

export const metadata: Metadata = {
  title: 'Alphabet Dating | Spark - Date Ideas',
  description: 'Explore our A-Z alphabet dating ideas to add creativity and structure to your date nights with one activity for each letter.',
  alternates: {
    canonical: getCanonicalUrl('/alphabet-dating')
  }
};

export default function AlphabetDatingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}