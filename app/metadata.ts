import type { Metadata } from 'next';
import { generateMetadata as generatePageMetadata } from '../utils/metadataUtils';

// Home page metadata
export const metadata = generatePageMetadata({
  title: 'Find Date Ideas Near You | Spark',
  description: 'Discover personalized date ideas for couples near you. From romantic dates to fun activities, find the perfect experience for you and your partner.',
  path: '/',
  keywords: [
    'date ideas near me',
    'romantic date ideas',
    'fun date activities',
    'unique date ideas',
    'couple experiences'
  ],
});

// Page-specific metadata
export const dateNightBoxMetadata: Metadata = {
  title: "Date Night Box Subscription | Themed Date Night Boxes | Spark",
  description: "Subscribe to our premium date night box service. Each month receive a themed box with everything needed for a perfect date night at home. Romantic, adventurous, and relaxing date experiences delivered to your door.",
  keywords: ["date night box subscription", "date night box", "date night subscription", "date night ideas", "date box", "monthly date night", "couples subscription box", "date night", "relationship gifts"],
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
