'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Image, Play, BarChart } from 'lucide-react';

interface GenerationStats {
  totalDateIdeas: number;
  generatedImages: number;
  coverage: number;
  recentImages: any[];
}

interface GenerationResult {
  total: number;
  processed: number;
  generated: number;
  cached: number;
  errors: number;
  details: any[];
}

export default function ImageGenerationAdmin() {
  const [stats, setStats] = useState<GenerationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch current stats
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/generate-all-images');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.message || 'Failed to fetch stats');
      }
    } catch (err) {
      setError('Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate all missing images
  const generateAllImages = async (mode: 'missing' | 'all' = 'missing') => {
    try {
      setIsGenerating(true);
      setError(null);
      setGenerationResult(null);

      const response = await fetch('/api/generate-all-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          forceRegenerate: mode === 'all'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setGenerationResult(data.results);
        // Refresh stats after generation
        await fetchStats();
      } else {
        setError(data.message || 'Generation failed');
      }
    } catch (err) {
      setError('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Image Generation Dashboard</h1>
        <p className="text-gray-600">
          Generate diverse couple images for all date ideas and save them to Supabase storage
        </p>
      </div>

      {/* Stats Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Current Statistics
          </CardTitle>
          <CardDescription>
            Overview of generated images for date ideas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button 
              onClick={fetchStats} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Refresh Stats
            </Button>
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{stats.totalDateIdeas}</div>
                <div className="text-sm text-gray-600">Total Date Ideas</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{stats.generatedImages}</div>
                <div className="text-sm text-gray-600">Generated Images</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{stats.coverage}%</div>
                <div className="text-sm text-gray-600">Coverage</div>
              </div>
            </div>
          )}

          {stats && stats.coverage < 100 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Image Coverage</span>
                <span>{stats.coverage}%</span>
              </div>
              <Progress value={stats.coverage} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generation Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Generate Images
          </CardTitle>
          <CardDescription>
            Generate AI images for date ideas with diverse couple representation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button 
              onClick={() => generateAllImages('missing')}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
              <Play className="w-4 h-4" />
              Generate Missing Images
            </Button>
            
            <Button 
              onClick={() => generateAllImages('all')}
              disabled={isGenerating}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
              <Image className="w-4 h-4" />
              Regenerate All Images
            </Button>
          </div>

          {isGenerating && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating images... This may take several minutes.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200">
          <CardContent className="p-4">
            <div className="text-red-700 font-medium">Error</div>
            <div className="text-red-600">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Generation Results */}
      {generationResult && (
        <Card>
          <CardHeader>
            <CardTitle>Generation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{generationResult.processed}</div>
                <div className="text-sm text-gray-600">Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{generationResult.generated}</div>
                <div className="text-sm text-gray-600">Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{generationResult.cached}</div>
                <div className="text-sm text-gray-600">Cached</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{generationResult.errors}</div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
            </div>

            {/* Recent Generation Details */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {generationResult.details.slice(0, 10).map((detail, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">{detail.title}</div>
                    {detail.diversityPrompt && (
                      <div className="text-xs text-gray-500">Diversity: {detail.diversityPrompt}</div>
                    )}
                  </div>
                  <Badge 
                    variant={
                      detail.status === 'generated' ? 'default' :
                      detail.status === 'cached' ? 'secondary' : 'destructive'
                    }
                  >
                    {detail.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}