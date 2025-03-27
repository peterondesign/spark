"use client";
import React, { useState } from 'react';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GiftIdea {
  title: string;
  description: string;
  price: string;
}

const DateGiftPlanningAssistant = () => {
    const [partnerInfo, setPartnerInfo] = useState('');
    const [occasion, setOccasion] = useState('');
    const [budget, setBudget] = useState('');
    const [interests, setInterests] = useState('');
    const [giftIdeas, setGiftIdeas] = useState<GiftIdea[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        // Placeholder for actual API call
        setTimeout(() => {
            setGiftIdeas([
                { 
                    title: "Custom Star Map", 
                    description: "A personalized star map showing the night sky from the exact time and place of your first date or another special moment.",
                    price: "$50-100"
                },
                { 
                    title: "Experience Gift Box", 
                    description: "A curated box with tickets to local experiences based on their interests, like cooking classes or outdoor adventures.",
                    price: "$100-200"
                },
                { 
                    title: "Personalized Playlist with Vintage Record Player", 
                    description: "A vinyl record with your special songs and a vintage-style record player.",
                    price: "$150-300"
                },
            ]);
            setLoading(false);
        }, 2000);
    };

    return (
        <>
            <Header />
            <main className="container mx-auto py-12 px-4">
                <h1 className="text-4xl font-bold text-center mb-12">Date & Gift Planning Assistant</h1>
                
                <Tabs defaultValue="gift-planner" className="max-w-4xl mx-auto">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="gift-planner">Gift Planning Assistant</TabsTrigger>
                        <TabsTrigger value="mystery-box">Mystery Date Box</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="gift-planner" className="space-y-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                            <h2 className="text-3xl font-bold mb-4">Find the Perfect Gift</h2>
                            <p className="text-lg mb-6">
                                Not sure what to get your partner for your next special occasion? Our AI-powered gift assistant
                                will help you discover thoughtful, personalized gift ideas based on your partner's interests and your budget.
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card>
                                <CardContent className="pt-6">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block mb-2 font-medium">Tell us about your partner</label>
                                            <Textarea 
                                                placeholder="Their personality, what they enjoy, hobbies, etc."
                                                value={partnerInfo}
                                                onChange={(e) => setPartnerInfo(e.target.value)}
                                                className="min-h-[100px]"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block mb-2 font-medium">Occasion</label>
                                            <Input 
                                                placeholder="Anniversary, birthday, Valentine's Day, etc."
                                                value={occasion}
                                                onChange={(e) => setOccasion(e.target.value)}
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block mb-2 font-medium">Budget</label>
                                            <Input 
                                                placeholder="$50-100, $100-200, etc."
                                                value={budget}
                                                onChange={(e) => setBudget(e.target.value)}
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block mb-2 font-medium">Specific interests (optional)</label>
                                            <Input 
                                                placeholder="Travel, cooking, music, etc."
                                                value={interests}
                                                onChange={(e) => setInterests(e.target.value)}
                                            />
                                        </div>
                                        
                                        <Button 
                                            type="submit" 
                                            className="w-full" 
                                            disabled={loading}
                                        >
                                            {loading ? 'Generating Ideas...' : 'Generate Gift Ideas'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                            
                            <div>
                                <h3 className="text-xl font-semibold mb-4">
                                    {giftIdeas.length > 0 ? 'Personalized Gift Ideas' : 'Your recommendations will appear here'}
                                </h3>
                                
                                {loading && (
                                    <div className="flex items-center justify-center h-40">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>
                                    </div>
                                )}
                                
                                <div className="space-y-4">
                                    {giftIdeas.map((idea, index) => (
                                        <Card key={index} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-4">
                                                <h4 className="font-bold">{idea.title}</h4>
                                                <p className="text-sm text-gray-600 mb-2">{idea.description}</p>
                                                <p className="text-sm font-medium">Estimated price: {idea.price}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="mystery-box">
                        <MysteryBox />
                    </TabsContent>
                </Tabs>
            </main>
            <Footer />
        </>
    );
};

// Mystery Box for Couples Component
const MysteryBox = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Mystery Date Box for Couples</h1>
                <p className="text-lg mb-6">Surprise your partner with a curated box full of date night essentials. Each box is themed and contains everything you need for a memorable date experience at home.</p>
                <Button variant="secondary" className="bg-white text-purple-700 hover:bg-gray-100">Learn More</Button>
            </div>
            
            <div className="mt-12 grid md:grid-cols-3 gap-6">
                <Card className="border-2 border-pink-200 hover:border-pink-500 transition-colors">
                    <CardContent className="pt-6">
                        <h3 className="text-xl font-bold text-center mb-2">Romantic Dinner</h3>
                        <div className="text-center mb-4">$79.99</div>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Gourmet dinner kit with recipes
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Handcrafted candle set
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Curated music playlist
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Dessert making kit
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Conversation starters
                            </li>
                        </ul>
                        <Button className="w-full">Order Now</Button>
                    </CardContent>
                </Card>
                
                <Card className="border-2 border-purple-200 hover:border-purple-500 transition-colors">
                    <CardContent className="pt-6">
                        <h3 className="text-xl font-bold text-center mb-2">Adventure Night</h3>
                        <div className="text-center mb-4">$89.99</div>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Mystery game for two
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Outdoor activity supplies
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Picnic essentials
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Adventure map & challenges
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Themed snacks and drinks
                            </li>
                        </ul>
                        <Button className="w-full">Order Now</Button>
                    </CardContent>
                </Card>
                
                <Card className="border-2 border-blue-200 hover:border-blue-500 transition-colors">
                    <CardContent className="pt-6">
                        <h3 className="text-xl font-bold text-center mb-2">Relaxation Retreat</h3>
                        <div className="text-center mb-4">$99.99</div>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Spa treatment essentials
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Aromatherapy kit
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Couple's massage guide
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Premium tea selection
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span> Relaxation playlist & activities
                            </li>
                        </ul>
                        <Button className="w-full">Order Now</Button>
                    </CardContent>
                </Card>
            </div>
            
            <div className="mt-12 text-center">
                <h3 className="text-2xl font-bold mb-4">How It Works</h3>
                <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                    <div>
                        <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <span className="text-purple-700 font-bold">1</span>
                        </div>
                        <h4 className="font-semibold mb-2">Choose Your Box</h4>
                        <p className="text-gray-600">Select the box that matches your mood or interests</p>
                    </div>
                    <div>
                        <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <span className="text-purple-700 font-bold">2</span>
                        </div>
                        <h4 className="font-semibold mb-2">Receive & Unbox</h4>
                        <p className="text-gray-600">Your carefully packaged date box arrives at your door</p>
                    </div>
                    <div>
                        <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <span className="text-purple-700 font-bold">3</span>
                        </div>
                        <h4 className="font-semibold mb-2">Enjoy Together</h4>
                        <p className="text-gray-600">Follow the guide and enjoy a special date night</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Remove one of the default exports - keeping the DateGiftPlanningAssistant
// as it contains all the implementation
export default DateGiftPlanningAssistant;

// This function can be exported regularly if needed elsewhere
export function GiftPlanningPage() {
    return (
        <div>
            <h1>Geschenk- und Date-Planungsassistent</h1>
            <p>Erhalten Sie Unterstützung bei der Planung von Geschenken und Dates.</p>
        </div>
    );
}