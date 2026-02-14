import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

/**
 * ProtectedRoute - Wraps routes that require authentication
 * If user is not logged in (user is null), redirects to login
 * While loading, shows a loading state
 */
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useUser();

    // While checking authentication status, show loading
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // User is authenticated, render the protected content
    return children;
};

export default ProtectedRoute;
