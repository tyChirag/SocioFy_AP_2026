import { useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BellOff, MessageSquare, Check, ArrowRight } from 'lucide-react';
import Avatar from '../common/Avatar';
import { useNotifications } from '../../context/NotificationContext';
import { formatLastMessageTime } from '../../utils/messageFormatters';

/**
 * NotificationDropdown Component
 * Displays real-time message notifications, sender preview, unread badges,
 * and direct navigation to conversations.
 */
const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markConversationAsRead } = useNotifications();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNotificationClick = (convId) => {
    markConversationAsRead(convId);
    onClose();
    navigate(`/messages/${convId}`);
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8F9FC]/60">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[#17233B]">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#5277D9] text-white text-[10px] font-bold">
              {unreadCount} new
            </span>
          )}
        </div>
        <Link
          to="/messages"
          onClick={onClose}
          className="text-xs text-[#5277D9] hover:underline font-semibold"
        >
          Messages
        </Link>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-[#F1F3F9]">
        {notifications.length === 0 ? (
          <div className="py-8 px-4 text-center text-[#667085] space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#F0F4FD] flex items-center justify-center text-[#5277D9] mb-2">
              <BellOff className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#17233B]">No new notifications</p>
            <p className="text-xs text-[#667085] max-w-xs mx-auto">
              When peers message or connect with you, your notifications will appear here.
            </p>
          </div>
        ) : (
          notifications.map((item) => {
            const hasUnread = !item.isRead || (item.unreadCount || 0) > 0;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNotificationClick(item.conversationId)}
                className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                  hasUnread ? 'bg-[#F0F4FD]/40 hover:bg-[#F0F4FD]' : 'hover:bg-[#F8F9FC]'
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar user={item.sender} size="md" />
                  {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#5277D9] ring-2 ring-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span
                      className={`text-xs sm:text-sm truncate ${
                        hasUnread ? 'font-bold text-[#17233B]' : 'font-semibold text-[#17233B]'
                      }`}
                    >
                      {item.sender?.fullName || 'Fellow Student'}
                    </span>
                    <span className="text-[10px] text-[#98A2B3] shrink-0 font-medium">
                      {formatLastMessageTime(item.createdAt)}
                    </span>
                  </div>

                  <p
                    className={`text-xs truncate ${
                      hasUnread ? 'font-medium text-[#17233B]' : 'text-[#667085]'
                    }`}
                  >
                    {item.content || 'Sent you a message.'}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-[#E5E7EB] bg-[#F8F9FC]/40 text-center">
        <Link
          to="/messages"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5277D9] hover:text-[#4364c2] transition-colors py-1 px-3"
        >
          <span>View all conversations</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
