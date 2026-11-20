import { BaseUrl } from "../config";
import { getAuthToken, clearAuthToken } from "./postServices";

/**
 * Helper to build auth headers
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Please log in to manage connections.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Send a connection request to a student
 * POST /api/connections/:userId
 */
export const sendConnectionRequest = async (userId) => {
  const response = await fetch(`${BaseUrl}/api/connections/${userId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to send connection request.");
  }

  return data;
};

/**
 * Fetch incoming connection requests
 * GET /api/connections/requests
 */
export const fetchIncomingRequests = async () => {
  const response = await fetch(`${BaseUrl}/api/connections/requests`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to fetch incoming requests.");
  }

  return data.requests || [];
};

/**
 * Fetch sent connection requests
 * GET /api/connections/sent
 */
export const fetchSentRequests = async () => {
  const response = await fetch(`${BaseUrl}/api/connections/sent`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to fetch sent requests.");
  }

  return data.sentRequests || [];
};

/**
 * Accept an incoming connection request
 * PATCH /api/connections/:id/accept
 */
export const acceptConnectionRequest = async (connectionId) => {
  const response = await fetch(`${BaseUrl}/api/connections/${connectionId}/accept`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to accept connection request.");
  }

  return data;
};

/**
 * Reject an incoming connection request
 * PATCH /api/connections/:id/reject
 */
export const rejectConnectionRequest = async (connectionId) => {
  const response = await fetch(`${BaseUrl}/api/connections/${connectionId}/reject`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to reject connection request.");
  }

  return data;
};

/**
 * Cancel a pending sent connection request
 * DELETE /api/connections/:id
 */
export const cancelSentRequest = async (connectionId) => {
  const response = await fetch(`${BaseUrl}/api/connections/${connectionId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to cancel request.");
  }

  return data;
};

/**
 * Fetch all accepted connections for current student
 * GET /api/connections
 */
export const fetchMyConnections = async () => {
  const response = await fetch(`${BaseUrl}/api/connections`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to load connections.");
  }

  return data.connections || [];
};

/**
 * Remove an existing accepted connection
 * DELETE /api/connections/:id/remove
 */
export const removeConnection = async (connectionId) => {
  const response = await fetch(`${BaseUrl}/api/connections/${connectionId}/remove`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to remove connection.");
  }

  return data;
};
