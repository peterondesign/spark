import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { ThemeProvider } from '@/components/theme-provider';
import Script from 'next/script';
import ClientPrivacyNotice from './components/ClientPrivacyNotice';
import { SanityLive } from "@/sanity/lib/live";
import { SpeedInsights } from "@vercel/speed-insights/next"


// Declare the global property on the Window interface
declare global {
  interface Window {
    gygScriptBlocked?: boolean;
    pa?: any;
  }
}

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
  // Get the base URL from environment or use the default
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sparkus.cc';
  
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
          href={baseUrl}
        />
        {/* These will be properly extended by each page's metadata.alternates */}
      </head>
      <body className={plusJakartaSans.className} suppressHydrationWarning={true}>
        {/* SanityLive component to enable live content updates */}
        <SanityLive />

        {/* GetYourGuide script with error detection */}
        <Script
          id="getyourguide-widget"
          src="https://widget.getyourguide.com/dist/pa.umd.production.min.js"
          data-gyg-partner-id="5QQHAHP"
          strategy="afterInteractive"
        />

        {/* Script to detect if ad blocker is preventing script load */}
        <Script
          id="adblock-detection"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Check if GetYourGuide script was blocked after a delay
              setTimeout(function() {
                if (window.gygScriptBlocked || !window.pa) {
                  console.warn('GetYourGuide widget might be blocked by an ad blocker.');
                  
                  // You can add code here to show a notification to the user
                  // For example:
                  // const notification = document.createElement('div');
                  // notification.innerHTML = 'Some features may not work correctly due to ad blocking. Please consider disabling your ad blocker for this site.';
                  // notification.style.cssText = 'position:fixed;bottom:10px;right:10px;background:#fff3cd;color:#856404;padding:10px;border-radius:4px;max-width:300px;z-index:9999;';
                  // document.body.appendChild(notification);
                }
              }, 3000);
            `
          }}
        />

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

        {/* Google Analytics tracking scripts */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EG77KJZHS4"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-EG77KJZHS4');
            `
          }}
        />
        <SpeedInsights />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ClientPrivacyNotice />
        </ThemeProvider>
      </body>
    </html>
  )
}