import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowLeft, Users, ShieldAlert } from 'lucide-react';
import TopNavbar from '../components/layout/TopNavbar';
import Sidebar from '../components/layout/Sidebar';
import BottomNavbar from '../components/layout/BottomNavbar';
import ConversationList from '../components/messages/ConversationList';
import ChatHeader from '../components/messages/ChatHeader';
import MessageList from '../components/messages/MessageList';
import MessageInput from '../components/messages/MessageInput';
import ConversationDetails from '../components/messages/ConversationDetails';
import {
  fetchConversations,
  fetchConversationDetails,
  fetchMessages,
  sendMessageApi,
  markConversationReadApi,
} from '../Services/messageServices';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNotifications } from '../context/NotificationContext';

/**
 * MessagesPage Component
 * Full-featured real-time 1-on-1 messaging interface for SocioFy.
 * - Multi-column responsive layout (Sidebar, Chat Window, Details Panel)
 * - Real-time Socket.IO synchronization for messages, typing, and presence
 * - Read receipts, unread counter badges, and cursor pagination
 */
const MessagesPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { socket, isUserOnline } = useSocket();
  const { setActiveConversationId: setContextActiveId, markConversationAsRead } = useNotifications();

  // State
  const [conversations, setConversations] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextBeforeId, setNextBeforeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const activeIdRef = useRef(conversationId);
  activeIdRef.current = conversationId;

  // 1. Fetch conversations list on mount
  const loadConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      const data = await fetchConversations();
      setConversations(data);
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 2. Select and load active conversation whenever conversationId URL param changes
  useEffect(() => {
    setContextActiveId(conversationId ? Number(conversationId) : null);

    if (!conversationId) {
      setActiveConversation(null);
      setMessages([]);
      setIsOtherUserTyping(false);
      return () => setContextActiveId(null);
    }

    const convIdNum = Number(conversationId);

    // Find in existing conversations list or fetch directly
    const found = conversations.find((c) => Number(c.id) === convIdNum);
    if (found) {
      setActiveConversation(found);
    } else {
      fetchConversationDetails(convIdNum)
        .then((conv) => {
          setActiveConversation(conv);
        })
        .catch((err) => {
          console.warn('Failed to load conversation details:', err);
          setGeneralError('Conversation not found or access denied.');
        });
    }

    // Load initial messages for active conversation
    const loadInitialMessages = async () => {
      try {
        setIsLoadingMessages(true);
        setGeneralError('');
        const res = await fetchMessages(convIdNum, { limit: 30 });
        setMessages(res.messages || []);
        setHasMore(res.hasMore);
        setNextBeforeId(res.nextBeforeId);

        // Mark as read immediately upon opening
        markConversationAsRead(convIdNum);

        // Update unread count in conversations state
        setConversations((prev) =>
          prev.map((c) => (Number(c.id) === convIdNum ? { ...c, unreadCount: 0 } : c))
        );
      } catch (err) {
        console.error('Failed to load messages for conversation:', err);
        setGeneralError(err.message || 'Failed to load messages.');
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadInitialMessages();

    return () => setContextActiveId(null);
  }, [conversationId, conversations.length, setContextActiveId, markConversationAsRead]);

  // 3. Socket.IO Room Joining & Cleanup
  useEffect(() => {
    if (!socket || !conversationId) return;

    const convIdNum = Number(conversationId);
    socket.emit('conversation:join', { conversationId: convIdNum });

    return () => {
      socket.emit('conversation:leave', { conversationId: convIdNum });
    };
  }, [socket, conversationId]);

  // 4. Socket.IO Real-Time Event Handlers
  useEffect(() => {
    if (!socket) return;

    // Incoming new message handler
    const handleNewMessage = (newMsg) => {
      if (!newMsg || !newMsg.id) return;
      const msgConvId = Number(newMsg.conversationId);
      const currentActiveId = Number(activeIdRef.current);

      if (msgConvId === currentActiveId) {
        // Active conversation: append message
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        // Mark read if incoming from other student
        if (Number(newMsg.senderId) !== Number(currentUser?.id)) {
          markConversationAsRead(msgConvId);
        }

        // Update sidebar preview
        setConversations((prev) => {
          const index = prev.findIndex((c) => Number(c.id) === msgConvId);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              lastMessage: newMsg,
              unreadCount: 0,
            };
            // Move active conversation to top of list
            const [moved] = updated.splice(index, 1);
            return [moved, ...updated];
          }
          return prev;
        });
      } else {
        // Different conversation: update last message and increment unread badge
        setConversations((prev) => {
          const index = prev.findIndex((c) => Number(c.id) === msgConvId);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              lastMessage: newMsg,
              unreadCount: (updated[index].unreadCount || 0) + 1,
            };
            const [moved] = updated.splice(index, 1);
            return [moved, ...updated];
          } else {
            // New conversation started by another user - reload list
            loadConversations();
            return prev;
          }
        });
      }
    };

    // Read receipt update handler
    const handleReadUpdate = (data) => {
      if (!data) return;
      const currentActiveId = Number(activeIdRef.current);

      if (Number(data.conversationId) === currentActiveId) {
        setMessages((prev) =>
          prev.map((m) => {
            if (Number(m.senderId) === Number(currentUser?.id) && !m.readAt) {
              return { ...m, readAt: data.readAt };
            }
            return m;
          })
        );
      }
    };

    // Typing indicator update handler
    const handleTypingUpdate = (data) => {
      if (!data) return;
      const currentActiveId = Number(activeIdRef.current);

      if (
        Number(data.conversationId) === currentActiveId &&
        Number(data.userId) !== Number(currentUser?.id)
      ) {
        setIsOtherUserTyping(Boolean(data.isTyping));
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:read:update', handleReadUpdate);
    socket.on('typing:update', handleTypingUpdate);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:read:update', handleReadUpdate);
      socket.off('typing:update', handleTypingUpdate);
    };
  }, [socket, currentUser?.id, loadConversations]);

  // 5. Send message action
  const handleSendMessage = async (content) => {
    if (!conversationId) return;
    const convIdNum = Number(conversationId);

    const savedMessage = await sendMessageApi(convIdNum, content);

    // Optimistically/safely append to local messages if not yet received via socket
    setMessages((prev) => {
      if (prev.some((m) => m.id === savedMessage.id)) return prev;
      return [...prev, savedMessage];
    });

    // Update conversation sidebar preview
    setConversations((prev) => {
      const index = prev.findIndex((c) => Number(c.id) === convIdNum);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          lastMessage: savedMessage,
        };
        const [moved] = updated.splice(index, 1);
        return [moved, ...updated];
      }
      return prev;
    });
  };

  // 6. Load older messages pagination
  const handleLoadOlder = async () => {
    if (!conversationId || isLoadingOlder || !hasMore || !nextBeforeId) return;

    try {
      setIsLoadingOlder(true);
      const res = await fetchMessages(Number(conversationId), {
        limit: 30,
        beforeId: nextBeforeId,
      });

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const filteredNew = (res.messages || []).filter((m) => !existingIds.has(m.id));
        return [...filteredNew, ...prev];
      });

      setHasMore(res.hasMore);
      setNextBeforeId(res.nextBeforeId);
    } catch (err) {
      console.warn('Failed to load older messages:', err);
    } finally {
      setIsLoadingOlder(false);
    }
  };

  // 7. Typing status emitters
  const handleTypingStart = () => {
    if (socket && conversationId) {
      socket.emit('typing:start', { conversationId: Number(conversationId) });
    }
  };

  const handleTypingStop = () => {
    if (socket && conversationId) {
      socket.emit('typing:stop', { conversationId: Number(conversationId) });
    }
  };

  const handleSelectConversation = (id) => {
    navigate(`/messages/${id}`);
  };

  const handleBackToList = () => {
    navigate('/messages');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#17233B] flex flex-col antialiased selection:bg-[#5277D9] selection:text-white">
      {/* Top Navigation Bar */}
      <TopNavbar />

      {/* Main Authenticated Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Global Navigation Sidebar (Visible on desktop, sticky) */}
          <div className="hidden md:block md:col-span-3 sticky top-22">
            <Sidebar />
          </div>

          {/* Right Column: Messages Area (12 cols on mobile, 9 cols on desktop) */}
          <div className="col-span-12 md:col-span-9 min-w-0">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs flex overflow-hidden h-[calc(100vh-8.5rem)] min-h-[560px]">
              {/* Internal Left Panel: Conversation List Sidebar */}
              {/* On mobile: visible only when NO conversation is selected */}
              <div
                className={`${
                  conversationId ? 'hidden md:flex' : 'flex'
                } w-full md:w-72 lg:w-80 flex-col shrink-0 h-full border-r border-[#E5E7EB]`}
              >
                <ConversationList
                  conversations={conversations}
                  activeConversationId={conversationId}
                  onSelectConversation={handleSelectConversation}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  isLoading={isLoadingConversations}
                />
              </div>

              {/* Internal Center Panel: Active Chat Window OR Empty State */}
              {/* On mobile: visible only when a conversation IS selected */}
              <div
                className={`${
                  !conversationId ? 'hidden md:flex' : 'flex'
                } flex-1 flex-col h-full min-w-0 bg-white relative`}
              >
                {activeConversation ? (
                  <>
                    {/* Header */}
                    <ChatHeader
                      otherUser={activeConversation.otherUser}
                      isOnline={isUserOnline(activeConversation.otherUser?.id)}
                      isTyping={isOtherUserTyping}
                      onBack={handleBackToList}
                      onToggleDetails={() => setShowDetails((prev) => !prev)}
                      showDetails={showDetails}
                    />

                    {/* Error Banner if any */}
                    {generalError && (
                      <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-600 text-xs flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>{generalError}</span>
                      </div>
                    )}

                    {/* Message Stream */}
                    {isLoadingMessages ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-[#667085] space-y-2">
                        <div className="w-8 h-8 border-2 border-[#5277D9] border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs">Loading messages...</p>
                      </div>
                    ) : (
                      <MessageList
                        messages={messages}
                        currentUserId={currentUser?.id}
                        otherUser={activeConversation.otherUser}
                        isLoadingOlder={isLoadingOlder}
                        hasMore={hasMore}
                        onLoadOlder={handleLoadOlder}
                        isTyping={isOtherUserTyping}
                      />
                    )}

                    {/* Input Composer */}
                    <MessageInput
                      onSendMessage={handleSendMessage}
                      onTypingStart={handleTypingStart}
                      onTypingStop={handleTypingStop}
                      disabled={isLoadingMessages}
                    />
                  </>
                ) : (
                  /* No Active Conversation Selected State (Desktop placeholder) */
                  <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center text-[#667085] bg-[#F8F9FC]/40">
                    <div className="w-16 h-16 rounded-2xl bg-[#F0F4FD] text-[#5277D9] flex items-center justify-center mb-4 shadow-xs">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-[#17233B]">Your Messages</h3>
                    <p className="text-xs sm:text-sm text-[#667085] max-w-sm mt-1 leading-relaxed">
                      Select a student from the sidebar to chat, or explore campus peers to start a new
                      conversation.
                    </p>
                  </div>
                )}
              </div>

              {/* Internal Right Panel: Conversation Details (Desktop toggleable) */}
              {showDetails && activeConversation && (
                <>
                  {/* Large screens: inline side panel */}
                  <div className="hidden xl:flex h-full">
                    <ConversationDetails
                      otherUser={activeConversation.otherUser}
                      onClose={() => setShowDetails(false)}
                    />
                  </div>

                  {/* Medium/Small screens: slide-over drawer with backdrop */}
                  <div className="xl:hidden fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="w-80 max-w-[85vw] h-full bg-white shadow-2xl animate-in slide-in-from-right duration-200">
                      <ConversationDetails
                        otherUser={activeConversation.otherUser}
                        onClose={() => setShowDetails(false)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation (only when no chat is open) */}
      {!conversationId && <BottomNavbar />}
    </div>
  );
};

export default MessagesPage;
