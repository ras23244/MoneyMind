import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create the context
export const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Optionally, fetch user info on mount (e.g., after refresh)
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}users/me`,
                    { withCredentials: true }
                );
                setUser(res.data);
            } catch {
                setUser(null);
            }
        };
        fetchUser();
    }, []);

    // Login: set user
    const login = (userData) => setUser(userData);

    // Logout: clear user
    const logout = () => setUser(null);

    // Update user: for profile changes
    const updateUser = (newUserData) => setUser(newUserData);

    return (
        <UserContext.Provider value={{ user, setUser, login, logout, updateUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);