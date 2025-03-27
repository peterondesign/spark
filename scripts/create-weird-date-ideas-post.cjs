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
        { role: 'system', content: 'You are a helpful assistant that generates engaging blog content about unconventional and weird date ideas.' },
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

// Execute the blog post creation targeting weird and unconventional date ideas
createBlogPost(
  'Weird and Unconventional Date Ideas: Fun and Memorable Experiences',
  'weird-date-ideas',
  'Looking for something different? Discover weird, funny, and unconventional date ideas that will make your time together unforgettable.',
  'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=2070&q=80',
  `Create a comprehensive, engaging blog post about weird and unconventional date ideas targeting these keywords: "weird date ideas", "competitive date ideas", "funny dates", "interactive dates", "unconventional date ideas", "odd date ideas", "strange date ideas", "extravagant date ideas", and "bizarre date ideas".

  The content should:
  
  1. Start with a warm introduction about how unconventional dates can be a fun way to break the routine and create unique memories. Naturally incorporate the phrase "weird date ideas" in the opening.
  
  2. Include a brief section on the benefits of unconventional dates:
     - Encourages creativity and spontaneity
     - Helps couples bond over shared experiences
     - Creates stories to laugh about later
  
  3. Organize the date ideas into clear categories (at least 20 ideas total):
     - "Competitive date ideas" for couples who love a challenge (trivia nights, laser tag, etc.)
     - "Funny dates" for lighthearted fun (karaoke, comedy clubs, etc.)
     - "Interactive dates" for hands-on activities (pottery classes, escape rooms, etc.)
     - "Unconventional date ideas" for adventurous couples (ghost tours, axe throwing, etc.)
     - "Odd date ideas" for quirky experiences (visiting unusual museums, goat yoga, etc.)
     - "Extravagant date ideas" for over-the-top fun (helicopter rides, luxury picnics, etc.)
  
  4. For each date idea, include:
     - A descriptive title
     - Why it works well for an unconventional date
     - A tip to make it special or unique
  
  5. Add a section on planning unconventional dates:
     - How to find unique activities in your area
     - Tips for keeping the vibe fun and relaxed
     - How to make the most of trying something new
  
  6. Include a practical section on "competitive date ideas":
     - Activities that bring out friendly competition
     - How to keep it lighthearted and fun
     - Ideas for both indoor and outdoor competitive dates
  
  7. Close with an encouraging conclusion about how unconventional dates can strengthen your relationship and create lasting memories
  
  The tone should be enthusiastic, friendly, and conversational. Write as if you're sharing your best unconventional date tips with a close friend. Use "you" language frequently and include occasional personal touches to make it relatable and authentic.
  
  Format with proper markdown headings (# for main title, ## for sections, ### for subsections) to create a well-structured article that's easy to scan. Incorporate all keywords naturally throughout the text.`
);