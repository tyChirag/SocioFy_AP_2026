import { useState } from 'react';
import { FolderGit2, Users, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';
import PrimaryButton from '../common/PrimaryButton';
import { projectsData } from '../../data/projects';

/**
 * ProjectsPreview Section
 * Displays sample active student projects seeking teammates.
 * Demonstrates team building and skill matching.
 */
const ProjectsPreview = () => {
  const [requestedProjects, setRequestedProjects] = useState({});

  const handleRequestJoin = (projectId) => {
    setRequestedProjects((prev) => ({
      ...prev,
      [projectId]: true,
    }));
  };

  return (
    <section id="projects" className="py-20 sm:py-24 bg-[#F8F9FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Campus Collaborations"
          title="Find Your Next Project Teammate"
          description="Turn your ideas into reality by finding students who have the skills and motivation to build something together."
          align="center"
        />

        {/* 3 Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {projectsData.map((project) => {
            const isRequested = requestedProjects[project.id];

            return (
              <div
                key={project.id}
                className="group flex flex-col justify-between bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-xs hover:shadow-lg hover:border-[#CBD5E1] transition-all duration-300"
              >
                <div>
                  {/* Card Header: Category & Demo Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E8EDF7] text-[#5277D9] flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5" />
                      {project.category}
                    </span>

                    <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-gray-100 text-[#667085] border border-gray-200">
                      Sample Project
                    </span>
                  </div>

                  {/* Project Title */}
                  <h3 className="text-xl font-bold text-[#17233B] tracking-tight group-hover:text-[#5277D9] transition-colors duration-200">
                    {project.title}
                  </h3>

                  {/* Project Description */}
                  <p className="mt-2.5 text-sm text-[#667085] leading-relaxed">
                    {project.description}
                  </p>

                  {/* Required Skills Badges */}
                  <div className="mt-5 pt-4 border-t border-[#E5E7EB]/80">
                    <p className="text-xs font-semibold text-[#17233B] uppercase tracking-wider mb-2.5">
                      Required Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#F8F9FC] text-[#17233B] border border-[#E5E7EB]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Positions & Request CTA */}
                <div className="mt-6 pt-5 border-t border-[#E5E7EB] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#667085]">
                    <Users className="w-4 h-4 text-[#5277D9]" />
                    <span className="font-semibold text-emerald-700">
                      {project.openPositions} {project.openPositions === 1 ? 'spot' : 'spots'} open
                    </span>
                    <span className="text-gray-300">•</span>
                    <span>{project.teamSize}</span>
                  </div>

                  {isRequested ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Request Sent
                    </span>
                  ) : (
                    <PrimaryButton
                      size="sm"
                      variant="secondary"
                      onClick={() => handleRequestJoin(project.id, project.title)}
                      className="text-xs"
                      icon={<ArrowRight className="w-3 h-3" />}
                    >
                      Request to Join
                    </PrimaryButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Small bottom note explaining project matching */}
        <div className="mt-10 text-center">
          <p className="text-xs text-[#667085] inline-flex items-center gap-1.5 bg-white px-4 py-2 rounded-full border border-[#E5E7EB]">
            <Sparkles className="w-3.5 h-3.5 text-[#5277D9]" />
            Have an idea of your own? Once enrolled, students can post their own projects and review applications.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProjectsPreview;
