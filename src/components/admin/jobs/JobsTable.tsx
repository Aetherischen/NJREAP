
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import StatusBadge from './StatusBadge';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import JobActionButtons from './JobActionButtons';

interface JobsTableProps {
  jobs: any[];
  loading: boolean;
  isInvoiceDialogOpen: boolean;
  selectedJob: any;
  loadingInvoice: boolean;
  onJobRowClick: (job: any) => void;
  onDeclineJob: (jobId: string) => void;
  onCreateInvoice: (jobId: string, amount: string, description: string) => void;
  onSetSelectedJob: (job: any) => void;
  onSetInvoiceDialogOpen: (open: boolean) => void;
  parseServiceDetails: (job: any) => string;
}

const JobsTable = ({
  jobs,
  loading,
  isInvoiceDialogOpen,
  selectedJob,
  loadingInvoice,
  onJobRowClick,
  onDeclineJob,
  onCreateInvoice,
  onSetSelectedJob,
  onSetInvoiceDialogOpen,
  parseServiceDetails
}: JobsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead className="w-[300px]">Service Details</TableHead>
          <TableHead>Property Address</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Invoice Status</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <TableRow 
              key={job.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onJobRowClick(job)}
            >
              <TableCell>
                <div>
                  <div className="font-medium">{job.client_name}</div>
                  <div className="text-sm text-gray-600">{job.client_email}</div>
                </div>
              </TableCell>
              <TableCell className="w-[300px]">
                <div className="space-y-1">
                  <Badge variant="outline" className="mb-1">
                    {job.service_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {parseServiceDetails(job)}
                  </div>
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate">{job.property_address}</TableCell>
              <TableCell>
                <StatusBadge status={job.status} />
              </TableCell>
              <TableCell>
                <InvoiceStatusBadge invoiceStatus={job.invoice_status} />
              </TableCell>
              <TableCell>
                {job.invoice_amount ? `$${parseFloat(job.invoice_amount).toLocaleString()}` : 
                 job.quoted_amount ? `$${parseFloat(job.quoted_amount).toLocaleString()}` : '-'}
              </TableCell>
              <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <div onClick={(e) => e.stopPropagation()}>
                  <JobActionButtons
                    job={job}
                    isInvoiceDialogOpen={isInvoiceDialogOpen}
                    selectedJob={selectedJob}
                    loadingInvoice={loadingInvoice}
                    onDeclineJob={onDeclineJob}
                    onCreateInvoice={onCreateInvoice}
                    onSetSelectedJob={onSetSelectedJob}
                    onSetInvoiceDialogOpen={onSetInvoiceDialogOpen}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
              {loading ? "Loading jobs..." : "No jobs found matching your criteria."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default JobsTable;
