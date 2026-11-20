import { BaseUrl } from "../config";

/**
 * Helper to get authentication token from storage (sessionStorage or localStorage)
 * Checks for non-empty, valid token strings (rejecting "undefined" or "null").
 * Gives priority to sessionStorage for the active session, falling back to localStorage.
 */
export const getAuthToken = () => {
  const token = sessionStorage.getItem("sociofy_token") || localStorage.getItem("sociofy_token") || "";
  if (!token || token === "undefined" || token === "null") {
    return "";
  }
  return token;
};

/**
 * Save authentication token cleanly
 * Clears both storages first so tokens from previous accounts cannot linger.
 */
export const saveAuthToken = (token, rememberMe = false) => {
  localStorage.removeItem("sociofy_token");
  sessionStorage.removeItem("sociofy_token");

  if (rememberMe) {
    localStorage.setItem("sociofy_token", token);
  } else {
    sessionStorage.setItem("sociofy_token", token);
  }
};

/**
 * Helper to clear stale or expired tokens from storage
 */
export const clearAuthToken = () => {
  localStorage.removeItem("sociofy_token");
  sessionStorage.removeItem("sociofy_token");
  localStorage.removeItem("sociofy_user");
  sessionStorage.removeItem("sociofy_user");
};

/**
 * Helper to get logged in user profile from storage or decoded token
 */
export const getStoredUser = () => {
  // First check stored user json
  const storedUserJson = sessionStorage.getItem("sociofy_user") || localStorage.getItem("sociofy_user");
  if (storedUserJson) {
    try {
      return JSON.parse(storedUserJson);
    } catch {}
  }

  // Fallback: decode JWT payload
  const token = getAuthToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.userId || payload.id,
      userId: payload.userId || payload.id,
      fullName: payload.fullName || "",
      collegeEmail: payload.collegeEmail || "",
    };
  } catch {
    return null;
  }
};

/**
 * Fetch all campus posts from the database
 * GET /api/posts
 */
export const fetchAllPosts = async (params = {}) => {
  const token = getAuthToken();
  const query = new URLSearchParams(params).toString();
  const url = `${BaseUrl}/api/posts${query ? `?${query}` : ""}`;

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
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to load campus feed.");
  }

  return data.posts || [];
};

/**
 * Fetch a single post by ID
 * GET /api/posts/:id
 */
export const fetchPostById = async (postId) => {
  const token = getAuthToken();
  const url = `${BaseUrl}/api/posts/${postId}`;

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
    throw new Error(data.message || "Post not found or unavailable.");
  }

  return data.post;
};

/**
 * Create a new post in the database
 * POST /api/posts
 */
export const createNewPost = async (content) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("You must be logged in to create a post. Please log in.");
  }

  const response = await fetch(`${BaseUrl}/api/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to create post. Please try again.");
  }

  return data.post;
};

/**
 * Like a post
 * POST /api/posts/:id/like
 */
export const likePostApi = async (postId) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Please log in to like posts.");
  }

  const response = await fetch(`${BaseUrl}/api/posts/${postId}/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to like post.");
  }

  return data;
};

/**
 * Unlike a post
 * DELETE /api/posts/:id/like
 */
export const unlikePostApi = async (postId) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Please log in to unlike posts.");
  }

  const response = await fetch(`${BaseUrl}/api/posts/${postId}/like`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to unlike post.");
  }

  return data;
};

/**
 * Fetch comments for a post
 * GET /api/posts/:id/comments
 */
export const fetchPostComments = async (postId) => {
  const token = getAuthToken();
  const url = `${BaseUrl}/api/posts/${postId}/comments`;

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
    throw new Error(data.message || "Failed to load comments.");
  }

  return data.comments || [];
};

/**
 * Add a comment to a post
 * POST /api/posts/:id/comments
 */
export const addPostComment = async (postId, content) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Please log in to comment.");
  }

  const response = await fetch(`${BaseUrl}/api/posts/${postId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to add comment.");
  }

  return data;
};

/**
 * Delete a comment
 * DELETE /api/comments/:id
 */
export const deleteCommentApi = async (commentId) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Please log in to delete comment.");
  }

  const response = await fetch(`${BaseUrl}/api/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to delete comment.");
  }

  return data;
};
