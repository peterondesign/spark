/**
 * Setup script for Replicate Image Service
 * Run this to create the necessary database table and storage bucket
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function setupDatabase() {
  console.log('Setting up database for Replicate Image Service...');
  
  try {
    // Create the generated_images table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS generated_images (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          keyword VARCHAR(255) NOT NULL,
          image_url TEXT NOT NULL,
          storage_path VARCHAR(500),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_generated_images_keyword ON generated_images(keyword);
        CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON generated_images(created_at);
      `
    });

    if (tableError) {
      console.error('Error creating table:', tableError);
    } else {
      console.log('✅ Database table created successfully');
    }

    // Check if storage bucket exists
    const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets();
    
    if (bucketListError) {
      console.error('Error listing buckets:', bucketListError);
      return;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'generated-images');
    
    if (!bucketExists) {
      // Create storage bucket
      const { error: bucketError } = await supabase.storage.createBucket('generated-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      });

      if (bucketError) {
        console.error('Error creating storage bucket:', bucketError);
      } else {
        console.log('✅ Storage bucket created successfully');
      }
    } else {
      console.log('✅ Storage bucket already exists');
    }

    console.log('🎉 Setup completed successfully!');
    
  } catch (error) {
    console.error('Setup error:', error);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

export default setupDatabase;