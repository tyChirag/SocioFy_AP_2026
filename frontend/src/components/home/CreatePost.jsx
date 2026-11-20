import { useState, useRef } from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import Avatar from '../common/Avatar';
import { createNewPost } from '../../Services/postServices';

/**
 * CreatePost Component
 * Real post composer connecting to POST /api/posts:
 * - Two-way state binding with postText
 * - Disabled while empty or submitting
 * - Submits authenticated post to backend and prepends to feed
 * - Displays error banner if creation fails
 *
 * @param {Object} props
 * @param {Function} props.onAddPost - Callback invoked with the newly created database post
 */
const CreatePost = ({ onAddPost }) => {
  const [postText, setPostText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedContent = postText.trim();
    if (!trimmedContent || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Call backend API (POST /api/posts)
      const createdPost = await createNewPost(trimmedContent);

      // Add the real post returned from PostgreSQL to the top of the feed
      if (onAddPost) {
        onAddPost(createdPost);
      }

      // Reset composer input only after successful creation
      setPostText('');
      setIsExpanded(false);
    } catch (err) {
      console.error('Failed to create post:', err);
      setErrorMessage(err.message || 'Failed to publish post. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-xs">
      {/* Error alert banner */}
      {errorMessage && (
        <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-red-500 hover:text-red-700 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
          <Avatar
            initials="ST"
            size="md"
          />

          <div className="flex-1">
            <textarea
              ref={textareaRef}
              rows={isExpanded ? 3 : 2}
              value={postText}
              onChange={(e) => {
                setPostText(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              onFocus={handleFocus}
              placeholder="What's happening on your campus?"
              disabled={isSubmitting}
              className="w-full text-sm sm:text-base text-[#17233B] placeholder-[#667085] bg-transparent resize-none focus:outline-none disabled:opacity-60"
            />
          </div>
        </div>

        {/* Toolbar & Action Buttons */}
        <div className="mt-3 pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
          <span className="text-xs text-[#667085]">
            Share thoughts, questions, or updates with fellow students
          </span>

          <button
            type="submit"
            disabled={!postText.trim() || isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5277D9] text-white text-xs sm:text-sm font-semibold hover:bg-[#4364BE] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
