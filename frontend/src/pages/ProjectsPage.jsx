import { useState, useEffect, useMemo } from 'react';
import {
  FolderGit2,
  Search,
  Plus,
  X,
  Compass,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import TopNavbar from '../components/layout/TopNavbar';
import Sidebar from '../components/layout/Sidebar';
import BottomNavbar from '../components/layout/BottomNavbar';
import ProjectCard from '../components/projects/ProjectCard';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import {
  fetchAllProjects,
  joinProject,
  leaveProject,
} from '../Services/projectServices';
import { projectsData } from '../data/projects';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'All',
  'Full Stack',
  'AI / EdTech',
  'Web App',
  'Mobile',
  'UI/UX',
  'Data Science',
  'Other',
];

/**
 * ProjectsPage Component
 * Primary collaboration dashboard for discovering projects, recruiting teammates,
 * and creating new open-source or campus initiatives.
 */
const ProjectsPage = () => {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id || currentUser?.userId;

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Load all projects with automatic fallback to sample data if backend is offline/unconfigured
  const loadProjects = async (category = activeCategory) => {
    setIsLoading(true);
    setError('');
    try {
      const filters = {};
      if (category && category !== 'All') {
        filters.category = category;
      }
      const data = await fetchAllProjects(filters);
      if (Array.isArray(data) && data.length > 0) {
        setProjects(data);
      } else {
        const filtered =
          category && category !== 'All'
            ? projectsData.filter((p) => p.category === category)
            : projectsData;
        setProjects(filtered);
      }
    } catch (err) {
      console.warn('Backend unavailable, using sample projects dataset:', err.message);
      const filtered =
        category && category !== 'All'
          ? projectsData.filter((p) => p.category === category)
          : projectsData;
      setProjects(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects(activeCategory);
  }, [activeCategory]);

  // Handle Project Creation (prepend new project to list)
  const handleProjectCreated = (newProject) => {
    const formatted = {
      id: newProject.id || Date.now(),
      title: newProject.title,
      description: newProject.description,
      skills: newProject.skills,
      category: newProject.category,
      openPositions: newProject.openPositions,
      repoUrl: newProject.repoUrl,
      membersCount: 1,
      isMember: true,
      creator: {
        id: currentUserId || 999,
        fullName: currentUser?.fullName || 'You (Creator)',
        collegeName: currentUser?.collegeName || 'Your Campus',
        department: currentUser?.department || 'Engineering',
      },
      ...newProject,
    };
    setProjects((prev) => [formatted, ...prev]);
    setActionMessage({
      type: 'success',
      text: 'Project published successfully! Team members can now join.',
    });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Handle Join Project with optimistic update
  const handleJoin = async (projectId) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              isMember: true,
              membersCount: (p.membersCount || 0) + 1,
              openPositions: Math.max(0, (p.openPositions || 1) - 1),
            }
          : p
      )
    );

    try {
      const res = await joinProject(projectId);
      if (res) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, ...res, isMember: true } : p))
        );
      }
    } catch (err) {
      console.warn('Live API unavailable; kept optimistic state:', err.message);
    }
    setActionMessage({ type: 'success', text: 'You have joined the project team!' });
    setTimeout(() => setActionMessage(null), 3000);
  };

  // Handle Leave Project with optimistic update
  const handleLeave = async (projectId) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              isMember: false,
              membersCount: Math.max(1, (p.membersCount || 1) - 1),
              openPositions: (p.openPositions || 0) + 1,
            }
          : p
      )
    );

    try {
      await leaveProject(projectId);
    } catch (err) {
      console.warn('Live API unavailable; kept optimistic state:', err.message);
    }
    setActionMessage({ type: 'success', text: 'You have left the project team.' });
    setTimeout(() => setActionMessage(null), 3000);
  };

  // Filter projects in-memory by search input (title, skills, description)
  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return projects;

    return projects.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.skills && item.skills.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q))
      );
    });
  }, [projects, searchQuery]);

  // User's joined/created projects for the right summary widget
  const myProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        p.isMember ||
        (currentUserId && p.creator?.id === currentUserId) ||
        (currentUserId && p.creatorId === currentUserId)
    );
  }, [projects, currentUserId]);

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

          {/* Center Column: Projects List */}
          <div className="col-span-12 md:col-span-9 lg:col-span-6 space-y-5">
            {/* Header Banner */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8EDF7] text-[#5277D9] flex items-center justify-center shrink-0">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#17233B] tracking-tight">
                      Project Collaborations
                    </h1>
                    <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
                      Find teammates, build hackathon projects, and launch campus ideas.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#5277D9] hover:bg-[#4364BE] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Project</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mt-4">
                <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects by title, tech stack (React, Python), or keywords..."
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

              {/* Category Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mt-3 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-[#5277D9] text-white shadow-xs'
                        : 'bg-[#F2F4F7] text-[#667085] hover:bg-[#E5E7EB] hover:text-[#17233B]'
                    }`}
                  >
                    {cat}
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

            {/* Loading Skeleton */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs animate-pulse space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="w-20 h-5 bg-gray-200 rounded-full" />
                      <div className="w-24 h-5 bg-gray-200 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-2/3" />
                      <div className="h-3.5 bg-gray-200 rounded w-full" />
                      <div className="h-3.5 bg-gray-200 rounded w-4/5" />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-16 h-6 bg-gray-200 rounded-lg" />
                      <div className="w-16 h-6 bg-gray-200 rounded-lg" />
                      <div className="w-16 h-6 bg-gray-200 rounded-lg" />
                    </div>
                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                      <div className="w-24 h-4 bg-gray-200 rounded" />
                      <div className="w-20 h-8 bg-gray-200 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Projects List */}
            {!isLoading && filteredProjects.length > 0 && (
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    currentUserId={currentUserId}
                    onJoin={handleJoin}
                    onLeave={handleLeave}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredProjects.length === 0 && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-[#F2F4F7] text-[#98A2B3] flex items-center justify-center mx-auto mb-3">
                  <FolderGit2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#17233B]">
                  No projects found
                </h3>
                <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
                  {searchQuery || activeCategory !== 'All'
                    ? 'No projects matched your criteria. Try resetting filters or search terms.'
                    : 'No projects yet. Be the first to post one!'}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  {(searchQuery || activeCategory !== 'All') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory('All');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#E8EDF7] text-[#5277D9] hover:bg-[#5277D9] hover:text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#5277D9] hover:bg-[#4364BE] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create a Project</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Widgets */}
          <div className="hidden lg:block lg:col-span-3 space-y-5 sticky top-22">
            {/* Create CTA Widget */}
            <div className="bg-gradient-to-br from-[#5277D9] to-[#3B5BBD] rounded-2xl p-5 text-white shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold tracking-tight">
                Got a project idea?
              </h3>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                Post your concept, list the skills needed, and assemble your campus dream team.
              </p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-white text-[#5277D9] hover:bg-white/95 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Post Project
              </button>
            </div>

            {/* My Projects Summary Widget */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#F2F4F7]">
                <h3 className="text-sm font-bold text-[#17233B] tracking-tight">
                  My Projects
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E8EDF7] text-[#5277D9]">
                  {myProjects.length}
                </span>
              </div>

              {myProjects.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-[#667085]">
                    You haven't joined or created any projects yet.
                  </p>
                  <p className="text-[11px] text-[#98A2B3] mt-1">
                    Join a team above or create your own project!
                  </p>
                </div>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {myProjects.map((proj) => {
                    const isCreator =
                      (currentUserId && proj.creator?.id === currentUserId) ||
                      (currentUserId && proj.creatorId === currentUserId);

                    return (
                      <div
                        key={proj.id}
                        className="p-2.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#17233B] truncate">
                            {proj.title}
                          </h4>
                          <span className="text-[10px] text-[#667085] block truncate mt-0.5">
                            {proj.category} • {proj.membersCount} {proj.membersCount === 1 ? 'member' : 'members'}
                          </span>
                        </div>
                        {isCreator ? (
                          <span className="text-[10px] font-semibold bg-[#E8EDF7] text-[#5277D9] px-2 py-0.5 rounded-md shrink-0">
                            Creator
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleLeave(proj.id)}
                            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                          >
                            Leave
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavbar />
    </div>
  );
};

export default ProjectsPage;
