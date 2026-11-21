import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  Building,
  User,
  Check,
  Plus,
  Loader2,
  LogOut,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const GitHubIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

/**
 * ProjectCard Component
 * Displays a student collaboration project card with creator details, skills,
 * open positions, team size, and interactive join/leave actions.
 */
const ProjectCard = ({ project, onJoin, onLeave, currentUserId }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHoveredJoined, setIsHoveredJoined] = useState(false);

  const isCreator =
    (currentUserId && project.creator?.id === currentUserId) ||
    (currentUserId && project.creatorId === currentUserId);

  const isMember = Boolean(project.isMember) || isCreator;
  const openPositions = project.openPositions ?? 0;
  const membersCount = project.membersCount ?? 1;

  // Split comma-separated skills
  const skillsList = project.skills
    ? project.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const handleToggle = async () => {
    if (isProcessing) return;
    if (isCreator) return; // Creator cannot leave their own project

    setIsProcessing(true);
    try {
      if (isMember) {
        if (onLeave) await onLeave(project.id);
      } else {
        if (onJoin) await onJoin(project.id);
      }
    } catch (err) {
      console.error('Project membership action failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs hover:border-[#CBD5E1] transition-all flex flex-col justify-between group">
      <div>
        {/* Header: Category Pill & Open Positions Badge */}
        <div className="flex items-center justify-between gap-2.5">
          <span className="bg-[#E8EDF7] text-[#5277D9] text-xs font-semibold rounded-full px-2.5 py-0.5">
            {project.category || 'General'}
          </span>

          {openPositions > 0 ? (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold rounded-full px-2.5 py-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {openPositions} {openPositions === 1 ? 'spot open' : 'spots open'}
            </span>
          ) : (
            <span className="bg-[#F2F4F7] text-[#667085] text-[11px] font-medium rounded-full px-2.5 py-0.5">
              Team Full
            </span>
          )}
        </div>

        {/* Project Title & Description */}
        <div className="mt-3.5">
          <h3 className="text-base font-bold text-[#17233B] tracking-tight group-hover:text-[#5277D9] transition-colors">
            {project.title}
          </h3>
          <p className="text-xs text-[#667085] line-clamp-3 mt-1.5 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Creator Info */}
        {project.creator && (
          <div className="mt-3.5 pt-3 border-t border-[#F2F4F7] flex items-center justify-between text-xs text-[#667085]">
            <div className="flex items-center gap-1.5 min-w-0">
              <User className="w-3.5 h-3.5 text-[#5277D9] shrink-0" />
              <Link
                to={`/profile/${project.creator.id}`}
                className="font-medium text-[#17233B] hover:text-[#5277D9] truncate transition-colors"
              >
                {project.creator.fullName}
              </Link>
            </div>
            {project.creator.collegeName && (
              <div className="flex items-center gap-1 min-w-0 shrink-0 text-[11px] text-[#98A2B3]">
                <Building className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[120px]">{project.creator.collegeName}</span>
              </div>
            )}
          </div>
        )}

        {/* Skills Tags */}
        {skillsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {skillsList.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#F8F9FC] border border-[#E5E7EB] text-[11px] font-medium text-[#475467]"
              >
                <Sparkles className="w-2.5 h-2.5 text-[#5277D9]" />
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Team Size, Repo Link & Join/Leave Button */}
      <div className="mt-5 pt-3.5 border-t border-[#F2F4F7] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 text-xs font-medium text-[#667085]">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#5277D9]" />
            <span>
              {membersCount} {membersCount === 1 ? 'member' : 'members'}
            </span>
          </div>

          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#667085] hover:text-[#17233B] transition-colors p-1 rounded-md hover:bg-[#F2F4F7]"
              title="View Repository"
            >
              <GitHubIcon className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Action Button */}
        {isCreator ? (
          <span className="py-1.5 px-3 rounded-xl bg-[#E8EDF7] text-[#5277D9] text-xs font-semibold">
            Your Project
          </span>
        ) : (
          <button
            type="button"
            disabled={isProcessing || (!isMember && openPositions <= 0)}
            onClick={handleToggle}
            onMouseEnter={() => setIsHoveredJoined(true)}
            onMouseLeave={() => setIsHoveredJoined(false)}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isMember
                ? isHoveredJoined
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : openPositions > 0
                ? 'bg-[#5277D9] hover:bg-[#4364BE] text-white'
                : 'bg-gray-100 text-gray-400'
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
            ) : openPositions > 0 ? (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Join Team</span>
              </>
            ) : (
              <span>Full</span>
            )}
          </button>
        )}
      </div>
    </article>
  );
};

export default ProjectCard;
