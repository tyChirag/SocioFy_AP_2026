import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Clock,
  Check,
  X,
  UserCheck,
  Building,
  GraduationCap,
  Sparkles,
  Loader2,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import Avatar from '../common/Avatar';
import { createOrGetConversation } from '../../Services/messageServices';

/**
 * Helper to generate initials from full name
 */
const getInitials = (name) => {
  if (!name) return 'SF';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

/**
 * StudentCard Component
 * Displays a student's public card in the Explore grid with responsive details
 * and real-time interactive connection buttons.
 */
const StudentCard = ({
  student,
  onConnect,
  onCancelRequest,
  onAcceptRequest,
  onRejectRequest,
  onRemoveConnection,
}) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);

  const handleMessage = async () => {
    if (!student?.id || isMessaging) return;
    try {
      setIsMessaging(true);
      const conv = await createOrGetConversation(student.id);
      if (conv?.id) {
        navigate(`/messages/${conv.id}`);
      } else {
        navigate('/messages');
      }
    } catch (err) {
      console.error('Failed to open message conversation:', err);
      alert(err.message || 'Could not start conversation.');
    } finally {
      setIsMessaging(false);
    }
  };

  // Parse comma-separated interests or skills for clean tag pills
  const interestList = student.interests
    ? student.interests.split(',').map((i) => i.trim()).filter(Boolean)
    : [];

  const handleAction = async (actionFn, ...args) => {
    if (isProcessing || !actionFn) return;
    setIsProcessing(true);
    try {
      await actionFn(...args);
    } catch (err) {
      console.error('Connection action failed:', err);
      alert(err.message || 'Action failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs hover:border-[#CBD5E1] transition-all flex flex-col justify-between group">
      <div>
        {/* Header: Avatar, Name, College */}
        <div className="flex items-start gap-3.5">
          <Link to={`/profile/${student.id}`} className="shrink-0 group-hover:opacity-90 transition-opacity">
            <Avatar
              src={student.profileImage}
              initials={getInitials(student.fullName)}
              alt={student.fullName}
              size="md"
            />
          </Link>

          <div className="min-w-0 flex-1">
            <Link
              to={`/profile/${student.id}`}
              className="text-sm font-bold text-[#17233B] hover:text-[#5277D9] transition-colors truncate block"
            >
              {student.fullName}
            </Link>

            <div className="flex items-center gap-1.5 text-xs text-[#667085] mt-0.5 truncate">
              <Building className="w-3.5 h-3.5 shrink-0 text-[#667085]" />
              <span className="truncate">{student.collegeName}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#667085] mt-0.5 truncate">
              <GraduationCap className="w-3.5 h-3.5 shrink-0 text-[#667085]" />
              <span className="truncate">
                {student.department} {student.academicYear ? `• ${student.academicYear}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Short Bio (if present) */}
        {student.bio ? (
          <p className="text-xs text-[#475467] line-clamp-2 mt-3 leading-relaxed">
            {student.bio}
          </p>
        ) : (
          <p className="text-xs text-[#98A2B3] italic mt-3">
            Passionate student at {student.collegeName}
          </p>
        )}

        {/* Interests & Skills tags */}
        {interestList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {interestList.slice(0, 3).map((interest, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#F8F9FC] border border-[#E5E7EB] text-[11px] font-medium text-[#475467]"
              >
                <Sparkles className="w-2.5 h-2.5 text-[#5277D9]" />
                {interest}
              </span>
            ))}
            {interestList.length > 3 && (
              <span className="text-[10px] text-[#667085] self-center">
                +{interestList.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Dynamic Connection Relationship Buttons */}
      <div className="mt-4 pt-3.5 border-t border-[#F2F4F7]">
        {student.connectionStatus === 'NONE' && (
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleAction(onConnect, student.id)}
            className="w-full py-2 px-3 rounded-xl bg-[#5277D9] hover:bg-[#4364BE] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UserPlus className="w-3.5 h-3.5" />
            )}
            <span>Connect</span>
          </button>
        )}

        {student.connectionStatus === 'SENT' && (
          <div className="flex items-center gap-2">
            <span className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] text-xs font-medium text-[#667085] flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Requested</span>
            </span>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleAction(onCancelRequest, student.connectionId, student.id)}
              className="py-1.5 px-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
              title="Cancel request"
            >
              {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Cancel'}
            </button>
          </div>
        )}

        {student.connectionStatus === 'RECEIVED' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleAction(onAcceptRequest, student.connectionId, student.id)}
              className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Accept</span>
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleAction(onRejectRequest, student.connectionId, student.id)}
              className="py-1.5 px-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#475467] text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
              title="Decline request"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {student.connectionStatus === 'CONNECTED' && (
          <div className="relative">
            {!showConfirmRemove ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleMessage}
                    disabled={isMessaging}
                    className="py-1 px-2.5 rounded-xl bg-[#5277D9] hover:bg-[#4364c2] text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                    title="Send message"
                  >
                    {isMessaging ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <MessageSquare className="w-3.5 h-3.5" />
                    )}
                    <span>Chat</span>
                  </button>
                  <span className="py-1 px-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Connected</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmRemove(true)}
                  className="p-1.5 rounded-lg text-[#98A2B3] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Remove connection"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                <span className="text-[11px] text-red-600 font-medium">Remove?</span>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => {
                    setShowConfirmRemove(false);
                    handleAction(onRemoveConnection, student.connectionId, student.id);
                  }}
                  className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 cursor-pointer"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmRemove(false)}
                  className="px-2 py-1 bg-gray-100 text-[#475467] text-[10px] font-semibold rounded-lg hover:bg-gray-200 cursor-pointer"
                >
                  Back
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default StudentCard;
