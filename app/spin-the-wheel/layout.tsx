import { Metadata } from "next";
import { getCanonicalUrl } from "../utils/canonicalUrl";

export const metadata: Metadata = {
  title: 'Spin the Wheel | Spark - Date Ideas',
  description: 'Have fun selecting your next date idea with our interactive spin the wheel game. Let chance decide your next romantic adventure.',
  alternates: {
    canonical: getCanonicalUrl('/spin-the-wheel')
  }
};

export default function SpinTheWheelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}