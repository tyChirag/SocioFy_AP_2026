import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Filter,
  X,
  Compass,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import TopNavbar from '../components/layout/TopNavbar';
import Sidebar from '../components/layout/Sidebar';
import BottomNavbar from '../components/layout/BottomNavbar';
import StudentCard from '../components/explore/StudentCard';
import ConnectionsManager from '../components/explore/ConnectionsManager';
import { fetchStudents, fetchFilterOptions } from '../Services/userServices';
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelSentRequest,
  removeConnection,
  fetchIncomingRequests,
} from '../Services/connectionServices';

/**
 * ExplorePage Component
 * Primary student discovery dashboard for SocioFy.
 * Supports:
 * - Cross-college student search with debouncing
 * - Dynamic college, department, and academic year filters
 * - Direct connection actions with real-time state updates
 * - Connections management tab (My Connections, Incoming, Sent)
 * - Pagination across database records
 */
const ExplorePage = () => {
  // Navigation view: 'explore' | 'manage'
  const [activeView, setActiveView] = useState('explore');

  // Search & Filter State
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Available filter dropdown options (loaded from backend)
  const [filterOptions, setFilterOptions] = useState({
    colleges: [],
    departments: [],
    academicYears: [],
  });

  // Students Data State
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingIncomingCount, setPendingIncomingCount] = useState(0);

  // Debounce search input by 350ms
  const debounceTimerRef = useRef(null);
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 350);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  // Load available filter options once on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const opts = await fetchFilterOptions();
        setFilterOptions(opts);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    loadFilters();
  }, []);

  // Check pending incoming request count for badge
  const refreshBadgeCount = useCallback(async () => {
    try {
      const inc = await fetchIncomingRequests();
      setPendingIncomingCount(inc.length);
    } catch {}
  }, []);

  useEffect(() => {
    refreshBadgeCount();
  }, [refreshBadgeCount]);

  // Load students from database
  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchStudents({
        search: debouncedSearch,
        college: selectedCollege,
        department: selectedDept,
        academicYear: selectedYear,
        page: currentPage,
        limit: 12,
      });

      setStudents(data.users || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 12, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load students:', err);
      setError(err.message || 'Failed to load students.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedCollege, selectedDept, selectedYear, currentPage]);

  useEffect(() => {
    if (activeView === 'explore') {
      loadStudents();
    }
  }, [activeView, loadStudents]);

  // Handle connection operations on student cards
  const handleConnect = async (targetUserId) => {
    const res = await sendConnectionRequest(targetUserId);
    setStudents((prev) =>
      prev.map((s) =>
        s.id === targetUserId
          ? { ...s, connectionStatus: 'SENT', connectionId: res.connection.id }
          : s
      )
    );
  };

  const handleCancelRequest = async (connectionId, targetUserId) => {
    await cancelSentRequest(connectionId);
    setStudents((prev) =>
      prev.map((s) =>
        s.id === targetUserId
          ? { ...s, connectionStatus: 'NONE', connectionId: null }
          : s
      )
    );
  };

  const handleAcceptRequest = async (connectionId, targetUserId) => {
    await acceptConnectionRequest(connectionId);
    setStudents((prev) =>
      prev.map((s) =>
        s.id === targetUserId
          ? { ...s, connectionStatus: 'CONNECTED' }
          : s
      )
    );
    refreshBadgeCount();
  };

  const handleRejectRequest = async (connectionId, targetUserId) => {
    await rejectConnectionRequest(connectionId);
    setStudents((prev) =>
      prev.map((s) =>
        s.id === targetUserId
          ? { ...s, connectionStatus: 'NONE', connectionId: null }
          : s
      )
    );
    refreshBadgeCount();
  };

  const handleRemoveConnection = async (connectionId, targetUserId) => {
    await removeConnection(connectionId);
    setStudents((prev) =>
      prev.map((s) =>
        s.id === targetUserId
          ? { ...s, connectionStatus: 'NONE', connectionId: null }
          : s
      )
    );
  };

  // Reset all filters
  const handleClearFilters = () => {
    setSelectedCollege('');
    setSelectedDept('');
    setSelectedYear('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(selectedCollege || selectedDept || selectedYear);

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

          {/* Right Area: Explore Content (9 cols) */}
          <div className="col-span-12 md:col-span-9 space-y-5">
            {/* Header Banner */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#5277D9]/10 text-[#5277D9] flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#17233B] tracking-tight">
                    Discover Students
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-[#667085] mt-1">
                  Find students, discover shared interests, and build connections across all colleges.
                </p>
              </div>

              {/* View Selector Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[#F8F9FC] rounded-xl border border-[#E5E7EB] shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveView('explore')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeView === 'explore'
                      ? 'bg-white text-[#17233B] shadow-xs'
                      : 'text-[#667085] hover:text-[#17233B]'
                  }`}
                >
                  Explore Grid
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('manage')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeView === 'manage'
                      ? 'bg-white text-[#17233B] shadow-xs'
                      : 'text-[#667085] hover:text-[#17233B]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Manage Connections</span>
                  {pendingIncomingCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </button>
              </div>
            </div>

            {/* TAB 1: Explore Grid View */}
            {activeView === 'explore' && (
              <>
                {/* Search Bar & Filters Card */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-xs space-y-4">
                  {/* Search Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#667085]">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={searchInput}
                      onChange={handleSearchChange}
                      placeholder="Search students by name, college, department, skills, or interests..."
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-[#17233B] placeholder-[#667085] focus:outline-none focus:bg-white focus:border-[#5277D9] focus:ring-1 focus:ring-[#5277D9] transition-all"
                    />
                    {searchInput && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#667085] hover:text-[#17233B]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Filter Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {/* College Filter */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-1">
                        College
                      </label>
                      <select
                        value={selectedCollege}
                        onChange={(e) => {
                          setSelectedCollege(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full py-2 px-3 text-xs bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-[#17233B] focus:outline-none focus:border-[#5277D9] transition-colors"
                      >
                        <option value="">All Colleges</option>
                        {filterOptions.colleges.map((college) => (
                          <option key={college} value={college}>
                            {college}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Department Filter */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-1">
                        Department
                      </label>
                      <select
                        value={selectedDept}
                        onChange={(e) => {
                          setSelectedDept(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full py-2 px-3 text-xs bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-[#17233B] focus:outline-none focus:border-[#5277D9] transition-colors"
                      >
                        <option value="">All Departments</option>
                        {filterOptions.departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Academic Year Filter */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-1">
                        Academic Year
                      </label>
                      <select
                        value={selectedYear}
                        onChange={(e) => {
                          setSelectedYear(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full py-2 px-3 text-xs bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-[#17233B] focus:outline-none focus:border-[#5277D9] transition-colors"
                      >
                        <option value="">All Years</option>
                        {filterOptions.academicYears.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Active Filters Clear Bar */}
                  {hasActiveFilters && (
                    <div className="flex items-center justify-between pt-2 border-t border-[#F2F4F7]">
                      <span className="text-xs text-[#667085]">
                        Filtered by: {[selectedCollege, selectedDept, selectedYear].filter(Boolean).join(' • ')}
                      </span>
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="text-xs font-semibold text-[#5277D9] hover:underline cursor-pointer"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center text-[#667085] flex flex-col items-center justify-center gap-2 shadow-xs">
                    <Loader2 className="w-6 h-6 animate-spin text-[#5277D9]" />
                    <p className="text-sm font-medium">Discovering campus peers...</p>
                  </div>
                )}

                {/* Error State */}
                {!isLoading && error && (
                  <div className="bg-white rounded-2xl border border-red-200 p-6 text-center shadow-xs">
                    <h4 className="text-sm font-bold text-[#17233B]">Unable to load students</h4>
                    <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">{error}</p>
                    <button
                      type="button"
                      onClick={loadStudents}
                      className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E8EDF7] text-[#5277D9] text-xs font-semibold hover:bg-[#5277D9] hover:text-white transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Try Again</span>
                    </button>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && students.length === 0 && (
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-[#F8F9FC] border border-[#E5E7EB] flex items-center justify-center mx-auto text-[#667085] mb-3">
                      <Search className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-[#17233B]">No students found</h3>
                    <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
                      {debouncedSearch || hasActiveFilters
                        ? 'Try loosening your search terms or clearing filters to see more students.'
                        : 'No other registered students found on campus yet.'}
                    </p>
                    {(debouncedSearch || hasActiveFilters) && (
                      <button
                        type="button"
                        onClick={() => {
                          handleClearSearch();
                          handleClearFilters();
                        }}
                        className="mt-4 px-3.5 py-1.5 rounded-xl bg-[#5277D9] text-white text-xs font-semibold hover:bg-[#4364BE] transition-colors cursor-pointer"
                      >
                        Reset Search & Filters
                      </button>
                    )}
                  </div>
                )}

                {/* Students Cards Grid */}
                {!isLoading && !error && students.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map((student) => (
                      <StudentCard
                        key={student.id}
                        student={student}
                        onConnect={handleConnect}
                        onCancelRequest={handleCancelRequest}
                        onAcceptRequest={handleAcceptRequest}
                        onRejectRequest={handleRejectRequest}
                        onRemoveConnection={handleRemoveConnection}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {!isLoading && !error && pagination.totalPages > 1 && (
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex items-center justify-between shadow-xs">
                    <span className="text-xs text-[#667085]">
                      Showing page <strong className="text-[#17233B]">{pagination.page}</strong> of{' '}
                      <strong className="text-[#17233B]">{pagination.totalPages}</strong> ({pagination.total} students)
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={pagination.page <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        className="p-1.5 rounded-xl border border-[#E5E7EB] text-[#17233B] hover:bg-[#F8F9FC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Previous page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="p-1.5 rounded-xl border border-[#E5E7EB] text-[#17233B] hover:bg-[#F8F9FC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Next page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB 2: Connections Manager View */}
            {activeView === 'manage' && (
              <ConnectionsManager
                onDataChange={() => {
                  loadStudents();
                  refreshBadgeCount();
                }}
              />
            )}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navbar */}
      <BottomNavbar />
    </div>
  );
};

export default ExplorePage;
