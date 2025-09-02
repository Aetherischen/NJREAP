
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const colors = {
    requested: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    // Legacy statuses for backward compatibility
    pending: 'bg-yellow-100 text-yellow-800',
    quoted: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
    invoice_sent: 'bg-orange-100 text-orange-800',
    invoice_paid: 'bg-emerald-100 text-emerald-800'
  };

  return (
    <Badge className={colors[status]}>
      {status.replace('_', ' ').toUpperCase()}
    </Badge>
  );
};

export default StatusBadge;
