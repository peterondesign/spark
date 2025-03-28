import { supabase } from '../../utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export type DateIdea = {
  id: number;
  title: string;
  category: string;
  rating: number;
  location: string | { [key: string]: any } | null; // Updated to handle JSON location
  description: string;
  price: string;
  duration: string;
  slug: string;
  image: string;
  priceLevel?: number;
  bestForStage?: string;
  tips?: string | null;
  idealFor?: string;
  relatedDateIdeas?: string[];
  longDescription?: string;
};

export class FavoritesError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'FavoritesError';
  }
}

// Function to get or create device ID
const getDeviceId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let deviceId = localStorage.getItem('device_id');
  
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem('device_id', deviceId);
  }
  
  return deviceId;
};

export const favoritesService = {
  async getRecentFavorites(limit: number = 3): Promise<DateIdea[]> {
    try {
      // Check if we can use localStorage instead
      if (typeof window !== 'undefined') {
        const savedIdeas = localStorage.getItem('savedDateIdeas');
        if (savedIdeas) {
          const parsedIdeas = JSON.parse(savedIdeas) as DateIdea[];
          return parsedIdeas.slice(0, limit);
        }
      }
      
      // If no localStorage or no items found, try with database
      try {
        // Debug message
        console.log('Attempting to fetch favorites from Supabase...');
        
        // Get favorite IDs - handle potential connection issues
        try {
          const deviceId = getDeviceId();
          console.log('Using device ID:', deviceId);
          
          const { data: favorites, error: favoritesError } = await supabase
            .from('favorites')
            .select('date_idea_id, device_id, created_at')
            .eq('device_id', deviceId)
            .order('created_at', { ascending: false })
            .limit(limit);
            
          if (favoritesError) {
            console.warn('Supabase favorites error:', favoritesError);
            // Return empty array instead of throwing
            return [];
          }
          
          if (!favorites || favorites.length === 0) {
            return [];
          }
          
          // Get date ideas for those IDs
          const dateIdeaIds = favorites.map(f => f.date_idea_id);
          const { data: dateIdeas, error: dateIdeasError } = await supabase
            .from('date_ideas')
            .select('*')
            .in('id', dateIdeaIds);
            
          if (dateIdeasError) {
            console.warn('Supabase date ideas error:', dateIdeasError);
            // Return empty array instead of throwing
            return [];
          }
          
          if (!dateIdeas) {
            return [];
          }
          
          // Order date ideas to match favorites order
          return dateIdeaIds
            .map(id => dateIdeas.find(idea => idea.id === id))
            .filter((idea): idea is DateIdea => idea !== undefined);
        } catch (connectionError) {
          console.warn('Supabase connection error:', connectionError);
          return [];
        }
      } catch (dbError) {
        console.warn('Database fetch failed, falling back to empty list:', dbError);
        return [];
      }
    } catch (error) {
      // Log error but don't rethrow - just return empty array
      console.error('Error in getRecentFavorites:', error);
      return [];
    }
  },
  
  // Add method to save a favorite to localStorage and sync with Supabase
  async saveFavorite(dateIdea: DateIdea): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      // Save to localStorage
      const savedIdeas = localStorage.getItem('savedDateIdeas');
      let favorites: DateIdea[] = savedIdeas ? JSON.parse(savedIdeas) : [];
      
      // Check if already exists in localStorage
      if (!favorites.some(idea => idea.id === dateIdea.id)) {
        favorites.push(dateIdea);
        localStorage.setItem('savedDateIdeas', JSON.stringify(favorites));
      }
      
      // Also save to Supabase
      const deviceId = getDeviceId();
      
      // Check if this favorite already exists for this device
      const { data: existingFavorite, error: queryError } = await supabase
        .from('favorites')
        .select('id')
        .eq('date_idea_id', dateIdea.id)
        .eq('device_id', deviceId)
        .maybeSingle();
      
      if (queryError) {
        console.warn('Error checking for existing favorite:', queryError);
        return;
      }
      
      // Only insert if it doesn't exist
      if (!existingFavorite) {
        const { error: insertError } = await supabase
          .from('favorites')
          .insert({
            date_idea_id: dateIdea.id,
            device_id: deviceId,
            created_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.warn('Error saving favorite to Supabase:', insertError);
        }
      }
    } catch (error) {
      console.error('Error saving favorite:', error);
    }
  },
  
  // Remove a favorite from localStorage and Supabase
  async removeFavorite(ideaId: number): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      // Remove from localStorage
      const savedIdeas = localStorage.getItem('savedDateIdeas');
      if (savedIdeas) {
        let favorites: DateIdea[] = JSON.parse(savedIdeas);
        favorites = favorites.filter(idea => idea.id !== ideaId);
        localStorage.setItem('savedDateIdeas', JSON.stringify(favorites));
      }
      
      // Also remove from Supabase
      const deviceId = getDeviceId();
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('date_idea_id', ideaId)
        .eq('device_id', deviceId);
        
      if (error) {
        console.warn('Error removing favorite from Supabase:', error);
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  },
  
  // Sync local favorites with Supabase
  async syncFavorites(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      const deviceId = getDeviceId();
      const savedIdeas = localStorage.getItem('savedDateIdeas');
      
      if (!savedIdeas) return;
      
      const favorites: DateIdea[] = JSON.parse(savedIdeas);
      
      // Get all favorites for this device from Supabase
      const { data: supabaseFavorites, error: fetchError } = await supabase
        .from('favorites')
        .select('date_idea_id')
        .eq('device_id', deviceId);
        
      if (fetchError) {
        console.warn('Error fetching favorites from Supabase:', fetchError);
        return;
      }
      
      const supabaseIds = (supabaseFavorites || []).map(f => f.date_idea_id);
      
      // Find local favorites that aren't in Supabase
      const favoritesToAdd = favorites
        .filter(idea => !supabaseIds.includes(idea.id))
        .map(idea => ({
          date_idea_id: idea.id,
          device_id: deviceId,
          created_at: new Date().toISOString()
        }));
      
      // Add missing favorites to Supabase
      if (favoritesToAdd.length > 0) {
        const { error: insertError } = await supabase
          .from('favorites')
          .insert(favoritesToAdd);
          
        if (insertError) {
          console.warn('Error syncing favorites to Supabase:', insertError);
        }
      }
    } catch (error) {
      console.error('Error syncing favorites:', error);
    }
  }
};
