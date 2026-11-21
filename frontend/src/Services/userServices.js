import { BaseUrl } from "../config";
import { getAuthToken, clearAuthToken, safeParseJson } from "./postServices";

/**
 * Synchronize user data in localStorage / sessionStorage and dispatch custom update event
 * @param {Object} updatedUser
 */
export const syncStoredUser = (updatedUser) => {
  if (!updatedUser) return;
  const existingUserJson = localStorage.getItem("sociofy_user") || sessionStorage.getItem("sociofy_user");
  let merged = updatedUser;
  if (existingUserJson) {
    try {
      const parsed = JSON.parse(existingUserJson);
      merged = { ...parsed, ...updatedUser };
    } catch {}
  }

  if (localStorage.getItem("sociofy_user")) {
    localStorage.setItem("sociofy_user", JSON.stringify(merged));
  } else {
    sessionStorage.setItem("sociofy_user", JSON.stringify(merged));
  }

  // Dispatch custom and storage event so header navbar and listeners update immediately
  window.dispatchEvent(new CustomEvent("sociofy_user_updated", { detail: merged }));
  window.dispatchEvent(new Event("storage"));
};

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

  const data = await safeParseJson(response);

  if (!response.ok) {
    throw new Error(data.message || "Registration failed. Please check your details.");
  }

  if (data.user) {
    syncStoredUser(data.user);
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

  const data = await safeParseJson(response);

  if (!response.ok) {
    throw new Error(data.message || "Invalid credentials. Please try again.");
  }

  if (data.user) {
    syncStoredUser(data.user);
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

  const data = await safeParseJson(response);

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
  const data = await safeParseJson(response);

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

  const data = await safeParseJson(response);

  if (!response.ok) {
    throw new Error(data.message || "Failed to load student profile.");
  }

  return data.user;
};

/**
 * Fetch all posts authored by a specific student
 * GET /api/users/:id/posts
 */
export const fetchStudentPosts = async (userId, params = {}) => {
  const token = getAuthToken();
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const url = `${BaseUrl}/api/users/${userId}/posts${query.toString() ? `?${query.toString()}` : ""}`;
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

  const data = await safeParseJson(response);

  if (!response.ok) {
    throw new Error(data.message || "Failed to load posts for this student.");
  }

  return data;
};

/**
 * Fetch all accepted connections of a specific student
 * GET /api/users/:id/connections
 */
export const fetchStudentConnections = async (userId) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BaseUrl}/api/users/${userId}/connections`, {
    method: "GET",
    headers,
  });

  const data = await safeParseJson(response);

  if (!response.ok) {
    throw new Error(data.message || "Failed to load student connections.");
  }

  return (data.connections || []).map((item) =>
    item.student
      ? { ...item.student, connectionId: item.connectionId, connectedAt: item.connectedAt }
      : item
  );
};

/**
 * Update the logged-in student's own profile
 * PATCH /api/users/me
 */
export const updateUserProfile = async (profileData) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required to update profile.");
  }

  const response = await fetch(`${BaseUrl}/api/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await safeParseJson(response);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to update profile.");
  }

  syncStoredUser(data.user);
  return data.user;
};

/**
 * Upload a profile picture (Avatar) for current logged-in user
 * POST /api/users/me/avatar
 * @param {File} file - File object from input[type="file"]
 * @returns {Promise<Object>}
 */
export const uploadAvatarApi = async (file) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required to upload profile picture.");
  }

  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${BaseUrl}/api/users/me/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // NOTE: Do not set Content-Type header when uploading FormData
    },
    body: formData,
  });

  const data = await safeParseJson(response);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to upload profile picture.");
  }

  syncStoredUser(data.user);
  return data.user;
};

/**
 * Remove profile picture for current logged-in user
 * DELETE /api/users/me/avatar
 * @returns {Promise<Object>}
 */
export const removeAvatarApi = async () => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required to remove profile picture.");
  }

  const response = await fetch(`${BaseUrl}/api/users/me/avatar`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeParseJson(response);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to remove profile picture.");
  }

  syncStoredUser(data.user);
  return data.user;
};

/**
 * Fetch current authenticated student profile fresh from database
 * GET /api/users/me
 */
export const fetchCurrentUser = async () => {
  const token = getAuthToken();

  if (!token) return null;

  try {
    const response = await fetch(`${BaseUrl}/api/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await safeParseJson(response);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        clearAuthToken();
      }
      return null;
    }

    if (data.user) {
      syncStoredUser(data.user);
    }

    return data.user;
  } catch (err) {
    console.warn("fetchCurrentUser error:", err);
    return null;
  }
};

/**
 * Optional server health check
 */
export const testing = async () => {
  const response = await fetch(`${BaseUrl}/`);
  if (!response.ok) throw new Error(`Server responded with ${response.status}`);
  return safeParseJson(response);
};
