"use client";
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageTitle from '../components/PageTitle';
import Head from 'next/head';

interface GiftIdea {
  title: string;
  description: string;
  price: string;
}

const DateNightBoxSubscription = () => {
    const [partnerInfo, setPartnerInfo] = useState('');
    const [occasion, setOccasion] = useState('');
    const [budget, setBudget] = useState('');
    const [interests, setInterests] = useState('');
    const [giftIdeas, setGiftIdeas] = useState<GiftIdea[]>([]);
    const [loading, setLoading] = useState(false);

    // Schema markup for search engines
    const dateNightBoxSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Date Night Box Subscription",
        "description": "Monthly themed date night boxes delivered to your door with everything you need for a memorable date night at home.",
        "offers": {
            "@type": "AggregateOffer",
            "lowPrice": "79.99",
            "highPrice": "99.99",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
        }
    };

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
            <Head>
                <script type="application/ld+json">
                    {JSON.stringify(dateNightBoxSchema)}
                </script>
            </Head>
            <PageTitle />
            <Header />
            <main className="container mx-auto py-12 px-4">
                <h1 className="text-4xl font-bold text-center mb-6">Date Night Box Subscription</h1>
                <p className="text-lg text-center text-gray-700 max-w-3xl mx-auto mb-12">
                    Premium themed date night boxes delivered monthly to your door. Everything you need for the perfect date night at home.
                </p>
                
                <Tabs defaultValue="mystery-box" className="max-w-4xl mx-auto">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="mystery-box">Date Night Boxes</TabsTrigger>
                        <TabsTrigger value="gift-planner">Gift Planning Assistant</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="gift-planner" className="space-y-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                            <h2 className="text-3xl font-bold mb-4">Find the Perfect Date Night Gift</h2>
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
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Premium Date Night Box Subscription</h1>
                <p className="text-lg mb-6">Surprise your partner with a curated monthly date night box full of everything you need for a memorable date experience at home. Each box has a unique theme to keep your relationship fresh and exciting.</p>
                <Button variant="secondary" className="bg-white text-purple-700 hover:bg-gray-100">Subscribe Now</Button>
            </div>
            
            <div className="mt-12 grid md:grid-cols-3 gap-6">
                <Card className="border-2 border-pink-200 hover:border-pink-500 transition-colors">
                    <CardContent className="pt-6">
                        <h3 className="text-xl font-bold text-center mb-2">Romantic Dinner Date Night</h3>
                        <div className="text-center mb-4">$79.99/month</div>
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
                        <Button className="w-full">Subscribe Monthly</Button>
                    </CardContent>
                </Card>
                
                <Card className="border-2 border-purple-200 hover:border-purple-500 transition-colors">
                    <CardContent className="pt-6">
                        <h3 className="text-xl font-bold text-center mb-2">Adventure Date Night</h3>
                        <div className="text-center mb-4">$89.99/month</div>
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
                        <Button className="w-full">Subscribe Monthly</Button>
                    </CardContent>
                </Card>
                
                <Card className="border-2 border-blue-200 hover:border-blue-500 transition-colors">
                    <CardContent className="pt-6">
                        <h3 className="text-xl font-bold text-center mb-2">Relaxation Date Night</h3>
                        <div className="text-center mb-4">$99.99/month</div>
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
                        <Button className="w-full">Subscribe Monthly</Button>
                    </CardContent>
                </Card>
            </div>
            
            <div className="mt-12 text-center">
                <h3 className="text-2xl font-bold mb-4">How Our Date Night Box Subscription Works</h3>
                <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                    <div>
                        <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <span className="text-purple-700 font-bold">1</span>
                        </div>
                        <h4 className="font-semibold mb-2">Choose Your Subscription</h4>
                        <p className="text-gray-600">Select the date night box that matches your relationship style</p>
                    </div>
                    <div>
                        <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <span className="text-purple-700 font-bold">2</span>
                        </div>
                        <h4 className="font-semibold mb-2">Receive Monthly Box</h4>
                        <p className="text-gray-600">Your date night box arrives with everything needed for a perfect evening</p>
                    </div>
                    <div>
                        <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <span className="text-purple-700 font-bold">3</span>
                        </div>
                        <h4 className="font-semibold mb-2">Enjoy Your Date Night</h4>
                        <p className="text-gray-600">Follow the guide and enjoy a special date night at home</p>
                    </div>
                </div>
            </div>

            <section className="mt-16 bg-gray-50 p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">Why Choose Our Date Night Box Subscription?</h2>
                <div className="space-y-4">
                    <p>Life gets busy, and planning quality date nights can be challenging. Our date night box subscription service takes the stress out of planning by delivering everything you need right to your door.</p>
                    <p>Each month you'll receive a themed box with carefully curated items to create a memorable date night experience without leaving home. It's the perfect way to prioritize your relationship and create lasting memories together.</p>
                    <p>From romantic dinners to adventurous activities, our subscription boxes cater to every couple's preferences and keep your relationship exciting month after month.</p>
                </div>
            </section>
        </div>
    );
};

export default DateNightBoxSubscription;