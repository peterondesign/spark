import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Date Ideas & Date Night Inspiration | Spark",
  description: "Discover unique and memorable date ideas near me. Find perfect date night ideas tailored just for you and your partner. Plan your next special evening with our creative date inspiration.",
  keywords: "date ideas, date night ideas, date ideas near me, romantic date ideas, creative date night, unique date ideas, date planning, couples activities, date night box subscription",
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

// Page-specific metadata
export const dateNightBoxMetadata: Metadata = {
  title: "Date Night Box Subscription | Themed Date Night Boxes | Spark",
  description: "Subscribe to our premium date night box service. Each month receive a themed box with everything needed for a perfect date night at home. Romantic, adventurous, and relaxing date experiences delivered to your door.",
  keywords: "date night box subscription, date night box, date night subscription, date night ideas, date box, monthly date night, couples subscription box, date night, relationship gifts",
  openGraph: {
    title: "Date Night Box Subscription | Monthly Themed Date Night Boxes",
    description: "Subscribe to our premium date night boxes. Each month receive everything needed for a perfect date night at home.",
    url: "https://sparkus.cc/date-night-box-subscription",
    siteName: "Spark - Date Ideas",
    images: [
      {
        url: "https://sparkus.cc/dateideas.png",
        width: 1200,
        height: 630,
        alt: "Date Night Box Subscription",
      },
    ],
    locale: "en_US",
    type: "website",
  }
}
