import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize checks for existing token
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            // Configure axios defaults
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        // Uses form-urlencoded content type as required by OAuth2PasswordRequestForm
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/login/access-token`, formData);
            const { access_token } = response.data;

            // Temporary: Since we don't have a /users/me endpoint yet, we fake the user object based on success
            // In Phase 38 we will fetch the real user profile
            const userObj = { username: username, role: 'admin' };

            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(userObj));

            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            setUser(userObj);
            return { success: true };
        } catch (error) {
            console.error("Login failed:", error);
            return {
                success: false,
                message: error.response?.data?.detail || "Falha na autenticação"
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
