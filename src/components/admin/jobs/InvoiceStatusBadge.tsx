
import { Badge } from '@/components/ui/badge';

interface InvoiceStatusBadgeProps {
  invoiceStatus?: string;
}

const InvoiceStatusBadge = ({ invoiceStatus }: InvoiceStatusBadgeProps) => {
  const colors = {
    not_sent: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <Badge className={colors[invoiceStatus] || 'bg-gray-100 text-gray-800'}>
      {invoiceStatus?.replace('_', ' ').toUpperCase() || 'NOT SENT'}
    </Badge>
  );
};

export default InvoiceStatusBadge;
