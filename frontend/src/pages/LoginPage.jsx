import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import FormInput from '../components/auth/FormInput';
import PasswordInput from '../components/auth/PasswordInput';
import PrimaryButton from '../components/common/PrimaryButton';
import { loginUser } from '../Services/userServices';
import { saveAuthToken } from '../Services/postServices';

/**
 * LoginPage Component
 * Full student login page with controlled inputs, two-way state binding,
 * checkbox state handling, validation, backend login API integration, and redirect to /home.
 */
const LoginPage = () => {
  const navigate = useNavigate();

  // 1. Controlled form state (two-way data synchronization)
  const [formData, setFormData] = useState({
    collegeEmail: '',
    password: '',
    rememberMe: false,
  });

  // 2. Separate validation errors state
  const [errors, setErrors] = useState({});

  // 3. State for backend error & submission loading
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Generic input change handler
   * Synchronizes text inputs and checkboxes with React state
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: fieldValue,
    }));

    // Clear error for edited field
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: '',
      }));
    }

    if (apiError) {
      setApiError('');
    }

    if (successMessage) {
      setSuccessMessage('');
    }
  };

  /**
   * Validate email and password inputs
   */
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Email validation
    if (!formData.collegeEmail.trim()) {
      newErrors.collegeEmail = 'College Email Address is required.';
    } else if (!emailRegex.test(formData.collegeEmail.trim())) {
      newErrors.collegeEmail = 'Please enter a valid email format.';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Form submission handler connecting to backend login API
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setIsLoading(true);
    setApiError('');
    setSuccessMessage('');

    try {
      // Call login function from userServices.js
      const response = await loginUser(formData);

      // Store token safely and cleanly without stale tokens from prior accounts
      if (response.token) {
        saveAuthToken(response.token, formData.rememberMe);
      }

      if (response.user) {
        const userJson = JSON.stringify(response.user);
        if (formData.rememberMe) {
          localStorage.setItem('sociofy_user', userJson);
        } else {
          sessionStorage.setItem('sociofy_user', userJson);
        }
      }

      setSuccessMessage('Login successful! Redirecting to home...');
      setErrors({});

      // Navigate to /home on successful login
      setTimeout(() => {
        navigate('/home');
      }, 500);
    } catch (err) {
      // Display the backend error message
      setApiError(err.message || 'Invalid college email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Welcome Back!"
      subtitle="Log in to reconnect with your campus community."
      maxWidth="max-w-md"
    >
      {/* Success Notification Banner */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Login Successful</p>
            <p className="mt-0.5 text-xs text-emerald-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Backend API Error Banner */}
      {apiError && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Client Validation Warning */}
      {Object.keys(errors).length > 0 && !apiError && !successMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Please fill in the required credentials.</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email Address */}
        <FormInput
          label="College Email Address"
          name="collegeEmail"
          type="email"
          value={formData.collegeEmail}
          onChange={handleChange}
          placeholder="e.g. aarav.sharma@college.edu"
          error={errors.collegeEmail}
          required
        />

        {/* Password */}
        <PasswordInput
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          error={errors.password}
          required
        />

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-left">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-[#5277D9] focus:ring-[#5277D9] cursor-pointer"
            />
            <span className="text-xs text-[#667085]">Remember me</span>
          </label>

          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-[#5277D9] hover:text-[#4364BE] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button with Loading State */}
        <div className="pt-3">
          <PrimaryButton
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            className="w-full shadow-md"
            icon={
              isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )
            }
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </PrimaryButton>
        </div>
      </form>

      {/* Switch to Signup Link */}
      <div className="mt-6 pt-5 border-t border-[#E5E7EB] text-center text-xs text-[#667085]">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="font-bold text-[#5277D9] hover:text-[#4364BE] hover:underline"
        >
          Sign up
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
