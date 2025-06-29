
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReputationCard from '@/components/ReputationCard';
import ResultsTable from '@/components/ResultsTable';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const Index = () => {
  const [score, setScore] = useState(78);
  const [lastUpdated, setLastUpdated] = useState('2025-06-29 03:00 PM');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [trackedKeywords, setTrackedKeywords] = useState<string[]>([]);
  const [savedReports, setSavedReports] = useState<Record<string, any[]>>({});
  const [selectedKeyword, setSelectedKeyword] = useState('');
  
  const [results, setResults] = useState([
    {
      id: 1,
      rank: 1,
      title: 'Negative Article About Data Privacy Concerns',
      url: 'https://techcrunch.com/example-article',
      serpFeature: 'organic',
      sentiment: 'NEGATIVE',
      hasControl: false,
      rankHistory: [3, 2, 1],
      domain: 'techcrunch.com'
    },
    {
      id: 2,
      rank: 2,
      title: 'Your LinkedIn Professional Profile',
      url: 'https://linkedin.com/in/yourname',
      serpFeature: 'profile',
      sentiment: 'POSITIVE',
      hasControl: true,
      rankHistory: [4, 3, 2],
      domain: 'linkedin.com'
    },
    {
      id: 3,
      rank: 3,
      title: 'Company News Release - Product Launch',
      url: 'https://businesswire.com/news-release',
      serpFeature: 'news',
      sentiment: 'POSITIVE',
      hasControl: true,
      rankHistory: [5, 4, 3],
      domain: 'businesswire.com'
    },
    {
      id: 4,
      rank: 4,
      title: 'Industry Forum Discussion Thread',
      url: 'https://reddit.com/r/technology/comments',
      serpFeature: 'forum',
      sentiment: 'NEUTRAL',
      hasControl: false,
      rankHistory: [6, 5, 4],
      domain: 'reddit.com'
    },
    {
      id: 5,
      rank: 5,
      title: 'Professional Bio on Company Website',
      url: 'https://yourcompany.com/team/bio',
      serpFeature: 'organic',
      sentiment: 'POSITIVE',
      hasControl: true,
      rankHistory: [7, 6, 5],
      domain: 'yourcompany.com'
    }
  ]);

  // Load saved reports from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('repRadarReports');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSavedReports(parsed);
      setTrackedKeywords(Object.keys(parsed));
    }
  }, []);

  // Save reports to localStorage whenever savedReports changes
  useEffect(() => {
    if (Object.keys(savedReports).length > 0) {
      localStorage.setItem('repRadarReports', JSON.stringify(savedReports));
    }
  }, [savedReports]);

  const refreshKeyword = async () => {
    if (!keyword) return;
    
    setIsRefreshing(true);
    try {
      const response = await fetch('http://192.168.1.115:3001/serp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keyword,
          maxResults: 50 
        }),
      });

      const data = await response.json();
      
      setSavedReports(prev => ({ ...prev, [keyword]: data.results }));
      setTrackedKeywords(prev => [...new Set([...prev, keyword])]);
      setSelectedKeyword(keyword);
      setResults(data.results);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error('Error fetching SERP data:', error);
      // Fallback to mock data update for now
      setScore(Math.floor(Math.random() * 20) + 70);
      setLastUpdated(new Date().toLocaleString());
    } finally {
      setIsRefreshing(false);
    }
  };

  function updateSentiment(id: number, newSentiment: string) {
    const updatedResults = results.map(item =>
      item.id === id ? { ...item, sentiment: newSentiment } : item
    );
    setResults(updatedResults);
    
    // Update the saved reports for the current keyword
    if (selectedKeyword) {
      setSavedReports(prev => ({
        ...prev,
        [selectedKeyword]: updatedResults
      }));
    }
  }

  function toggleControl(id: number) {
    const updatedResults = results.map(item =>
      item.id === id ? { ...item, hasControl: !item.hasControl } : item
    );
    setResults(updatedResults);
    
    // Update the saved reports for the current keyword
    if (selectedKeyword) {
      setSavedReports(prev => ({
        ...prev,
        [selectedKeyword]: updatedResults
      }));
    }
  }

  const calculateScore = (data: typeof results) => {
    let totalWeight = 0;
    let weightedScore = 0;
    
    data.forEach((result, index) => {
      // Higher positions have more weight (position 1 = weight 10, position 2 = weight 9, etc.)
      const weight = Math.max(11 - result.rank, 1);
      totalWeight += weight;
      
      let sentimentScore = 50; // Neutral baseline
      if (result.sentiment === 'POSITIVE') sentimentScore = 90;
      if (result.sentiment === 'NEGATIVE') sentimentScore = 10;
      
      // Boost score if we have control over the result
      if (result.hasControl && result.sentiment === 'POSITIVE') {
        sentimentScore = 95;
      }
      
      weightedScore += sentimentScore * weight;
    });
    
    return Math.round(weightedScore / totalWeight);
  };

  useEffect(() => {
    const newScore = calculateScore(results);
    setScore(newScore);
  }, [results]);

  useEffect(() => {
    if (savedReports[selectedKeyword]) {
      setResults([...savedReports[selectedKeyword]]); // Create a new array to avoid reference sharing
    }
  }, [selectedKeyword, savedReports]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Logo */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/499b2041-d476-4a05-b5b4-bd5e69c78469.png" 
              alt="Company Logo" 
              className="h-12 w-auto"
            />
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center space-y-2 py-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Reputation Tracker
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Monitor how your name or brand appears in Google search results with real-time sentiment analysis
          </p>
        </div>

        {/* Keyword Input Form */}
        <Card className="shadow-lg">
          <CardContent className="p-6 space-y-4">
            <form className="flex items-center space-x-2" onSubmit={(e) => { e.preventDefault(); refreshKeyword(); }}>
              <Input
                type="text"
                placeholder="Enter keyword (e.g. Your Name)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={refreshKeyword} disabled={isRefreshing}>
                {isRefreshing ? 'Tracking...' : 'Track'}
              </Button>
            </form>
            
            {/* Saved Reports Dropdown */}
            {trackedKeywords.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Saved Reports:</span>
                <Select value={selectedKeyword} onValueChange={setSelectedKeyword}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a saved report" />
                  </SelectTrigger>
                  <SelectContent>
                    {trackedKeywords.map((trackedKeyword) => (
                      <SelectItem key={trackedKeyword} value={trackedKeyword}>
                        {trackedKeyword}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reputation Score Card */}
        <ReputationCard 
          score={score}
          lastUpdated={lastUpdated}
          onRefresh={refreshKeyword}
          isRefreshing={isRefreshing}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Positive Results</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {results.filter(r => r.sentiment === 'POSITIVE').length}
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">Negative Results</span>
              </div>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {results.filter(r => r.sentiment === 'NEGATIVE').length}
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Controlled Results</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {results.filter(r => r.hasControl).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Results Analysis</span>
              <Badge variant="outline" className="text-sm">
                Top {results.length} Results
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResultsTable 
              results={results}
              onUpdateSentiment={updateSentiment}
              onToggleControl={toggleControl}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
