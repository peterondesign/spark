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
        { role: 'system', content: 'You are a helpful assistant that generates engaging blog content about daytime date ideas with a focus on weekend and Sunday activities.' },
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

// Execute the blog post creation targeting daytime date ideas
createBlogPost(
  'Sunday Afternoon Date Ideas: 30 Daytime Activities for Couples',
  'sunday-afternoon-date-ideas',
  'Looking for the perfect afternoon date? Discover our collection of Sunday afternoon date ideas, daytime activities, and mid-day adventures to enjoy with your partner.',
  'image-asset-id', // Replace with the actual asset ID of the image in your Sanity project
  `Create an engaging blog post about daytime date ideas with a focus on Sunday activities. Target these keywords: "Sunday afternoon date ideas", "afternoon date ideas", "daytime date", "Sunday date ideas", and "best day date ideas".

  The content should:
  
  1. Start with a warm introduction about why daytime dates are special and underrated compared to evening dates. Mention "Sunday afternoon date ideas" naturally in the opening paragraph.
  
  2. Include a section about the benefits of "afternoon date" activities (more energy, better lighting for photos, cheaper prices, less crowded venues, etc.)
  
  3. Create these categories of daytime date ideas with 5-7 specific suggestions in each:
     - "Sunday date ideas" that take advantage of weekend leisure time
     - Outdoor "afternoon date ideas" for nature lovers (parks, botanical gardens, etc.)
     - Culinary "daytime date" experiences (brunch, food markets, etc.)
     - Cultural "Sunday afternoon date ideas" (museums, art galleries, etc.)
     - Active "activities during the day" for energetic couples
     - Relaxing "mid day date ideas" for laid-back couples
     - Seasonal "best day date ideas" for each time of year
  
  4. For each date idea, include:
     - A descriptive title
     - Why it works especially well during daytime
     - A specific tip or creative twist to make it special
     - Approximate time needed
  
  5. Add a section about planning the perfect "whole day date ideas" with sample itineraries that combine multiple activities
  
  6. Include practical advice about timing, what to bring, and how to transition between activities for "best daytime date ideas"
  
  7. Close with a warm conclusion encouraging readers to try these Sunday afternoon date ideas
  
  The tone should be enthusiastic, warm, and conversational. Make it feel like recommendations from a friend rather than generic advice. Use "you" language frequently and include occasional personal touches or anecdotes to make it feel authentic.
  
  Format with proper markdown headings (# for main title, ## for sections, ### for subsections) to create a well-structured article that's easy to scan. Incorporate all keywords naturally without forcing them.`
);