# 🎨 AI Image Generation System for Date Ideas

This system automatically generates diverse couple images for date ideas using Replicate's Seedream-4 AI model and stores them in your Supabase bucket.

## 🚀 **Quick Start**

### 1. Generate Images for All Current Date Ideas
```bash
# Start your development server
npm run dev

# Run the generation script (in another terminal)
node scripts/generate-all-current-images.js
```

### 2. Access Admin Dashboard
Visit: `http://localhost:3000/admin/generate-images`

### 3. Auto-Generate for New Date Ideas
```typescript
import { autoGenerateImageForNewDateIdea } from '@/app/hooks/useAutoImageGeneration';

// After adding a new date idea to database
const imageResult = await autoGenerateImageForNewDateIdea(newDateIdea);
```

## 📁 **Files Created**

### API Endpoints
- `app/api/generate-all-images/route.ts` - Bulk generation for all date ideas
- `app/api/generate-date-idea-image/route.ts` - Single date idea image generation

### Utilities
- `app/utils/dateIdeaImageGenerator.ts` - Core image generation functions
- `app/hooks/useAutoImageGeneration.ts` - React hooks and auto-generation utilities

### Admin Interface
- `app/admin/generate-images/page.tsx` - Admin dashboard for managing image generation

### Scripts
- `scripts/generate-all-current-images.js` - One-time script to generate all images

## 🎯 **Key Features**

### ✅ **Diverse Representation**
Automatically includes diverse couple prompts:
- White couple, Asian couple, Black couple, Latino couple
- Interracial couple, multicultural couple, mixed race couple
- LGBTQ+ couple, diverse couple

### ✅ **Smart Caching**
- Stores images in Supabase `generated-images` bucket
- Saves metadata in `generated_images` database table
- Avoids regenerating existing images

### ✅ **Automatic Integration**
- Works with existing `AllDateIdeasSection.tsx`
- Auto-generates when new date ideas are added
- Falls back gracefully if generation fails

## 🔧 **Usage Examples**

### Manual Generation via API
```typescript
// Generate all missing images
const response = await fetch('/api/generate-all-images', {
  method: 'POST',
  body: JSON.stringify({ mode: 'missing' })
});

// Generate for specific date idea
const response = await fetch('/api/generate-date-idea-image', {
  method: 'POST',
  body: JSON.stringify({
    dateIdea: {
      id: '123',
      title: 'Romantic Dinner',
      category: 'Food & Drink'
    }
  })
});
```

### React Hook Usage
```typescript
import { useAutoImageGeneration } from '@/app/hooks/useAutoImageGeneration';

function DateIdeaForm() {
  const { generateImage, isGenerating, error } = useAutoImageGeneration();
  
  const handleSubmit = async (formData) => {
    // Save to database first
    const newDateIdea = await saveToDatabase(formData);
    
    // Generate image
    const imageUrl = await generateImage(newDateIdea);
    
    if (imageUrl) {
      console.log('Image generated:', imageUrl);
    }
  };
}
```

### Batch Processing
```typescript
import { generateImagesForDateIdeas } from '@/app/utils/dateIdeaImageGenerator';

const results = await generateImagesForDateIdeas(dateIdeasArray, {
  width: 400,
  height: 300,
  delayBetweenRequests: 2000
});
```

## 📊 **Admin Dashboard Features**

### Statistics View
- Total date ideas count
- Generated images count  
- Coverage percentage
- Recent generations

### Generation Controls
- **Generate Missing**: Only creates images for date ideas without existing images
- **Regenerate All**: Forces regeneration of all images (use carefully)

### Real-time Progress
- Shows generation progress
- Displays success/error counts
- Lists recent generations with diversity prompts

## 🔄 **Integration with Existing Code**

### AllDateIdeasSection.tsx
Already updated to use diverse prompts:
```typescript
const diversityPrompts = [
  'White couple', 'diverse couple', 'interracial couple',
  'multicultural couple', 'Asian couple', 'Black couple',
  'Latino couple', 'Caucasian couple'
];

const randomDiversityPrompt = diversityPrompts[Math.floor(Math.random() * diversityPrompts.length)];
const imageUrl = await getImageUrl(idea.image, `${idea.title} ${idea.category} ${randomDiversityPrompt} ${selectedCity}`);
```

### Image Service Flow
1. **Check cache** (memory + browser storage)
2. **Check database** (generated_images table)
3. **Generate via Replicate** (if not cached)
4. **Save to Supabase storage** (bucket + database)
5. **Return public URL**

## 🛠 **Configuration**

### Environment Variables Required
```env
REPLICATE_API_TOKEN=your_replicate_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### Database Schema
Table: `generated_images`
```sql
CREATE TABLE generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  storage_path VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Storage Bucket: `generated-images` (public access)

## 💰 **Cost Optimization**

### Caching Strategy
- **24-hour cache** for AI-generated images
- **Database lookup** before API calls
- **Browser storage** for client-side caching

### Rate Limiting
- **2-second delay** between generations
- **Batch processing** for multiple images
- **Skip existing** images in bulk operations

### Monitoring
- Track generation counts via admin dashboard
- Monitor Supabase storage usage
- Check Replicate API usage

## 🚨 **Important Notes**

1. **Server-side Only**: Image generation only works server-side (not in browser)
2. **Rate Limits**: Replicate has rate limits - the system includes delays
3. **Storage Costs**: Monitor your Supabase storage usage
4. **API Costs**: Each image generation uses Replicate credits

## 🔗 **Links**

- **Supabase Bucket**: https://supabase.com/dashboard/project/ljixbbwscwfdqygjmljq/storage/buckets/generated-images
- **Admin Dashboard**: http://localhost:3000/admin/generate-images
- **Replicate Model**: bytedance/seedream-4

## 🎉 **Next Steps**

1. **Run the initial generation**: `node scripts/generate-all-current-images.js`
2. **Check your Supabase bucket** for generated images
3. **Visit the admin dashboard** to monitor progress
4. **Integrate auto-generation** into your date idea creation workflow

Your date ideas will now have beautiful, diverse couple images automatically generated and cached! 🎨✨