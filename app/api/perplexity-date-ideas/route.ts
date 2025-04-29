import { NextRequest, NextResponse } from 'next/server';

interface DateIdea {
  title: string;
  imageUrl: string;
  sourceUrl: string;
  section?: string;
}

// Define the type for the sections result
interface PerplexityResult {
  title: string;
  imageUrl: string;
  sourceUrl: string;
  section: 'GetYourGuide' | 'Google' | 'Luma';
}

interface DateSections {
  GetYourGuide: PerplexityResult[];
  Google: PerplexityResult[];
  Luma: PerplexityResult[];
}

export async function POST(req: NextRequest) {
  try {
    const { city } = await req.json();
    if (!city) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 });
    }

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Perplexity API key not set' }, { status: 500 });
    }

    // Updated Perplexity prompt
    const prompt = `You are a search assistant specialized in finding *date ideas* based on a city input: ${city}.

Task:
- Search GetYourGuide (site:getyourguide.com) for "best date ideas in ${city}" or "romantic activities in ${city}". Extract Title, Image URL (if available, otherwise state "Not available"), and Source URL for each result. List under "## GetYourGuide Results".
- Search Google Maps for relevant date idea locations in ${city} (e.g., "romantic restaurants", "parks", "museums", "cinemas", "theaters"). Provide the Google Maps search URL for each category found. List under "## Google Maps Results". Example URL format: https://www.google.com/maps/search/romantic+restaurants+${city}/
- Search Luma (https://lu.ma/${city.toLowerCase().replace(/\s+/g, '-')}) for relevant upcoming events suitable for dates (e.g., workshops, concerts, meetups). Extract Title, Image URL (if available), and Source URL. List under "## Luma Results".
- If no results are found for a section, clearly state: "No results found".
- Output results cleanly in markdown format with the specified section headers.`;

    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro', // Using sonar as per previous context
        messages: [
          { role: 'system', content: 'You are a helpful assistant outputting markdown.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1500, // Increased slightly for potentially longer markdown
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API Error:", errorText);
      return NextResponse.json({ error: `Perplexity API Error: ${response.statusText}`, details: errorText }, { status: response.status });
    }

    const data = await response.json();
    // Log the raw Perplexity response for debugging
    console.log('Perplexity raw response:', JSON.stringify(data, null, 2));

    // --- Markdown Parsing Logic ---
    let sections: DateSections = { GetYourGuide: [], Google: [], Luma: [] };
    const content = data.choices?.[0]?.message?.content || '';

    const parseSection = (sectionTitle: 'GetYourGuide' | 'Google' | 'Luma', regex: RegExp): PerplexityResult[] => {
        const sectionHeader = `## ${sectionTitle}${sectionTitle === 'Google' ? ' Maps' : ''} Results`;
        const sectionMatch = content.split(sectionHeader);
        if (sectionMatch.length < 2) return [];

        const sectionContent = sectionMatch[1].split('\n## ')[0]; // Get content until the next section or end
        const results: PerplexityResult[] = [];
        let match;

        while ((match = regex.exec(sectionContent)) !== null) {
            // Handle potential variations in markdown list format (e.g., '-', '*')
            const title = match[1]?.trim() || 'Unknown Title';
            // Handle "Not available" for image URL
            const imageUrl = match[2]?.trim();
            const sourceUrl = match[3]?.trim();

            results.push({
                title: title,
                // Use placeholder or empty string if image URL is "Not available" or missing
                imageUrl: (imageUrl && !/not available/i.test(imageUrl)) ? imageUrl : '',
                sourceUrl: sourceUrl || '',
                section: sectionTitle,
            });
        }
        return results;
    };

    // Regex for GetYourGuide and Luma (Title, Image URL, Source URL)
    // Handles optional numbering/bullets, optional image URL line
    const standardRegex = /^[\*\-\d]+\.\s+\*\*(.*?)\*\*(?:\n\s+-\s+Image URL:\s*(.*?))?\n\s+-\s+Source URL:\s*\[?(.+?)\]?\(?\3?\)?/gm;

    // Regex for Google Maps (Description/Category, Google Maps URL)
    // Assumes a format like: - **Category:** [URL](URL) or similar
    const googleMapsRegex = /-\s+\*\*(.*?):\*\*\s+(?:\(?\[?(.+?)\]?\)?)/gm;


    sections.GetYourGuide = parseSection('GetYourGuide', standardRegex);

    // Custom parsing for Google Maps URLs
    const googleSectionHeader = "## Google Maps Results";
    const googleSectionMatch = content.split(googleSectionHeader);
    if (googleSectionMatch.length >= 2) {
        const googleSectionContent = googleSectionMatch[1].split('\n## ')[0];
        let googleMatch;
        while ((googleMatch = googleMapsRegex.exec(googleSectionContent)) !== null) {
            sections.Google.push({
                title: googleMatch[1]?.trim() || 'Google Maps Search',
                imageUrl: '', // No image for Google Maps links
                sourceUrl: googleMatch[2]?.trim() || '',
                section: 'Google',
            });
        }
    }


    sections.Luma = parseSection('Luma', standardRegex);

    // Check if sections are empty and add "No results found" placeholder if needed
    if (sections.GetYourGuide.length === 0 && content.includes("## GetYourGuide Results\n\nNo results found")) {
        sections.GetYourGuide.push({ title: "No results found", imageUrl: "", sourceUrl: "", section: 'GetYourGuide' });
    }
     if (sections.Google.length === 0 && content.includes("## Google Maps Results\n\nNo results found")) {
        sections.Google.push({ title: "No results found", imageUrl: "", sourceUrl: "", section: 'Google' });
    }
     if (sections.Luma.length === 0 && content.includes("## Luma Results\n\nNo results found")) {
        sections.Luma.push({ title: "No results found", imageUrl: "", sourceUrl: "", section: 'Luma' });
    }


    // Return both parsed sections and the raw Perplexity response
    return NextResponse.json({ sections, rawPerplexityResponse: data });

  } catch (err) {
    console.error("API Route Error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error in API route' }, { status: 500 });
  }
}
