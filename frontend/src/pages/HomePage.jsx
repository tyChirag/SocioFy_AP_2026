import { useState, useEffect } from 'react';
import TopNavbar from '../components/layout/TopNavbar';
import Sidebar from '../components/layout/Sidebar';
import BottomNavbar from '../components/layout/BottomNavbar';
import Feed from '../components/home/Feed';
import SuggestedStudents from '../components/home/SuggestedStudents';
import PopularCommunities from '../components/home/PopularCommunities';
import UpcomingEvents from '../components/home/UpcomingEvents';
import { fetchAllPosts } from '../Services/postServices';

/**
 * HomePage Component
 * Primary authenticated student dashboard for SocioFy.
 * Connects to PostgreSQL database via Express REST APIs.
 */
const HomePage = () => {
  // 1. Manage real campus posts state
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // 2. Fetch posts from backend on component mount
  const loadPosts = async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const data = await fetchAllPosts();
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
      setFetchError(err.message || 'Failed to load posts from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // 3. Add a newly created real post from PostgreSQL to the top of the feed
  const handleAddPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  // 4. Update post metadata (likes, comments count)
  const handlePostUpdate = (postId, updates) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            ...updates,
            isLiked: updates.isLiked !== undefined ? updates.isLiked : post.isLiked,
            isLikedByCurrentUser: updates.isLikedByCurrentUser !== undefined
              ? updates.isLikedByCurrentUser
              : (updates.isLiked !== undefined ? updates.isLiked : post.isLikedByCurrentUser),
            likesCount: updates.likesCount !== undefined ? updates.likesCount : post.likesCount,
            _count: {
              ...post._count,
              likes: updates.likesCount !== undefined ? updates.likesCount : post._count?.likes,
              comments: updates.commentsCount !== undefined ? updates.commentsCount : post._count?.comments,
            },
          };
        }
        return post;
      })
    );
  };

  // 5. Scroll to top/composer on mobile bottom navbar create click
  const handleMobileCreateClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#17233B] flex flex-col antialiased selection:bg-[#5277D9] selection:text-white">
      {/* Top Navigation Bar */}
      <TopNavbar />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Navigation Sidebar (Hidden on mobile, 3 cols on md/lg) */}
          <div className="hidden md:block md:col-span-3 lg:col-span-3 sticky top-22">
            <Sidebar />
          </div>

          {/* Center Column: Main Campus Feed (12 cols on mobile, 9 on md without right rail, 6 on lg) */}
          <div className="col-span-12 md:col-span-9 lg:col-span-6 space-y-5">
            <Feed
              posts={posts}
              isLoading={isLoading}
              error={fetchError}
              onRefresh={loadPosts}
              onAddPost={handleAddPost}
              onPostUpdate={handlePostUpdate}
            />
          </div>

          {/* Right Column: Discovery and Updates (Hidden on tablet/mobile, 3 cols on lg) */}
          <div className="hidden lg:block lg:col-span-3 space-y-5 sticky top-22">
            <SuggestedStudents />
            <PopularCommunities />
            <UpcomingEvents />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavbar onCreateClick={handleMobileCreateClick} />
    </div>
  );
};

export default HomePage;
