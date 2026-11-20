import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { fetchConversations, markConversationReadApi } from '../Services/messageServices';

const NotificationContext = createContext(null);

/**
 * NotificationProvider
 * Centralized notification management across SocioFy:
 * - Real-time unread message counter badge
 * - Synchronized in-app message notifications
 * - Ephemeral notification toast banners
 * - Avoids duplicate notifications or notifying sender about their own messages
 * - Automatically restores counts from PostgreSQL on page reload
 */
export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { socket } = useSocket();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [toast, setToast] = useState(null);

  const activeConvRef = useRef(activeConversationId);
  activeConvRef.current = activeConversationId;

  const toastTimerRef = useRef(null);

  // 1. Initial fetch from backend on login or page refresh
  const refreshNotifications = useCallback(async () => {
    if (!currentUser) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    try {
      const convs = await fetchConversations();
      const totalUnread = convs.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
      setUnreadCount(totalUnread);

      // Extract recent conversations that have messages as notification items
      const notifs = convs
        .filter((c) => c.lastMessage)
        .slice(0, 15)
        .map((c) => ({
          id: `conv-${c.id}-${c.lastMessage.id}`,
          conversationId: c.id,
          sender: c.otherUser,
          content: c.lastMessage.content,
          createdAt: c.lastMessage.createdAt,
          unreadCount: c.unreadCount || 0,
          isRead: (c.unreadCount || 0) === 0,
        }));

      setNotifications(notifs);
    } catch (err) {
      console.warn('Failed to fetch initial unread notifications:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // 2. Dismiss Toast Banner
  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  }, []);

  // 3. Mark conversation as read
  const markConversationAsRead = useCallback(
    async (convId) => {
      const idNum = Number(convId);
      if (!idNum) return;

      try {
        await markConversationReadApi(idNum);

        if (socket) {
          socket.emit('message:read', { conversationId: idNum });
        }

        // Update local unread counter & notifications
        setNotifications((prev) => {
          let readMessagesInConv = 0;
          const updated = prev.map((n) => {
            if (Number(n.conversationId) === idNum) {
              readMessagesInConv = n.unreadCount || 1;
              return { ...n, isRead: true, unreadCount: 0 };
            }
            return n;
          });

          setUnreadCount((current) => Math.max(0, current - readMessagesInConv));
          return updated;
        });

        // If current toast is for this conversation, dismiss it
        if (toast?.conversationId === idNum) {
          dismissToast();
        }
      } catch (err) {
        console.warn('Failed to mark conversation read in context:', err);
      }
    },
    [socket, toast?.conversationId, dismissToast]
  );

  // 4. Real-time Socket.IO Listener for new messages
  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleNewMessage = (newMsg) => {
      if (!newMsg || !newMsg.id) return;

      const senderId = Number(newMsg.senderId);
      const currentUserId = Number(currentUser.id);
      const msgConvId = Number(newMsg.conversationId);
      const currentlyViewingId = activeConvRef.current ? Number(activeConvRef.current) : null;

      // RULE 1: Do NOT notify sender about their own messages
      if (senderId === currentUserId) return;

      // RULE 2: If user is actively viewing this conversation, do NOT increment unread or show toast
      if (currentlyViewingId && currentlyViewingId === msgConvId) {
        // Conversation is actively in focus, update notifications list as already read
        setNotifications((prev) => {
          const filtered = prev.filter((n) => Number(n.conversationId) !== msgConvId);
          return [
            {
              id: `msg-${newMsg.id}`,
              conversationId: msgConvId,
              sender: newMsg.sender,
              content: newMsg.content,
              createdAt: newMsg.createdAt,
              unreadCount: 0,
              isRead: true,
            },
            ...filtered,
          ];
        });
        return;
      }

      // User is on another page (/home, /explore) or viewing a DIFFERENT conversation:
      // Increment unread count in real time
      setUnreadCount((prev) => prev + 1);

      // Add to notifications dropdown list
      setNotifications((prev) => {
        const existing = prev.find((n) => Number(n.conversationId) === msgConvId);
        const prevUnread = existing?.unreadCount || 0;
        const filtered = prev.filter((n) => Number(n.conversationId) !== msgConvId);
        return [
          {
            id: `msg-${newMsg.id}`,
            conversationId: msgConvId,
            sender: newMsg.sender,
            content: newMsg.content,
            createdAt: newMsg.createdAt,
            unreadCount: prevUnread + 1,
            isRead: false,
          },
          ...filtered,
        ];
      });

      // Show in-app ephemeral notification toast
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setToast({
        id: newMsg.id,
        conversationId: msgConvId,
        sender: newMsg.sender,
        content: newMsg.content,
        createdAt: newMsg.createdAt,
      });

      // Auto-dismiss after 5 seconds
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
      }, 5000);
    };

    const handleReadUpdate = (data) => {
      if (!data) return;
      const readerId = Number(data.readerId);
      const currentUserId = Number(currentUser.id);
      const convId = Number(data.conversationId);

      // If the current user read messages in another tab/device, synchronize counts
      if (readerId === currentUserId) {
        setNotifications((prev) =>
          prev.map((n) =>
            Number(n.conversationId) === convId ? { ...n, isRead: true, unreadCount: 0 } : n
          )
        );
        refreshNotifications();
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:read:update', handleReadUpdate);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:read:update', handleReadUpdate);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [socket, currentUser, refreshNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        toast,
        dismissToast,
        activeConversationId,
        setActiveConversationId,
        markConversationAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      unreadCount: 0,
      notifications: [],
      toast: null,
      dismissToast: () => {},
      activeConversationId: null,
      setActiveConversationId: () => {},
      markConversationAsRead: async () => {},
      refreshNotifications: async () => {},
    };
  }
  return context;
};

export default NotificationContext;
