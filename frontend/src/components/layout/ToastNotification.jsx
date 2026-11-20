import { useNavigate } from 'react-router-dom';
import { X, MessageSquare } from 'lucide-react';
import Avatar from '../common/Avatar';
import { useNotifications } from '../../context/NotificationContext';

/**
 * ToastNotification Component
 * Floating ephemeral banner in the top-right corner when receiving a message
 * while viewing other parts of SocioFy.
 */
const ToastNotification = () => {
  const { toast, dismissToast, markConversationAsRead } = useNotifications();
  const navigate = useNavigate();

  if (!toast) return null;

  const handleClick = () => {
    markConversationAsRead(toast.conversationId);
    navigate(`/messages/${toast.conversationId}`);
    dismissToast();
  };

  return (
    <div
      role="alert"
      className="fixed top-18 right-4 z-50 max-w-sm w-full bg-white border border-[#E5E7EB] rounded-2xl shadow-xl p-3.5 flex items-start gap-3 animate-in slide-in-from-top-4 fade-in duration-200 cursor-pointer hover:border-[#5277D9] transition-all"
      onClick={handleClick}
    >
      <div className="relative shrink-0">
        <Avatar user={toast.sender} size="md" />
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#5277D9] flex items-center justify-center text-white ring-2 ring-white">
          <MessageSquare className="w-2 h-2" />
        </span>
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between gap-1">
          <h4 className="text-xs sm:text-sm font-bold text-[#17233B] truncate">
            {toast.sender?.fullName || 'New Message'}
          </h4>
          <span className="text-[10px] text-[#98A2B3] shrink-0">Just now</span>
        </div>
        <p className="text-xs text-[#475467] line-clamp-2 mt-0.5 leading-snug">
          {toast.content}
        </p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          dismissToast();
        }}
        className="p-1 -mr-1 rounded-lg text-[#98A2B3] hover:text-[#17233B] hover:bg-[#F8F9FC] transition-colors cursor-pointer shrink-0"
        title="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ToastNotification;
