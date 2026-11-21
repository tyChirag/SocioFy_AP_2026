import { useState } from 'react';
import { X, FolderGit2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { createProject } from '../../Services/projectServices';

const CATEGORIES = [
  'Full Stack',
  'AI / EdTech',
  'Web App',
  'Mobile',
  'UI/UX',
  'Data Science',
  'Other',
];

/**
 * CreateProjectModal Component
 * Modal dialog for student collaboration project submission.
 */
const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    category: 'Full Stack',
    openPositions: 2,
    repoUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Please enter a project title.');
      return;
    }

    if (!formData.description.trim()) {
      setFormError('Please provide a project description.');
      return;
    }

    const openPos = parseInt(formData.openPositions, 10);
    if (isNaN(openPos) || openPos < 0) {
      setFormError('Open positions must be a non-negative number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newProject = await createProject({
        title: formData.title.trim(),
        description: formData.description.trim(),
        skills: formData.skills.trim(),
        category: formData.category,
        openPositions: openPos,
        repoUrl: formData.repoUrl.trim() || undefined,
      });

      if (onProjectCreated) {
        onProjectCreated(newProject);
      }
      onClose();
    } catch (err) {
      console.error('Project creation failed:', err);
      setFormError(err.message || 'Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[#F2F4F7] flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8EDF7] text-[#5277D9] flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#17233B]">
                Create a Collaboration Project
              </h2>
              <p className="text-xs text-[#667085]">
                Invite campus peers to build and contribute
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#98A2B3] hover:text-[#17233B] hover:bg-[#F2F4F7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#17233B] mb-1">
              Project Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Campus Event Management System"
              maxLength={120}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] text-sm text-[#17233B] placeholder-[#98A2B3] focus:outline-none focus:border-[#5277D9] focus:ring-2 focus:ring-[#5277D9]/20 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#17233B] mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the project goal, what you are building, and what teammates you're looking for..."
              maxLength={1000}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] text-sm text-[#17233B] placeholder-[#98A2B3] focus:outline-none focus:border-[#5277D9] focus:ring-2 focus:ring-[#5277D9]/20 transition-all resize-none"
            />
          </div>

          {/* Category & Open Positions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#17233B] mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] text-sm text-[#17233B] focus:outline-none focus:border-[#5277D9] focus:ring-2 focus:ring-[#5277D9]/20 transition-all cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17233B] mb-1">
                Open Positions
              </label>
              <input
                type="number"
                name="openPositions"
                min="0"
                max="20"
                value={formData.openPositions}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] text-sm text-[#17233B] focus:outline-none focus:border-[#5277D9] focus:ring-2 focus:ring-[#5277D9]/20 transition-all"
              />
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-xs font-semibold text-[#17233B] mb-1">
              Required Skills / Tech Stack
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g., React, Node.js, PostgreSQL (comma-separated)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] text-sm text-[#17233B] placeholder-[#98A2B3] focus:outline-none focus:border-[#5277D9] focus:ring-2 focus:ring-[#5277D9]/20 transition-all"
            />
          </div>

          {/* Repository URL */}
          <div>
            <label className="block text-xs font-semibold text-[#17233B] mb-1">
              Repository URL <span className="text-[11px] font-normal text-[#98A2B3]">(Optional)</span>
            </label>
            <input
              type="url"
              name="repoUrl"
              value={formData.repoUrl}
              onChange={handleChange}
              placeholder="https://github.com/username/project"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] text-sm text-[#17233B] placeholder-[#98A2B3] focus:outline-none focus:border-[#5277D9] focus:ring-2 focus:ring-[#5277D9]/20 transition-all"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#F2F4F7] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#667085] hover:text-[#17233B] hover:bg-[#F2F4F7] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#5277D9] hover:bg-[#4364BE] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publish Project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
