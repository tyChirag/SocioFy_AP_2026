import { Routes, Route, Navigate } from 'react-router-dom';
import {
  Compass,
  Users,
  FolderGit2,
  Calendar,
  MessageSquare,
  User,
} from 'lucide-react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import PostDetailsPage from './pages/PostDetailsPage';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import CommunitiesPage from './pages/CommunitiesPage';
import ProjectsPage from './pages/ProjectsPage';
import MessagesPage from './pages/MessagesPage';
import PlaceholderPage from './pages/PlaceholderPage';

/**
 * App Component
 * Application-level routing configuration using React Router DOM.
 * Defines public routes for the Landing Page and Authentication pages,
 * the primary authenticated Student Dashboard (/home), single post view (/post/:id),
 * and secondary dashboard routes.
 */
function App() {
  return (
    <Routes>
      {/* Root Route: SocioFy Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Authentication Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Authenticated Student Dashboard */}
      <Route path="/home" element={<HomePage />} />

      {/* Individual Shared Post Route */}
      <Route path="/post/:id" element={<PostDetailsPage />} />

      {/* Explore Students Route */}
      <Route path="/explore" element={<ExplorePage />} />

      {/* Student Profile Routes */}
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/:id" element={<ProfilePage />} />
      {/* Campus Communities Route */}
      <Route path="/communities" element={<CommunitiesPage />} />

      {/* Project Collaborations Route */}
      <Route path="/projects" element={<ProjectsPage />} />
      <Route
        path="/events"
        element={
          <PlaceholderPage
            title="Campus Events"
            description="Browse upcoming workshops, hackathons, guest lectures, and cultural fests."
            icon={Calendar}
          />
        }
      />
      {/* Private Messages Routes */}
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/messages/:conversationId" element={<MessagesPage />} />

      {/* Catch-all Route: Redirect unknown routes to Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
