"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartIcon, MapPinIcon, SearchIcon, StarIcon } from "./components/icons";
import SaveButton from "./components/SaveButton";
import { getImageUrl } from "./utils/imageService";

export default function Home() {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [topDateIdeaImages, setTopDateIdeaImages] = useState<Record<string, string>>({});
  const [seasonalIdeaImages, setSeasonalIdeaImages] = useState<Record<string, string>>({});
  const [popularCityImages, setPopularCityImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadImages = async () => {
      // Load hero image
      const heroImg = await getImageUrl("/", "romantic couple date", 1920, 500);
      setHeroImageUrl(heroImg);

      // Load category images
      const categoryImagesPromises = categories.map(async (category) => ({
        [category.slug]: await getImageUrl(category.image, category.name + " date", 400, 300),
      }));
      const categoryImagesResolved = Object.assign({}, ...(await Promise.all(categoryImagesPromises)));
      setCategoryImages(categoryImagesResolved);

      // Load top date idea images
      const topDateIdeaImagesPromises = topDateIdeas.map(async (idea) => ({
        [idea.slug]: await getImageUrl(idea.image, `${idea.title} ${idea.category}`, 400, 300),
      }));
      const topDateIdeaImagesResolved = Object.assign({}, ...(await Promise.all(topDateIdeaImagesPromises)));
      setTopDateIdeaImages(topDateIdeaImagesResolved);

      // Load seasonal idea images
      const seasonalIdeaImagesPromises = seasonalIdeas.map(async (idea) => ({
        [idea.slug]: await getImageUrl(idea.image, idea.title, 600, 400),
      }));
      const seasonalIdeaImagesResolved = Object.assign({}, ...(await Promise.all(seasonalIdeaImagesPromises)));
      setSeasonalIdeaImages(seasonalIdeaImagesResolved);

      // Load popular city images
      const popularCityImagesPromises = popularCities.map(async (city) => ({
        [city.slug]: await getImageUrl(city.image, `${city.name} city skyline`, 400, 200),
      }));
      const popularCityImagesResolved = Object.assign({}, ...(await Promise.all(popularCityImagesPromises)));
      setPopularCityImages(popularCityImagesResolved);
    };

    loadImages();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Made Sticky */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <HeartIcon className="h-8 w-8 text-rose-500" />
            <span className="ml-2 text-xl font-bold text-gray-800">Spark</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/discover" className="text-gray-600 hover:text-gray-900">
              Discover
            </Link>
            <Link href="/categories" className="text-gray-600 hover:text-gray-900">
              Categories
            </Link>
            <Link href="/favorites" className="text-gray-600 hover:text-gray-900">
              Favorites
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <button className="text-gray-600 hover:text-gray-900">
              <SearchIcon className="h-5 w-5" />
            </button>
            <Link
              href="/login"
              className="px-4 py-2 rounded-full border border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/80 to-purple-600/80 z-10"></div>
        <div className="relative h-[500px]">
          {heroImageUrl && (
            <Image
              src={heroImageUrl}
              alt="Couple on a date"
              width={1920}
              height={500}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6">Find your perfect date</h1>
          <p className="text-xl md:text-2xl text-center mb-8 max-w-2xl">
            Discover unique and memorable date ideas tailored just for you
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-3xl bg-white rounded-full shadow-lg overflow-hidden">
            <div className="flex items-center p-2">
              <div className="flex-1 px-4">
                <input
                  type="text"
                  placeholder="Search for date ideas, locations, activities..."
                  className="w-full py-2 text-gray-800 focus:outline-none"
                />
              </div>
              <button className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-full font-medium transition-colors">
                Search
              </button>
            </div>
          </div>
          
          {/* Personalize Button */}
          <div className="mt-6">
            <Link 
              href="/preferences" 
              className="bg-white text-rose-500 hover:bg-gray-100 px-6 py-3 rounded-full font-medium transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Personalize Your Experience
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Explore date ideas by category</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Link href={`/category/${category.slug}`} key={index} className="group">
                <div className="relative rounded-lg overflow-hidden h-64">
                  {categoryImages[category.slug] && (
                    <Image
                      src={categoryImages[category.slug]!}
                      alt={category.name}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h3 className="text-xl font-bold">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.count} ideas</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Date Ideas Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Top-rated date ideas</h2>
            <Link href="/top-ideas" className="text-rose-500 hover:text-rose-600 font-medium">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topDateIdeas.map((idea, index) => (
              <Link href={`/date-idea/${idea.slug}`} key={index} className="group">
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {topDateIdeaImages[idea.slug] && (
                      <Image
                        src={topDateIdeaImages[idea.slug]!}
                        alt={idea.title}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <SaveButton itemSlug={idea.slug} item={idea} className="absolute top-3 right-3" />
                  </div>

                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {idea.category}
                      </span>
                      <div className="ml-auto flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-600">{idea.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-rose-500 transition-colors">
                      {idea.title}
                    </h3>

                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span>{idea.location}</span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{idea.description}</p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">{idea.price}</span>
                      <span className="text-gray-500">{idea.duration}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal Ideas Section */}
      <section className="py-12 bg-gradient-to-r from-rose-50 to-purple-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Seasonal date ideas</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {seasonalIdeas.map((idea, index) => (
              <Link href={`/collection/${idea.slug}`} key={index} className="group">
                <div className="relative rounded-lg overflow-hidden h-80">
                  {seasonalIdeaImages[idea.slug] && (
                    <Image
                      src={seasonalIdeaImages[idea.slug]!}
                      alt={idea.title}
                      width={600}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{idea.title}</h3>
                    <p className="text-sm opacity-90 mb-4">{idea.description}</p>
                    <span className="inline-flex items-center text-sm font-medium text-white">
                      Explore ideas <span className="ml-1">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Popular cities for dates</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularCities.map((city, index) => (
              <Link href={`/city/${city.slug}`} key={index} className="group">
                <div className="relative rounded-lg overflow-hidden h-40">
                  {popularCityImages[city.slug] && (
                    <Image
                      src={popularCityImages[city.slug]!}
                      alt={city.name}
                      width={400}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h3 className="text-xl font-bold">{city.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Spark Choice Section */}
      <section className="py-12 bg-gradient-to-r from-rose-500 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <div className="inline-block bg-white/20 rounded-lg px-3 py-1 text-sm mb-4">Spark Choice</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Best of the Best Date Ideas</h2>
              <p className="text-lg mb-6 opacity-90">
                Our top picks of romantic, fun, and unique date experiences—curated with love by our community of date
                enthusiasts.
              </p>
              <Link
                href="/Spark-choice"
                className="inline-block bg-white text-rose-500 hover:bg-gray-100 px-6 py-3 rounded-full font-medium transition-colors"
              >
                See the winners
              </Link>
            </div>
            <div className="md:w-1/2">
              <div className="relative h-80 rounded-lg overflow-hidden">
                {heroImageUrl && (
                  <Image
                    src={heroImageUrl}
                    alt="Couple enjoying a date"
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-gray-800 font-bold mb-4">About Spark</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-gray-900">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="text-gray-600 hover:text-gray-900">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="text-gray-600 hover:text-gray-900">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-gray-600 hover:text-gray-900">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-800 font-bold mb-4">Explore</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/write-review" className="text-gray-600 hover:text-gray-900">
                    Write a Review
                  </Link>
                </li>
                <li>
                  <Link href="/add-place" className="text-gray-600 hover:text-gray-900">
                    Add a Place
                  </Link>
                </li>
                <li>
                  <Link href="/join" className="text-gray-600 hover:text-gray-900">
                    Join
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-gray-600 hover:text-gray-900">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-800 font-bold mb-4">Date Planning</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/romantic" className="text-gray-600 hover:text-gray-900">
                    Romantic Dates
                  </Link>
                </li>
                <li>
                  <Link href="/adventure" className="text-gray-600 hover:text-gray-900">
                    Adventure Dates
                  </Link>
                </li>
                <li>
                  <Link href="/budget" className="text-gray-600 hover:text-gray-900">
                    Budget-Friendly
                  </Link>
                </li>
                <li>
                  <Link href="/special" className="text-gray-600 hover:text-gray-900">
                    Special Occasions
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-800 font-bold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
              <div className="mt-6">
                <h3 className="text-gray-800 font-bold mb-4">Download our App</h3>
                <div className="flex space-x-3">
                  <Link href="#" className="bg-black text-white px-4 py-2 rounded-lg text-xs flex items-center">
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.707 9.293l-5-5a1 1 0 00-1.414 0l-5 5a1 1 0 001.414 1.414L12 6.414l4.293 4.293a1 1 0 001.414-1.414z" />
                      <path d="M12 18a1 1 0 01-1-1V7a1 1 0 012 0v10a1 1 0 01-1 1z" />
                    </svg>
                    App Store
                  </Link>
                  <Link href="#" className="bg-black text-white px-4 py-2 rounded-lg text-xs flex items-center">
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.707 9.293l-5-5a1 1 0 00-1.414 0l-5 5a1 1 0 001.414 1.414L12 6.414l4.293 4.293a1 1 0 001.414-1.414z" />
                      <path d="M12 18a1 1 0 01-1-1V7a1 1 0 012 0v10a1 1 0 01-1 1z" />
                    </svg>
                    Google Play
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <HeartIcon className="h-8 w-8 text-rose-500" />
              <span className="ml-2 text-xl font-bold text-gray-800">Spark</span>
            </div>
            <div className="text-sm text-gray-500">© {new Date().getFullYear()} Spark. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sample data
const categories = [
  { name: "Romantic", count: 124, slug: "romantic", image: "/placeholder.svg?height=300&width=400" },
  { name: "Adventure", count: 86, slug: "adventure", image: "/placeholder.svg?height=300&width=400" },
  { name: "Food & Drink", count: 152, slug: "food-drink", image: "/placeholder.svg?height=300&width=400" },
  { name: "Arts & Culture", count: 78, slug: "arts-culture", image: "/placeholder.svg?height=300&width=400" },
]

const topDateIdeas = [
  {
    title: "Sunset Kayaking Tour",
    category: "Adventure",
    rating: 4.9,
    location: "Multiple locations",
    description: "Experience the magic of sunset from the water with this guided kayaking tour for couples.",
    price: "From $49 per person",
    duration: "2 hours",
    slug: "sunset-kayaking",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    title: "Couples Cooking Class",
    category: "Food & Drink",
    rating: 4.8,
    location: "Downtown",
    description: "Learn to cook a gourmet meal together with expert chefs in this hands-on cooking class.",
    price: "From $75 per person",
    duration: "3 hours",
    slug: "couples-cooking",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    title: "Rooftop Movie Night",
    category: "Entertainment",
    rating: 4.7,
    location: "City Center",
    description: "Enjoy classic romantic films under the stars with comfortable seating and gourmet snacks.",
    price: "From $35 per person",
    duration: "3 hours",
    slug: "rooftop-movie",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    title: "Wine Tasting Tour",
    category: "Food & Drink",
    rating: 4.9,
    location: "Wine Country",
    description: "Sample premium wines at three boutique wineries with transportation included.",
    price: "From $89 per person",
    duration: "5 hours",
    slug: "wine-tasting",
    image: "/placeholder.svg?height=300&width=400",
  },
]

const seasonalIdeas = [
  {
    title: "10 Cozy Winter Date Ideas",
    description: "Stay warm and connected with these romantic winter activities",
    slug: "winter-dates",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    title: "Perfect Picnic Dates",
    description: "Outdoor dining experiences for the perfect spring or summer day",
    slug: "picnic-dates",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    title: "Fall in Love: Autumn Date Ideas",
    description: "Celebrate the season with these autumn-inspired romantic outings",
    slug: "fall-dates",
    image: "/placeholder.svg?height=400&width=600",
  },
]

const popularCities = [
  { name: "New York", slug: "new-york", image: "/placeholder.svg?height=200&width=400" },
  { name: "Los Angeles", slug: "los-angeles", image: "/placeholder.svg?height=200&width=400" },
  { name: "Chicago", slug: "chicago", image: "/placeholder.svg?height=200&width=400" },
  { name: "San Francisco", slug: "san-francisco", image: "/placeholder.svg?height=200&width=400" },
]