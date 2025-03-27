import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Date Ideas & Date Night Inspiration | Spark",
  description: "Discover unique and memorable date ideas near me. Find perfect date night ideas tailored just for you and your partner. Plan your next special evening with our creative date inspiration.",
  keywords: "date ideas, date night ideas, date ideas near me, romantic date ideas, creative date night, unique date ideas, date planning, couples activities",
  openGraph: {
    title: "Date Ideas & Date Night Inspiration | Spark",
    description: "Discover unique and memorable date ideas near me. Find perfect date night ideas tailored just for you and your partner.",
    url: "https://sparkus.cc",
    siteName: "Spark - Date Ideas",
    images: [
      {
        url: "https://sparkus.cc/dateideas.png",
        width: 1200,
        height: 630,
        alt: "Date Ideas by Spark",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Date Ideas & Date Night Inspiration | Spark",
    description: "Discover unique and memorable date ideas near me. Find perfect date night ideas tailored just for you and your partner.",
    images: ["https://sparkus.cc/dateideas.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://sparkus.cc",
    languages: {
      "en": "https://sparkus.cc",
      "de": "https://sparkus.cc/de",
    },
  },
  generator: 'Spark Date Ideas'
}
