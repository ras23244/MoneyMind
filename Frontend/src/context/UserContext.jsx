import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";


export const UserContext = createContext();


export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.log("No token found, user not logged in");
                    setUser(null);
                    setLoading(false);
                    return;
                }

                // ✅ If user already in localStorage, skip API fetch
                if (user) {
                    console.log("User already in state:", user);
                    setLoading(false);
                    return;
                }

                 console.log("There was no user but had token so fetching user data from API")
                const res = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}users/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setUser(res.data);
                localStorage.setItem("user", JSON.stringify(res.data));
            } catch {
                setUser(null);
                localStorage.removeItem("user");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

   
    const login = (userData, token) => {
        setUser(userData);
        if (token) {
            localStorage.setItem("token", token);
        }
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("User logged in:", userData);
    };

    const patchUser = (partialData) => {
        let updatedUser;
        setUser((prevUser) => {
            updatedUser = { ...prevUser, ...partialData };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            console.log("User updated:", updatedUser);
            return updatedUser;
        });
        return updatedUser; 
    };



    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };


    const updateUser = (newUserData) => {
        setUser(newUserData);
        localStorage.setItem("user", JSON.stringify(newUserData));
    };

    return (
        <UserContext.Provider value={{ user, setUser, login, patchUser, logout, updateUser, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
