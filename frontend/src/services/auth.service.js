import { apiRequest } from "./api.js";

export const authService = {
  signup: async ({ email, password, confirmPassword, phone, username, gender = 0 }) => {
    return await apiRequest("/auth/signup", {
      method: "POST",
      body: { email, password, confirmPassword, phone, username, gender: Number(gender) }
    });
  },

  confirmEmail: async ({ email, otp }) => {
    return await apiRequest("/auth/confirm-email", {
      method: "PATCH",
      body: { email, otp: String(otp) }
    });
  },

  resendConfirmEmail: async ({ email }) => {
    return await apiRequest("/auth/resend-confirm-email", {
      method: "PATCH",
      body: { email }
    });
  },

  login: async ({ email, password }) => {
    return await apiRequest("/auth/login", {
      method: "POST",
      body: { email, password }
    });
  },

  loginWithGmail: async ({ idToken }) => {
    return await apiRequest("/auth/loginWithGmail", {
      method: "POST",
      body: { idToken }
    });
  },

  loginConfirmation: async ({ email, otp }) => {
    return await apiRequest("/auth/login-confirmation", {
      method: "POST",
      body: { email, otp: String(otp) }
    });
  },

  requestForgotPassword: async ({ email }) => {
    return await apiRequest("/auth/request-confirm-password", {
      method: "POST",
      body: { email }
    });
  },

  verifyForgotPassword: async ({ email, otp }) => {
    return await apiRequest("/auth/verify-forgot-password", {
      method: "POST",
      body: { email, otp: String(otp) }
    });
  },

  resetPassword: async ({ email, otp, password, confirmPassword }) => {
    return await apiRequest("/auth/reset-password", {
      method: "PATCH",
      body: { email, otp: String(otp), password, confirmPassword }
    });
  },

  enableTwoStep: async () => {
    return await apiRequest("/auth/enable-2-step", {
      method: "POST"
    });
  },

  confirmTwoStep: async ({ email, otp }) => {
    return await apiRequest("/auth/confirm-2-step", {
      method: "PATCH",
      body: { email, otp: String(otp) }
    });
  },

  disableTwoStep: async () => {
    return await apiRequest("/auth/disable-2-step", {
      method: "PATCH"
    });
  }
};
