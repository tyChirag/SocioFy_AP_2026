import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import { getStoredUser } from '../../Services/postServices';

/**
 * Feed Component
 * Center column of the student dashboard:
 * - CreatePost composer at top
 * - Loading, error, empty, and post list states
 *
 * @param {Object} props
 * @param {Array} props.posts - Array of post items
 * @param {boolean} props.isLoading - Whether posts are currently loading from database
 * @param {string} props.error - Error message if fetch failed
 * @param {Function} props.onRefresh - Function to retry loading posts
 * @param {Function} props.onAddPost - Post creation handler
 * @param {Function} [props.onPostUpdate] - Post like or comments count updater
 */
const Feed = ({
  posts,
  isLoading,
  error,
  onRefresh,
  onAddPost,
  onPostUpdate,
}) => {
  const currentUser = getStoredUser();

  return (
    <div className="space-y-5">
      {/* 1. Create Post Composer */}
      {onAddPost && <CreatePost onAddPost={onAddPost} />}

      {/* 2. Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center text-[#667085] flex flex-col items-center justify-center gap-2 shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#5277D9]" />
          <p className="text-sm font-medium">Loading campus feed...</p>
        </div>
      )}

      {/* 3. Error State */}
      {!isLoading && error && (
        <div className="bg-white rounded-2xl border border-red-200 p-6 text-center shadow-xs">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-2">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#17233B]">Unable to load posts</h4>
          <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">{error}</p>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E8EDF7] text-[#5277D9] text-xs font-semibold hover:bg-[#5277D9] hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      )}

      {/* 4. Campus Feed Posts List */}
      {!isLoading && !error && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={`${post.id}-${currentUser?.userId || currentUser?.id || 'guest'}`}
              post={post}
              onPostUpdate={onPostUpdate}
            />
          ))}
        </div>
      )}

      {/* 5. Empty Feed State */}
      {!isLoading && !error && posts.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center text-[#667085] text-sm shadow-xs">
          <p className="font-semibold text-[#17233B]">No posts on campus yet</p>
          <p className="text-xs text-[#667085] mt-1">
            Be the first student to share an update, project, or question!
          </p>
        </div>
      )}
    </div>
  );
};

export default Feed;
