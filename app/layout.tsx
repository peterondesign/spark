import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { ThemeProvider } from '@/components/theme-provider';
import Script from 'next/script';

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] })

// Base metadata that can be extended by individual pages
// Each page should define its own unique title and description
export const metadata: Metadata = {
  // Default title and description will be overridden by page-specific values
  // These act only as a fallback and should rarely be used directly
  title: {
    template: '%s | Spark - Date Ideas',
    default: 'Spark - Personalized Date Ideas For Couples',
  },
  description: 'Discover personalized date ideas and experiences for couples.',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 
          Proper implementation of hreflang attributes
          Each specific page should define its own set of alternates in its metadata
          Here we define only the root alternates
        */}
        <link
          rel="canonical"
          href="https://www.sparkus.cc/"
        />
        {/* These will be properly extended by each page's metadata.alternates */}
      </head>
      <body className={plusJakartaSans.className}>
        {/* Microsoft Clarity analytics tracking script */}
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "qx9ogw0g2g");
            `
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}