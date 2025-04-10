import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import PageTitle from '../../../components/PageTitle';
import { PAGE_TITLES } from '../../../utils/titleUtils';
import { getCityBySlug } from '@/utils/cityService';



// Generate metadata for SEO
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  // Await the params Promise to get the actual slug value
  const { slug } = await props.params;
  
  const cityInfo = await getCityBySlug(slug);
  
  if (!cityInfo) {
    return {
      title: 'Location Not Found',
      description: 'We could not find date ideas for this location.'
    };
  }
  
  return {
    title: `Date Ideas in ${cityInfo.name} | Fun Date Night Activities`,
    description: `Discover the best date ideas and activities in ${cityInfo.name}. Find romantic adventures, unique experiences, and fun things to do as a couple.`,
    keywords: [`date ideas in ${cityInfo.name}`, 'date night', 'romantic activities', 'couples experiences', `things to do in ${cityInfo.name}`]
  };
}



  export default async function DateIdeasNearMeLocationPage(props: { 
    params: Promise<{ slug: string }> 
  }) {
    // Await the params Promise to get the actual slug value
    const { slug } = await props.params;

  const cityInfo = await getCityBySlug(slug);
  
  // If no city found for this slug, return 404
  if (!cityInfo) {
    notFound();
  }
  
  // Default category to show for this location
  const defaultCategory = "romantic activities";
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PageTitle title={`Date Ideas in ${cityInfo.name} | ${PAGE_TITLES.DATE_IDEAS_NEAR_ME || "Date Ideas Near Me"}`} />
      
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-cover bg-center py-20" style={{ backgroundImage: 'url(/placeholder.jpg)' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-rose-600/90 to-purple-800/90"></div>
        
        <div className="relative container mx-auto px-4 z-10">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Date Ideas in {cityInfo.name}</h1>
            <p className="text-xl mb-8">Discover amazing experiences for your next date night in {cityInfo.name}, {cityInfo.region || cityInfo.countryCode}</p>
          </div>
        </div>
      </section>
      
      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              Best Date Ideas in {cityInfo.name}
            </h2>
            
            <p className="text-gray-600 mb-8">
              We've gathered the best experiences from multiple sources so you can find the perfect date idea in {cityInfo.name}.
              Each activity opens in a new tab on the provider's website where you can learn more and book directly.
            </p>
            
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Romantic Activities in {cityInfo.name}</h3>
              </div>
              
              {/* Category Selection Tabs */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Explore More Date Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    "couples experiences",
                    "fun date ideas",
                    "unique experiences",
                    "outdoor adventures",
                    "indoor activities",
                    "food tours",
                  ].map((category) => (
                    <a 
                      key={category}
                      href={`/date-ideas-near-me/${slug}?category=${encodeURIComponent(category)}`}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-md text-sm font-medium text-center"
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </a>
                  ))}
                </div>
              </div>
              
              <div className="bg-rose-50 rounded-xl shadow-md p-6">
                <h3 className="text-xl font-semibold text-rose-800 mb-4">Local Insights for {cityInfo.name}</h3>
                <p className="text-gray-700">
                  {cityInfo.name} offers a variety of unique date experiences that highlight its local culture and attractions.
                  From scenic spots to hidden gems, explore our curated list of activities perfect for couples looking
                  to create special memories in this beautiful city.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular Date Spots */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Popular Date Spots in {cityInfo.name}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Romantic Restaurants", image: "/placeholder.jpg", query: "romantic dinner" },
              { name: "Outdoor Activities", image: "/placeholder.jpg", query: "outdoor activities" },
              { name: "Cultural Attractions", image: "/placeholder.jpg", query: "cultural experiences" },
              { name: "Nightlife & Entertainment", image: "/placeholder.jpg", query: "nightlife" },
              { name: "Day Trips", image: "/placeholder.jpg", query: "day trips" },
              { name: "Seasonal Activities", image: "/placeholder.jpg", query: "seasonal activities" },
            ].map((category) => (
              <div key={category.name} className="relative overflow-hidden rounded-xl shadow-md group">
                <a href={`/date-ideas-near-me/${slug}?category=${encodeURIComponent(category.query)}`}>
                  <div className="relative h-48">
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors z-10"></div>
                    <img
                      src={category.image}
                      alt={`${category.name} in ${cityInfo.name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <h3 className="text-white text-xl font-bold">{category.name}</h3>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Tips Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Tips for a Perfect Date in {cityInfo.name}</h2>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Best Time to Visit</h3>
                <p className="text-gray-600">
                  Consider the local climate and tourist seasons when planning your date. 
                  Some activities in {cityInfo.name} are seasonal or weather-dependent.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Transportation Tips</h3>
                <p className="text-gray-600">
                  Research the best ways to get around {cityInfo.name}. Consider public transportation,
                  rideshare options, or walking paths to make your date logistics stress-free.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Local Customs</h3>
                <p className="text-gray-600">
                  Familiarize yourself with any local customs or etiquette that might enhance your experience
                  in {cityInfo.name}, especially if you're visiting from another area.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}