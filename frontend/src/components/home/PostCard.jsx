import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Share2, Send, Trash2, Loader2, Check } from 'lucide-react';
import Avatar from '../common/Avatar';
import {
  likePostApi,
  unlikePostApi,
  fetchPostComments,
  addPostComment,
  deleteCommentApi,
} from '../../Services/postServices';
import { useAuth } from '../../context/AuthContext';

/**
 * Format relative time or clean date string
 */
const formatPostTime = (dateString) => {
  if (!dateString) return 'Just now';
  try {
    const postDate = new Date(dateString);
    const now = new Date();
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
  } catch {
    return 'Recently';
  }
};

/**
 * Get fallback initials from full name
 */
const getInitials = (name) => {
  if (!name) return 'SF';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

/**
 * PostCard Component
 * Displays student post with full real-time database-backed interactions:
 * - Like / Unlike with optimistic UI & rollback
 * - Expandable Comments with database fetching, posting, and deletion
 * - Native Web Share API with clipboard fallback
 *
 * @param {Object} props
 * @param {Object} props.post - Real post object from database
 * @param {Function} [props.onPostUpdate] - Optional callback to sync post changes back to parent
 */
const PostCard = ({ post, onPostUpdate }) => {
  const { currentUser } = useAuth();

  // 1. Like State (Optimistic update)
  const initialLikesCount = typeof post.likesCount === 'number'
    ? post.likesCount
    : post._count?.likes ?? 0;

  const initialLiked = post.isLikedByCurrentUser !== undefined
    ? Boolean(post.isLikedByCurrentUser)
    : Boolean(post.isLiked);

  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);

  // Synchronize state whenever post props update (e.g. account switch or parent refresh)
  useEffect(() => {
    const propLiked = post.isLikedByCurrentUser !== undefined
      ? Boolean(post.isLikedByCurrentUser)
      : Boolean(post.isLiked);
    const propCount = typeof post.likesCount === 'number'
      ? post.likesCount
      : post._count?.likes ?? 0;

    setIsLiked(propLiked);
    setLikesCount(propCount);
  }, [post.id, post.isLikedByCurrentUser, post.isLiked, post.likesCount]);

  // 2. Comments State
  const initialCommentsCount = typeof post.comments?.length === 'number'
    ? post.comments.length
    : post._count?.comments ?? 0;

  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsError, setCommentsError] = useState('');

  // 3. Share State
  const [shareSuccess, setShareSuccess] = useState(false);

  // Author details
  const authorName = post.author?.fullName || 'Student User';
  const collegeName = post.author?.collegeName || 'Campus';
  const department = post.author?.department || '';
  const academicYear = post.author?.academicYear || '';
  const formattedTime = post.createdAt ? formatPostTime(post.createdAt) : post.timeAgo || 'Just now';

  /**
   * Handle Like / Unlike with optimistic state
   */
  const handleToggleLike = async () => {
    if (isLikeProcessing) return;

    const previousLiked = isLiked;
    const previousCount = likesCount;

    // Optimistically update UI
    const nextLiked = !previousLiked;
    const nextCount = nextLiked ? previousCount + 1 : Math.max(previousCount - 1, 0);

    setIsLiked(nextLiked);
    setLikesCount(nextCount);
    setIsLikeProcessing(true);

    try {
      let res;
      if (nextLiked) {
        res = await likePostApi(post.id);
      } else {
        res = await unlikePostApi(post.id);
      }

      const finalCount = typeof res?.likesCount === 'number' ? res.likesCount : nextCount;
      const finalLiked = res?.isLikedByCurrentUser !== undefined
        ? res.isLikedByCurrentUser
        : (res?.isLiked !== undefined ? res.isLiked : nextLiked);

      setIsLiked(finalLiked);
      setLikesCount(finalCount);

      if (onPostUpdate) {
        onPostUpdate(post.id, {
          isLiked: finalLiked,
          isLikedByCurrentUser: finalLiked,
          likesCount: finalCount,
        });
      }
    } catch (err) {
      console.error('Like action failed:', err);
      // Revert optimistic update on failure
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      alert(err.message || 'Failed to update like. Please make sure you are logged in.');
    } finally {
      setIsLikeProcessing(false);
    }
  };

  /**
   * Toggle and load comments
   */
  const handleToggleComments = async () => {
    const nextShow = !showComments;
    setShowComments(nextShow);

    // If opening comments and list is empty, fetch from database
    if (nextShow && comments.length === 0) {
      setIsLoadingComments(true);
      setCommentsError('');
      try {
        const fetched = await fetchPostComments(post.id);
        setComments(fetched);
        setCommentsCount(fetched.length);
      } catch (err) {
        console.error('Failed to load comments:', err);
        setCommentsError(err.message || 'Failed to load comments.');
      } finally {
        setIsLoadingComments(false);
      }
    }
  };

  /**
   * Submit new comment
   */
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const content = commentInput.trim();
    if (!content || isSubmittingComment) return;

    setIsSubmittingComment(true);
    setCommentsError('');

    try {
      const res = await addPostComment(post.id, content);
      setComments((prev) => [...prev, res.comment]);
      setCommentsCount(res.commentsCount);
      setCommentInput('');

      if (onPostUpdate) {
        onPostUpdate(post.id, { commentsCount: res.commentsCount });
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
      setCommentsError(err.message || 'Failed to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  /**
   * Delete comment
   */
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const res = await deleteCommentApi(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentsCount(res.commentsCount);

      if (onPostUpdate) {
        onPostUpdate(post.id, { commentsCount: res.commentsCount });
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert(err.message || 'Failed to delete comment.');
    }
  };

  /**
   * Share Post (Web Share API with Clipboard Fallback)
   */
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `SocioFy Post by ${authorName}`,
          text: post.content.slice(0, 100),
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled share or aborted
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    } catch {
      // In case clipboard permissions fail
      window.prompt('Copy post link:', shareUrl);
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-xs transition-all hover:border-[#CBD5E1]">
      {/* Header: Author Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to={post.author?.id ? `/profile/${post.author.id}` : '#'}
            className="shrink-0 hover:opacity-90 transition-opacity"
            title={`View ${authorName}'s profile`}
          >
            <Avatar
              src={post.author?.profileImage}
              initials={getInitials(authorName)}
              alt={authorName}
              size="md"
            />
          </Link>
          <div>
            <Link
              to={post.author?.id ? `/profile/${post.author.id}` : '#'}
              className="text-sm font-bold text-[#17233B] hover:text-[#5277D9] transition-colors leading-tight block"
              title={`View ${authorName}'s profile`}
            >
              {authorName}
            </Link>
            <p className="text-xs text-[#667085] leading-tight mt-0.5">
              {[department, academicYear].filter(Boolean).join(', ')}
              {department || academicYear ? ` • ${collegeName}` : collegeName}
            </p>
            <p className="text-[11px] text-[#667085] mt-0.5">{formattedTime}</p>
          </div>
        </div>

        {post.tag && (
          <span className="text-[11px] font-medium text-[#5277D9] bg-[#E8EDF7] px-2 py-0.5 rounded-full shrink-0">
            {post.tag}
          </span>
        )}
      </div>

      {/* Post Text Content */}
      <p className="mt-3.5 text-sm sm:text-base text-[#17233B] leading-relaxed whitespace-pre-line">
        {post.content}
      </p>

      {/* Optional Post Image */}
      {post.image && (
        <div className="mt-3.5 rounded-xl overflow-hidden border border-[#E5E7EB] bg-gray-50">
          <img
            src={post.image}
            alt="Post media"
            className="w-full max-h-96 object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Engagement Counters */}
      <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#667085]">
        <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
        <span>{commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}</span>
      </div>

      {/* Action Buttons Row */}
      <div className="mt-2 pt-1 border-t border-[#E5E7EB]/70 grid grid-cols-3 gap-1">
        {/* Like Button */}
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={isLikeProcessing}
          className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
            isLiked
              ? 'text-red-600 bg-red-50 font-semibold'
              : 'text-[#667085] hover:text-[#17233B] hover:bg-[#F8F9FC]'
          }`}
          title={isLiked ? 'Unlike post' : 'Like post'}
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              isLiked ? 'fill-red-600 text-red-600 scale-110' : ''
            }`}
          />
          <span>{isLiked ? 'Liked' : 'Like'}</span>
        </button>

        {/* Comment Button */}
        <button
          type="button"
          onClick={handleToggleComments}
          className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
            showComments
              ? 'text-[#5277D9] bg-[#E8EDF7] font-semibold'
              : 'text-[#667085] hover:text-[#17233B] hover:bg-[#F8F9FC]'
          }`}
          title="Toggle comments"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#667085] hover:text-[#17233B] hover:bg-[#F8F9FC] transition-colors cursor-pointer"
          title="Share post link"
        >
          {shareSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-[#E5E7EB] space-y-3">
          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
            <Avatar
              initials={currentUser ? getInitials(currentUser.fullName || 'ST') : 'ST'}
              size="sm"
            />
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Write a comment..."
              disabled={isSubmittingComment}
              className="flex-1 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl px-3 py-1.5 text-xs sm:text-sm text-[#17233B] placeholder-[#667085] focus:outline-none focus:bg-white focus:border-[#5277D9]"
            />
            <button
              type="submit"
              disabled={!commentInput.trim() || isSubmittingComment}
              className="p-2 rounded-xl bg-[#5277D9] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#4364BE] transition-colors cursor-pointer"
              title="Submit Comment"
            >
              {isSubmittingComment ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </form>

          {/* Error notice */}
          {commentsError && (
            <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{commentsError}</p>
          )}

          {/* Loading spinner */}
          {isLoadingComments && (
            <div className="flex items-center justify-center py-3 text-[#667085] gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#5277D9]" />
              <span className="text-xs">Loading comments...</span>
            </div>
          )}

          {/* Comment List */}
          {!isLoadingComments && comments.length > 0 && (
            <div className="space-y-2.5 pt-1">
              {comments.map((comment) => {
                const isAuthor = currentUser && currentUser.userId === comment.user?.id;
                const cAuthorName = comment.user?.fullName || 'Student';
                const cCollege = comment.user?.collegeName || '';

                return (
                  <div
                    key={comment.id}
                    className="flex items-start justify-between gap-2.5 bg-[#F8F9FC] p-2.5 rounded-xl border border-[#E5E7EB]/60"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <Avatar
                        initials={getInitials(cAuthorName)}
                        alt={cAuthorName}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-[#17233B] truncate">
                            {cAuthorName}
                            {cCollege && (
                              <span className="text-[10px] font-normal text-[#667085] ml-1.5">
                                • {cCollege}
                              </span>
                            )}
                          </p>
                          <span className="text-[10px] text-[#667085] shrink-0">
                            {formatPostTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-[#17233B] mt-1 break-words leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>

                    {/* Delete button only for author */}
                    {isAuthor && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-[#667085] hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Delete your comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty comments */}
          {!isLoadingComments && comments.length === 0 && !commentsError && (
            <p className="text-center text-xs text-[#667085] py-2">
              No comments yet. Start the conversation!
            </p>
          )}
        </div>
      )}
    </article>
  );
};

export default PostCard;
