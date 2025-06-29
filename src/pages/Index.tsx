import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import ReputationCard from '@/components/ReputationCard';
import ResultsTable from '@/components/ResultsTable';
import { ShareReportModal } from '@/components/ShareReportModal';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const Index = () => {
  const [score, setScore] = useState(78);
  const [lastUpdated, setLastUpdated] = useState('2025-06-29 03:00 PM');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [trackedKeywords, setTrackedKeywords] = useState<string[]>([]);
  const [savedReports, setSavedReports] = useState<Record<string, any[]>>({});
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
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

  const refreshKeyword = async (keywordToRefresh?: string) => {
    const targetKeyword = keywordToRefresh || selectedKeyword || keyword;
    if (!targetKeyword) return;
    
    setIsRefreshing(true);
    try {
      const response = await fetch('http://localhost:3001/serp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: targetKeyword }),
      });

      const data = await response.json();
      setResults(data.results);
      
      // Update saved reports and UI state
      setSavedReports(prev => ({ ...prev, [targetKeyword]: data.results }));
      setTrackedKeywords(prev => [...new Set([...prev, targetKeyword])]);
      setSelectedKeyword(targetKeyword);
      setLastUpdated(new Date().toLocaleString());
      
      // Clear the input field if we just tracked a new keyword
      if (targetKeyword === keyword) {
        setKeyword('');
      }
    } catch (error) {
      console.error('Error fetching SERP data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  function updateSentiment(id: number, newSentiment: string) {
    console.log('Updating sentiment for ID:', id, 'to:', newSentiment);
    
    // Update the current results
    const updatedResults = results.map(item =>
      item.id === id ? { ...item, sentiment: newSentiment } : item
    );
    setResults(updatedResults);
    
    // Update the saved reports for the current keyword
    if (selectedKeyword && savedReports[selectedKeyword]) {
      const updatedSavedResults = savedReports[selectedKeyword].map(item =>
        item.id === id ? { ...item, sentiment: newSentiment } : item
      );
      
      setSavedReports(prev => ({
        ...prev,
        [selectedKeyword]: updatedSavedResults
      }));
    }
  }

  function toggleControl(id: number) {
    console.log('Toggling control for ID:', id);
    
    // Update the current results
    const updatedResults = results.map(item =>
      item.id === id ? { ...item, hasControl: !item.hasControl } : item
    );
    setResults(updatedResults);
    
    // Update the saved reports for the current keyword
    if (selectedKeyword && savedReports[selectedKeyword]) {
      const updatedSavedResults = savedReports[selectedKeyword].map(item =>
        item.id === id ? { ...item, hasControl: !item.hasControl } : item
      );
      
      setSavedReports(prev => ({
        ...prev,
        [selectedKeyword]: updatedSavedResults
      }));
    }
  }

  const calculateScore = (data: typeof results) => {
    let totalWeight = 0;
    let weightedScore = 0;
    let hasNegativeInTop10 = false;
    
    // Check if there are negative results in top 10
    data.forEach((result) => {
      if (result.rank <= 10 && result.sentiment === 'NEGATIVE') {
        hasNegativeInTop10 = true;
      }
    });
    
    data.forEach((result) => {
      // Base weight calculation
      let weight = Math.max(11 - result.rank, 1);
      
      // Apply position-based multipliers
      if (result.rank <= 10) {
        weight *= 3; // 3x weighting for top 10
        
        // Extra penalty weighting for negative results in top 10
        if (result.sentiment === 'NEGATIVE') {
          weight *= 2; // Additional 2x weighting for negative results in top 10
        }
      } else if (result.rank <= 20) {
        weight *= 1.5; // 1.5x weighting for positions 11-20
      }
      
      // Apply control boost (20% increase in weighting)
      if (result.hasControl) {
        weight *= 1.2;
      }
      
      totalWeight += weight;
      
      let sentimentScore = 50; // Neutral baseline
      if (result.sentiment === 'POSITIVE') sentimentScore = 90;
      if (result.sentiment === 'NEGATIVE') sentimentScore = 10;
      
      // Boost score if we have control over positive results
      if (result.hasControl && result.sentiment === 'POSITIVE') {
        sentimentScore = 95;
      }
      
      weightedScore += sentimentScore * weight;
    });
    
    let finalScore = Math.round(weightedScore / totalWeight);
    
    // Cap score at 60 if there are negative results in top 10, but still allow it to go lower
    if (hasNegativeInTop10 && finalScore > 60) {
      finalScore = 60;
    }
    
    return finalScore;
  };

  useEffect(() => {
    const newScore = calculateScore(results);
    setScore(newScore);
  }, [results]);

  useEffect(() => {
    if (savedReports[selectedKeyword]) {
      // Create completely new objects to avoid any reference sharing
      const freshResults = savedReports[selectedKeyword].map(result => ({ ...result }));
      setResults(freshResults);
    }
  }, [selectedKeyword]);

  const loadReport = (reportKeyword: string) => {
    setSelectedKeyword(reportKeyword);
    if (savedReports[reportKeyword]) {
      const freshResults = savedReports[reportKeyword].map(result => ({ ...result }));
      setResults(freshResults);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar 
          savedReports={savedReports}
          onLoadReport={loadReport}
          selectedKeyword={selectedKeyword}
        />
        <SidebarInset>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header with Logo and Sidebar Toggle */}
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger />
                  <img 
                    src="/lovable-uploads/f64bc9a8-107c-40dd-b13a-b4ad224292db.png" 
                    alt="Reputation Citadel Logo" 
                    className="h-16 w-auto"
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
                <CardContent className="p-6">
                  <form className="flex items-center space-x-2" onSubmit={(e) => { e.preventDefault(); refreshKeyword(); }}>
                    <Input
                      type="text"
                      placeholder="Enter keyword (e.g. Your Name)"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="flex-grow"
                    />
                    <Button onClick={() => refreshKeyword()} disabled={isRefreshing}>
                      {isRefreshing ? 'Tracking...' : 'Track'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Reputation Score Card */}
              <ReputationCard 
                score={score}
                lastUpdated={lastUpdated}
                onRefresh={() => refreshKeyword()}
                isRefreshing={isRefreshing}
                onShare={() => setIsShareModalOpen(true)}
              />

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
        </SidebarInset>
      </div>

      {/* Share Report Modal */}
      <ShareReportModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        keyword={selectedKeyword || keyword}
        score={score}
        lastUpdated={lastUpdated}
        results={results}
      />
    </SidebarProvider>
  );
};

export default Index;
