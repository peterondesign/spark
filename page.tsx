"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { favoritesService, DateIdea } from "./app/services/favoritesService"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [favorites, setFavorites] = useState<DateIdea[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load user's favorites on component mount
  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true)
      try {
        const userFavorites = await favoritesService.getRecentFavorites(5)
        setFavorites(userFavorites)
      } catch (error) {
        console.error("Failed to load favorites:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [])

  // Handle removing a favorite
  const handleRemoveFavorite = async (id: number) => {
    try {
      await favoritesService.removeFavorite(id)
      setFavorites(favorites.filter(favorite => favorite.id !== id))
    } catch (error) {
      console.error("Failed to remove favorite:", error)
    }
  }

  useEffect(() => {
    const fetchExperiences = async () => {
      if (!userCity || !dateIdea?.title) return;
      
      setLoadingExperiences(true);
      try {
        // Step 1: Scrape the search results page to get activities
        const searchUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(dateIdea.title)}+${encodeURIComponent(userCity)}&searchSource=3`;
        const response = await fetch(`/api/scrape?url=${encodeURIComponent(searchUrl)}&method=selenium`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Scraped data:", data);
        
        // Process the activity data from the scraper
        if (data && data.activities && data.activities.length > 0) {
          // Filter activities to ensure they're relevant to the date idea
          const relevantActivities = data.activities.filter((activity: any) => {
            // Check if the activity title is relevant to the date idea
            const activityTitle = activity.title?.toLowerCase() || '';
            const dateIdeaTitle = dateIdea.title.toLowerCase();
            const dateIdeaWords = dateIdeaTitle.split(/\s+/).filter(word => word.length > 3);
            
            // Check if any significant words from the date idea appear in the activity title
            const isRelevant = dateIdeaWords.some(word => activityTitle.includes(word));
            return isRelevant;
          });
          
          // Map the activities to our Experience format
          const processedExperiences: Experience[] = (relevantActivities.length > 0 ? relevantActivities : data.activities)
            .map((activity: any) => {
              // The URLs should already be properly formatted from the Python script
              return {
                title: activity.title || `${dateIdea.title} in ${userCity}`,
                price: activity.price && activity.price !== "Price not available" 
                  ? activity.price 
                  : "Check website for prices",
                rating: activity.rating || "4.5",
                reviewCount: activity.reviews || "100+",
                imageUrl: activity.image || dateIdea.image,
                link: activity.url || `https://www.getyourguide.com/s/?q=${encodeURIComponent(dateIdea.title)}+${encodeURIComponent(userCity)}&searchSource=3?partner_id=5QQHAHP&utm_medium=online_publisher`,
                isRelevant: relevantActivities.includes(activity)
              };
            });
          
          console.log("Processed experiences:", processedExperiences);
          
          // Add a warning message if we couldn't find relevant activities
          if (relevantActivities.length === 0 && data.activities.length > 0) {
            setExperiencesWarning(
              "We couldn't find activities that exactly match this date idea, but here are some alternatives."
            );
          } else {
            setExperiencesWarning("");
          }
          
          setExperiences(processedExperiences);
        } else {
          // Fall back to a default experience if no activities were found
          setExperiences([{
            title: `${dateIdea.title} in ${userCity}`,
            price: "Check website for prices",
            rating: "4.5",
            reviewCount: "100+",
            imageUrl: dateIdea.image,
            link: `https://www.getyourguide.com/s/?q=${encodeURIComponent(dateIdea.title)}+${encodeURIComponent(userCity)}&searchSource=3?partner_id=5QQHAHP&utm_medium=online_publisher`,
            isRelevant: true
          }]);
          setExperiencesWarning("We couldn't find specific activities for this date idea.");
        }
      } catch (error) {
        console.error('Error fetching experiences:', error);
        // Even on error, show a generic experience option
        const searchUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(dateIdea.title)}+${encodeURIComponent(userCity)}&searchSource=3`;
        setExperiences([{
          title: `${dateIdea.title} in ${userCity}`,
          price: "Check website for prices",
          rating: "4.5",
          reviewCount: "100+",
          imageUrl: dateIdea.image,
          link: `${searchUrl}?partner_id=5QQHAHP&utm_medium=online_publisher`,
          isRelevant: true
        }]);
        setExperiencesWarning("Something went wrong while fetching activities. Here's a general option.");
      } finally {
        setLoadingExperiences(false);
      }
    };

    if (userCity && dateIdea) {
      fetchExperiences();
    }
  }, [userCity, dateIdea]);

  return (
    <div className="flex flex-col items-center p-8 w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Date Planner</h1>
      
      {/* Calendar Section */}
      <div className="w-full border rounded-md shadow-sm mb-8">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md"
        />
      </div>
      
      {/* Selected Date Display */}
      {date && (
        <div className="w-full mb-8 p-4 border rounded-md bg-slate-50">
          <h2 className="text-lg font-medium">
            Selected date: {date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          <p className="text-muted-foreground mt-1">
            Plan your perfect date for this day
          </p>
        </div>
      )}
      
      {/* Favorites Accordion */}
      <div className="w-full">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="favorites">
            <AccordionTrigger className="text-lg font-medium">
              Your Favorite Date Ideas ({favorites.length})
            </AccordionTrigger>
            <AccordionContent>
              {isLoading ? (
                <div className="flex justify-center p-4">Loading your favorites...</div>
              ) : favorites.length > 0 ? (
                <div className="grid gap-4 mt-2">
                  {favorites.map((favorite) => (
                    <Card key={favorite.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{favorite.title}</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveFavorite(favorite.id)}
                          >
                            <Heart className="h-4 w-4 fill-current text-red-500" />
                          </Button>
                        </div>
                        <CardDescription>{favorite.category}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm">{favorite.description}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between text-xs text-muted-foreground pt-0">
                        <div>{favorite.price}</div>
                        <div>{favorite.duration}</div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  You haven't saved any date ideas yet.
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
-lg font-medium">
                Selected date: {date?.toLocaleDateString('en-US', { 
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}