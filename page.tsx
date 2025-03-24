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
