import { Metadata } from "next";
import { getCanonicalUrl } from "../utils/canonicalUrl";

export const metadata: Metadata = {
  title: 'Dating Blog | Date Ideas',
  description: 'Discover relationship advice, dating tips, and creative date ideas in our dating blog to enhance your romantic experiences.',
  alternates: {
    canonical: getCanonicalUrl('/blog')
  }
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}