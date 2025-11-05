import { useState, useEffect } from "react";
import api from "../utils/api";

export const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [bases, setBases] = useState([]);

  useEffect(() => {
    if (token) {
      api
        .get("/auth/me")
        .then(async (res) => {
          const loggedUser = res.data.user;
          setUser(loggedUser);

          if (["admin", "logistics"].includes(loggedUser.role)) {
            const baseRes = await api.get("/bases");
            setBases(baseRes.data);
          } else if (loggedUser.role === "commander") {
            setBases([loggedUser.assignedBase]);
          }
        })
        .catch(() => {
          handleLogout();
        });
    }
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setBases([]);
  };

  return { token, user, bases, login, logout: handleLogout };
};
