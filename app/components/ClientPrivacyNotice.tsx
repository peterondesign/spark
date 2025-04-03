'use client';

import dynamic from 'next/dynamic';

// Dynamically import the privacy notice with no SSR to avoid hydration issues
const MicrosoftPrivacyNotice = dynamic(
  () => import('./MicrosoftPrivacyNotice'),
  { ssr: false }
);

export default function ClientPrivacyNotice() {
  return <MicrosoftPrivacyNotice />;
}