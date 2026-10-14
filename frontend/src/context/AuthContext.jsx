import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getStoredToken, setAuthSession, clearAuthSession } from "../services/api.js";
import { userService } from "../services/user.service.js";
import { messageService } from "../services/message.service.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    const currentToken = getStoredToken();
    if (!currentToken) return;
    try {
      const res = await messageService.getInbox({ type: "0", limit: 1 });
      const count = res?.data?.unreadCount ?? 0;
      setUnreadCount(count);
    } catch {
      // ignore polling failure
    }
  }, []);

  // Validate session against the backend on mount
  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      const storedToken = getStoredToken();
      if (!storedToken) {
        if (isMounted) {
          clearAuthSession();
          setUser(null);
          setToken(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await userService.getProfile();
        const profileData = response?.data?.user || response?.data;
        if (isMounted && profileData) {
          setUser(profileData);
          setToken(storedToken);
          localStorage.setItem("mysteryme_user", JSON.stringify(profileData));
        } else if (isMounted) {
          // Empty or invalid response payload
          clearAuthSession();
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        // Any validation failure (400, 401, 403, 404, or network failure with invalid token)
        // clears the invalid local authentication state
        if (isMounted) {
          clearAuthSession();
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async ({ access_token, refresh_token, user: initialUser }) => {
    setLoading(true);
    setAuthSession({ access_token, refresh_token, user: initialUser });
    setToken(access_token);

    let currentUser = initialUser;
    if (!currentUser) {
      try {
        const res = await userService.getProfile();
        currentUser = res?.data?.user || res?.data;
      } catch (err) {
        console.error("Failed to load user profile on login:", err);
      }
    }

    if (currentUser) {
      setUser(currentUser);
      localStorage.setItem("mysteryme_user", JSON.stringify(currentUser));
    }
    setLoading(false);
    return currentUser;
  }, []);

  const logout = useCallback(async (allDevices = false) => {
    try {
      if (token) {
        await userService.logout(allDevices ? 1 : 0);
      }
    } catch {
      // Ignore network errors on logout and proceed with local clearance
    } finally {
      clearAuthSession();
      setUser(null);
      setToken(null);
      setLoading(false);
    }
  }, [token]);

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem("mysteryme_user", JSON.stringify(merged));
      return merged;
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await userService.getProfile();
      const profileData = response?.data?.user || response?.data;
      if (profileData) {
        updateUser(profileData);
      }
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        clearAuthSession();
        setUser(null);
        setToken(null);
      }
    }
  }, [updateUser]);

  const isAuthenticated = Boolean(!loading && token && user);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUnreadCount();
      const interval = setInterval(refreshUnreadCount, 25000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated, refreshUnreadCount]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        unreadCount,
        setUnreadCount,
        refreshUnreadCount,
        login,
        logout,
        updateUser,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
