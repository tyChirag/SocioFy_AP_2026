import { useEffect, useRef, useLayoutEffect, useState, useMemo } from 'react';
import { Check, CheckCheck, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import Avatar from '../common/Avatar';
import { formatMessageTime, formatDateDivider } from '../../utils/messageFormatters';

/**
 * Helper to detect and render clickable URLs in message content safely
 */
const renderMessageContent = (content, isMe) => {
  if (!content) return '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline break-all transition-opacity hover:opacity-80 ${
            isMe ? 'text-white font-semibold' : 'text-[#5277D9] font-medium'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

/**
 * MessageList Component
 * Polished chronological message stream featuring:
 * - Consecutive message grouping (shared sender within 5 mins)
 * - Adaptive bubble corner radiuses
 * - Visual date separators (Today, Yesterday, Date)
 * - Distinct sent vs received bubble contrast
 * - Non-jumping cursor pagination
 * - Floating "Scroll to bottom" button when user scrolled up
 * - Live animated typing indicator
 */
const MessageList = ({
  messages = [],
  currentUserId,
  otherUser,
  isLoadingOlder = false,
  hasMore = false,
  onLoadOlder,
  isTyping = false,
}) => {
  const containerRef = useRef(null);
  const bottomAnchorRef = useRef(null);
  const scrollSnapshotRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Group messages and compute clustering metadata
  const groupedItems = useMemo(() => {
    const items = [];
    let lastDateStr = null;

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const prevMsg = i > 0 ? messages[i - 1] : null;
      const nextMsg = i < messages.length - 1 ? messages[i + 1] : null;

      // Check date change
      const dateStr = msg.createdAt ? new Date(msg.createdAt).toDateString() : '';
      if (dateStr && dateStr !== lastDateStr) {
        items.push({
          type: 'divider',
          id: `divider-${dateStr}-${i}`,
          date: msg.createdAt,
        });
        lastDateStr = dateStr;
      }

      // Clustering with previous message
      const isSameDateAsPrev = prevMsg && new Date(prevMsg.createdAt).toDateString() === dateStr;
      const timeDiffPrev = prevMsg && isSameDateAsPrev
        ? (new Date(msg.createdAt) - new Date(prevMsg.createdAt)) / 1000
        : Infinity;
      const isSameSenderAsPrev = Boolean(
        prevMsg && isSameDateAsPrev && Number(prevMsg.senderId) === Number(msg.senderId) && timeDiffPrev <= 300
      );

      // Clustering with next message
      const nextDateStr = nextMsg?.createdAt ? new Date(nextMsg.createdAt).toDateString() : '';
      const isSameDateAsNext = nextMsg && nextDateStr === dateStr;
      const timeDiffNext = nextMsg && isSameDateAsNext
        ? (new Date(nextMsg.createdAt) - new Date(msg.createdAt)) / 1000
        : Infinity;
      const isSameSenderAsNext = Boolean(
        nextMsg && isSameDateAsNext && Number(nextMsg.senderId) === Number(msg.senderId) && timeDiffNext <= 300
      );

      items.push({
        type: 'message',
        id: msg.id,
        data: msg,
        isFirstInGroup: !isSameSenderAsPrev,
        isLastInGroup: !isSameSenderAsNext,
        isGrouped: isSameSenderAsPrev || isSameSenderAsNext,
      });
    }

    return items;
  }, [messages]);

  // Handle Load Older: snapshot scroll before load
  const handleLoadOlderClick = () => {
    if (containerRef.current) {
      scrollSnapshotRef.current = {
        scrollHeight: containerRef.current.scrollHeight,
        scrollTop: containerRef.current.scrollTop,
      };
    }
    onLoadOlder();
  };

  // Restore scroll position after older messages prepended
  useLayoutEffect(() => {
    if (scrollSnapshotRef.current && containerRef.current) {
      const { scrollHeight: oldHeight, scrollTop: oldTop } = scrollSnapshotRef.current;
      const newHeight = containerRef.current.scrollHeight;
      containerRef.current.scrollTop = newHeight - oldHeight + oldTop;
      scrollSnapshotRef.current = null;
    }
  }, [messages]);

  // Initial load auto-scroll to bottom
  useEffect(() => {
    if (isInitialLoadRef.current && messages.length > 0) {
      bottomAnchorRef.current?.scrollIntoView({ behavior: 'auto' });
      isInitialLoadRef.current = false;
    }
  }, [messages.length]);

  // When a new message arrives at the bottom, auto-scroll if near bottom
  useEffect(() => {
    if (!containerRef.current) return;
    const { scrollHeight, scrollTop, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 280;
    if (isNearBottom) {
      bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages[messages.length - 1]?.id, isTyping]);

  // Track scroll position for "Scroll to bottom" button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollHeight, scrollTop, clientHeight } = containerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 350;
    setShowScrollBottom(isFarFromBottom);
  };

  const scrollToBottom = () => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative flex-1 flex flex-col min-h-0 bg-[#F8F9FC]/60">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-1"
      >
        {/* Load Older Messages Button */}
        {hasMore && (
          <div className="flex justify-center pb-3">
            <button
              type="button"
              onClick={handleLoadOlderClick}
              disabled={isLoadingOlder}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#E5E7EB] text-[#5277D9] hover:bg-[#F0F4FD] transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              {isLoadingOlder ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading older messages...</span>
                </>
              ) : (
                <span>Load older messages</span>
              )}
            </button>
          </div>
        )}

        {/* Empty State */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex items-center justify-center text-[#5277D9]">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="max-w-sm">
              <h4 className="text-base font-bold text-[#17233B]">Start the conversation</h4>
              <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                Send a message to connect, discuss campus projects, or collaborate with{' '}
                {otherUser?.fullName || 'this student'}.
              </p>
            </div>
          </div>
        )}

        {/* Message Stream */}
        {groupedItems.map((item) => {
          if (item.type === 'divider') {
            return (
              <div key={item.id} className="flex items-center justify-center my-4 select-none">
                <div className="border-t border-[#E5E7EB] flex-1" />
                <span className="px-3.5 py-1 bg-white border border-[#E5E7EB] rounded-full text-[11px] font-semibold text-[#667085] shadow-2xs">
                  {formatDateDivider(item.date)}
                </span>
                <div className="border-t border-[#E5E7EB] flex-1" />
              </div>
            );
          }

          const msg = item.data;
          const isMe = Number(msg.senderId) === Number(currentUserId);
          const isRead = Boolean(msg.readAt);

          // Dynamic corner radius based on clustering
          let radiusClasses = '';
          if (isMe) {
            if (!item.isGrouped) {
              radiusClasses = 'rounded-2xl rounded-br-xs';
            } else if (item.isFirstInGroup) {
              radiusClasses = 'rounded-2xl rounded-br-md';
            } else if (item.isLastInGroup) {
              radiusClasses = 'rounded-2xl rounded-tr-md rounded-br-xs';
            } else {
              radiusClasses = 'rounded-2xl rounded-tr-md rounded-br-md';
            }
          } else {
            if (!item.isGrouped) {
              radiusClasses = 'rounded-2xl rounded-bl-xs';
            } else if (item.isFirstInGroup) {
              radiusClasses = 'rounded-2xl rounded-bl-md';
            } else if (item.isLastInGroup) {
              radiusClasses = 'rounded-2xl rounded-tl-md rounded-bl-xs';
            } else {
              radiusClasses = 'rounded-2xl rounded-tl-md rounded-bl-md';
            }
          }

          const marginBottom = item.isLastInGroup ? 'mb-3 sm:mb-3.5' : 'mb-1';

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} ${marginBottom}`}
            >
              {/* Other student's avatar: show only at the bottom of a cluster */}
              {!isMe && (
                <div className="w-6 shrink-0 flex justify-center mb-0.5">
                  {item.isLastInGroup ? (
                    <Avatar
                      user={msg.sender || otherUser}
                      size="xs"
                      className="hidden sm:flex shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="w-6 hidden sm:block" />
                  )}
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] px-4 py-2.5 shadow-2xs transition-all ${radiusClasses} ${
                  isMe
                    ? 'bg-[#5277D9] text-white'
                    : 'bg-white text-[#17233B] border border-[#E5E7EB]'
                }`}
              >
                {/* Message Body */}
                <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed select-text [word-break:break-word]">
                  {renderMessageContent(msg.content, isMe)}
                </p>

                {/* Meta: Timestamp & Read Receipt */}
                <div
                  className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
                    isMe ? 'text-white/80' : 'text-[#98A2B3]'
                  }`}
                >
                  <span>{formatMessageTime(msg.createdAt)}</span>
                  {isMe && (
                    <span title={isRead ? `Read at ${formatMessageTime(msg.readAt)}` : 'Delivered'}>
                      {isRead ? (
                        <CheckCheck className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-white/70" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Typing Indicator */}
        {isTyping && (
          <div className="flex items-end gap-2 animate-in fade-in duration-200 mb-2">
            <div className="w-6 shrink-0 flex justify-center">
              <Avatar user={otherUser} size="xs" className="hidden sm:flex shrink-0 shadow-2xs" />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-bl-xs px-4 py-2.5 shadow-2xs flex items-center gap-1.5">
              <span className="text-xs text-[#667085] font-medium mr-1">
                {otherUser?.fullName?.split(' ')[0] || 'Student'} is typing
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#5277D9] animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#5277D9] animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#5277D9] animate-bounce" />
            </div>
          </div>
        )}

        {/* Bottom Anchor */}
        <div ref={bottomAnchorRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-4 right-6 p-2 rounded-full bg-white border border-[#E5E7EB] text-[#5277D9] shadow-md hover:bg-[#F0F4FD] transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold animate-in fade-in"
          title="Scroll to latest messages"
        >
          <ChevronDown className="w-4 h-4" />
          <span className="hidden sm:inline pr-1">Latest</span>
        </button>
      )}
    </div>
  );
};

export default MessageList;
