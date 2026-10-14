import { apiRequest } from "./api.js";

export const messageService = {
  sendMessage: async ({ content, receiverId, files = [], attachments = [] }) => {
    const fileList = files?.length ? files : attachments;
    if (fileList && fileList.length > 0) {
      const formData = new FormData();
      formData.append("receiverId", receiverId);
      if (content) formData.append("content", content);
      for (const file of fileList) {
        formData.append("attachments", file);
      }
      return await apiRequest("/message", {
        method: "POST",
        body: formData,
        isFormData: true
      });
    }

    return await apiRequest("/message", {
      method: "POST",
      body: { content, receiverId }
    });
  },

  sendAnonymousMessage: async (params) => {
    return await messageService.sendMessage(params);
  },

  getInbox: async ({ type = "0", page = 1, limit = 10 } = {}) => {
    return await apiRequest(`/message?type=${type}&page=${page}&limit=${limit}`, {
      method: "GET"
    });
  },

  getMessages: async (params) => {
    return await messageService.getInbox(params);
  },

  getMessageById: async (messageId) => {
    return await apiRequest(`/message/${messageId}`, {
      method: "GET"
    });
  },

  deleteMessage: async (messageId) => {
    return await apiRequest(`/message/${messageId}`, {
      method: "DELETE"
    });
  },

  markAsRead: async (messageId) => {
    return await apiRequest(`/message/${messageId}/read`, {
      method: "PATCH"
    });
  }
};

export default messageService;

