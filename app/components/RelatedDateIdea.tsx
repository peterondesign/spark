"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { getImageUrl } from '../utils/imageService';

interface RelatedDateIdeaProps {
  slug: string;
  fallbackTitle?: string;
}

interface DateIdea {
  id: number | string;
  title: string;
  category: string;
  description: string;
  slug: string;
  image: string;
}

export default function RelatedDateIdea({ slug, fallbackTitle }: RelatedDateIdeaProps) {
  const [dateIdea, setDateIdea] = useState<DateIdea | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>('/placeholder.jpg');
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDateIdea = async () => {
      try {
        // If slug is invalid or empty, fail early
        if (!slug || slug === 'undefined' || slug.trim() === '') {
          setError(true);
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('date_ideas')
          .select('id, title, category, description, slug, image')
          .eq('slug', slug)
          .single();

        if (error) {
          console.error('Error fetching related date idea:', error.message || 'Unknown error');
          setError(true);
          setLoading(false);
          return;
        }

        if (data) {
          setDateIdea(data);
          
          try {
            // Get image URL
            const url = await getImageUrl(data.image, `${data.title} ${data.category}`, 300, 200);
            setImageUrl(url);
          } catch (imgError) {
            console.warn('Could not load image for related date idea:', imgError);
            setImageUrl('/placeholder.jpg');
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error in fetchDateIdea:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchDateIdea();
    } else {
      setLoading(false);
      setError(true);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-pulse">
        <div className="h-40 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Show fallback UI when there's an error or no date idea found
  if (!dateIdea || error) {
    if (fallbackTitle) {
      // Show placeholder with fallback title
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="relative h-40">
            <Image 
              src="/placeholder.jpg" 
              alt={fallbackTitle}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 bg-rose-500/80 text-white text-xs font-medium px-2 py-1">
              Date Idea
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-2">{fallbackTitle}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">Explore this exciting date idea.</p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <Link href={`/date-idea/${dateIdea.slug}`} className="group">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative h-40">
          <Image 
            src={imageUrl || '/placeholder.jpg'} 
            alt={dateIdea.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-0 left-0 bg-rose-500/80 text-white text-xs font-medium px-2 py-1">
            {dateIdea.category}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-rose-600 transition-colors">{dateIdea.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{dateIdea.description}</p>
        </div>
      </div>
    </Link>
  );
}