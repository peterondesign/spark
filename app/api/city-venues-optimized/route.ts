import { NextRequest, NextResponse } from "next/server";

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

// Performance optimizations
const FAST_CACHE = new Map<string, any>();
const CACHE_TTL = 3 * 60 * 1000; // Reduced to 3 minutes for speed testing

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let body: any = {};

  try {
    body = await req.json();
    const {
      city,
      activity,
      max_results = 6,
      language = "en",
      offset = 0,
    } = body;

    if (!city || !activity) {
      return NextResponse.json(
        {
          error: "City and activity are required",
          received: { city, activity },
        },
        { status: 400 }
      );
    }

    // Ultra-fast cache check
    const cacheKey = `${city.toLowerCase()}_${activity.toLowerCase()}_${offset}`;
    const cached = FAST_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const response = NextResponse.json({
        ...cached.data,
        cached: true,
        response_time_ms: Date.now() - startTime,
      });
      response.headers.set("Cache-Control", "public, s-maxage=300");
      return response;
    }

    if (!PERPLEXITY_API_KEY) {
      return NextResponse.json(
        {
          error: "Perplexity API key not configured",
        },
        { status: 500 }
      );
    }

    // Detect country from city name
    const cityLower = city.toLowerCase();
    let country = "Portugal"; // Default

    if (
      cityLower.includes("london") ||
      cityLower.includes("manchester") ||
      cityLower.includes("birmingham")
    ) {
      country = "United Kingdom";
    } else if (
      cityLower.includes("paris") ||
      cityLower.includes("lyon") ||
      cityLower.includes("marseille")
    ) {
      country = "France";
    } else if (
      cityLower.includes("madrid") ||
      cityLower.includes("barcelona") ||
      cityLower.includes("valencia")
    ) {
      country = "Spain";
    } else if (
      cityLower.includes("rome") ||
      cityLower.includes("milan") ||
      cityLower.includes("naples")
    ) {
      country = "Italy";
    }

    // Ultra-optimized prompt for speed
    const prompt = `${max_results} ${activity} venues in ${city}, ${country}. JSON only:
{"results":[{"title":"Name","description":"Brief","address":{"street":"Street","city":"${city}"},"website_url":"URL"}]}`;

    // Speed-optimized API call with reduced timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Reduced to 15 seconds

    console.log(
      `[Perplexity] Speed search: ${activity} in ${city}, ${country}`
    );

    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar", // Faster online model
        messages: [{ role: "user", content: prompt }],
        web_search_options: {
          search_mode: "low",
          search_context_size: "low",
        },
        max_tokens: 500, // Reduced from 800 for speed
        temperature: 0, // Maximum consistency and speed
        top_p: 0.9,
        stream: false, // Fixed: Changed from true to false for JSON parsing
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Perplexity API error: ${response.status} ${response.statusText}`,
        errorText
      );
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(
      "[Perplexity] Raw API response:",
      JSON.stringify(data, null, 2)
    );

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid API response structure");
    }

    // Enhanced JSON extraction and repair
    let content = data.choices[0].message.content;
    console.log("[Perplexity] Raw content length:", content.length);

    // Handle potential SSE format remnants (just in case)
    if (content.startsWith('data: ')) {
      console.log("[Perplexity] Detected SSE format, extracting JSON...");
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const jsonData = JSON.parse(line.substring(6));
            if (jsonData.choices?.[0]?.message?.content) {
              content = jsonData.choices[0].message.content;
              break;
            }
          } catch (e) {
            // Continue to next line
          }
        }
      }
    }

    // Clean up common formatting issues
    content = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Extract JSON from content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    // Advanced JSON repair for malformed responses
    if (content.includes('"results":[')) {
      // Fix common JSON issues
      content = content
        .replace(/,\s*}/g, "}") // Remove trailing commas before }
        .replace(/,\s*]/g, "]") // Remove trailing commas before ]
        .replace(/"\s*:\s*"/g, '":"') // Fix spacing in key-value pairs
        .replace(/([^"\\])\n/g, "$1") // Remove unexpected newlines
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();

      // Ensure proper closing
      if (!content.endsWith("]}") && !content.endsWith("}")) {
        const lastValidIndex = Math.max(
          content.lastIndexOf("}"),
          content.lastIndexOf("]")
        );
        if (lastValidIndex > 0) {
          content = content.substring(0, lastValidIndex + 1);
          if (!content.endsWith("]}")) {
            content += "]}";
          }
        }
      }
    }

    let parsedContent;
    try {
      // First attempt - try parsing as-is
      parsedContent = JSON.parse(content);
      console.log("[Perplexity] Successfully parsed response:", parsedContent);
    } catch (parseError) {
      console.log("[Perplexity] First parse failed, attempting repair...");

      try {
        // Advanced JSON repair - handle multiple common issues
        let repairedContent = content;

        // Remove any trailing incomplete content after the last complete object
        const lastCloseBrace = repairedContent.lastIndexOf("}");
        const lastCloseBracket = repairedContent.lastIndexOf("]");

        if (lastCloseBrace > -1 && lastCloseBracket > -1) {
          // Find the better ending point
          if (lastCloseBrace > lastCloseBracket) {
            // Last } is after last ], probably incomplete object
            const secondLastCloseBrace = repairedContent.lastIndexOf(
              "}",
              lastCloseBrace - 1
            );
            if (secondLastCloseBrace > -1) {
              repairedContent =
                repairedContent.substring(0, secondLastCloseBrace + 1) + "]}";
            }
          } else {
            // Last ] is after last }, probably complete
            repairedContent =
              repairedContent.substring(0, lastCloseBracket + 1) + "}";
          }
        }

        // Additional cleanup
        repairedContent = repairedContent
          .replace(/,\s*([}\]])/g, "$1") // Remove trailing commas
          .replace(/([^"])\n\s*"([^"]*)":/g, '$1,"$2":') // Fix missing commas between properties
          .replace(/:\s*"([^"]*)"([^,}\]]*)/g, ':"$1"') // Clean up malformed string values
          .replace(/}\s*{/g, "},{") // Fix missing commas between objects
          .trim();

        parsedContent = JSON.parse(repairedContent);
        console.log("[Perplexity] Successfully repaired and parsed response");
      } catch (repairError) {
        console.error("[Perplexity] JSON repair also failed:", repairError);
        console.error(
          "[Perplexity] Original error:",
          parseError,
          "Content snippet:",
          content.substring(0, 500)
        );

        // Final fallback - try to extract at least some venues manually
        const manualVenues = [];
        const titleMatches = content.match(/"title":\s*"([^"]+)"/g);
        const descMatches = content.match(/"description":\s*"([^"]+)"/g);

        if (titleMatches && titleMatches.length > 0) {
          for (
            let i = 0;
            i < Math.min(titleMatches.length, descMatches?.length || 0);
            i++
          ) {
            const title = titleMatches[i].match(/"title":\s*"([^"]+)"/)?.[1];
            const description = descMatches?.[i]?.match(
              /"description":\s*"([^"]+)"/
            )?.[1];

            if (title) {
              manualVenues.push({
                title,
                description: description || `${activity} venue in ${city}`,
                address: { street: "City Center", city, postal_code: "" },
                website_url: null,
                source_url: null,
                source: "perplexity",
              });
            }
          }
        }

        if (manualVenues.length > 0) {
          parsedContent = { results: manualVenues };
          console.log(
            "[Perplexity] Manually extracted",
            manualVenues.length,
            "venues"
          );
        } else {
          // Ultimate fallback - use generated venues
          const quickVenues = generateQuickVenues(city, activity, max_results);
          const fallbackResponse = {
            query: `${activity} in ${city}`,
            city,
            activity,
            results_count: quickVenues.length,
            generated_at: new Date().toISOString(),
            currency: "EUR",
            results: quickVenues,
            fallback: true,
            response_time_ms: Date.now() - startTime,
          };

          return NextResponse.json(fallbackResponse);
        }
      }
    }

    // Get Perplexity venues
    const perplexityVenues = (parsedContent.results || []).map(
      (venue: any) => ({
        title: venue.title || "Local Venue",
        description:
          venue.description ||
          `Great place for ${activity.toLowerCase()} in ${city}`,
        address: {
          street: venue.address?.street || "City Center",
          city: venue.address?.city || city,
          postal_code: venue.address?.postal_code || "",
        },
        website_url: venue.website_url || null,
        source_url: venue.source_url || venue.website_url || null,
        source: "perplexity",
      })
    );

    // Create GetYourGuide search results instead of API call
    let getYourGuideResults: any[] = [];
    try {
      console.log("[GetYourGuide] Creating search links...");

      // Create GetYourGuide search URL with partner attribution
      const searchTerm = encodeURIComponent(`${activity} ${city}`);
      const partnerSearchUrl = `https://www.getyourguide.com/?q=${searchTerm}&partner_id=5QQHAHP`;

      // Create a GetYourGuide search recommendation
      getYourGuideResults = [
        {
          title: `Find ${activity} experiences in ${city}`,
          description: `Browse verified ${activity.toLowerCase()} tours and activities in ${city} with instant booking and free cancellation`,
          address: {
            street: "Multiple locations",
            city: city,
            postal_code: "",
          },
          website_url: partnerSearchUrl,
          source_url: partnerSearchUrl,
          source: "getyourguide",
          recommended: true,
          searchUrl: true, // Flag to indicate this is a search link
        },
      ];

      console.log("[GetYourGuide] Created search link:", partnerSearchUrl);
    } catch (gygError) {
      console.log("[GetYourGuide] Error creating search link:", gygError);
    }

    // Combine results with GetYourGuide first (priority)
    const allResults = [...getYourGuideResults, ...perplexityVenues];

    // Fast response normalization
    const normalizedResponse = {
      query: `${activity} in ${city}`,
      city,
      activity,
      results_count: allResults.length,
      generated_at: new Date().toISOString(),
      currency: "EUR",
      results: allResults,
      response_time_ms: Date.now() - startTime,
    };

    // Cache the response
    FAST_CACHE.set(cacheKey, {
      data: normalizedResponse,
      timestamp: Date.now(),
    });

    // Aggressive caching headers
    const apiResponse = NextResponse.json(normalizedResponse);
    apiResponse.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=86400"
    );

    return apiResponse;
  } catch (error: any) {
    console.error("[Perplexity] Full API error:", error.message, error.stack);

    // Ultra-fast fallback
    const quickVenues = generateQuickVenues(
      body?.city || "Unknown",
      body?.activity || "activity",
      body?.max_results || 6
    );

    return NextResponse.json({
      query: `${body?.activity || "activity"} places in ${body?.city || "city"}`,
      city: body?.city || "Unknown",
      activity: body?.activity || "Unknown",
      results_count: quickVenues.length,
      generated_at: new Date().toISOString(),
      currency: "EUR",
      results: quickVenues,
      fallback: true,
      error: `API failed: ${error.message}`,
      response_time_ms: Date.now() - startTime,
    });
  }
}

// Generate realistic venue data
function generateQuickVenues(city: string, activity: string, count: number) {
  const venueTypes = {
    "romantic dinner": [
      "Restaurante Romantic",
      "Café Intimate",
      "Bistro Cozy",
      "Wine Bar Elegant",
    ],
    "outdoor activity": [
      "Adventure Center",
      "Nature Park",
      "Outdoor Club",
      "Sports Complex",
    ],
    "cultural experience": [
      "Cultural Center",
      "Art Gallery",
      "Museum Local",
      "Heritage Site",
    ],
    entertainment: [
      "Entertainment Hub",
      "Live Music Venue",
      "Theater Local",
      "Comedy Club",
    ],
  };

  const defaultNames = [
    `Local ${activity} Venue`,
    `${city} ${activity} Spot`,
    `Popular ${activity} Place`,
  ];
  const names =
    venueTypes[activity.toLowerCase() as keyof typeof venueTypes] ||
    defaultNames;

  return Array.from({ length: count }, (_, i) => ({
    title: names[i % names.length] || `${activity} Location ${i + 1}`,
    description: `Recommended ${activity.toLowerCase()} venue in ${city}`,
    address: {
      street: `${city} Center`,
      city,
      postal_code: `${Math.floor(Math.random() * 9000) + 1000}-000`,
    },
    website_url: null,
    source_url: null,
  }));
}
