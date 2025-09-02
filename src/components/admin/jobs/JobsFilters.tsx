
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface JobsFiltersProps {
  searchTerm: string;
  filterStatus: string;
  filterService: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onServiceChange: (value: string) => void;
}

const JobsFilters = ({
  searchTerm,
  filterStatus,
  filterService,
  onSearchChange,
  onStatusChange,
  onServiceChange
}: JobsFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4">
      <Input
        placeholder="Search jobs..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
      <Select value={filterStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="requested">Requested</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
          {/* Legacy statuses for backward compatibility */}
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="quoted">Quoted</SelectItem>
          <SelectItem value="accepted">Accepted</SelectItem>
          <SelectItem value="invoice_sent">Invoice Sent</SelectItem>
          <SelectItem value="invoice_paid">Invoice Paid</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterService} onValueChange={onServiceChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by service" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Services</SelectItem>
          <SelectItem value="photography">Photography</SelectItem>
          <SelectItem value="floor_plans">Floor Plans</SelectItem>
          <SelectItem value="virtual_tour">Virtual Tour</SelectItem>
          <SelectItem value="aerial_photography">Aerial Photography</SelectItem>
          <SelectItem value="appraisal">Appraisal</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default JobsFilters;
