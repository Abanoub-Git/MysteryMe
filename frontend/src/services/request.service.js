import { apiRequest } from "./api.js";

export const requestService = {
  createIdentityRequest: async (messageId) => {
    const id = typeof messageId === "object" && messageId !== null ? messageId.messageId : messageId;
    return await apiRequest(`/request/${id}`, {
      method: "POST"
    });
  },

  createRequest: async (params) => {
    return await requestService.createIdentityRequest(params);
  },

  getReceivedRequests: async ({ page = 1, limit = 20 } = {}) => {
    return await apiRequest(`/request?page=${page}&limit=${limit}`, {
      method: "GET"
    });
  },

  getSentRequests: async ({ page = 1, limit = 20 } = {}) => {
    return await apiRequest(`/request/sent?page=${page}&limit=${limit}`, {
      method: "GET"
    });
  },

  getRequests: async (params) => {
    return await requestService.getReceivedRequests(params);
  },

  getRequestById: async (requestId) => {
    const id = typeof requestId === "object" && requestId !== null ? requestId.requestId : requestId;
    return await apiRequest(`/request/${id}`, {
      method: "GET"
    });
  },

  updateRequestStatus: async (requestId, status) => {
    const id = typeof requestId === "object" && requestId !== null ? requestId.requestId : requestId;
    const finalStatus = typeof status === "object" && status !== null ? (status.status || status.action) : status;
    return await apiRequest(`/request/${id}`, {
      method: "PATCH",
      body: { status: finalStatus }
    });
  },

  updateRequest: async (requestId, status) => {
    return await requestService.updateRequestStatus(requestId, status);
  }
};

export default requestService;
