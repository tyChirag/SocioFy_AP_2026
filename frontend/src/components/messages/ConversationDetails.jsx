import { X, ExternalLink, GraduationCap, Building, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import { useSocket } from '../../context/SocketContext';

/**
 * ConversationDetails Component
 * Side panel providing participant student profile details, academic info,
 * connection status, and navigation to their full profile.
 */
const ConversationDetails = ({ otherUser, onClose }) => {
  const { isUserOnline } = useSocket();

  if (!otherUser) return null;

  const isOnline = isUserOnline(otherUser.id);

  return (
    <div className="w-72 lg:w-80 h-full bg-white border-l border-[#E5E7EB] flex flex-col shrink-0 overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
        <h4 className="text-sm font-bold text-[#17233B]">Student Profile</h4>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-[#667085] hover:text-[#17233B] hover:bg-[#F8F9FC] transition-colors cursor-pointer"
          title="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Profile Info */}
      <div className="p-6 flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <Avatar user={otherUser} size="xl" className="shadow-xs" />
          {isOnline ? (
            <span
              title="Online"
              className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white ring-2 ring-emerald-400"
            />
          ) : (
            <span
              title="Offline"
              className="absolute bottom-1 right-1 w-4 h-4 bg-gray-300 rounded-full border-2 border-white"
            />
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#17233B]">{otherUser.fullName}</h3>
          <p className="text-xs text-[#667085] mt-0.5">
            {isOnline ? (
              <span className="text-emerald-600 font-semibold">Online now</span>
            ) : (
              'Offline'
            )}
          </p>
        </div>

        {/* Connected Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Connected</span>
        </div>

        {/* View Profile Action */}
        <Link
          to={`/profile/${otherUser.id}`}
          className="w-full py-2 px-4 rounded-xl bg-[#F0F4FD] hover:bg-[#E8EDF7] text-[#5277D9] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <span>View Full Profile</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="border-t border-[#E5E7EB] my-1" />

      {/* Academic Details */}
      <div className="p-5 space-y-4 text-left">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#98A2B3]">
            Academic Information
          </span>
          <div className="mt-3 space-y-3">
            {otherUser.college && (
              <div className="flex items-start gap-2.5">
                <Building className="w-4 h-4 text-[#5277D9] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[#667085]">College / University</p>
                  <p className="text-xs font-semibold text-[#17233B]">{otherUser.college}</p>
                </div>
              </div>
            )}

            {otherUser.department && (
              <div className="flex items-start gap-2.5">
                <GraduationCap className="w-4 h-4 text-[#5277D9] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[#667085]">Department</p>
                  <p className="text-xs font-semibold text-[#17233B]">{otherUser.department}</p>
                </div>
              </div>
            )}

            {otherUser.yearOfStudy && (
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#E8EDF7] text-[#5277D9] text-[10px] font-bold flex items-center justify-center mt-0.5 shrink-0">
                  Yr
                </div>
                <div>
                  <p className="text-[11px] text-[#667085]">Year</p>
                  <p className="text-xs font-semibold text-[#17233B]">{otherUser.yearOfStudy}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {otherUser.bio && (
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#98A2B3]">
              About
            </span>
            <p className="mt-2 text-xs text-[#475467] leading-relaxed bg-[#F8F9FC] p-3 rounded-xl border border-[#E5E7EB]">
              {otherUser.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationDetails;
