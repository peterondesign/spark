-- Create the generated_images table for caching AI-generated images
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  storage_path VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_images_keyword ON generated_images(keyword);
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON generated_images(created_at);

-- Create storage bucket for generated images (run this in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('generated-images', 'generated-images', true);

-- Set up RLS (Row Level Security) policies
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Policy to allow read access to all users
CREATE POLICY "Allow read access to generated images" ON generated_images
  FOR SELECT USING (true);

-- Policy to allow insert for service role
CREATE POLICY "Allow insert for service role" ON generated_images
  FOR INSERT WITH CHECK (true);

-- Policy to allow update for service role  
CREATE POLICY "Allow update for service role" ON generated_images
  FOR UPDATE USING (true);