import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import TopNavbar from '../components/layout/TopNavbar';
import Sidebar from '../components/layout/Sidebar';
import BottomNavbar from '../components/layout/BottomNavbar';
import PostCard from '../components/home/PostCard';
import SuggestedStudents from '../components/home/SuggestedStudents';
import PopularCommunities from '../components/home/PopularCommunities';
import { fetchPostById } from '../Services/postServices';

/**
 * PostDetailsPage Component
 * Displays an individual shared post via /post/:id
 */
const PostDetailsPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPost = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await fetchPostById(id);
        setPost(data);
      } catch (err) {
        console.error('Failed to load shared post:', err);
        setError(err.message || 'Post not found or unavailable.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadPost();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#17233B] flex flex-col antialiased selection:bg-[#5277D9] selection:text-white">
      <TopNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Navigation Sidebar */}
          <div className="hidden md:block md:col-span-3 lg:col-span-3 sticky top-22">
            <Sidebar />
          </div>

          {/* Center Column: Single Post Display */}
          <div className="col-span-12 md:col-span-9 lg:col-span-6 space-y-4">
            <Link
              to="/home"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5277D9] hover:text-[#4364BE] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Campus Feed</span>
            </Link>

            {isLoading && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center text-[#667085] flex flex-col items-center justify-center gap-2 shadow-xs">
                <Loader2 className="w-6 h-6 animate-spin text-[#5277D9]" />
                <p className="text-sm font-medium">Loading post...</p>
              </div>
            )}

            {!isLoading && error && (
              <div className="bg-white rounded-2xl border border-red-200 p-8 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#17233B]">Post Not Found</h3>
                <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">{error}</p>
                <Link
                  to="/home"
                  className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5277D9] text-white text-xs font-semibold hover:bg-[#4364BE] transition-colors shadow-xs"
                >
                  Return to Home
                </Link>
              </div>
            )}

            {!isLoading && !error && post && (
              <PostCard post={post} />
            )}
          </div>

          {/* Right Column: Suggested & Popular */}
          <div className="hidden lg:block lg:col-span-3 space-y-5 sticky top-22">
            <SuggestedStudents />
            <PopularCommunities />
          </div>
        </div>
      </main>

      <BottomNavbar />
    </div>
  );
};

export default PostDetailsPage;
