import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Shield, ShieldOff } from 'lucide-react';
import TrendChart from './TrendChart';

interface ResultItem {
  id: number;
  rank: number;
  title: string;
  url: string;
  serpFeature: string;
  sentiment: string;
  hasControl: boolean;
  rankHistory: number[];
  domain: string;
  isNew?: boolean; // Add optional isNew property
}

interface ResultsTableProps {
  results: ResultItem[];
  onUpdateSentiment: (id: number, sentiment: string) => void;
  onToggleControl: (id: number) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  onUpdateSentiment,
  onToggleControl
}) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'bg-green-50 border-l-4 border-green-400';
      case 'NEUTRAL':
        return 'bg-yellow-50 border-l-4 border-yellow-400';
      case 'NEGATIVE':
        return 'bg-red-50 border-l-4 border-red-400';
      default:
        return 'bg-white';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">🟢 Positive</Badge>;
      case 'NEUTRAL':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">🟡 Neutral</Badge>;
      case 'NEGATIVE':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">🔴 Negative</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getFeatureBadge = (feature: string) => {
    const colors = {
      organic: 'bg-blue-100 text-blue-800',
      news: 'bg-purple-100 text-purple-800',
      profile: 'bg-green-100 text-green-800',
      forum: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={colors[feature as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {feature.charAt(0).toUpperCase() + feature.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="w-16 font-semibold">#</TableHead>
            <TableHead className="font-semibold">Result</TableHead>
            <TableHead className="w-24 font-semibold">Type</TableHead>
            <TableHead className="w-32 font-semibold">Sentiment</TableHead>
            <TableHead className="w-24 font-semibold">Control</TableHead>
            <TableHead className="w-32 font-semibold">Trend</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow 
              key={result.id} 
              className={`${getSentimentColor(result.sentiment)} hover:shadow-md transition-all duration-200`}
            >
              <TableCell className="font-bold text-lg">
                <div className="flex items-center gap-2">
                  {result.rank}
                  {result.isNew && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">NEW</Badge>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="space-y-1">
                <div className="font-semibold">{result.title}</div>
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 underline hover:text-blue-800 flex items-center space-x-1 group"
                >
                  <span className="truncate max-w-xs">{result.url}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </TableCell>
              
              <TableCell>
                {getFeatureBadge(result.serpFeature)}
              </TableCell>
              
              <TableCell>
                <Select 
                  value={result.sentiment} 
                  onValueChange={(value) => onUpdateSentiment(result.id, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {getSentimentBadge(result.sentiment)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POSITIVE">🟢 Positive</SelectItem>
                    <SelectItem value="NEUTRAL">🟡 Neutral</SelectItem>
                    <SelectItem value="NEGATIVE">🔴 Negative</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onToggleControl(result.id)}
                  className={`hover:scale-110 transition-transform ${
                    result.hasControl 
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {result.hasControl ? (
                    <Shield className="w-5 h-5" />
                  ) : (
                    <ShieldOff className="w-5 h-5" />
                  )}
                </Button>
              </TableCell>
              
              <TableCell>
                <TrendChart data={result.rankHistory} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ResultsTable;
