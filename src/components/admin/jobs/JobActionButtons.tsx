
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Send, X } from 'lucide-react';
import InvoiceDialog from './InvoiceDialog';

interface JobActionButtonsProps {
  job: any;
  isInvoiceDialogOpen: boolean;
  selectedJob: any;
  loadingInvoice: boolean;
  onDeclineJob: (jobId: string) => void;
  onCreateInvoice: (jobId: string, amount: string, description: string) => void;
  onSetSelectedJob: (job: any) => void;
  onSetInvoiceDialogOpen: (open: boolean) => void;
}

const JobActionButtons = ({
  job,
  isInvoiceDialogOpen,
  selectedJob,
  loadingInvoice,
  onDeclineJob,
  onCreateInvoice,
  onSetSelectedJob,
  onSetInvoiceDialogOpen
}: JobActionButtonsProps) => {
  const shouldShowDeclineButton = job.status === 'requested';
  const shouldShowInvoiceButton = job.status === 'completed' && 
    (!job.invoice_status || job.invoice_status === 'not_sent');

  return (
    <div className="flex space-x-2">
      {shouldShowDeclineButton && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <X className="w-4 h-4 mr-1" />
              Decline
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to decline this job?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The job will be marked as cancelled and the client will need to submit a new request if they want to proceed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDeclineJob(job.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Yes, Decline Job
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {shouldShowInvoiceButton && (
        <Dialog 
          open={isInvoiceDialogOpen && selectedJob?.id === job.id} 
          onOpenChange={(open) => {
            onSetInvoiceDialogOpen(open);
            if (!open) onSetSelectedJob(null);
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="bg-[#4d0a97] hover:bg-[#4d0a97]/90"
              size="sm"
              onClick={() => onSetSelectedJob(job)}
              disabled={loadingInvoice}
            >
              <Send className="w-4 h-4 mr-1" />
              Invoice
            </Button>
          </DialogTrigger>
          <InvoiceDialog
            job={selectedJob}
            onCreateInvoice={onCreateInvoice}
            loading={loadingInvoice}
            onClose={() => {
              onSetInvoiceDialogOpen(false);
              onSetSelectedJob(null);
            }}
          />
        </Dialog>
      )}
    </div>
  );
};

export default JobActionButtons;
