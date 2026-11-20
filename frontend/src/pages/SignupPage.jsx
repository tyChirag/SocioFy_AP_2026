import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import FormInput from '../components/auth/FormInput';
import PasswordInput from '../components/auth/PasswordInput';
import PrimaryButton from '../components/common/PrimaryButton';
import { registerUser } from '../Services/userServices';
import { saveAuthToken } from '../Services/postServices';

/**
 * Department and Academic Year options for dropdown selection
 */
const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Artificial Intelligence and Data Science',
  'Electronics and Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Other',
];

const ACADEMIC_YEARS = [
  'First Year',
  'Second Year',
  'Third Year',
  'Fourth Year',
  'Other',
];

/**
 * SignupPage Component
 * Full student registration page with controlled inputs, two-way state synchronization,
 * dropdown bindings, checkbox binding, frontend validation, and backend API integration.
 */
const SignupPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Single state object storing all form values (two-way binding)
  const [formData, setFormData] = useState({
    fullName: '',
    collegeEmail: location.state?.email || '',
    collegeName: '',
    department: '',
    academicYear: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  // 2. Separate state object for field-level validation errors
  const [errors, setErrors] = useState({});

  // 3. State for backend error & submission loading
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Generic change handler for two-way synchronization.
   * Handles text, email, password, select dropdowns, and boolean checkboxes.
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    // Immutable state update
    setFormData((prevData) => ({
      ...prevData,
      [name]: fieldValue,
    }));

    // Clear individual field error as user types or changes value
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
   * Validates all form fields against current state.
   * Returns true if valid, false otherwise.
   */
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    // College Email validation
    if (!formData.collegeEmail.trim()) {
      newErrors.collegeEmail = 'College Email Address is required.';
    } else if (!emailRegex.test(formData.collegeEmail.trim())) {
      newErrors.collegeEmail = 'Please enter a valid email address.';
    }

    // College Name validation
    if (!formData.collegeName.trim()) {
      newErrors.collegeName = 'College Name is required.';
    }

    // Department validation
    if (!formData.department) {
      newErrors.department = 'Please select your department.';
    }

    // Academic Year validation
    if (!formData.academicYear) {
      newErrors.academicYear = 'Please select your current academic year.';
    }

    // Password validation (at least 8 characters)
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required.';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    // Terms & Conditions checkbox validation
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the Terms and Conditions to register.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Form submission handler connecting to backend registration API
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
      // Call registration function from userServices.js
      const response = await registerUser(formData);

      // Save token and user info cleanly if returned by backend
      if (response.token) {
        saveAuthToken(response.token, true);
        if (response.user) {
          localStorage.setItem('sociofy_user', JSON.stringify(response.user));
        }
      }

      setSuccessMessage('Registration successful! Redirecting to home...');
      setErrors({});

      // Navigate to /home on successful registration
      setTimeout(() => {
        navigate('/home');
      }, 800);
    } catch (err) {
      // Display the backend error message
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Create Your SocioFy Account"
      subtitle="Join your campus community and start connecting."
      maxWidth="max-w-xl"
    >
      {/* Success Notification Banner */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Registration Successful</p>
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

      {/* Top Validation Warning if client-side validation errors exist */}
      {Object.keys(errors).length > 0 && !apiError && !successMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Please fix the highlighted errors before submitting.</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Row 1: Full Name */}
        <FormInput
          label="Full Name"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="e.g. Aarav Sharma"
          error={errors.fullName}
          required
        />

        {/* Row 2: College Email Address */}
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

        {/* Row 3: College Name */}
        <FormInput
          label="College / University Name"
          name="collegeName"
          type="text"
          value={formData.collegeName}
          onChange={handleChange}
          placeholder="e.g. National Institute of Technology"
          error={errors.collegeName}
          required
        />

        {/* Row 4: Department & Academic Year Dropdowns (2 columns on sm+) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Department Select Dropdown */}
          <div className="flex flex-col text-left">
            <label
              htmlFor="department"
              className="text-xs font-semibold text-[#17233B] mb-1.5 flex items-center gap-1"
            >
              <span>Department</span>
              <span className="text-red-500">*</span>
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white text-[#17233B] transition-all duration-150 focus:outline-none focus:ring-2 cursor-pointer ${
                errors.department
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-400/20'
                  : 'border-[#E5E7EB] hover:border-[#CBD5E1] focus:border-[#5277D9] focus:ring-[#5277D9]/20'
              }`}
            >
              <option value="" disabled>
                Select Department
              </option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.department}
              </p>
            )}
          </div>

          {/* Academic Year Select Dropdown */}
          <div className="flex flex-col text-left">
            <label
              htmlFor="academicYear"
              className="text-xs font-semibold text-[#17233B] mb-1.5 flex items-center gap-1"
            >
              <span>Academic Year</span>
              <span className="text-red-500">*</span>
            </label>
            <select
              id="academicYear"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white text-[#17233B] transition-all duration-150 focus:outline-none focus:ring-2 cursor-pointer ${
                errors.academicYear
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-400/20'
                  : 'border-[#E5E7EB] hover:border-[#CBD5E1] focus:border-[#5277D9] focus:ring-[#5277D9]/20'
              }`}
            >
              <option value="" disabled>
                Select Academic Year
              </option>
              {ACADEMIC_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {errors.academicYear && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.academicYear}
              </p>
            )}
          </div>
        </div>

        {/* Row 5: Password & Confirm Password (2 columns on sm+) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            error={errors.password}
            required
          />

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            error={errors.confirmPassword}
            required
          />
        </div>

        {/* Row 6: Terms and Conditions Checkbox */}
        <div className="pt-2 text-left">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              id="termsAccepted"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#5277D9] focus:ring-[#5277D9] cursor-pointer"
            />
            <span className="text-xs text-[#667085] leading-relaxed">
              I agree to the{' '}
              <a
                href="#terms"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Terms and Conditions placeholder.');
                }}
                className="text-[#5277D9] font-medium hover:underline"
              >
                Terms and Conditions
              </a>{' '}
              and confirm that I am an actively enrolled college student.
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.termsAccepted}
            </p>
          )}
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
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </PrimaryButton>
        </div>
      </form>

      {/* Switch to Login Link */}
      <div className="mt-6 pt-5 border-t border-[#E5E7EB] text-center text-xs text-[#667085]">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-bold text-[#5277D9] hover:text-[#4364BE] hover:underline"
        >
          Log in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
