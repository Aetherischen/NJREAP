
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/contexts/NotificationsContext';
import { 
  Bell, 
  CheckCircle, 
  DollarSign, 
  AlertTriangle, 
  Briefcase,
  Settings,
  X,
  Check
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_job':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'payment_update':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'storage_warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'system_alert':
        return <Settings className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50';
    
    switch (type) {
      case 'new_job':
        return 'bg-blue-50 border-l-4 border-blue-500';
      case 'payment_update':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'storage_warning':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'system_alert':
        return 'bg-red-50 border-l-4 border-red-500';
      default:
        return 'bg-gray-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-12 right-0 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          <h3 className="font-semibold">Notifications</h3>
          {notifications.filter(n => !n.read).length > 0 && (
            <Badge variant="secondary">
              {notifications.filter(n => !n.read).length}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {notifications.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <Check className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNotifications}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Clear all
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="max-h-96">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
            <p className="text-xs">You'll receive notifications for new jobs, payments, and system alerts.</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${getNotificationBgColor(
                  notification.type,
                  notification.read
                )}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationsPanel;
