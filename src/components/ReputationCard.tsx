
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

interface ReputationCardProps {
  score: number;
  lastUpdated: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const ReputationCard: React.FC<ReputationCardProps> = ({
  score,
  lastUpdated,
  onRefresh,
  isRefreshing
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <Card className="shadow-xl bg-gradient-to-r from-white to-slate-50 border-2 hover:shadow-2xl transition-all duration-300">
      <CardContent className="p-8">
        <div className="flex justify-between items-center">
          <div className="space-y-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Reputation Score</h2>
              <div className="flex items-center space-x-4">
                <div className={`text-6xl font-black bg-gradient-to-r ${getScoreGradient(score)} bg-clip-text text-transparent`}>
                  {score}
                </div>
                <div className="space-y-1">
                  <div className={`text-lg font-semibold ${getScoreColor(score)}`}>
                    {getScoreLabel(score)}
                  </div>
                  <div className="flex items-center space-x-1">
                    {score >= 75 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm text-slate-600">
                      {score >= 75 ? 'Trending up' : 'Needs improvement'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Score Bar */}
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getScoreGradient(score)} transition-all duration-1000 ease-out rounded-full`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>

          <div className="text-right space-y-4">
            <div className="text-sm text-slate-600">
              <div className="font-medium">Last Updated</div>
              <div className="text-slate-800 font-semibold">{lastUpdated}</div>
            </div>
            
            <Button 
              onClick={onRefresh} 
              disabled={isRefreshing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Updating...' : 'Update Now'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReputationCard;
