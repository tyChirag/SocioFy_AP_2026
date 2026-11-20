import { ArrowLeft, Info, ExternalLink, Building, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';

/**
 * ChatHeader Component
 * Sticky top navigation bar of active chat window with participant details,
 * live online indicator, and responsive controls.
 */
const ChatHeader = ({
  otherUser,
  isOnline = false,
  isTyping = false,
  onBack,
  onToggleDetails,
  showDetails = false,
}) => {
  if (!otherUser) return null;

  const displayName = otherUser.fullName || otherUser.name || 'Student';

  return (
    <div className="sticky top-0 z-20 h-16 px-4 sm:px-6 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-md flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="md:hidden p-2 -ml-2 rounded-xl text-[#667085] hover:text-[#17233B] hover:bg-[#F8F9FC] transition-colors cursor-pointer"
          aria-label="Back to conversations list"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* User Avatar with status dot */}
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

        {/* Name, College & Presence */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm sm:text-base font-bold text-[#17233B] truncate leading-tight">
              {displayName}
            </h3>
            {otherUser.id && (
              <Link
                to={`/profile/${otherUser.id}`}
                target="_blank"
                rel="noopener noreferrer"
                title="View full profile"
                className="text-[#98A2B3] hover:text-[#5277D9] transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs truncate mt-0.5">
            {isTyping ? (
              <span className="text-[#5277D9] font-semibold animate-pulse">Typing...</span>
            ) : isOnline ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active now
              </span>
            ) : otherUser.college ? (
              <span className="text-[#667085] truncate flex items-center gap-1">
                <Building className="w-3 h-3 text-[#98A2B3] shrink-0" />
                {otherUser.college}
              </span>
            ) : (
              <span className="text-[#98A2B3]">Offline</span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleDetails}
          title={showDetails ? 'Hide student details' : 'Show student details'}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            showDetails
              ? 'bg-[#E8EDF7] text-[#5277D9]'
              : 'text-[#667085] hover:text-[#17233B] hover:bg-[#F8F9FC]'
          }`}
        >
          <Info className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
