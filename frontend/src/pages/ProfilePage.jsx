import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building,
  GraduationCap,
  Calendar,
  Sparkles,
  Award,
  Edit3,
  UserPlus,
  UserCheck,
  Clock,
  Check,
  X,
  Trash2,
  FileText,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Save,
  ExternalLink,
  Camera,
  Globe,
  Users,
  CheckCircle2,
  Plus,
  MessageSquare,
} from 'lucide-react';
import TopNavbar from '../components/layout/TopNavbar';
import Sidebar from '../components/layout/Sidebar';
import BottomNavbar from '../components/layout/BottomNavbar';
import Avatar from '../components/common/Avatar';
import PostCard from '../components/home/PostCard';
import {
  fetchUserProfile,
  updateUserProfile,
  uploadAvatarApi,
  removeAvatarApi,
  fetchStudentPosts,
  fetchStudentConnections,
} from '../Services/userServices';
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelSentRequest,
  removeConnection,
} from '../Services/connectionServices';
import { createOrGetConversation } from '../Services/messageServices';
import { getStoredUser } from '../Services/postServices';

/**
 * Clean Brand Icons for LinkedIn and GitHub
 */
const LinkedInIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const GitHubIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

/**
 * Format date string to clean readable string
 */
const formatDate = (dateString) => {
  if (!dateString) return 'Recently';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recently';
  }
};

const getInitials = (name) => {
  if (!name) return 'SF';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

/**
 * ProfilePage Component
 * Redesigned Student Profile Experience:
 * - Profile Header: Compact cover banner, overlapping circular avatar, student hierarchy, dynamic connection actions (no fake message button)
 * - Profile Picture Upload: file selection, 5MB validation, JPG/PNG/WebP, preview, replace & remove actions
 * - Profile Statistics: actual database post count & accepted connection count
 * - Profile Completion Indicator: for own profile with actionable missing prompts
 * - Navigation Tabs: Posts, About, Connections
 * - Edit Profile Modal: interactive tag input for skills & interests, portfolio & socials, instant photo manager
 */
const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getStoredUser();

  const isViewingSelfParam = !id || Number(id) === Number(currentUser?.userId || currentUser?.id);
  const targetId = id ? parseInt(id, 10) : Number(currentUser?.userId || currentUser?.id);

  // Profile data & loading
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Tab: 'posts' | 'about' | 'connections'
  const [activeTab, setActiveTab] = useState('posts');

  // Student's posts & loading
  const [studentPosts, setStudentPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  // Student's connections & loading
  const [studentConnections, setStudentConnections] = useState([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);

  // Connection action in progress
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const [isStartingMessage, setIsStartingMessage] = useState(false);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    bio: '',
    skills: [],
    interests: [],
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newInterestInput, setNewInterestInput] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [modalFeedback, setModalFeedback] = useState({ type: '', message: '' });

  // Avatar Upload State in Modal
  const fileInputRef = useRef(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarError, setAvatarError] = useState('');

  // 1. Fetch student profile details from backend
  const loadProfile = useCallback(async () => {
    if (!targetId || isNaN(targetId)) {
      setError('Invalid student profile ID.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const user = await fetchUserProfile(targetId);
      setProfile(user);

      // Pre-fill edit form
      const skillsArray = user.skills
        ? user.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const interestsArray = user.interests
        ? user.interests.split(',').map((i) => i.trim()).filter(Boolean)
        : [];

      setEditForm({
        fullName: user.fullName || '',
        bio: user.bio || '',
        skills: skillsArray,
        interests: interestsArray,
        linkedinUrl: user.linkedinUrl || '',
        githubUrl: user.githubUrl || '',
        portfolioUrl: user.portfolioUrl || '',
      });
      setAvatarPreview(user.profileImage || null);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err.message || 'Student profile not found.');
    } finally {
      setIsLoading(false);
    }
  }, [targetId]);

  // 2. Fetch student's posts from backend
  const loadPosts = useCallback(async () => {
    if (!targetId || isNaN(targetId)) return;
    setIsLoadingPosts(true);
    try {
      const data = await fetchStudentPosts(targetId, { limit: 30 });
      setStudentPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to load student posts:', err);
      setStudentPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [targetId]);

  // 3. Fetch student's connections from backend
  const loadConnections = useCallback(async () => {
    if (!targetId || isNaN(targetId)) return;
    setIsLoadingConnections(true);
    try {
      const conns = await fetchStudentConnections(targetId);
      setStudentConnections(conns || []);
    } catch (err) {
      console.error('Failed to load connections:', err);
      setStudentConnections([]);
    } finally {
      setIsLoadingConnections(false);
    }
  }, [targetId]);

  useEffect(() => {
    loadProfile();
    loadPosts();
    loadConnections();
  }, [loadProfile, loadPosts, loadConnections]);

  const isOwnProfile = profile?.connection?.isSelf || isViewingSelfParam;

  // Post update sync callback from PostCard (likes/comments)
  const handlePostUpdate = (postId, updates) => {
    setStudentPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...updates } : p))
    );
  };

  // Connection action handlers
  const handleConnect = async () => {
    if (isProcessingAction) return;
    setIsProcessingAction(true);
    try {
      const res = await sendConnectionRequest(targetId);
      setProfile((prev) => ({
        ...prev,
        connection: { status: 'SENT', connectionId: res.connection.id },
      }));
    } catch (err) {
      alert(err.message || 'Failed to send connection request.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleCancelRequest = async () => {
    if (isProcessingAction || !profile.connection?.connectionId) return;
    setIsProcessingAction(true);
    try {
      await cancelSentRequest(profile.connection.connectionId);
      setProfile((prev) => ({
        ...prev,
        connection: { status: 'NONE', connectionId: null },
      }));
    } catch (err) {
      alert(err.message || 'Failed to cancel request.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (isProcessingAction || !profile.connection?.connectionId) return;
    setIsProcessingAction(true);
    try {
      await acceptConnectionRequest(profile.connection.connectionId);
      setProfile((prev) => ({
        ...prev,
        connectionsCount: (prev.connectionsCount || 0) + 1,
        connection: { ...prev.connection, status: 'CONNECTED' },
      }));
      loadConnections();
    } catch (err) {
      alert(err.message || 'Failed to accept connection request.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleRejectRequest = async () => {
    if (isProcessingAction || !profile.connection?.connectionId) return;
    setIsProcessingAction(true);
    try {
      await rejectConnectionRequest(profile.connection.connectionId);
      setProfile((prev) => ({
        ...prev,
        connection: { status: 'NONE', connectionId: null },
      }));
    } catch (err) {
      alert(err.message || 'Failed to decline request.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleRemoveConnection = async () => {
    if (!window.confirm(`Are you sure you want to remove your connection with ${profile.fullName}?`)) return;
    if (isProcessingAction || !profile.connection?.connectionId) return;
    setIsProcessingAction(true);
    try {
      await removeConnection(profile.connection.connectionId);
      setProfile((prev) => ({
        ...prev,
        connectionsCount: Math.max((prev.connectionsCount || 1) - 1, 0),
        connection: { status: 'NONE', connectionId: null },
      }));
      setShowConfirmRemove(false);
      loadConnections();
    } catch (err) {
      alert(err.message || 'Failed to remove connection.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleStartMessage = async () => {
    if (!profile?.id || isStartingMessage) return;
    try {
      setIsStartingMessage(true);
      const conversation = await createOrGetConversation(profile.id);
      if (conversation?.id) {
        navigate(`/messages/${conversation.id}`);
      } else {
        navigate('/messages');
      }
    } catch (err) {
      console.error('Failed to open message conversation:', err);
      alert(err.message || 'Could not open conversation.');
    } finally {
      setIsStartingMessage(false);
    }
  };

  // Avatar Upload Handlers
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError('');
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setAvatarError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image size exceeds 5 MB. Please select a smaller photo.');
      return;
    }

    // Set immediate preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    // Auto upload to backend
    setIsUploadingAvatar(true);
    try {
      const updatedUser = await uploadAvatarApi(file);
      setProfile((prev) => ({
        ...prev,
        profileImage: updatedUser.profileImage,
      }));
      setAvatarPreview(updatedUser.profileImage);
      setModalFeedback({
        type: 'success',
        message: 'Profile picture updated successfully!',
      });
      setTimeout(() => setModalFeedback({ type: '', message: '' }), 3000);
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setAvatarError(err.message || 'Failed to upload photo.');
      setAvatarPreview(profile?.profileImage || null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    setIsUploadingAvatar(true);
    setAvatarError('');
    try {
      await removeAvatarApi();
      setProfile((prev) => ({
        ...prev,
        profileImage: null,
      }));
      setAvatarPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setModalFeedback({
        type: 'success',
        message: 'Profile picture removed.',
      });
      setTimeout(() => setModalFeedback({ type: '', message: '' }), 3000);
    } catch (err) {
      setAvatarError(err.message || 'Failed to remove photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Tag Add / Remove handlers for Skills and Interests
  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (trimmed && !editForm.skills.includes(trimmed)) {
      setEditForm((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setEditForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleAddInterest = (e) => {
    e.preventDefault();
    const trimmed = newInterestInput.trim();
    if (trimmed && !editForm.interests.includes(trimmed)) {
      setEditForm((prev) => ({
        ...prev,
        interests: [...prev.interests, trimmed],
      }));
      setNewInterestInput('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setEditForm((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interestToRemove),
    }));
  };

  // Profile Form Save Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setModalFeedback({ type: '', message: '' });

    try {
      const payload = {
        fullName: editForm.fullName.trim(),
        bio: editForm.bio.trim(),
        skills: editForm.skills.join(', '),
        interests: editForm.interests.join(', '),
        linkedinUrl: editForm.linkedinUrl.trim(),
        githubUrl: editForm.githubUrl.trim(),
        portfolioUrl: editForm.portfolioUrl.trim(),
      };

      const updated = await updateUserProfile(payload);
      setProfile((prev) => ({
        ...prev,
        ...updated,
      }));

      setModalFeedback({
        type: 'success',
        message: 'Profile saved successfully!',
      });

      setTimeout(() => {
        setIsEditModalOpen(false);
        setModalFeedback({ type: '', message: '' });
      }, 700);
    } catch (err) {
      setModalFeedback({
        type: 'error',
        message: err.message || 'Failed to save changes.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Profile Completion Calculation (for logged-in student)
  const skillsList = profile?.skills
    ? profile.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const interestsList = profile?.interests
    ? profile.interests.split(',').map((i) => i.trim()).filter(Boolean)
    : [];

  const completionChecks = [
    {
      label: 'Profile picture',
      done: Boolean(profile?.profileImage),
      action: 'Upload a profile photo',
    },
    {
      label: 'Bio',
      done: Boolean(profile?.bio && profile.bio.trim().length > 0),
      action: 'Add a bio to introduce yourself',
    },
    {
      label: 'Skills',
      done: Boolean(skillsList.length > 0),
      action: 'Add your academic & technical skills',
    },
    {
      label: 'Interests',
      done: Boolean(interestsList.length > 0),
      action: 'Add topics you are interested in',
    },
    {
      label: 'Portfolio & Socials',
      done: Boolean(profile?.githubUrl || profile?.linkedinUrl || profile?.portfolioUrl),
      action: 'Add your LinkedIn, GitHub, or Portfolio',
    },
  ];

  const completedCount = completionChecks.filter((c) => c.done).length;
  const completionPercentage = Math.round((completedCount / completionChecks.length) * 100);
  const nextMissing = completionChecks.find((c) => !c.done);

  const firstName = profile?.fullName ? profile.fullName.split(' ')[0] : 'Student';

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

          {/* Right Column: Profile Content (9 cols) */}
          <div className="col-span-12 md:col-span-9 space-y-6">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#667085] hover:text-[#17233B] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {isOwnProfile && profile && (
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#5277D9] text-xs font-bold text-[#17233B] hover:text-[#5277D9] shadow-xs transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center text-[#667085] flex flex-col items-center justify-center gap-2 shadow-xs">
                <Loader2 className="w-6 h-6 animate-spin text-[#5277D9]" />
                <p className="text-sm font-medium">Loading student profile...</p>
              </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <div className="bg-white rounded-2xl border border-red-200 p-8 text-center shadow-xs">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-2">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#17233B]">Profile Not Found</h4>
                <p className="text-xs text-[#667085] mt-1">{error}</p>
                <Link
                  to="/explore"
                  className="mt-4 inline-block px-4 py-2 rounded-xl bg-[#5277D9] text-white text-xs font-semibold hover:bg-[#4364BE] transition-colors"
                >
                  Explore Other Students
                </Link>
              </div>
            )}

            {/* Loaded Profile View */}
            {!isLoading && !error && profile && (
              <>
                {/* 1. Profile Header Card */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs">
                  {/* Subtle Gradient Cover Banner */}
                  <div className="h-28 sm:h-32 bg-gradient-to-r from-[#17233B] via-[#243556] to-[#5277D9] relative" />

                  <div className="px-5 pb-6 sm:px-8">
                    {/* Avatar & Relationship Actions Row */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 sm:-mt-16 mb-4 gap-4">
                      {/* Overlapping Avatar with Ring & Upload Prompt */}
                      <div className="relative group self-start">
                        <div className="ring-4 ring-white rounded-full inline-block shadow-md bg-white">
                          <Avatar
                            src={profile.profileImage}
                            initials={getInitials(profile.fullName)}
                            size="2xl"
                            className="w-24 h-24 sm:w-28 sm:h-28 text-2xl"
                          />
                        </div>

                        {/* Camera Overlay Icon on Own Profile */}
                        {isOwnProfile && (
                          <button
                            type="button"
                            onClick={() => setIsEditModalOpen(true)}
                            className="absolute bottom-1 right-1 p-2 bg-[#17233B] hover:bg-[#5277D9] text-white rounded-full shadow-md border-2 border-white transition-colors cursor-pointer"
                            title="Update Profile Picture"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Header Actions */}
                      {isOwnProfile ? (
                        <button
                          type="button"
                          onClick={() => setIsEditModalOpen(true)}
                          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] hover:border-[#5277D9] text-xs font-bold text-[#17233B] hover:text-[#5277D9] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Profile</span>
                        </button>
                      ) : (
                        <div className="self-start sm:self-auto flex items-center gap-2">
                          {/* Case 1: No Connection -> Connect Button */}
                          {profile.connection?.status === 'NONE' && (
                            <button
                              type="button"
                              disabled={isProcessingAction}
                              onClick={handleConnect}
                              className="px-4 py-2 rounded-xl bg-[#5277D9] hover:bg-[#4364BE] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              {isProcessingAction ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <UserPlus className="w-4 h-4" />
                              )}
                              <span>Connect</span>
                            </button>
                          )}

                          {/* Case 2: Request Sent -> Requested Badge + Cancel */}
                          {profile.connection?.status === 'SENT' && (
                            <div className="flex items-center gap-2">
                              <span className="px-3.5 py-1.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] text-xs font-medium text-[#667085] flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-amber-500" />
                                <span>Requested</span>
                              </span>
                              <button
                                type="button"
                                disabled={isProcessingAction}
                                onClick={handleCancelRequest}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {/* Case 3: Request Received -> Accept & Decline */}
                          {profile.connection?.status === 'RECEIVED' && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={isProcessingAction}
                                onClick={handleAcceptRequest}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                              >
                                {isProcessingAction ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                                <span>Accept Request</span>
                              </button>
                              <button
                                type="button"
                                disabled={isProcessingAction}
                                onClick={handleRejectRequest}
                                className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#475467] text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Decline
                              </button>
                            </div>
                          )}

                          {/* Case 4: Connected -> Message + Connected Badge + Remove */}
                          {profile.connection?.status === 'CONNECTED' && (
                            <div className="flex items-center gap-2">
                              {!showConfirmRemove ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={handleStartMessage}
                                    disabled={isStartingMessage}
                                    className="px-3.5 py-2 rounded-xl bg-[#5277D9] hover:bg-[#4364c2] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                                    title="Send Message"
                                  >
                                    {isStartingMessage ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <MessageSquare className="w-4 h-4" />
                                    )}
                                    <span>Message</span>
                                  </button>
                                  <span className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                                    <UserCheck className="w-4 h-4" />
                                    <span>Connected</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirmRemove(true)}
                                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Remove connection"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                                  <span className="text-xs text-red-600 font-medium">Remove?</span>
                                  <button
                                    type="button"
                                    disabled={isProcessingAction}
                                    onClick={handleRemoveConnection}
                                    className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 cursor-pointer"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirmRemove(false)}
                                    className="px-2.5 py-1.5 bg-gray-100 text-[#475467] text-xs font-semibold rounded-xl hover:bg-gray-200 cursor-pointer"
                                  >
                                    Back
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Student Identity */}
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17233B] tracking-tight">
                        {profile.fullName}
                      </h1>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#667085] mt-1.5">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Building className="w-4 h-4 text-[#5277D9]" />
                          <span>{profile.collegeName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <GraduationCap className="w-4 h-4 text-[#5277D9]" />
                          <span>
                            {profile.department} {profile.academicYear ? `• ${profile.academicYear}` : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Joined {formatDate(profile.createdAt)}</span>
                        </div>
                      </div>

                      {/* Header Short Bio */}
                      {profile.bio && (
                        <p className="mt-3 text-xs sm:text-sm text-[#475467] leading-relaxed max-w-2xl whitespace-pre-line">
                          {profile.bio}
                        </p>
                      )}
                    </div>

                    {/* Profile Statistics: Real Database Counts */}
                    <div className="flex flex-wrap items-center gap-6 mt-5 pt-4 border-t border-[#F2F4F7]">
                      <button
                        type="button"
                        onClick={() => setActiveTab('posts')}
                        className="text-left group cursor-pointer"
                      >
                        <span className="text-lg font-black text-[#17233B] group-hover:text-[#5277D9] transition-colors">
                          {profile.postsCount ?? studentPosts.length ?? 0}
                        </span>
                        <span className="text-xs text-[#667085] ml-1.5 font-medium">Posts</span>
                      </button>

                      <div className="h-4 w-px bg-gray-200" />

                      <button
                        type="button"
                        onClick={() => setActiveTab('connections')}
                        className="text-left group cursor-pointer"
                      >
                        <span className="text-lg font-black text-[#17233B] group-hover:text-[#5277D9] transition-colors">
                          {profile.connectionsCount ?? studentConnections.length ?? 0}
                        </span>
                        <span className="text-xs text-[#667085] ml-1.5 font-medium">
                          Connections
                        </span>
                      </button>

                      {/* External Professional Links */}
                      {(profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl) && (
                        <>
                          <div className="h-4 w-px bg-gray-200" />
                          <div className="flex items-center gap-2">
                            {profile.portfolioUrl && (
                              <a
                                href={
                                  profile.portfolioUrl.startsWith('http')
                                    ? profile.portfolioUrl
                                    : `https://${profile.portfolioUrl}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8F9FC] border border-[#E5E7EB] text-xs text-[#667085] hover:text-[#5277D9] hover:border-[#5277D9]/40 transition-colors"
                                title="Personal Website / Portfolio"
                              >
                                <Globe className="w-3.5 h-3.5 text-[#5277D9]" />
                                <span className="text-[11px] font-medium">Portfolio</span>
                                <ExternalLink className="w-3 h-3 opacity-60" />
                              </a>
                            )}

                            {profile.linkedinUrl && (
                              <a
                                href={
                                  profile.linkedinUrl.startsWith('http')
                                    ? profile.linkedinUrl
                                    : `https://${profile.linkedinUrl}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8F9FC] border border-[#E5E7EB] text-xs text-[#667085] hover:text-[#0A66C2] hover:border-[#0A66C2]/40 transition-colors"
                                title="LinkedIn Profile"
                              >
                                <LinkedInIcon className="w-3.5 h-3.5 text-[#0A66C2]" />
                                <span className="text-[11px] font-medium">LinkedIn</span>
                                <ExternalLink className="w-3 h-3 opacity-60" />
                              </a>
                            )}

                            {profile.githubUrl && (
                              <a
                                href={
                                  profile.githubUrl.startsWith('http')
                                    ? profile.githubUrl
                                    : `https://${profile.githubUrl}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8F9FC] border border-[#E5E7EB] text-xs text-[#667085] hover:text-[#17233B] hover:border-gray-400 transition-colors"
                                title="GitHub Profile"
                              >
                                <GitHubIcon className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-medium">GitHub</span>
                                <ExternalLink className="w-3 h-3 opacity-60" />
                              </a>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Profile Completion Indicator (Only for logged-in user's own profile) */}
                {isOwnProfile && (
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#5277D9]/10 text-[#5277D9] flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-bold text-[#17233B]">Profile Completion</h3>
                      </div>
                      <span className="text-xs font-extrabold text-[#5277D9]">
                        {completionPercentage}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#5277D9] h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>

                    {/* Actionable Prompt */}
                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      {completionPercentage === 100 ? (
                        <p className="text-emerald-700 font-semibold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Your profile is 100% complete! Outstanding job.</span>
                        </p>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <p className="text-[#667085]">
                            Suggestion: <span className="text-[#17233B] font-medium">{nextMissing?.action}</span>
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsEditModalOpen(true)}
                            className="text-[#5277D9] font-bold hover:underline cursor-pointer ml-2 shrink-0"
                          >
                            Update
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Navigation Tabs Bar */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-1.5 shadow-xs flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'posts'
                        ? 'bg-[#17233B] text-white shadow-xs'
                        : 'text-[#667085] hover:text-[#17233B] hover:bg-[#F8F9FC]'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Posts</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        activeTab === 'posts' ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#667085]'
                      }`}
                    >
                      {profile.postsCount ?? studentPosts.length ?? 0}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('about')}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'about'
                        ? 'bg-[#17233B] text-white shadow-xs'
                        : 'text-[#667085] hover:text-[#17233B] hover:bg-[#F8F9FC]'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>About</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('connections')}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'connections'
                        ? 'bg-[#17233B] text-white shadow-xs'
                        : 'text-[#667085] hover:text-[#17233B] hover:bg-[#F8F9FC]'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Connections</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        activeTab === 'connections'
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 text-[#667085]'
                      }`}
                    >
                      {profile.connectionsCount ?? studentConnections.length ?? 0}
                    </span>
                  </button>
                </div>

                {/* 4. Tab Content Panels */}

                {/* TAB 1: POSTS */}
                {activeTab === 'posts' && (
                  <div className="space-y-4">
                    {isLoadingPosts ? (
                      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center text-[#667085] flex flex-col items-center justify-center gap-2 shadow-xs">
                        <Loader2 className="w-5 h-5 animate-spin text-[#5277D9]" />
                        <p className="text-xs font-medium">Loading posts...</p>
                      </div>
                    ) : studentPosts.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center shadow-xs">
                        <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <h3 className="text-sm font-bold text-[#17233B]">No posts published yet</h3>
                        <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
                          {isOwnProfile
                            ? "You haven't posted any updates to the campus feed yet."
                            : `${firstName} hasn't published any posts yet.`}
                        </p>
                        {isOwnProfile && (
                          <Link
                            to="/home"
                            className="mt-4 inline-block px-4 py-2 rounded-xl bg-[#5277D9] text-white text-xs font-semibold hover:bg-[#4364BE] transition-colors"
                          >
                            Create your first post
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {studentPosts.map((post) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            onPostUpdate={handlePostUpdate}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: ABOUT */}
                {activeTab === 'about' && (
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs space-y-6">
                    {/* Introduction / Bio */}
                    <div>
                      <h2 className="text-xs font-black text-[#667085] uppercase tracking-wider mb-2">
                        Introduction
                      </h2>
                      {profile.bio ? (
                        <p className="text-xs sm:text-sm text-[#475467] leading-relaxed whitespace-pre-line">
                          {profile.bio}
                        </p>
                      ) : (
                        <p className="text-xs text-[#98A2B3] italic">
                          No bio added yet.{' '}
                          {isOwnProfile && (
                            <button
                              type="button"
                              onClick={() => setIsEditModalOpen(true)}
                              className="text-[#5277D9] hover:underline not-italic font-semibold cursor-pointer"
                            >
                              Add bio
                            </button>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Academic Details */}
                    <div className="pt-5 border-t border-[#F2F4F7]">
                      <h2 className="text-xs font-black text-[#667085] uppercase tracking-wider mb-3">
                        Academic Details
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB]">
                          <p className="text-[11px] text-[#667085] font-medium">Institution</p>
                          <p className="text-xs font-bold text-[#17233B] mt-0.5 truncate">
                            {profile.collegeName}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB]">
                          <p className="text-[11px] text-[#667085] font-medium">Department</p>
                          <p className="text-xs font-bold text-[#17233B] mt-0.5 truncate">
                            {profile.department}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB]">
                          <p className="text-[11px] text-[#667085] font-medium">Academic Year</p>
                          <p className="text-xs font-bold text-[#17233B] mt-0.5 truncate">
                            {profile.academicYear}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Skills Section */}
                    <div className="pt-5 border-t border-[#F2F4F7]">
                      <h2 className="text-xs font-black text-[#667085] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[#5277D9]" />
                        <span>Skills & Expertise</span>
                      </h2>
                      {skillsList.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {skillsList.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-xl bg-[#E8EDF7] text-[#5277D9] text-xs font-semibold border border-[#D0DBF5]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#98A2B3] italic">
                          No skills listed yet.{' '}
                          {isOwnProfile && (
                            <button
                              type="button"
                              onClick={() => setIsEditModalOpen(true)}
                              className="text-[#5277D9] hover:underline not-italic font-semibold cursor-pointer"
                            >
                              Add skills
                            </button>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Interests Section */}
                    <div className="pt-5 border-t border-[#F2F4F7]">
                      <h2 className="text-xs font-black text-[#667085] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Interests & Topics</span>
                      </h2>
                      {interestsList.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {interestsList.map((interest, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-xl bg-[#F8F9FC] text-[#475467] text-xs font-medium border border-[#E5E7EB]"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#98A2B3] italic">
                          No interests listed yet.{' '}
                          {isOwnProfile && (
                            <button
                              type="button"
                              onClick={() => setIsEditModalOpen(true)}
                              className="text-[#5277D9] hover:underline not-italic font-semibold cursor-pointer"
                            >
                              Add interests
                            </button>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Professional Links Section */}
                    <div className="pt-5 border-t border-[#F2F4F7]">
                      <h2 className="text-xs font-black text-[#667085] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#5277D9]" />
                        <span>Social & Portfolio Links</span>
                      </h2>

                      {profile.portfolioUrl || profile.linkedinUrl || profile.githubUrl ? (
                        <div className="flex flex-wrap gap-3">
                          {profile.portfolioUrl && (
                            <a
                              href={
                                profile.portfolioUrl.startsWith('http')
                                  ? profile.portfolioUrl
                                  : `https://${profile.portfolioUrl}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] text-xs text-[#17233B] hover:text-[#5277D9] hover:border-[#5277D9] transition-all"
                            >
                              <Globe className="w-4 h-4 text-[#5277D9]" />
                              <span className="font-medium">Portfolio</span>
                              <ExternalLink className="w-3 h-3 text-[#667085]" />
                            </a>
                          )}

                          {profile.linkedinUrl && (
                            <a
                              href={
                                profile.linkedinUrl.startsWith('http')
                                  ? profile.linkedinUrl
                                  : `https://${profile.linkedinUrl}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] text-xs text-[#17233B] hover:text-[#0A66C2] hover:border-[#0A66C2] transition-all"
                            >
                              <LinkedInIcon className="w-4 h-4 text-[#0A66C2]" />
                              <span className="font-medium">LinkedIn</span>
                              <ExternalLink className="w-3 h-3 text-[#667085]" />
                            </a>
                          )}

                          {profile.githubUrl && (
                            <a
                              href={
                                profile.githubUrl.startsWith('http')
                                  ? profile.githubUrl
                                  : `https://${profile.githubUrl}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] text-xs text-[#17233B] hover:text-[#17233B] hover:border-gray-400 transition-all"
                            >
                              <GitHubIcon className="w-4 h-4 text-[#17233B]" />
                              <span className="font-medium">GitHub</span>
                              <ExternalLink className="w-3 h-3 text-[#667085]" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-[#98A2B3] italic">
                          No links added yet.{' '}
                          {isOwnProfile && (
                            <button
                              type="button"
                              onClick={() => setIsEditModalOpen(true)}
                              className="text-[#5277D9] hover:underline not-italic font-semibold cursor-pointer"
                            >
                              Add links
                            </button>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: CONNECTIONS */}
                {activeTab === 'connections' && (
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-[#17233B] flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#5277D9]" />
                        <span>Accepted Connections</span>
                        <span className="text-xs font-normal text-[#667085]">
                          ({studentConnections.length})
                        </span>
                      </h3>
                    </div>

                    {isLoadingConnections ? (
                      <div className="py-8 text-center text-[#667085] flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-[#5277D9]" />
                        <p className="text-xs">Loading connections...</p>
                      </div>
                    ) : studentConnections.length === 0 ? (
                      <div className="py-10 text-center text-[#667085]">
                        <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <h4 className="text-sm font-bold text-[#17233B]">No connections yet</h4>
                        <p className="text-xs mt-1 max-w-sm mx-auto">
                          {isOwnProfile
                            ? 'Connect with peers from other departments and colleges to expand your network.'
                            : `${firstName} has not connected with other students yet.`}
                        </p>
                        {isOwnProfile && (
                          <Link
                            to="/explore"
                            className="mt-4 inline-block px-4 py-2 rounded-xl bg-[#5277D9] text-white text-xs font-semibold hover:bg-[#4364BE] transition-colors"
                          >
                            Explore Students
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {studentConnections.map((peer) => (
                          <div
                            key={peer.id}
                            className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FC] hover:border-[#CBD5E1] transition-all flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Link to={`/profile/${peer.id}`} className="shrink-0 hover:opacity-90">
                                <Avatar
                                  src={peer.profileImage}
                                  initials={getInitials(peer.fullName)}
                                  size="md"
                                />
                              </Link>
                              <div className="min-w-0">
                                <Link
                                  to={`/profile/${peer.id}`}
                                  className="text-xs font-bold text-[#17233B] hover:text-[#5277D9] transition-colors truncate block"
                                >
                                  {peer.fullName}
                                </Link>
                                <p className="text-[11px] text-[#667085] truncate">
                                  {peer.collegeName}
                                </p>
                                <p className="text-[10px] text-[#667085] truncate">
                                  {peer.department} {peer.academicYear ? `• ${peer.academicYear}` : ''}
                                </p>
                              </div>
                            </div>

                            <Link
                              to={`/profile/${peer.id}`}
                              className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E7EB] text-[11px] font-semibold text-[#17233B] hover:text-[#5277D9] hover:border-[#5277D9] transition-colors shrink-0"
                            >
                              View
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Edit Profile Modal Dialog */}
      {isEditModalOpen && isOwnProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#5277D9]/10 text-[#5277D9] flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#17233B]">Edit Profile</h2>
                  <p className="text-xs text-[#667085]">
                    Update your public presence, photo, and skills.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Feedback Alert */}
              {modalFeedback.message && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    modalFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalFeedback.message}</span>
                </div>
              )}

              {/* 1. Profile Picture Manager */}
              <div className="p-4 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB]">
                <label className="block text-xs font-extrabold text-[#17233B] mb-3">
                  Profile Picture
                </label>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar
                      src={avatarPreview}
                      initials={getInitials(editForm.fullName)}
                      size="2xl"
                      className="w-18 h-18 text-xl ring-2 ring-white shadow-xs"
                    />
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                        id="avatar-file-input"
                      />
                      <label
                        htmlFor="avatar-file-input"
                        className="px-3 py-1.5 rounded-xl bg-[#5277D9] hover:bg-[#4364BE] text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{avatarPreview ? 'Change Photo' : 'Upload Photo'}</span>
                      </label>

                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          disabled={isUploadingAvatar}
                          className="px-3 py-1.5 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer inline-flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-[#667085]">
                      Supports JPG, PNG, or WebP. Max size: 5 MB.
                    </p>
                    {avatarError && (
                      <p className="text-[11px] text-red-600 font-semibold">{avatarError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Text Details Form */}
              <form onSubmit={handleSaveProfile} id="edit-profile-form" className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-[#17233B] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    placeholder="Your full name"
                    className="w-full p-2.5 text-xs bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-[#17233B] focus:outline-none focus:border-[#5277D9] focus:bg-white transition-all"
                  />
                </div>

                {/* Bio */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#17233B]">Bio</label>
                    <span className="text-[10px] text-[#667085]">
                      {editForm.bio.length} / 500
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell students about yourself, what you study, projects you love..."
                    className="w-full p-3 text-xs bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-[#17233B] focus:outline-none focus:border-[#5277D9] focus:bg-white transition-all leading-relaxed"
                  />
                </div>

                {/* Skills Interactive Tags */}
                <div>
                  <label className="block text-xs font-bold text-[#17233B] mb-1">
                    Skills & Expertise
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill(e);
                        }
                      }}
                      placeholder="e.g. React, Python, Data Science"
                      className="flex-1 p-2 text-xs bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-[#17233B] focus:outline-none focus:border-[#5277D9] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-3 py-2 bg-[#17233B] hover:bg-[#5277D9] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Skills Pills */}
                  {editForm.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-[#F8F9FC] rounded-xl border border-[#E5E7EB]">
                      {editForm.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E8EDF7] text-[#5277D9] text-xs font-semibold"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-[#5277D9] hover:text-red-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interests Interactive Tags */}
                <div>
                  <label className="block text-xs font-bold text-[#17233B] mb-1">
                    Interests & Topics
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newInterestInput}
                      onChange={(e) => setNewInterestInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInterest(e);
                        }
                      }}
                      placeholder="e.g. AI, Robotics, Hackathons, Design"
                      className="flex-1 p-2 text-xs bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-[#17233B] focus:outline-none focus:border-[#5277D9] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddInterest}
                      className="px-3 py-2 bg-[#17233B] hover:bg-[#5277D9] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Interests Pills */}
                  {editForm.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-[#F8F9FC] rounded-xl border border-[#E5E7EB]">
                      {editForm.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E5E7EB] text-[#475467] text-xs font-medium"
                        >
                          <span>{interest}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveInterest(interest)}
                            className="text-[#667085] hover:text-red-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Social & Portfolio Links */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-[#17233B]">
                    Social & Portfolio Links
                  </label>

                  <div>
                    <label className="block text-[11px] text-[#667085] mb-1">
                      Personal Portfolio / Website
                    </label>
                    <input
                      type="text"
                      value={editForm.portfolioUrl}
                      onChange={(e) => setEditForm({ ...editForm, portfolioUrl: e.target.value })}
                      placeholder="https://yourname.dev"
                      className="w-full p-2.5 text-xs bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-[#17233B] focus:outline-none focus:border-[#5277D9] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#667085] mb-1">
                        LinkedIn Profile
                      </label>
                      <input
                        type="text"
                        value={editForm.linkedinUrl}
                        onChange={(e) => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                        placeholder="linkedin.com/in/username"
                        className="w-full p-2.5 text-xs bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-[#17233B] focus:outline-none focus:border-[#5277D9] focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#667085] mb-1">
                        GitHub Profile
                      </label>
                      <input
                        type="text"
                        value={editForm.githubUrl}
                        onChange={(e) => setEditForm({ ...editForm, githubUrl: e.target.value })}
                        placeholder="github.com/username"
                        className="w-full p-2.5 text-xs bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-[#17233B] focus:outline-none focus:border-[#5277D9] focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#E5E7EB] shrink-0 bg-white">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#667085] hover:bg-[#F8F9FC] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-profile-form"
                disabled={isSavingProfile}
                className="px-5 py-2 rounded-xl bg-[#5277D9] hover:bg-[#4364BE] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navbar */}
      <BottomNavbar />
    </div>
  );
};

export default ProfilePage;
