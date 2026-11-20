import { BaseUrl } from "../config";
import { getAuthToken, clearAuthToken } from "./postServices";

/**
 * Register a new student user
 * @param {Object} userData - Form data matching backend registration schema
 * @returns {Promise<Object>} - Server response object with user info and token
 */
export const registerUser = async (userData) => {
  const response = await fetch(`${BaseUrl}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed. Please check your details.");
  }

  return data;
};

/**
 * Login an existing student user
 * @param {Object} credentials - Object containing collegeEmail and password
 * @returns {Promise<Object>} - Server response object with safe user info and token
 */
export const loginUser = async (credentials) => {
  const response = await fetch(`${BaseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Invalid credentials. Please try again.");
  }

  return data;
};

/**
 * Fetch students for Explore page with search & filter support
 * GET /api/users
 */
export const fetchStudents = async (params = {}) => {
  const token = getAuthToken();
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const url = `${BaseUrl}/api/users${query.toString() ? `?${query.toString()}` : ""}`;

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load students.");
  }

  return data;
};

/**
 * Fetch dynamic filter options (colleges, departments, academic years)
 * GET /api/users/filters
 */
export const fetchFilterOptions = async () => {
  const response = await fetch(`${BaseUrl}/api/users/filters`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load filter options.");
  }

  return data;
};

/**
 * Fetch a single student's public profile by ID
 * GET /api/users/:id
 */
export const fetchUserProfile = async (userId) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BaseUrl}/api/users/${userId}`, {
    method: "GET",
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load student profile.");
  }

  return data.user;
};

/**
 * Update the logged-in student's own profile
 * PUT /api/users/profile
 */
export const updateUserProfile = async (profileData) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required to update profile.");
  }

  const response = await fetch(`${BaseUrl}/api/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to update profile.");
  }

  // Update local storage user profile cache if available
  const existingUserJson = localStorage.getItem("sociofy_user") || sessionStorage.getItem("sociofy_user");
  if (existingUserJson) {
    try {
      const parsed = JSON.parse(existingUserJson);
      const updated = { ...parsed, ...data.user };
      if (localStorage.getItem("sociofy_user")) {
        localStorage.setItem("sociofy_user", JSON.stringify(updated));
      } else {
        sessionStorage.setItem("sociofy_user", JSON.stringify(updated));
      }
    } catch {}
  }

  return data.user;
};

/**
 * Optional server health check
 */
export const testing = async () => {
  const response = await fetch(`${BaseUrl}/`);
  if (!response.ok) throw new Error(`Server responded with ${response.status}`);
  return response.json();
};
