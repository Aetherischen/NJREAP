
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface JobsHeaderProps {
  totalJobs: number;
  onRefresh: () => void;
}

const JobsHeader = ({ totalJobs, onRefresh }: JobsHeaderProps) => {
  const handleRefresh = () => {
    console.log('Refresh button clicked in JobsHeader');
    onRefresh();
  };

  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Jobs Management</CardTitle>
        <CardDescription>
          Manage quote requests, create invoices, and track payments. Click on any job row to view detailed information.
          <br />
          <span className="text-sm text-gray-500">Total jobs: {totalJobs}</span>
        </CardDescription>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    </CardHeader>
  );
};

export default JobsHeader;
