import { createClient } from '@sanity/client';

// Create Sanity client with proper configuration
export const client = createClient({
  projectId: 'dyrlcvtu',
  dataset: 'production',
  useCdn: process.env.NODE_ENV === 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN, // Add token for authenticated requests
});

// Create a second Sanity client for the local dataset
export const localClient = createClient({
  projectId: 'dyrlcvtu',
  dataset: 'local',
  useCdn: false, // Avoid caching for local development
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
});

// Helper function to build an image URL
export const urlFor = (source: any) => {
  return `${source}`;
};

// Helper to fetch blog posts
export async function getPosts() {
  try {
    const productionPosts = await client.fetch(`*[_type == "post" || _type == "blogPost"] | order(publishedAt desc){
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      mainImage,
      "categories": categories[]->title
    }`);

    const localPosts = await localClient.fetch(`*[_type == "post" || _type == "blogPost"] | order(publishedAt desc){
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      mainImage,
      "categories": categories[]->title
    }`);

    // Merge and deduplicate posts by _id
    const allPosts = [...productionPosts, ...localPosts].reduce((acc, post) => {
      if (!acc.find((p: {_id: string}) => p._id === post._id)) {
        acc.push(post);
      }
      return acc;
    }, []);

    return allPosts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

// Helper to fetch a single post by slug
export async function getPost(slug: string) {
  try {
    // Updated query to include both "post" and "blogPost" document types
    return await client.fetch(
      `*[(_type == "post" || _type == "blogPost") && slug.current == $slug][0]{
        _id,
        title,
        slug,
        publishedAt,
        excerpt,
        mainImage,
        body,
        "categories": categories[]->title,
        "author": author->{name, image}
      }`,
      { slug }
    );
  } catch (error) {
    console.error(`Error fetching post with slug ${slug}:`, error);
    return null;
  }
}

// Helper to fetch location-based date ideas - handle both old and new data models
export async function getLocationDateIdeas() {
  try {
    console.log('Fetching all location date ideas...');
    
    // Try the original query first (locationDateIdea)
    const locationDateIdeas = await client.fetch(`*[_type == "locationDateIdea"] | order(publishedAt desc){
      _id,
      title,
      slug,
      location,
      locationSlug,
      publishedAt,
      excerpt,
      mainImage,
      keywords,
      searchVolume,
      "categories": categories[]->title
    }`);
    
    // If no results, try the alternative 'location' type
    if (!locationDateIdeas || locationDateIdeas.length === 0) {
      console.log('No locationDateIdea documents found, trying location type...');
      const locations = await client.fetch(`*[_type == "location"] | order(title asc) {
        _id,
        title,
        locationSlug,
        description,
        mainImage,
        publishedAt,
        "dateIdeasCount": count(*[_type == "dateIdea" && references(^._id)])
      }`);
      
      // Format locations to match expected structure
      return locations.map((loc: any) => ({
        _id: loc._id,
        title: `Date Ideas in ${loc.title}`,
        slug: loc.locationSlug,
        location: loc.title,
        locationSlug: loc.locationSlug,
        publishedAt: loc.publishedAt || new Date().toISOString(),
        excerpt: loc.description || `Discover the best date ideas in ${loc.title}`,
        mainImage: loc.mainImage,
        keywords: [`${loc.title} date ideas`],
        searchVolume: 0,
        categories: []
      }));
    }
    
    return locationDateIdeas;
  } catch (error) {
    console.error("Error fetching location date ideas:", error);
    // Log the full error details to help diagnose
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error; // Rethrow so UI can handle it
  }
}

// Helper to fetch date ideas by location
export async function getDateIdeasByLocation(locationSlug: string) {
  try {
    console.log(`Fetching date ideas for location slug: ${locationSlug}`);
    
    // First, try to get a single locationDateIdea document by locationSlug
    const singleLocationDoc = await client.fetch(`
      *[_type == "locationDateIdea" && locationSlug.current == $locationSlug][0] {
        _id,
        title,
        slug,
        location,
        locationSlug,
        publishedAt,
        excerpt,
        mainImage,
        body,
        dateIdeas,
        keywords,
        searchVolume
      }
    `, { locationSlug });

    if (singleLocationDoc) {
      console.log(`Found locationDateIdea document for ${locationSlug}`);
      // Return in format expected by UI
      return {
        locationInfo: {
          title: singleLocationDoc.title,
          description: singleLocationDoc.excerpt,
          mainImage: singleLocationDoc.mainImage
        },
        dateIdeas: singleLocationDoc.dateIdeas?.map((idea: any) => ({
          _id: `${singleLocationDoc._id}-${idea.name}`,
          title: idea.name,
          slug: { current: idea.name.toLowerCase().replace(/\s+/g, '-') },
          excerpt: idea.description,
          mainImage: idea.image,
          price: idea.price,
          categories: []
        })) || []
      };
    }

    // If no locationDateIdea document found, try the alternative data structure
    console.log(`No locationDateIdea found, checking for location and dateIdea documents`);
    
    // Get the location information
    const locationInfo = await client.fetch(`
      *[_type == "location" && locationSlug.current == $locationSlug][0] {
        title,
        description,
        highlights,
        mainImage
      }
    `, { locationSlug });
    
    // Then, get all date ideas for this location
    const dateIdeas = await client.fetch(`
      *[_type == "dateIdea" && references(*[_type == "location" && locationSlug.current == $locationSlug]._id)] {
        _id,
        title,
        slug,
        excerpt,
        mainImage,
        categories[] {
          title
        },
        price
      }
    `, { locationSlug });
    
    console.log(`Found ${dateIdeas.length} dateIdea documents for location ${locationSlug}`);
    
    // Format the date ideas for display
    const formattedDateIdeas = dateIdeas.map((idea: any) => ({
      ...idea,
      mainImage: urlFor(idea.mainImage),
      categories: idea.categories?.map((c: any) => c.title) || []
    }));
    
    return {
      locationInfo: locationInfo ? {
        ...locationInfo,
        mainImage: locationInfo.mainImage ? urlFor(locationInfo.mainImage) : null
      } : null,
      dateIdeas: formattedDateIdeas
    };
  } catch (error) {
    console.error(`Error fetching date ideas for location ${locationSlug}:`, error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return { locationInfo: null, dateIdeas: [] };
  }
}

// Helper to fetch a single location-based date idea article
export async function getLocationDateIdea(slug: string) {
  try {
    return await client.fetch(
      `*[_type == "locationDateIdea" && slug.current == $slug][0]{
        _id,
        title,
        slug,
        location,
        locationSlug,
        publishedAt,
        excerpt,
        mainImage,
        body,
        dateIdeas,
        keywords,
        searchVolume,
        "categories": categories[]->title,
        "author": author->{name, image}
      }`,
      { slug }
    );
  } catch (error) {
    console.error(`Error fetching location date idea with slug ${slug}:`, error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return null;
  }
}