
import { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, RefreshCw, Edit } from 'lucide-react';

interface InvoiceDialogProps {
  job: any;
  onCreateInvoice: (jobId: string, amount: string, description: string) => void;
  loading: boolean;
  onClose: () => void;
}

const InvoiceDialog = ({ job, onCreateInvoice, loading, onClose }: InvoiceDialogProps) => {
  const [amount, setAmount] = useState(job?.quoted_amount || '');
  const [description, setDescription] = useState('');
  const [isEditingAmount, setIsEditingAmount] = useState(false);

  useEffect(() => {
    if (job) {
      setAmount(job.quoted_amount || '');
      setDescription(`${job.service_type.replace('_', ' ').toUpperCase()} service for ${job.property_address}`);
    }
  }, [job]);

  if (!job) return null;

  const handleCreateInvoice = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    await onCreateInvoice(job.id, amount, description);
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Create Stripe Invoice</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>Client</Label>
          <p className="text-sm text-gray-600">{job.client_name} ({job.client_email})</p>
        </div>
        <div>
          <Label>Service</Label>
          <p className="text-sm text-gray-600">{job.service_type.replace('_', ' ').toUpperCase()}</p>
        </div>
        <div>
          <Label>Property</Label>
          <p className="text-sm text-gray-600">{job.property_address}</p>
        </div>
        <div>
          <Label htmlFor="invoice_amount">Invoice Amount ($)</Label>
          <div className="flex items-center space-x-2">
            {isEditingAmount ? (
              <Input
                id="invoice_amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter invoice amount"
                required
                onBlur={() => setIsEditingAmount(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Escape') {
                    setIsEditingAmount(false);
                  }
                }}
                autoFocus
              />
            ) : (
              <>
                <div className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-gray-900">
                  ${amount || '0'}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingAmount(true)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="invoice_description">Description (Optional)</Label>
          <Textarea
            id="invoice_description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional description for the invoice"
            rows={3}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            className="bg-[#4d0a97] hover:bg-[#4d0a97]/90"
            onClick={handleCreateInvoice} 
            disabled={loading || !amount || parseFloat(amount) <= 0}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Invoice
              </>
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default InvoiceDialog;
