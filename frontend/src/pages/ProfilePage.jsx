import { useState, useEffect, useCallback } from 'react';
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
  Heart,
  MessageSquare,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Save,
} from 'lucide-react';

const LinkedInIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const GitHubIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);
import TopNavbar from '../components/layout/TopNavbar';
import Sidebar from '../components/layout/Sidebar';
import BottomNavbar from '../components/layout/BottomNavbar';
import Avatar from '../components/common/Avatar';
import { fetchUserProfile, updateUserProfile } from '../Services/userServices';
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelSentRequest,
  removeConnection,
} from '../Services/connectionServices';
import { getStoredUser } from '../Services/postServices';

/**
 * Format relative time or clean date
 */
const formatTime = (dateString) => {
  if (!dateString) return 'Recently';
  try {
    const postDate = new Date(dateString);
    return postDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recently';
  }
};

/**
 * ProfilePage Component
 * Full student profile viewer and editor:
 * - Public viewing of any student across universities (/profile/:id)
 * - Private editing of own student profile (/profile or /profile/:myId)
 * - Engagement stats: Posts count, Connections count
 * - Bio, Skills badges, Interests badges, Professional links
 * - Recent campus posts list
 * - Interactive connection action button
 */
const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getStoredUser();

  // If no ID param provided, view own profile
  const isViewingSelfParam = !id || Number(id) === Number(currentUser?.userId || currentUser?.id);
  const targetId = id ? parseInt(id, 10) : Number(currentUser?.userId || currentUser?.id);

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Profile Edit Modal / Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    skills: '',
    interests: '',
    linkedinUrl: '',
    githubUrl: '',
    profileImage: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Fetch student profile details from backend
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
      setEditForm({
        bio: user.bio || '',
        skills: user.skills || '',
        interests: user.interests || '',
        linkedinUrl: user.linkedinUrl || '',
        githubUrl: user.githubUrl || '',
        profileImage: user.profileImage || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err.message || 'Student profile not found.');
    } finally {
      setIsLoading(false);
    }
  }, [targetId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Determine whether the viewer has ownership to edit
  const isOwnProfile = profile?.connection?.isSelf || isViewingSelfParam;

  // Handle connection operations
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
      alert(err.message || 'Failed to send request.');
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
    } catch (err) {
      alert(err.message || 'Failed to accept request.');
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
    if (!window.confirm('Are you sure you want to remove this connection?')) return;
    if (isProcessingAction || !profile.connection?.connectionId) return;
    setIsProcessingAction(true);
    try {
      await removeConnection(profile.connection.connectionId);
      setProfile((prev) => ({
        ...prev,
        connectionsCount: Math.max((prev.connectionsCount || 1) - 1, 0),
        connection: { status: 'NONE', connectionId: null },
      }));
    } catch (err) {
      alert(err.message || 'Failed to remove connection.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handle saving profile edits
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');
    try {
      const updated = await updateUserProfile(editForm);
      setProfile((prev) => ({
        ...prev,
        ...updated,
      }));
      setSaveSuccess('Profile updated successfully!');
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess('');
      }, 1000);
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // Parse skill and interest tags
  const skillsList = profile?.skills
    ? profile.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const interestsList = profile?.interests
    ? profile.interests.split(',').map((i) => i.trim()).filter(Boolean)
    : [];

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
          <div className="col-span-12 md:col-span-9 space-y-5">
            {/* Back to Explore Button */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#667085] hover:text-[#17233B] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {isOwnProfile && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#5277D9] text-xs font-semibold text-[#17233B] hover:text-[#5277D9] shadow-xs transition-colors cursor-pointer"
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
                <h4 className="text-sm font-bold text-[#17233B]">Profile Error</h4>
                <p className="text-xs text-[#667085] mt-1">{error}</p>
                <Link
                  to="/explore"
                  className="mt-4 inline-block px-4 py-2 rounded-xl bg-[#5277D9] text-white text-xs font-semibold hover:bg-[#4364BE] transition-colors"
                >
                  Explore Other Students
                </Link>
              </div>
            )}

            {/* Profile Loaded */}
            {!isLoading && !error && profile && (
              <>
                {/* Header Profile Card */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs">
                  {/* Decorative Header Banner */}
                  <div className="h-28 bg-linear-to-r from-[#17233B] to-[#5277D9] relative" />

                  <div className="px-5 pb-6 sm:px-8">
                    {/* Avatar & Relationship Actions Row */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-4 gap-4">
                      <div className="ring-4 ring-white rounded-full inline-block shadow-md w-fit bg-white">
                        <Avatar
                          src={profile.profileImage}
                          initials={profile.fullName.slice(0, 2).toUpperCase()}
                          size="xl"
                          className="w-20 h-20 text-xl"
                        />
                      </div>

                      {/* Connection Actions (if viewing another student) */}
                      {!isOwnProfile && (
                        <div className="flex items-center gap-2">
                          {profile.connection?.status === 'NONE' && (
                            <button
                              type="button"
                              disabled={isProcessingAction}
                              onClick={handleConnect}
                              className="px-4 py-2 rounded-xl bg-[#5277D9] hover:bg-[#4364BE] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              {isProcessingAction ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <UserPlus className="w-4 h-4" />
                              )}
                              <span>Connect</span>
                            </button>
                          )}

                          {profile.connection?.status === 'SENT' && (
                            <div className="flex items-center gap-2">
                              <span className="px-3.5 py-1.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] text-xs font-medium text-[#667085] flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-amber-500" />
                                <span>Request Pending</span>
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

                          {profile.connection?.status === 'RECEIVED' && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={isProcessingAction}
                                onClick={handleAcceptRequest}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
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

                          {profile.connection?.status === 'CONNECTED' && (
                            <div className="flex items-center gap-2">
                              <span className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                                <UserCheck className="w-4 h-4" />
                                <span>Connected</span>
                              </span>
                              <button
                                type="button"
                                disabled={isProcessingAction}
                                onClick={handleRemoveConnection}
                                className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Remove connection"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Student Identity */}
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#17233B] tracking-tight">
                        {profile.fullName}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#667085] mt-1.5">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Building className="w-3.5 h-3.5 text-[#5277D9]" />
                          <span>{profile.collegeName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <GraduationCap className="w-3.5 h-3.5 text-[#5277D9]" />
                          <span>
                            {profile.department} {profile.academicYear ? `• ${profile.academicYear}` : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>Joined {formatTime(profile.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Counter Row */}
                    <div className="flex items-center gap-6 mt-5 pt-4 border-t border-[#F2F4F7]">
                      <div>
                        <span className="text-lg font-black text-[#17233B]">
                          {profile.postsCount ?? 0}
                        </span>
                        <span className="text-xs text-[#667085] ml-1.5 font-medium">Posts</span>
                      </div>
                      <div className="h-4 w-px bg-gray-200" />
                      <div>
                        <span className="text-lg font-black text-[#17233B]">
                          {profile.connectionsCount ?? 0}
                        </span>
                        <span className="text-xs text-[#667085] ml-1.5 font-medium">Connections</span>
                      </div>

                      {/* Social/Professional Links */}
                      {(profile.linkedinUrl || profile.githubUrl) && (
                        <>
                          <div className="h-4 w-px bg-gray-200" />
                          <div className="flex items-center gap-2">
                            {profile.linkedinUrl && (
                              <a
                                href={profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-[#F8F9FC] text-[#667085] hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors"
                                title="LinkedIn Profile"
                              >
                                <LinkedInIcon className="w-4 h-4" />
                              </a>
                            )}
                            {profile.githubUrl && (
                              <a
                                href={profile.githubUrl.startsWith('http') ? profile.githubUrl : `https://${profile.githubUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-[#F8F9FC] text-[#667085] hover:text-[#17233B] hover:bg-black/10 transition-colors"
                                title="GitHub Profile"
                              >
                                <GitHubIcon className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Edit Mode Form */}
                {isEditing && isOwnProfile && (
                  <div className="bg-white rounded-2xl border border-[#5277D9] p-6 shadow-md animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
                      <h3 className="text-base font-bold text-[#17233B] flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-[#5277D9]" />
                        <span>Edit Your Profile</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
                      {/* Bio */}
                      <div>
                        <label className="block text-xs font-bold text-[#17233B] mb-1">
                          Short Bio (max 500 chars)
                        </label>
                        <textarea
                          rows={3}
                          value={editForm.bio}
                          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                          placeholder="Tell campus peers about your passion, current projects, or goals..."
                          className="w-full p-3 text-xs bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-[#17233B] focus:outline-none focus:border-[#5277D9] focus:bg-white transition-all"
                        />
                      </div>

                      {/* Skills & Interests in 2 columns */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#17233B] mb-1">
                            Skills (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={editForm.skills}
                            onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                            placeholder="e.g. React, Python, UI/UX, Cloud"
                            className="w-full p-2.5 text-xs bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-[#17233B] focus:outline-none focus:border-[#5277D9] focus:bg-white transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#17233B] mb-1">
                            Interests (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={editForm.interests}
                            onChange={(e) => setEditForm({ ...editForm, interests: e.target.value })}
                            placeholder="e.g. Web Dev, Machine Learning, Robotics"
                            className="w-full p-2.5 text-xs bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-[#17233B] focus:outline-none focus:border-[#5277D9] focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      {/* External links */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#17233B] mb-1">
                            LinkedIn URL or username
                          </label>
                          <input
                            type="text"
                            value={editForm.linkedinUrl}
                            onChange={(e) => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                            placeholder="e.g. linkedin.com/in/username"
                            className="w-full p-2.5 text-xs bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-[#17233B] focus:outline-none focus:border-[#5277D9] focus:bg-white transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#17233B] mb-1">
                            GitHub URL or username
                          </label>
                          <input
                            type="text"
                            value={editForm.githubUrl}
                            onChange={(e) => setEditForm({ ...editForm, githubUrl: e.target.value })}
                            placeholder="e.g. github.com/username"
                            className="w-full p-2.5 text-xs bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-[#17233B] focus:outline-none focus:border-[#5277D9] focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      {/* Avatar Image URL */}
                      <div>
                        <label className="block text-xs font-bold text-[#17233B] mb-1">
                          Profile Image URL (optional)
                        </label>
                        <input
                          type="url"
                          value={editForm.profileImage}
                          onChange={(e) => setEditForm({ ...editForm, profileImage: e.target.value })}
                          placeholder="https://..."
                          className="w-full p-2.5 text-xs bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-[#17233B] focus:outline-none focus:border-[#5277D9] focus:bg-white transition-all"
                        />
                      </div>

                      {saveSuccess && (
                        <p className="text-xs font-semibold text-emerald-600">{saveSuccess}</p>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-[#667085] hover:bg-[#F8F9FC] transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-5 py-2 rounded-xl bg-[#5277D9] hover:bg-[#4364BE] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {isSaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Bio, Skills, and Interests Card */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs space-y-5">
                  {/* Bio Section */}
                  <div>
                    <h3 className="text-xs font-black text-[#667085] uppercase tracking-wider mb-2">
                      About
                    </h3>
                    {profile.bio ? (
                      <p className="text-xs sm:text-sm text-[#344054] leading-relaxed whitespace-pre-line">
                        {profile.bio}
                      </p>
                    ) : (
                      <p className="text-xs text-[#98A2B3] italic">
                        No bio added yet.{isOwnProfile ? ' Click "Edit Profile" above to share your background.' : ''}
                      </p>
                    )}
                  </div>

                  {/* Skills Section */}
                  <div className="pt-4 border-t border-[#F2F4F7]">
                    <h3 className="text-xs font-black text-[#667085] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[#5277D9]" />
                      <span>Skills & Expertise</span>
                    </h3>
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
                        No skills listed.{isOwnProfile ? ' Add your skills so collaborators can find you.' : ''}
                      </p>
                    )}
                  </div>

                  {/* Interests Section */}
                  <div className="pt-4 border-t border-[#F2F4F7]">
                    <h3 className="text-xs font-black text-[#667085] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Interests & Topics</span>
                    </h3>
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
                        No interests listed yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Recent Public Posts Section */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-[#17233B] flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4 text-[#5277D9]" />
                    <span>Recent Posts by {profile.fullName.split(' ')[0]}</span>
                  </h3>

                  {(!profile.recentPosts || profile.recentPosts.length === 0) ? (
                    <div className="py-8 text-center text-[#667085]">
                      <p className="text-xs">No posts shared by this student yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {profile.recentPosts.map((post) => (
                        <div
                          key={post.id}
                          className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F8F9FC] hover:border-[#CBD5E1] transition-all"
                        >
                          <p className="text-xs sm:text-sm text-[#17233B] leading-relaxed">
                            {post.content}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-[#667085] mt-3 pt-2 border-t border-[#E5E7EB]/60">
                            <span>{formatTime(post.createdAt)}</span>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3 text-red-500" />
                                {post.likesCount ?? 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3 text-[#5277D9]" />
                                {post.commentsCount ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navbar */}
      <BottomNavbar />
    </div>
  );
};

export default ProfilePage;
