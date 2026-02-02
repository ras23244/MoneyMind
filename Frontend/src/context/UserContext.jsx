import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { io } from 'socket.io-client';
export const UserContext = createContext();
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [token, setToken] = useState(() => localStorage.getItem("token"));

    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (!token) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                const res = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}users/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                console.log('Fetched user data from server:', res.data);
                setUser(res.data);
                localStorage.setItem("user", JSON.stringify(res.data));
            } catch (err) {
                console.error('Failed to fetch user:', err);
                setUser(null);
                localStorage.removeItem("user");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [token]);


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !user) return;

        const base = (import.meta.env.VITE_BASE_URL || '').replace(/\/$/, '');
        const s = io(base, { auth: { token }, transports: ['websocket'] });

        s.on('connect', () => {
            console.log('socket connected', s.id);
        });

        s.on('notification', (n) => {

            const normalized = {
                id: n.id || n._id || String(n._id),
                type: n.type,
                title: n.title,
                body: n.body,
                data: n.data,
                priority: n.priority || 'low',
                read: n.read || false,
                createdAt: n.createdAt || new Date().toISOString(),
            };
            setNotifications((prev) => [normalized, ...prev]);
        });

        setSocket(s);

        return () => {
            try { s.disconnect(); } catch (e) { }
            setSocket(null);
        };
    }, [user]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || !user) return;
                const res = await axios.get(`${import.meta.env.VITE_BASE_URL}notifications?unread=true`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = (res.data?.data || res.data || []).map((n) => ({
                    id: n._id || n.id,
                    type: n.type,
                    title: n.title,
                    body: n.body,
                    data: n.data,
                    priority: n.priority || 'low',
                    read: n.read || false,
                    createdAt: n.createdAt,
                }));
                setNotifications(data);
            } catch (e) {
                console.error('Failed to fetch notifications', e.message);
            }
        };
        fetchNotifications();
    }, [user]);

    const markNotificationRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${import.meta.env.VITE_BASE_URL}notifications/${id}/read`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // remove from current unread list so it disappears from inbox
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            return true;
        } catch (e) {
            console.error('markNotificationRead error', e.message);
            return false;
        }
    };

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${import.meta.env.VITE_BASE_URL}notifications/read-all`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // clear unread list
            setNotifications([]);
            return true;
        } catch (e) {
            console.error('markAllRead error', e.message);
            return false;
        }
    };

    const deleteNotification = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_BASE_URL}notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            return true;
        } catch (e) {
            console.error('deleteNotification error', e.message);
            return false;
        }
    };

    const login = (userData, token) => {
        if (token) {
            localStorage.setItem("token", token);
            setToken(token);
        }
    };

    const patchUser = (partialData) => {
        let updatedUser;
        setUser((prevUser) => {
            console.log("Patching user with data:", partialData);
            console.log("Previous user data:", prevUser);
            updatedUser = { ...prevUser, ...partialData };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            return updatedUser;
        });
        return updatedUser;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setToken(null);
        try { socket && socket.disconnect(); } catch (e) { }
        setNotifications([]);
    };

    const updateUser = (newUserData) => {
        setUser(newUserData);
        localStorage.setItem("user", JSON.stringify(newUserData));
    };

    return (
        <UserContext.Provider value={{ user, setUser, login, patchUser, logout, updateUser, loading, socket, notifications, markNotificationRead, markAllRead, deleteNotification }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
