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
        { role: 'system', content: 'You are a helpful assistant that generates engaging blog content about affordable and budget-friendly date ideas.' },
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

const createBlogPost = async (title, slug, excerpt, mainImage, prompt) => {
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
      mainImage,
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

// Execute the blog post creation targeting affordable date ideas
createBlogPost(
  '50 Inexpensive Date Ideas: Fun, Affordable Ways to Connect',
  'inexpensive-date-ideas',
  'Looking for cheap date ideas that don\'t feel cheap? Discover 50+ budget-friendly, affordable date night ideas that are creative, romantic, and won\'t empty your wallet.',
  'https://images.unsplash.com/photo-1522264746902-69e09fbb4abb?auto=format&fit=crop&w=2070&q=80',
  `Create a comprehensive, practical blog post about budget-friendly date ideas that targets these keywords: "inexpensive date ideas", "affordable date night ideas", "cheap date night ideas", "budget date ideas", "free date night ideas", and "low cost date ideas".

  The content should:
  
  1. Begin with a warm, relatable introduction about how meaningful dates don't have to be expensive. Address the challenge of wanting quality time without breaking the bank. Naturally incorporate the phrase "inexpensive date ideas" in the opening.
  
  2. Include a brief section on the benefits of budget-friendly dating:
     - Reduces financial pressure
     - Encourages creativity
     - Often leads to more meaningful connections
     - Allows for more frequent dates
  
  3. Organize the date ideas into clear categories (at least 50 ideas total):
     - Completely "free date night ideas" (parks, hiking, stargazing, etc.)
     - "Cheap date night ideas" under $20 (coffee shops, dessert dates, etc.)
     - "Affordable date night" experiences under $50 (budget restaurants, mini-golf, etc.)
     - At-home "budget date ideas" (movie nights, cooking together, etc.)
     - Seasonal "inexpensive date ideas" for each time of year
     - Outdoor "low cost date ideas" for nature lovers
     - Indoor "cheap date activities" for rainy days or winter
  
  4. For each date idea, include:
     - A descriptive title
     - Estimated cost range
     - Why it's fun/romantic despite being affordable
     - A tip to make it special or unique
  
  5. Add a section on "fun date night ideas near me" with tips for finding local budget-friendly activities:
     - How to search for free events in your area
     - Using deal sites and apps for discounts
     - Finding happy hours and special offers
     - Local parks, museums with free days, etc.
  
  6. Include a practical section on "affordable dates ideas" that feel luxurious:
     - How to elevate simple experiences
     - Creating ambiance on a budget
     - Small touches that make a big difference
  
  7. Add a section with sample date night itineraries combining multiple "cheap date activities" for different budgets ($0, $25, $50)
  
  8. Close with an encouraging conclusion about how the "best date night ideas" are about connection, not cost
  
  The tone should be enthusiastic, practical, and conversational. Write as if you're a savvy friend sharing your best money-saving date tips. Use "you" language frequently and include occasional personal touches to make it relatable and authentic.
  
  Format with proper markdown headings (# for main title, ## for sections, ### for subsections) to create a well-structured article that's easy to scan. Incorporate all keywords naturally throughout the text.`
);