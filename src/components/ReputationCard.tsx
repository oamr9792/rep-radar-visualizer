
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Share2 } from 'lucide-react';

interface ReputationCardProps {
  score: number;
  lastUpdated: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  onShare?: () => void;
}

export default function ReputationCard({ 
  score, 
  lastUpdated, 
  onRefresh, 
  isRefreshing,
  onShare 
}: ReputationCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 border-green-200 bg-green-50';
    if (score >= 60) return 'text-yellow-600 border-yellow-200 bg-yellow-50';
    return 'text-red-600 border-red-200 bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Attention';
  };

  return (
    <Card className={`shadow-lg border-2 ${getScoreColor(score)}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Reputation Score</span>
          <div className="flex gap-2">
            {onShare && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onShare}
                className="flex items-center gap-2"
              >
                <Share2 size={16} />
                Share Report
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh} 
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
              {score}
            </div>
            <div className="text-xl text-gray-600 mt-2">
              out of 100
            </div>
            <Badge 
              variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}
              className="mt-2"
            >
              {getScoreLabel(score)}
            </Badge>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Last updated:</p>
            <p className="font-medium">{lastUpdated}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
