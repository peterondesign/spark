const { createClient } = require('@sanity/client');
const dotenv = require('dotenv');
const { resolve } = require('path');
const OpenAI = require('openai');

// Load environment variables from .env.local file
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const token = process.env.SANITY_API_TOKEN;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!token) {
  console.error('ERROR: SANITY_API_TOKEN is missing in your .env.local file');
  process.exit(1);
}

if (!openaiApiKey) {
  console.error('ERROR: OPENAI_API_KEY is missing in your .env.local file');
  process.exit(1);
}

const client = createClient({
  projectId: 'dyrlcvtu',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: token
});

// Initialize OpenAI with the new API structure
const openai = new OpenAI({
  apiKey: openaiApiKey
});

const generateContent = async (prompt) => {
  try {
    console.log('Sending prompt to OpenAI...');
    // Using the newer chat completion API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates engaging blog content about local date ideas and activities for couples.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });
    console.log('Response received from OpenAI');
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating content with OpenAI:', error);
    throw error;
  }
};

const createBlogPost = async (title, slug, excerpt, mainImageUrl, prompt) => {
  try {
    console.log('Generating content with OpenAI...');
    const bodyContent = await generateContent(prompt);
    console.log('Content generated successfully!');

    // Format the content into Sanity blocks
    const bodyBlocks = bodyContent.split('\n\n').map((paragraph, index) => ({
      _type: 'block',
      _key: `paragraph_${index}`,
      style: paragraph.startsWith('# ') ? 'h1' : 
             paragraph.startsWith('## ') ? 'h2' : 
             paragraph.startsWith('### ') ? 'h3' : 'normal',
      children: [
        {
          _type: 'span',
          _key: `span_${index}`,
          text: paragraph.replace(/^#+ /, '').trim() // Remove markdown headings
        }
      ]
    }));

    const blogPostContent = {
      _type: 'blogPost',
      title,
      slug: { _type: 'slug', current: slug },
      publishedAt: new Date().toISOString(),
      excerpt,
      mainImage: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: mainImageUrl
        }
      },
      body: bodyBlocks
    };

    const existingDoc = await client.fetch(
      `*[_type == "blogPost" && slug.current == $slug][0]`,
      { slug }
    );

    if (existingDoc) {
      console.log('Document already exists. Updating...');
      const updatedDoc = await client.patch(existingDoc._id).set(blogPostContent).commit();
      console.log('Updated document:', updatedDoc._id);
    } else {
      console.log('Creating new document...');
      const newDoc = await client.create(blogPostContent);
      console.log('Created document:', newDoc._id);
    }
  } catch (error) {
    console.error('Error creating or updating blog post:', error);
  }
};

// Execute the blog post creation with local date idea keywords
createBlogPost(
  'Date Ideas Near Me: Finding the Perfect Spots & Activities for Couples',
  'date-ideas-near-me',
  'Searching for "date ideas near me"? Discover the best date night activities, cozy spots, and unique experiences for couples in your area, from romantic dinners to adventurous outings.',
  'image-asset-id', // Replace with the actual asset ID of the image in your Sanity project
  `Create a comprehensive, engaging blog post about local date ideas targeting these keywords: "date ideas near me", "date night activities near me", "date spots near me", "fun date ideas near me for couples", and "date night places near me".

  The content should:
  
  1. Begin with an introduction that empathizes with the reader's search for local date options and mentions the primary keyword "date ideas near me" naturally
  
  2. Include a section explaining how to use location-based searches to find perfect date spots in any area
  
  3. Create distinct sections for different types of local date ideas:
     - Romantic restaurants and "date night places near me"
     - Active "date activities near me" (outdoor adventures, classes, etc.)
     - Unique "date experiences near me" (food tours, sunset cruises, etc.)
     - "Cozy date spots near me" (cafes, bookstores, etc.)
     - "Late night activities for couples near me" (stargazing, dessert spots, etc.)
     - "Adult date activities near me" (wine tastings, comedy clubs, etc.)
     - Budget-friendly "date ideas near me for couples"
  
  4. For each category, include:
     - 5-7 specific activity suggestions that would work in most locations
     - Tips for finding the best version of each activity locally
     - A brief explanation of why it makes for a great date
  
  5. Add a section about seasonal date ideas near me (what works best in summer, fall, winter, spring)
  
  6. Include a practical paragraph about using Google Maps, Yelp, or date planning tools to find exact locations for these date ideas
  
  7. Close with an encouraging call-to-action inviting readers to explore date options in their area
  
  The tone should be warm, helpful, and conversational. Make it feel like advice from a knowledgeable friend, not generic content. Use second-person "you" language to make it personal.
  
  Format the content with proper headings (use markdown # for h1, ## for h2, ### for h3) to create a well-structured article that's easy to scan. Naturally incorporate all keywords throughout the text without making it feel forced or repetitive.`
);