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
        { role: 'system', content: 'You are a helpful assistant that generates engaging blog content about double date ideas and group activities.' },
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

// Execute the blog post creation targeting double date ideas
createBlogPost(
  'Double Date Ideas: Fun Activities for Couples to Enjoy Together',
  'double-date-ideas',
  'Looking for fun double date ideas? Discover creative activities, group date ideas, and the best double date ideas for young couples to make your outing unforgettable.',
  'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=2070&q=80',
  `Create a comprehensive, engaging blog post about double date ideas targeting these keywords: "double date ideas", "double date activities", "fun double date ideas", "group date ideas", "fun double date activities", and "best double date ideas".

  The content should:
  
  1. Start with a warm introduction about why double dates are a great way to bond with friends and strengthen relationships. Naturally incorporate the phrase "double date ideas" in the opening.
  
  2. Include a brief section on the benefits of double dates:
     - Strengthens friendships
     - Adds variety to your dating routine
     - Encourages teamwork and shared experiences
  
  3. Organize the double date ideas into clear categories (at least 30 ideas total):
     - "Fun double date ideas" for adventurous couples (escape rooms, hiking, etc.)
     - "Group date ideas" for larger gatherings (game nights, trivia, etc.)
     - "Double date activities" for foodies (cooking classes, food tours, etc.)
     - "Best double date ideas" for young couples (karaoke, mini-golf, etc.)
     - Seasonal "double date ideas" for each time of year
     - Budget-friendly "fun double date activities" for couples on a budget
  
  4. For each date idea, include:
     - A descriptive title
     - Why it works well for a double date
     - A tip to make it special or unique
  
  5. Add a section on planning the perfect double date:
     - How to coordinate schedules
     - Tips for choosing activities everyone will enjoy
     - How to keep the vibe fun and relaxed
  
  6. Include a practical section on "group date ideas" for larger friend groups:
     - Activities that work well for groups of 4-8 people
     - How to manage group dynamics
     - Ideas for indoor and outdoor group dates
  
  7. Close with an encouraging conclusion about how double dates are a fun way to create lasting memories with friends
  
  The tone should be enthusiastic, friendly, and conversational. Write as if you're sharing your best double date tips with a close friend. Use "you" language frequently and include occasional personal touches to make it relatable and authentic.
  
  Format with proper markdown headings (# for main title, ## for sections, ### for subsections) to create a well-structured article that's easy to scan. Incorporate all keywords naturally throughout the text.`
);