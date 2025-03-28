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
        { role: 'system', content: 'You are a helpful assistant that generates engaging blog content about planning romantic and relaxing date nights.' },
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

// Execute the blog post creation targeting relaxing and romantic date ideas
createBlogPost(
  'How to Plan the Perfect Romantic Date Night',
  'how-to-plan-the-perfect-date-night',
  'Discover relaxing date ideas, romantic at-home date night plans, and tips for planning the perfect date with your partner.',
  'image-asset-id', // Replace with the actual asset ID of the image in your Sanity project
  `Create a comprehensive, engaging blog post about planning romantic and relaxing date nights targeting these keywords: "relaxing date ideas", "how to plan a date night", "best at home date night ideas", "how to plan a date with a girl", "how to have a romantic night at home", and "how to plan the perfect date".

  The content should:
  
  1. Start with a warm introduction about the importance of planning thoughtful and relaxing date nights. Naturally incorporate the phrase "how to plan the perfect date" in the opening.
  
  2. Include a brief section on the benefits of relaxing date nights:
     - Strengthens emotional connection
     - Reduces stress
     - Creates lasting memories
  
  3. Organize the date ideas into clear categories (at least 20 ideas total):
     - "Relaxing date ideas" for unwinding together (spa nights, stargazing, etc.)
     - "Best at home date night ideas" for cozy evenings (cooking together, movie nights, etc.)
     - "How to have a romantic night at home" with creative setups (candlelit dinners, DIY wine tastings, etc.)
     - "How to plan a date with a girl" with thoughtful gestures (surprise plans, personalized activities, etc.)
  
  4. For each date idea, include:
     - A descriptive title
     - Why it works well for a romantic or relaxing date
     - A tip to make it special or unique
  
  5. Add a section on planning the perfect date night:
     - How to set the mood (lighting, music, etc.)
     - Tips for choosing activities both partners will enjoy
     - How to keep the vibe fun and relaxed
  
  6. Include a practical section on "how to plan a date with a girl":
     - Ideas for first dates
     - How to make her feel special
     - Tips for being thoughtful and attentive
  
  7. Close with an encouraging conclusion about how planning thoughtful date nights can strengthen your relationship
  
  The tone should be warm, friendly, and conversational. Write as if you're sharing your best romantic date tips with a close friend. Use "you" language frequently and include occasional personal touches to make it relatable and authentic.
  
  Format with proper markdown headings (# for main title, ## for sections, ### for subsections) to create a well-structured article that's easy to scan. Incorporate all keywords naturally throughout the text.`
);