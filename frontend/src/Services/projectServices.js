import { BaseUrl } from '../config';
import { getAuthToken, clearAuthToken } from './postServices';

/**
 * Safely parse JSON response from fetch API.
 * Prevents "Unexpected token '<', <!DOCTYPE..." errors when the API URL
 * is misconfigured or returns HTML instead of JSON.
 */
const safeParseJson = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    if (text.trim().startsWith('<') || text.includes('<!DOCTYPE')) {
      throw new Error(
        'Server returned HTML instead of JSON (DOCTYPE error). Please ensure VITE_API_URL is properly configured in Vercel to point to your live backend server.'
      );
    }
    throw new Error(text || `Request failed with status ${response.status}`);
  }
};

/**
 * Fetch all projects with creator info, member count, and membership status
 * Optional filters (e.g., { category: 'Full Stack' })
 * GET /api/projects[?category=...]
 */
export const fetchAllProjects = async (filters = {}) => {
  const token = getAuthToken();
  const query = new URLSearchParams(filters).toString();
  const url = `${BaseUrl}/api/projects${query ? `?${query}` : ''}`;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  const data = await safeParseJson(response);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || 'Failed to load projects.');
  }

  return data.projects || [];
};

/**
 * Create a new collaboration project
 * POST /api/projects
 */
export const createProject = async (projectData) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please log in to create a project.');
  }

  const url = `${BaseUrl}/api/projects`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(projectData),
  });

  const data = await safeParseJson(response);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || 'Failed to create project.');
  }

  return data.project;
};

/**
 * Join an existing project
 * POST /api/projects/:id/join
 */
export const joinProject = async (projectId) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please log in to join projects.');
  }

  const url = `${BaseUrl}/api/projects/${projectId}/join`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeParseJson(response);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || 'Failed to join project.');
  }

  return data.project;
};

/**
 * Leave a project
 * DELETE /api/projects/:id/leave
 */
export const leaveProject = async (projectId) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please log in to leave projects.');
  }

  const url = `${BaseUrl}/api/projects/${projectId}/leave`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeParseJson(response);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || 'Failed to leave project.');
  }

  return data;
};

/**
 * Fetch projects joined/created by the current authenticated user
 * GET /api/projects/mine
 */
export const fetchMyProjects = async () => {
  const token = getAuthToken();
  if (!token) {
    return [];
  }

  const url = `${BaseUrl}/api/projects/mine`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeParseJson(response);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || 'Failed to fetch your projects.');
  }

  return data.projects || [];
};
