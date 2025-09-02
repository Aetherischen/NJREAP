
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: 'new_job' | 'payment_update' | 'storage_warning' | 'system_alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Listen for new jobs
  useEffect(() => {
    const channel = supabase
      .channel('jobs-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'jobs'
        },
        (payload) => {
          console.log('New job notification:', payload);
          const job = payload.new as any;
          addNotification({
            type: 'new_job',
            title: 'New Job Submitted',
            message: `New job for ${job.property_address}`,
            data: job
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs'
        },
        (payload) => {
          console.log('Job update notification:', payload);
          const job = payload.new as any;
          const oldJob = payload.old as any;
          
          // Check if payment status changed
          if (job.invoice_status !== oldJob.invoice_status && job.invoice_status === 'paid') {
            addNotification({
              type: 'payment_update',
              title: 'Payment Received',
              message: `Payment received for ${job.property_address}`,
              data: job
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Check storage usage periodically
  useEffect(() => {
    const checkStorageUsage = async () => {
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const galleryBucket = buckets?.find(bucket => bucket.name === 'gallery-images');
        
        if (galleryBucket) {
          const { data: objects } = await supabase.storage
            .from('gallery-images')
            .list('', { limit: 1000 });

          if (objects && objects.length > 0) {
            let totalSize = 0;
            for (const obj of objects) {
              totalSize += obj.metadata?.size || 0;
            }
            
            const usedGB = totalSize / (1024 * 1024 * 1024);
            const percentage = (usedGB / 2) * 100; // 2GB limit

            if (percentage > 80) {
              addNotification({
                type: 'storage_warning',
                title: 'Storage Warning',
                message: `Storage usage is at ${percentage.toFixed(1)}%. Consider upgrading your plan.`,
                data: { percentage, usedGB }
              });
            }
          }
        }
      } catch (error) {
        console.error('Error checking storage usage:', error);
      }
    };

    // Check storage on mount and then every hour
    checkStorageUsage();
    const interval = setInterval(checkStorageUsage, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
