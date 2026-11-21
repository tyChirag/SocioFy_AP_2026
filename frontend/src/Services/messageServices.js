import { BaseUrl } from "../config";
import { getAuthToken, clearAuthToken, safeParseJson } from "./postServices";

/**
 * Normalize conversation structure to ensure consistency across components
 */
export const normalizeConversation = (conv) => {
  if (!conv) return conv;
  const otherUser = conv.otherParticipant || conv.otherUser || null;
  const lastMessage = conv.latestMessage || conv.lastMessage || null;
  return {
    ...conv,
    otherUser,
    otherParticipant: otherUser,
    lastMessage,
    latestMessage: lastMessage,
    unreadCount: typeof conv.unreadCount === "number" ? conv.unreadCount : 0,
  };
};

/**
 * Fetch all conversations for the authenticated user
 * GET /api/conversations
 */
export const fetchConversations = async () => {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication required.");

  const response = await fetch(`${BaseUrl}/api/conversations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to load conversations.");
  }

  const rawList = data.conversations || [];
  return rawList.map(normalizeConversation);
};

/**
 * Fetch details of a single conversation
 * GET /api/conversations/:id
 */
export const fetchConversationDetails = async (conversationId) => {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication required.");

  const response = await fetch(`${BaseUrl}/api/conversations/${conversationId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to load conversation details.");
  }

  return normalizeConversation(data.conversation);
};

/**
 * Create or get conversation with another student
 * POST /api/conversations
 * @param {number} userId - Target student's user ID
 */
export const createOrGetConversation = async (userId) => {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication required.");

  const response = await fetch(`${BaseUrl}/api/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      if (data.message && data.message.includes("accepted connection")) {
        throw new Error(data.message);
      }
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to start conversation.");
  }

  return normalizeConversation(data.conversation);
};

/**
 * Fetch paginated messages for a conversation
 * GET /api/conversations/:id/messages
 * @param {number} conversationId
 * @param {Object} params - { limit, beforeId }
 */
export const fetchMessages = async (conversationId, params = {}) => {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication required.");

  const query = new URLSearchParams();
  if (params.limit) query.append("limit", params.limit);
  if (params.beforeId) query.append("beforeId", params.beforeId);

  const url = `${BaseUrl}/api/conversations/${conversationId}/messages${
    query.toString() ? `?${query.toString()}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
    }
    throw new Error(data.message || "Failed to load messages.");
  }

  return {
    messages: data.messages || [],
    hasMore: Boolean(data.hasMore),
    nextBeforeId: data.nextBeforeId || null,
  };
};

/**
 * Send a message in a conversation
 * POST /api/conversations/:id/messages
 * @param {number} conversationId
 * @param {string} content
 */
export const sendMessageApi = async (conversationId, content) => {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication required.");

  const response = await fetch(`${BaseUrl}/api/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.message || "Failed to send message.");
  }

  return data.message;
};

/**
 * Mark messages in a conversation as read
 * PATCH /api/conversations/:id/read
 * @param {number} conversationId
 */
export const markConversationReadApi = async (conversationId) => {
  const token = getAuthToken();
  if (!token) return { readCount: 0 };

  try {
    const response = await fetch(`${BaseUrl}/api/conversations/${conversationId}/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await safeParseJson(response);
    return data;
  } catch (err) {
    console.warn("markConversationReadApi error:", err);
    return { readCount: 0 };
  }
};

/**
 * Delete a message
 * DELETE /api/messages/:id
 * @param {number} messageId
 */
export const deleteMessageApi = async (messageId) => {
  const token = getAuthToken();
  if (!token) throw new Error("Authentication required.");

  const response = await fetch(`${BaseUrl}/api/messages/${messageId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeParseJson(response);
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete message.");
  }

  return data;
};
