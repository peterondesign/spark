import { Metadata } from "next";
import { getCanonicalUrl } from "../utils/canonicalUrl";

export const metadata: Metadata = {
  title: 'Favorite Date Ideas | Date Ideas',
  description: 'Access your saved favorite date ideas to quickly find and plan your next perfect date night.',
  alternates: {
    canonical: getCanonicalUrl('/favorites')
  }
};

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}