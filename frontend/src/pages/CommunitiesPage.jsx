import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  X,
  Loader2,
  RefreshCw,
  Compass,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import TopNavbar from '../components/layout/TopNavbar';
import Sidebar from '../components/layout/Sidebar';
import BottomNavbar from '../components/layout/BottomNavbar';
import CommunityCard from '../components/communities/CommunityCard';
import {
  fetchAllCommunities,
  joinCommunity,
  leaveCommunity,
} from '../Services/communityServices';

const TAG_FILTERS = [
  'All',
  'Technology',
  'AI & Data',
  'Coding',
  'Creative',
  'Business',
  'Design',
];

/**
 * CommunitiesPage Component
 * Main page for browsing, searching, filtering, joining, and leaving campus communities.
 */
const CommunitiesPage = () => {
  const [communities, setCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [actionMessage, setActionMessage] = useState(null);

  // Load communities from API
  const loadCommunities = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchAllCommunities();
      setCommunities(data);
    } catch (err) {
      console.error('Failed to load communities:', err);
      setError(err.message || 'Failed to load communities from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  // Handle Join Community with optimistic update and rollback
  const handleJoin = async (communityId) => {
    // 1. Optimistic update
    const previousCommunities = [...communities];
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === communityId
          ? { ...c, isMember: true, membersCount: (c.membersCount || 0) + 1 }
          : c
      )
    );

    try {
      const res = await joinCommunity(communityId);
      if (res && res.membersCount !== undefined) {
        setCommunities((prev) =>
          prev.map((c) =>
            c.id === communityId
              ? { ...c, isMember: true, membersCount: res.membersCount }
              : c
          )
        );
      }
      setActionMessage({ type: 'success', text: 'Joined community successfully!' });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      // Rollback
      setCommunities(previousCommunities);
      console.error('Error joining community:', err);
      setActionMessage({ type: 'error', text: err.message || 'Failed to join community.' });
      setTimeout(() => setActionMessage(null), 4000);
      throw err;
    }
  };

  // Handle Leave Community with optimistic update and rollback
  const handleLeave = async (communityId) => {
    // 1. Optimistic update
    const previousCommunities = [...communities];
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === communityId
          ? { ...c, isMember: false, membersCount: Math.max(0, (c.membersCount || 1) - 1) }
          : c
      )
    );

    try {
      const res = await leaveCommunity(communityId);
      if (res && res.membersCount !== undefined) {
        setCommunities((prev) =>
          prev.map((c) =>
            c.id === communityId
              ? { ...c, isMember: false, membersCount: res.membersCount }
              : c
          )
        );
      }
      setActionMessage({ type: 'success', text: 'Left community successfully.' });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      // Rollback
      setCommunities(previousCommunities);
      console.error('Error leaving community:', err);
      setActionMessage({ type: 'error', text: err.message || 'Failed to leave community.' });
      setTimeout(() => setActionMessage(null), 4000);
      throw err;
    }
  };

  // Filter communities by search query and active tag pill
  const filteredCommunities = useMemo(() => {
    return communities.filter((item) => {
      const matchesTag = activeTag === 'All' || item.tag === activeTag;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.tag && item.tag.toLowerCase().includes(q));

      return matchesTag && matchesSearch;
    });
  }, [communities, activeTag, searchQuery]);

  // Joined communities for the sidebar widget
  const myCommunities = useMemo(() => {
    return communities.filter((c) => c.isMember);
  }, [communities]);

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#17233B] flex flex-col antialiased selection:bg-[#5277D9] selection:text-white">
      {/* Top Navigation */}
      <TopNavbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Navigation Sidebar */}
          <div className="hidden md:block md:col-span-3 sticky top-22">
            <Sidebar />
          </div>

          {/* Center Column: Communities List */}
          <div className="col-span-12 md:col-span-9 lg:col-span-6 space-y-5">
            {/* Header Banner */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8EDF7] text-[#5277D9] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#17233B] tracking-tight">
                    Campus Communities
                  </h1>
                  <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
                    Connect with peer clubs, technical hubs, and creative circles.
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mt-4">
                <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search communities by name, skill, or topic..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] text-sm text-[#17233B] placeholder-[#98A2B3] focus:outline-none focus:border-[#5277D9] focus:ring-2 focus:ring-[#5277D9]/20 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#17233B] p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Tag Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mt-3 scrollbar-none">
                {TAG_FILTERS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      activeTag === tag
                        ? 'bg-[#5277D9] text-white shadow-xs'
                        : 'bg-[#F2F4F7] text-[#667085] hover:bg-[#E5E7EB] hover:text-[#17233B]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification alert banner */}
            {actionMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                  actionMessage.type === 'error'
                    ? 'bg-rose-50 border border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                }`}
              >
                {actionMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                <span>{actionMessage.text}</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-700 text-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={loadCommunities}
                  className="px-3 py-1 bg-white border border-rose-300 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs animate-pulse space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="w-11 h-11 bg-gray-200 rounded-xl" />
                      <div className="w-16 h-5 bg-gray-200 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                    </div>
                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                      <div className="w-20 h-4 bg-gray-200 rounded" />
                      <div className="w-16 h-8 bg-gray-200 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Communities Grid */}
            {!isLoading && !error && filteredCommunities.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredCommunities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    onJoin={handleJoin}
                    onLeave={handleLeave}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredCommunities.length === 0 && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-[#F2F4F7] text-[#98A2B3] flex items-center justify-center mx-auto mb-3">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#17233B]">
                  No communities found
                </h3>
                <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
                  {searchQuery || activeTag !== 'All'
                    ? 'No communities matched your filter criteria. Try searching with different keywords.'
                    : 'No communities are currently available.'}
                </p>
                {(searchQuery || activeTag !== 'All') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveTag('All');
                    }}
                    className="mt-4 px-3.5 py-1.5 rounded-xl bg-[#E8EDF7] text-[#5277D9] hover:bg-[#5277D9] hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column: "My Communities" Summary Widget */}
          <div className="hidden lg:block lg:col-span-3 space-y-5 sticky top-22">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#F2F4F7]">
                <h3 className="text-sm font-bold text-[#17233B] tracking-tight">
                  My Communities
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E8EDF7] text-[#5277D9]">
                  {myCommunities.length}
                </span>
              </div>

              {myCommunities.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-[#667085]">
                    You haven't joined any communities yet.
                  </p>
                  <p className="text-[11px] text-[#98A2B3] mt-1">
                    Click "Join" on any community to get connected!
                  </p>
                </div>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {myCommunities.map((comm) => (
                    <div
                      key={comm.id}
                      className="p-2.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#17233B] truncate">
                          {comm.name}
                        </h4>
                        <span className="text-[10px] text-[#667085] block truncate mt-0.5">
                          {comm.tag} • {comm.membersCount} members
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLeave(comm.id)}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                      >
                        Leave
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavbar />
    </div>
  );
};

export default CommunitiesPage;
