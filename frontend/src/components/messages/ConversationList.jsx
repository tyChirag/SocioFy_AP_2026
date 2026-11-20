import { useMemo } from 'react';
import { Search, MessageSquare, CheckCheck, Check, X } from 'lucide-react';
import Avatar from '../common/Avatar';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { formatLastMessageTime } from '../../utils/messageFormatters';

/**
 * ConversationList Component
 * Displays searchable list of 1-on-1 conversations with students.
 * Features live search, online presence, unread indicators, and active highlights.
 */
const ConversationList = ({
  conversations = [],
  activeConversationId,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  isLoading,
}) => {
  const { isUserOnline } = useSocket();
  const { currentUser } = useAuth();

  // Filter conversations by student name or college
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase().trim();
    return conversations.filter((c) => {
      const user = c.otherUser || c.otherParticipant || {};
      const name = user.fullName?.toLowerCase() || '';
      const college = user.college?.toLowerCase() || '';
      const dept = user.department?.toLowerCase() || '';
      return name.includes(query) || college.includes(query) || dept.includes(query);
    });
  }, [conversations, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-[#E5E7EB] select-none">
      {/* Header & Search */}
      <div className="p-4 border-b border-[#E5E7EB] space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#17233B] tracking-tight">Messages</h2>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E8EDF7] text-[#5277D9]">
            {conversations.length}
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search student or college..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-[#17233B] placeholder-[#667085] focus:outline-none focus:bg-white focus:border-[#5277D9] focus:ring-1 focus:ring-[#5277D9] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#98A2B3] hover:text-[#17233B] hover:bg-gray-200 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#F1F3F9]">
        {isLoading && conversations.length === 0 ? (
          <div className="p-8 text-center text-[#667085] space-y-3">
            <div className="w-8 h-8 mx-auto border-2 border-[#5277D9] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-[#667085] space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#F0F4FD] flex items-center justify-center text-[#5277D9] mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            {searchQuery ? (
              <>
                <p className="text-sm font-bold text-[#17233B]">No results found</p>
                <p className="text-xs text-[#667085]">No conversations match "{searchQuery}"</p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-[#17233B]">No messages yet</p>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Connect with fellow students across campuses to start chatting!
                </p>
              </>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = Number(activeConversationId) === Number(conv.id);
            const otherUser = conv.otherUser || conv.otherParticipant || {};
            const isOnline = isUserOnline(otherUser.id);
            const hasUnread = (conv.unreadCount || 0) > 0;
            const lastMsg = conv.lastMessage || conv.latestMessage;
            const isSentByMe = lastMsg && Number(lastMsg.senderId) === Number(currentUser?.id);

            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#E8EDF7]/70 border-l-4 border-[#5277D9]'
                    : hasUnread
                    ? 'bg-[#F0F4FD]/50 hover:bg-[#F0F4FD]'
                    : 'hover:bg-[#F8F9FC]'
                }`}
              >
                {/* Avatar with Online Presence Dot */}
                <div className="relative shrink-0">
                  <Avatar user={otherUser} size="md" className="shadow-2xs" />
                  {isOnline ? (
                    <span
                      title="Online"
                      className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-400"
                    />
                  ) : (
                    <span
                      title="Offline"
                      className="absolute bottom-0 right-0 w-3 h-3 bg-gray-300 rounded-full border-2 border-white"
                    />
                  )}
                </div>

                {/* Details & Preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className={`text-xs sm:text-sm truncate ${
                          hasUnread ? 'font-bold text-[#17233B]' : 'font-semibold text-[#17233B]'
                        }`}
                      >
                        {otherUser.fullName || 'Student'}
                      </span>
                      {hasUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#5277D9] shrink-0" />
                      )}
                    </div>
                    {lastMsg?.createdAt && (
                      <span className="text-[11px] text-[#98A2B3] shrink-0 font-medium">
                        {formatLastMessageTime(lastMsg.createdAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-xs truncate ${
                        hasUnread
                          ? 'font-medium text-[#17233B]'
                          : 'text-[#667085]'
                      }`}
                    >
                      {lastMsg ? (
                        <>
                          {isSentByMe && (
                            <span className="text-[#5277D9] font-medium mr-1 inline-flex items-center">
                              {lastMsg.readAt ? (
                                <CheckCheck className="w-3.5 h-3.5 inline mr-0.5 text-[#5277D9]" />
                              ) : (
                                <Check className="w-3.5 h-3.5 inline mr-0.5 text-gray-400" />
                              )}
                              You:
                            </span>
                          )}
                          <span>{lastMsg.content}</span>
                        </>
                      ) : (
                        <span className="italic text-[#98A2B3]">No messages yet</span>
                      )}
                    </p>

                    {/* Unread badge */}
                    {hasUnread && (
                      <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-[#5277D9] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                        {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* College / Department snippet */}
                  {otherUser.college && (
                    <p className="text-[11px] text-[#98A2B3] truncate mt-0.5">
                      {otherUser.college}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
