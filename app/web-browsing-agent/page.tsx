import WebBrowsingAgentDemo from '../components/WebBrowsingAgentDemo';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Web Browsing Agent - AI-Powered Activity Search | Date Ideas',
  description: 'Experience our elite 0.1% AI web browsing agent that finds real-time activity data with URLs, images, dates, and pricing information.',
  keywords: ['AI agent', 'web browsing', 'activity search', 'date ideas', 'OpenAI'],
};

export default function WebBrowsingAgentPage() {
  return (
    <>
      <Header />
      <WebBrowsingAgentDemo />
      <Footer />
    </>
  );
}
