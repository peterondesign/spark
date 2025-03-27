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
        { role: 'system', content: 'You are a helpful assistant that generates engaging blog content about ideal dates and romantic experiences.' },
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

// Execute the blog post creation targeting ideal date concepts
createBlogPost(
  'What is Your Ideal Date? Crafting the Perfect Evening for Every Personality',
  'what-is-your-ideal-date',
  'Wondering about the ideal date? Discover what makes a perfect date night for different personalities, plus creative ideas and first date advice to make your next outing unforgettable.',
  'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=2069&q=80',
  `Create an engaging, thoughtful blog post about the concept of an "ideal date" that targets these keywords: "ideal of a perfect date", "ideal date", "what would be your ideal date night", and "ideal first date answer".

  The content should:
  
  1. Begin with a warm, thoughtful introduction that explores what makes a date "ideal" and why the concept differs from person to person. Naturally incorporate the phrase "ideal of a perfect date".
  
  2. Include a section about how to discover your own "ideal date" preferences (considering factors like personality type, love language, interests, energy level, etc.)
  
  3. Explore different types of "ideal date night" scenarios based on personality types:
     - The Adventurous Type
     - The Foodie
     - The Intellectual
     - The Romantic
     - The Creative Soul
     - The Homebody
     - The Nature Lover
  
  4. For each personality type, provide:
     - A description of what might constitute their "ideal date"
     - 3-4 specific date ideas tailored to their preferences
     - Elements that would make the experience special for them
  
  5. Create a section specifically addressing "what would be your ideal date night" as a conversation topic, with:
     - Why this question reveals important compatibility information
     - How to thoughtfully answer this question
     - What to listen for in your date's answer
  
  6. Include a practical section about crafting the "ideal first date" with advice on:
     - Location selection
     - Activity planning
     - Conversation starters
     - How to be authentic while making a good impression
  
  7. Provide a thoughtful section on "ideal first date answer" examples that are genuine but impressive, with:
     - Sample answers for different personality types
     - What these answers reveal about the person
     - Why authenticity matters more than trying to impress
  
  8. Close with a warm conclusion that reminds readers that the true "ideal date" is one where both people feel comfortable being themselves
  
  The tone should be warm, thoughtful, and conversational - like relationship advice from a wise friend. Use "you" language frequently, include occasional personal touches or observations, and maintain a friendly, accessible style throughout.
  
  Format with proper markdown headings (# for main title, ## for sections, ### for subsections) to create a well-structured article that's easy to scan. Incorporate all keywords naturally without forcing them.`
);