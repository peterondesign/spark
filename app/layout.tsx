import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] })

// Default metadata that will be used as fallback when no metadata is defined in page
export const metadata: Metadata = {
  title: "Spark - Find Your Perfect Date",
  description: "Discover unique and memorable date ideas tailored just for you",
  keywords: [
    "stay at home date ideas",
    "ideal first date answer",
    "relaxing date ideas",
    "best at home date night ideas",
    "afternoon date ideas",
    "sunday date ideas",
    "date ideas for teenagers",
    "first date ideas for teens",
    "date ideas for teens",
    "cute date ideas for teens",
    "things for couples to do near me",
    "fun things to do for date night near me",
    "romantic date ideas for older couples",
    "fancy date",
    "expensive date ideas",
    "weeknight date ideas",
    "date ideas outside",
    "outdoor activities for couples",
    "outdoor date ideas",
    "places to go on a date near me",
    "date night questions",
    "date night topics",
    "fun couple things to do near me",
    "romantic things to do for your girlfriend",
    "date night bucket list",
    "date bucket list",
    "romantic candle light dinner",
    "cheap anniversary ideas",
    "date activities near me",
    "Best date ideas",
    "Romantic date ideas",
    "Unique date ideas",
    "Fun date ideas",
    "Creative date ideas"
  ],
  other: {
    'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=31536000'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="alternate" hrefLang="en" href="https://www.sparkus.cc/" />
        <link rel="alternate" hrefLang="de" href="https://www.sparkus.cc/de/" />
      </head>
      <body className={plusJakartaSans.className}>{children}</body>
    </html>
  )
}