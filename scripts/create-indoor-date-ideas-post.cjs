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
        { role: 'system', content: 'You are a helpful assistant that generates engaging blog content about indoor date ideas and activities for couples.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2500,
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

// Execute the blog post creation targeting indoor date ideas
createBlogPost(
  'Indoor Date Ideas: Fun and Cozy Activities for Couples',
  'indoor-date-ideas',
  'Looking for fun indoor date ideas? Discover creative and cozy activities for couples, perfect for rainy days or staying in.',
  'image-asset-id', // Replace with the actual asset ID of the image in your Sanity project
  `Create a comprehensive, engaging blog post about indoor date ideas targeting these keywords: "indoor date ideas", "indoor date activities", "rainy day date ideas", "date ideas inside", "indoor activities for couples", and "fun indoor date ideas".

  The content should:
  
  1. Start with a warm introduction about why indoor dates are a great way to connect, especially during bad weather or when staying in. Naturally incorporate the phrase "indoor date ideas" in the opening.
  
  2. Include a brief section on the benefits of indoor dates:
     - Comfortable and cozy
     - Budget-friendly
     - Great for creativity and bonding
  
  3. Organize the indoor date ideas into clear categories (at least 30 ideas total):
     - "Fun indoor date ideas" for active couples (board games, DIY projects, etc.)
     - "Rainy day date ideas" for cozy vibes (movie marathons, baking, etc.)
     - "Indoor activities for couples" who love to learn (online classes, puzzles, etc.)
     - "Date ideas inside" for foodies (cooking together, wine tasting, etc.)
     - Seasonal "indoor date ideas" for each time of year
     - Budget-friendly "indoor date activities" for couples on a budget
  
  4. For each date idea, include:
     - A descriptive title
     - Why it works well for an indoor date
     - A tip to make it special or unique
  
  5. Add a section on planning the perfect indoor date:
     - How to set the mood (lighting, music, etc.)
     - Tips for choosing activities both partners will enjoy
     - How to keep the vibe fun and relaxed
  
  6. Include a practical section on "rainy day date ideas" for couples:
     - Activities that work well when the weather keeps you inside
     - How to make the most of a rainy day
     - Ideas for indoor adventures at home or nearby
  
  7. Close with an encouraging conclusion about how indoor dates can be just as fun and memorable as going out
  
  The tone should be enthusiastic, friendly, and conversational. Write as if you're sharing your best indoor date tips with a close friend. Use "you" language frequently and include occasional personal touches to make it relatable and authentic.
  
  Format with proper markdown headings (# for main title, ## for sections, ### for subsections) to create a well-structured article that's easy to scan. Incorporate all keywords naturally throughout the text.`
);