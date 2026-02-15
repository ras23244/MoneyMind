import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";
import { io } from "socket.io-client";
import axiosInstance from "../lib/axiosInstance";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axiosInstance.get("/users/me");
                setUser(res.data);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        if (!user) return;

        const baseURL = (import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");

        const s = io(baseURL, {
            withCredentials: true,
            transports: ["websocket"],
        });

        s.on("connect", () => {
            // Socket connected
        });

        s.on("notification", (n) => {
            const normalized = {
                id: n._id || n.id,
                type: n.type,
                title: n.title,
                body: n.body,
                data: n.data,
                priority: n.priority || "low",
                read: n.read || false,
                createdAt: n.createdAt || new Date().toISOString(),
            };

            setNotifications((prev) => [normalized, ...prev]);
        });

        setSocket(s);

        return () => {
            try {
                s.disconnect();
            } catch (e) { }
            setSocket(null);
        };
    }, [user]);


    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            try {
                const res = await axiosInstance.get("/notifications?unread=true");
                const list = (res.data?.data || res.data || []).map((n) => ({
                    id: n._id || n.id,
                    type: n.type,
                    title: n.title,
                    body: n.body,
                    data: n.data,
                    priority: n.priority || "low",
                    read: n.read || false,
                    createdAt: n.createdAt,
                }));

                setNotifications(list);
            } catch (e) {
                // Silently ignore fetch errors
            }
        };

        fetchNotifications();
    }, [user]);

    const markNotificationRead = async (id) => {
        try {
            await axiosInstance.patch(`/notifications/${id}/read`);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            return true;
        } catch (e) {
            return false;
        }
    };

    const markAllRead = async () => {
        try {
            await axiosInstance.patch("/notifications/read-all");
            setNotifications([]);
            return true;
        } catch (e) {
            return false;
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axiosInstance.delete(`/notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            return true;
        } catch (e) {
            return false;
        }
    };

    const login = (userData) => {
        setUser(userData);
    };

    const patchUser = (partialData) => {
        let updatedUser;
        setUser((prev) => {
            updatedUser = { ...prev, ...partialData };
            return updatedUser;
        });
        return updatedUser;
    };

    const updateUser = (newUserData) => {
        setUser(newUserData);
    };

    const logout = async () => {
        try {
            await axiosInstance.post("/users/logout");
        } catch (e) {
            // Ignore logout errors
        } finally {
            setUser(null);
            try {
                socket && socket.disconnect();
            } catch (e) { }
            setNotifications([]);
        }
    };

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                loading,
                socket,
                notifications,
                login,
                logout,
                patchUser,
                updateUser,
                markNotificationRead,
                markAllRead,
                deleteNotification,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
