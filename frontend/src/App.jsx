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

      {/* Secondary Dashboard Sections */}
      <Route
        path="/explore"
        element={
          <PlaceholderPage
            title="Explore Campus"
            description="Discover trending topics, discussions, and spotlight students across your university."
            icon={Compass}
          />
        }
      />
      <Route
        path="/communities"
        element={
          <PlaceholderPage
            title="Campus Communities"
            description="Join interest-based student clubs, technical guilds, and academic study groups."
            icon={Users}
          />
        }
      />
      <Route
        path="/projects"
        element={
          <PlaceholderPage
            title="Project Collaborations"
            description="Find teammates, share open-source repositories, and build hackathon projects together."
            icon={FolderGit2}
          />
        }
      />
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
      <Route
        path="/messages"
        element={
          <PlaceholderPage
            title="Private Messages"
            description="Connect 1-on-1 with campus peers and collaborate in group chats."
            icon={MessageSquare}
          />
        }
      />
      <Route
        path="/profile"
        element={
          <PlaceholderPage
            title="Student Profile"
            description="Manage your college profile, skills, enrolled courses, and activity history."
            icon={User}
          />
        }
      />

      {/* Catch-all Route: Redirect unknown routes to Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
