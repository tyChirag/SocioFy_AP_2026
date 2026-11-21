import { useState } from 'react';
import {
  Code2,
  Brain,
  Terminal,
  Camera,
  Rocket,
  Palette,
  Users,
  Check,
  Plus,
  Loader2,
  LogOut,
} from 'lucide-react';

// Map iconKey string from database to Lucide icon component
const ICON_MAP = {
  Code2,
  Brain,
  Terminal,
  Camera,
  Rocket,
  Palette,
  Users,
};

/**
 * CommunityCard Component
 * Displays a single university community card with real member count and join/leave action.
 */
const CommunityCard = ({ community, onJoin, onLeave }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHoveredJoined, setIsHoveredJoined] = useState(false);

  const IconComponent = (community.iconKey && ICON_MAP[community.iconKey]) || Users;
  const isMember = Boolean(community.isMember);
  const memberCount = community.membersCount ?? 0;

  const handleToggle = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (isMember) {
        if (onLeave) await onLeave(community.id);
      } else {
        if (onJoin) await onJoin(community.id);
      }
    } catch (err) {
      console.error('Community membership action failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs hover:border-[#CBD5E1] transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header: Icon, Tag Pill */}
        <div className="flex items-center justify-between gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#E8EDF7] text-[#5277D9] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <IconComponent className="w-5 h-5" />
          </div>

          {community.tag && (
            <span className="bg-[#E8EDF7] text-[#5277D9] text-xs font-semibold rounded-full px-2.5 py-0.5 shrink-0">
              {community.tag}
            </span>
          )}
        </div>

        {/* Content: Community Name & Description */}
        <div className="mt-3.5">
          <h3 className="text-base font-bold text-[#17233B] tracking-tight group-hover:text-[#5277D9] transition-colors">
            {community.name}
          </h3>
          <p className="text-xs text-[#667085] line-clamp-2 mt-1.5 leading-relaxed">
            {community.description}
          </p>
        </div>
      </div>

      {/* Footer: Member Count & Action Button */}
      <div className="mt-5 pt-3.5 border-t border-[#F2F4F7] flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#667085]">
          <Users className="w-3.5 h-3.5 text-[#5277D9]" />
          <span>
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>

        <button
          type="button"
          disabled={isProcessing}
          onClick={handleToggle}
          onMouseEnter={() => setIsHoveredJoined(true)}
          onMouseLeave={() => setIsHoveredJoined(false)}
          className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 ${
            isMember
              ? isHoveredJoined
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-[#5277D9] hover:bg-[#4364BE] text-white'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : isMember ? (
            isHoveredJoined ? (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Joined</span>
              </>
            )
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Join</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};

export default CommunityCard;
