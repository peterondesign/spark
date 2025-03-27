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
    // Using the newer chat completion API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates engaging blog content.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });
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
    // This is a simple implementation - for more complex formatting, 
    // you might want to parse the generated content into multiple blocks
    const bodyBlocks = bodyContent.split('\n\n').map((paragraph, index) => ({
      _type: 'block',
      _key: `paragraph_${index}`,
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: `span_${index}`,
          text: paragraph.trim()
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

// Execute the blog post creation
createBlogPost(
  'Date Idea Generator: Find Your Perfect Date Night',
  'date-idea-generator',
  'Overwhelmed by planning a date? Discover unique, fun, and personalized date ideas with our intuitive date idea generator.',
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1740&q=80',
  `Create a long-form blog post about date ideas targeting the keywords "date idea generator", "date night generator", and "random date idea generator".

  The content should:
  - Open with a relatable hook about being overwhelmed by planning dates and wanting something unique
  - Introduce a date idea generator solution with filters for mood, season, budget, or surprise factor
  - Include all three target keywords naturally in headings, subheadings, and intro
  - Offer at least 20 unique, engaging date ideas categorized by type (adventurous, cozy, spontaneous, etc.)
  - Include personal touches and little scenarios to make it feel human, not robotic
  - Close with a call-to-action to try the date night generator
  
  The tone should be fun, casual, and human. Make it feel personal and tailored.`
);