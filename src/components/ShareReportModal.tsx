
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShareableReport } from './ShareableReport';

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  score: number;
  lastUpdated: string;
  results: any[];
}

export function ShareReportModal({ 
  isOpen, 
  onClose, 
  keyword, 
  score, 
  lastUpdated, 
  results 
}: ShareReportModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Shareable Report</DialogTitle>
        </DialogHeader>
        <ShareableReport
          keyword={keyword}
          score={score}
          lastUpdated={lastUpdated}
          results={results}
        />
      </DialogContent>
    </Dialog>
  );
}
