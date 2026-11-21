import { BaseUrl } from '../config';
import { getAuthToken, clearAuthToken } from './postServices';

/**
 * Fetch all communities with member counts and membership status for current user
 * GET /api/communities
 */
export const fetchAllCommunities = async () => {
  const token = getAuthToken();
  const url = `${BaseUrl}/api/communities`;

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

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || 'Failed to load communities.');
  }

  return data.communities || [];
};

/**
 * Join a community
 * POST /api/communities/:id/join
 */
export const joinCommunity = async (communityId) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please log in to join communities.');
  }

  const url = `${BaseUrl}/api/communities/${communityId}/join`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || 'Failed to join community.');
  }

  return data;
};

/**
 * Leave a community
 * DELETE /api/communities/:id/leave
 */
export const leaveCommunity = async (communityId) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please log in to leave communities.');
  }

  const url = `${BaseUrl}/api/communities/${communityId}/leave`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || 'Failed to leave community.');
  }

  return data;
};

/**
 * Fetch communities joined by the current authenticated user
 * GET /api/communities/mine
 */
export const fetchMyCommunities = async () => {
  const token = getAuthToken();
  if (!token) {
    return [];
  }

  const url = `${BaseUrl}/api/communities/mine`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || 'Failed to fetch your communities.');
  }

  return data.communities || [];
};
