
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ShareableReportProps {
  keyword: string;
  score: number;
  lastUpdated: string;
  results: any[];
}

export function ShareableReport({ keyword, score, lastUpdated, results }: ShareableReportProps) {
  const handlePrint = () => {
    window.print();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return 'bg-green-100 text-green-800';
      case 'NEGATIVE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (rankHistory: number[]) => {
    if (!rankHistory || rankHistory.length < 2) return <Minus className="w-4 h-4 text-gray-400" />;
    
    const firstRank = rankHistory[rankHistory.length - 1]; // Oldest rank
    const lastRank = rankHistory[0]; // Most recent rank
    
    if (lastRank < firstRank) {
      return <TrendingUp className="w-4 h-4 text-green-600" />; // Improved (lower rank number is better)
    } else if (lastRank > firstRank) {
      return <TrendingDown className="w-4 h-4 text-red-600" />; // Worsened
    } else {
      return <Minus className="w-4 h-4 text-gray-400" />; // No change
    }
  };

  const getTrendText = (rankHistory: number[]) => {
    if (!rankHistory || rankHistory.length < 2) return 'No data';
    
    const firstRank = rankHistory[rankHistory.length - 1];
    const lastRank = rankHistory[0];
    
    if (lastRank < firstRank) {
      return `↑ ${firstRank - lastRank}`;
    } else if (lastRank > firstRank) {
      return `↓ ${lastRank - firstRank}`;
    } else {
      return '→ 0';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      {/* Print Button - Hidden in print */}
      <div className="mb-6 print:hidden">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Download size={16} />
          Download PDF
        </Button>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Reputation Report
        </h1>
        <p className="text-lg text-gray-600">
          Keyword: <span className="font-semibold">{keyword}</span>
        </p>
        <p className="text-sm text-gray-500">
          Generated on {lastUpdated}
        </p>
      </div>

      {/* Score Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Reputation Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="text-xl text-gray-600 mt-2">
                out of 100
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Search Results Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Rank</th>
                  <th className="text-left p-3 font-semibold">Title</th>
                  <th className="text-left p-3 font-semibold">Domain</th>
                  <th className="text-left p-3 font-semibold">Sentiment</th>
                  <th className="text-left p-3 font-semibold">Control</th>
                  <th className="text-left p-3 font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id} className="border-b">
                    <td className="p-3 font-medium">
                      <div className="flex items-center gap-2">
                        #{result.rank}
                        {result.isNew && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">NEW</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 max-w-xs">
                      <div className="truncate" title={result.title}>
                        {result.title}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {result.domain || new URL(result.url).hostname}
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant="secondary" 
                        className={getSentimentColor(result.sentiment)}
                      >
                        {result.sentiment}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={result.hasControl ? "default" : "outline"}>
                        {result.hasControl ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(result.rankHistory)}
                        <span className="text-sm font-medium">
                          {getTrendText(result.rankHistory)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Generated by Reputation Tracker</p>
      </div>
    </div>
  );
}
