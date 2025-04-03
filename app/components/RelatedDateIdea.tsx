"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { getImageUrl } from '../utils/imageService';

interface RelatedDateIdeaProps {
  slug: string;
}

interface DateIdea {
  id: number | string;
  title: string;
  category: string;
  description: string;
  slug: string;
  image: string;
}

export default function RelatedDateIdea({ slug }: RelatedDateIdeaProps) {
  const [dateIdea, setDateIdea] = useState<DateIdea | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>('/placeholder.jpg');

  useEffect(() => {
    const fetchDateIdea = async () => {
      try {
        const { data, error } = await supabase
          .from('date_ideas')
          .select('id, title, category, description, slug, image')
          .eq('slug', slug)
          .single();

        if (error) {
          console.error('Error fetching related date idea:', error);
          setLoading(false);
          return;
        }

        if (data) {
          setDateIdea(data);
          
          // Get image URL
          const url = await getImageUrl(data.image, `${data.title} ${data.category}`, 300, 200);
          setImageUrl(url);
        }
      } catch (err) {
        console.error('Error in fetchDateIdea:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchDateIdea();
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

  if (!dateIdea) {
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