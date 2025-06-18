import { NotificationService } from '@/services/notificationService';
import { SimpleNotification } from '@/types/notification';
import { useCallback, useEffect, useState } from 'react';

export function useNotifications() {
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const notificationsData = await NotificationService.getUserNotifications();
      setNotifications(notificationsData);
    } catch (err: any) {
      console.error('Error loading notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const respondToNotification = useCallback(async (
    notificationId: string,
    response: 'accepted' | 'rejected',
    responseMessage?: string
  ) => {
    try {
      setError(null);
      
      // Update the notification with the response
      const responseType = response === 'accepted' ? 'request_accepted' : 'request_rejected';
      const message = responseMessage || `Request ${response}`;
      
      await NotificationService.updateNotification(notificationId, {
        type: responseType,
        message: message,
        read: true,
      });

      // Reload notifications
      await loadNotifications();
      
      return { success: true, message: `Request ${response} successfully` };
    } catch (err: any) {
      console.error('Error responding to notification:', err);
      setError(err.message);
      throw err;
    }
  }, [loadNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.$id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.$id !== notificationId));
    } catch (err: any) {
      console.error('Error deleting notification:', err);
    }
  }, []);

  const refresh = useCallback(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    loading,
    error,
    respondToNotification,
    markAsRead,
    deleteNotification,
    refresh,
    
    // Computed values
    unreadNotifications: notifications.filter(n => !n.read).length,
    totalUnread: notifications.filter(n => !n.read).length,
    pendingRequests: notifications.filter(n => n.type === 'food_request' && !n.read),
    acceptedRequests: notifications.filter(n => n.type === 'request_accepted'),
    rejectedRequests: notifications.filter(n => n.type === 'request_rejected'),
  };
}
