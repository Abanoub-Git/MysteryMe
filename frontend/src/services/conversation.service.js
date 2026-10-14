import { apiRequest } from "./api.js";

export const conversationService = {
  getConversations: async () => {
    return await apiRequest("/conversation", {
      method: "GET"
    });
  },

  getConversationById: async (conversationId) => {
    return await apiRequest(`/conversation/${conversationId}`, {
      method: "GET"
    });
  },

  getMessages: async (conversationId) => {
    return await apiRequest(`/conversation/${conversationId}/messages`, {
      method: "GET"
    });
  },

  sendMessage: async (conversationId, { content, files = [], attachments = [] }) => {
    const fileList = files?.length ? files : attachments;
    if (fileList && fileList.length > 0) {
      const formData = new FormData();
      if (content) formData.append("content", content);
      for (const file of fileList) {
        formData.append("attachments", file);
      }
      return await apiRequest(`/conversation/${conversationId}`, {
        method: "POST",
        body: formData,
        isFormData: true
      });
    }

    return await apiRequest(`/conversation/${conversationId}`, {
      method: "POST",
      body: { content }
    });
  },

  deleteConversation: async (conversationId) => {
    return await apiRequest(`/conversation/${conversationId}`, {
      method: "DELETE"
    });
  }
};
