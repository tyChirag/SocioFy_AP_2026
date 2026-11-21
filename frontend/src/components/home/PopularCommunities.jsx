import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  ArrowRight,
} from 'lucide-react';
import {
  fetchAllCommunities,
  joinCommunity,
  leaveCommunity,
} from '../../Services/communityServices';

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
 * PopularCommunities Component
 * Renders a compact list of top university communities connected to the real database.
 */
const PopularCommunities = () => {
  const [communities, setCommunities] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadPopular = async () => {
      try {
        const data = await fetchAllCommunities();
        if (isMounted) {
          setCommunities(data.slice(0, 4));
        }
      } catch (err) {
        console.warn('Could not load popular communities from DB:', err.message);
        if (isMounted) {
          setCommunities([]);
        }
      }
    };

    loadPopular();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleJoin = async (community) => {
    if (loadingId) return;
    const communityId = community.id;
    const isMember = Boolean(community.isMember);
    setLoadingId(communityId);

    // Optimistic update
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === communityId
          ? {
              ...c,
              isMember: !isMember,
              membersCount: isMember
                ? Math.max(0, (c.membersCount || 1) - 1)
                : (c.membersCount || 0) + 1,
            }
          : c
      )
    );

    try {
      if (isMember) {
        await leaveCommunity(communityId);
      } else {
        await joinCommunity(communityId);
      }
    } catch (err) {
      console.error('Failed to toggle community membership:', err);
      // Rollback
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === communityId
            ? {
                ...c,
                isMember,
                membersCount: community.membersCount,
              }
            : c
        )
      );
    } finally {
      setLoadingId(null);
    }
  };

  if (communities.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#17233B] tracking-tight">
            Popular Communities
          </h3>
          <p className="text-xs text-[#667085] mt-0.5">Campus hubs & interest clubs</p>
        </div>
        <Link
          to="/communities"
          className="text-xs font-semibold text-[#5277D9] hover:underline flex items-center gap-0.5"
        >
          <span>All</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="mt-3.5 space-y-3">
        {communities.map((community) => {
          const isJoined = Boolean(community.isMember);
          const Icon = (community.iconKey && ICON_MAP[community.iconKey]) || Users;
          const isButtonLoading = loadingId === community.id;

          return (
            <div
              key={community.id}
              className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-[#E5E7EB]/60 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#E8EDF7] text-[#5277D9] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
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
                disabled={isButtonLoading}
                onClick={() => handleToggleJoin(community)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 ${
                  isJoined
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-[#E8EDF7] text-[#5277D9] hover:bg-[#5277D9] hover:text-white'
                }`}
              >
                {isButtonLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isJoined ? (
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
