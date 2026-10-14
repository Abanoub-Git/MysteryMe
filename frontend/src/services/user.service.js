import { apiRequest } from "./api.js";

export const getProfile = async () => {
  return await apiRequest("/user", {
    method: "GET"
  });
};

export const updateProfile = async (data) => {
  return await apiRequest("/user", {
    method: "PATCH",
    body: data
  });
};

export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append("attachment", file);
  return await apiRequest("/user/profile-image", {
    method: "PATCH",
    body: formData,
    isFormData: true
  });
};

export const updateProfileImage = uploadProfileImage;

export const logoutUser = async (action = 0) => {
  return await apiRequest("/user/logout", {
    method: "POST",
    body: { action }
  });
};

export const userService = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  updateProfileImage,
  logout: logoutUser
};

export default userService;
