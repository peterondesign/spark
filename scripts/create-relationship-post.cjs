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
        { role: 'system', content: 'You are a helpful assistant that generates engaging blog content about relationships and dating.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
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

// Execute the blog post creation with the relationship-themed keywords
createBlogPost(
  'Fun Things to Do With Your Partner: 50+ Activities to Strengthen Your Relationship',
  'things-to-do-with-your-partner',
  'Looking for fun things to do with your girlfriend or boyfriend? Discover over 50 activities to try with your partner that will create lasting memories and strengthen your bond.',
  'image-asset-id', // Replace with the actual asset ID of the image in your Sanity project
  `Create a comprehensive, engaging blog post about activities couples can do together. Target these keywords: "things to do with your girlfriend", "fun things to do with your gf", "sweet things to do for your boyfriend", and "new things to try with your partner".

  The content should:
  
  1. Start with a warm, relatable introduction about how quality time strengthens relationships
  
  2. Include at least 50 activities organized into categories like:
     - Fun outdoor activities
     - Cozy indoor ideas
     - Creative date ideas
     - Sweet gestures for your partner
     - Adventurous experiences to try together
     - Budget-friendly options
  
  3. For each activity, include:
     - A brief, enthusiastic description
     - Why it's beneficial for the relationship
     - A practical tip or suggestion to make it special
  
  4. Include personal touches that make the content feel genuine and not AI-generated
  
  5. Add interesting headings and subheadings that naturally incorporate the target keywords
  
  6. End with an encouraging call-to-action that invites readers to try these activities
  
  The tone should be warm, friendly, and conversational - like advice from a friend, not a robot. Use second-person "you" language frequently.
  
  Format the content with proper headings (use markdown # for h1, ## for h2, ### for h3) to create a well-structured article that's easy to scan.`
);