import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { communitiesData } from '../../data/communities';

/**
 * PopularCommunities Component
 * Renders a compact list of university clubs/communities with Join button state.
 */
const PopularCommunities = () => {
  // Store joined community IDs in local component state
  const [joinedIds, setJoinedIds] = useState(['web-dev']);

  const toggleJoin = (id) => {
    setJoinedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Display top 4 communities for a compact widget
  const popularList = communitiesData.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
      <h3 className="text-sm font-bold text-[#17233B] tracking-tight">
        Popular Communities
      </h3>
      <p className="text-xs text-[#667085] mt-0.5">Campus hubs & interest clubs</p>

      <div className="mt-3.5 space-y-3">
        {popularList.map((community) => {
          const isJoined = joinedIds.includes(community.id);
          const Icon = community.icon;

          return (
            <div
              key={community.id}
              className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-[#E5E7EB]/60 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#E8EDF7] text-[#5277D9] flex items-center justify-center shrink-0">
                  {Icon && <Icon className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#17233B] truncate leading-tight">
                    {community.name}
                  </h4>
                  <p className="text-[11px] text-[#667085] truncate leading-tight mt-0.5">
                    {community.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleJoin(community.id)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  isJoined
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-[#E8EDF7] text-[#5277D9] hover:bg-[#5277D9] hover:text-white'
                }`}
              >
                {isJoined ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Joined</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    <span>Join</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PopularCommunities;
