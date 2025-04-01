import { Metadata } from 'next';
import { supabase } from "@/utils/supabaseClient";
import { generateMetadata as generatePageMetadata } from "../../../utils/metadataUtils";

// Dynamic metadata generation for this route
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Fetch the specific date idea data to generate accurate metadata
  const { data } = await supabase
    .from('date_ideas')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!data) {
    return generatePageMetadata({
      title: 'Date Idea Not Found | Spark',
      description: 'The requested date idea could not be found. Explore other date ideas for couples on Spark.',
      path: `/date-idea/${params.slug}`,
    });
  }

  // Create a dynamic meta description based on the date idea's content
  const metaDescription = data.description 
    ? `${data.title}: ${data.description.substring(0, 120)}${data.description.length > 120 ? '...' : ''} - Find date ideas like this and more.`
    : `Discover everything about "${data.title}" and plan your perfect date with Spark's detailed guide and tips.`;

  return generatePageMetadata({
    title: `${data.title} | Date Ideas`,
    description: metaDescription,
    path: `/date-idea/${params.slug}`,
    // Use the actual image if available
    image: data.image || '/dateideas.png',
    // Add relevant keywords based on the date idea's properties
    keywords: [
      data.title,
      data.category,
      'date idea',
      'couple activity',
      data.price ? data.price.toLowerCase() : 'date',
      data.location ? (typeof data.location === 'string' ? data.location : 'local date') : 'date near me'
    ],
  });
}