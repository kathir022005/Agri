import React, { createContext, useContext, useState, useEffect } from "react";
import { loginApi, registerApi, getMeApi } from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("agri_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("agri_token") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getMeApi()
        .then(({ data }) => {
          setUser((prev) => ({ ...prev, ...data }));
          localStorage.setItem("agri_user", JSON.stringify(data));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    const { data } = await loginApi({ username, password });
    setUser(data);
    setToken(data.token);
    localStorage.setItem("agri_token", data.token);
    localStorage.setItem("agri_user", JSON.stringify(data));
    return data;
  };

  const register = async (formData) => {
    const { data } = await registerApi(formData);
    setUser(data);
    setToken(data.token);
    localStorage.setItem("agri_token", data.token);
    localStorage.setItem("agri_user", JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("agri_token");
    localStorage.removeItem("agri_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
