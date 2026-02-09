import { useEffect, useState } from "react";
import {
  GlobalContext,
  type ContextType,
  type User,
  type ResponseData,
} from "./Context";
import { apiService } from "../../../services/api";

interface Props {
  children: React.ReactNode;
}

export const ContextProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseData, setResponseData] = useState<ResponseData | null>(null);

  useEffect(() => {
    const initAuth = () => {
      const stored = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (stored && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && parsedUser.email) {
            setToken(stored);
            setUser(parsedUser);
            fetchUser();
          } else {
            setLoading(false);
          }
        } catch (error) {
          console.error("Failed to parse user data:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const fetchUser = async () => {
    try {
      const data = await apiService.get<{ success: boolean; user: User }>(
        "/api/auth/profile",
      );
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const data = await apiService.post<{
      success: boolean;
      token: string;
      user: User;
      error?: string;
    }>("/api/auth/login", { email, password });

    if (!data.success || !data.token) {
      throw new Error(data.error || "Login failed");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const signup = async (email: string, password: string) => {
    const data = await apiService.post<{
      success: boolean;
      token: string;
      user: User;
      error?: string;
    }>("/api/auth/signup", { email, password });

    if (!data.success || !data.token) {
      throw new Error(data.error || "Signup failed");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setResponseData(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value: ContextType = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    signup,
    logout,
    responseData,
    setResponseData,
    setUser,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};
