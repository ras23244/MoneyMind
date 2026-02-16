import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const hash = window.location.hash.replace(/^#/, '');
            const params = new URLSearchParams(hash);
            const accessToken = params.get('accessToken');
            const refreshToken = params.get('refreshToken');

            if (accessToken) localStorage.setItem('accessToken', accessToken);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        } catch (e) { }

        // Redirect to dashboard after storing tokens
        navigate('/dashboard');
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div>Processing authentication...</div>
        </div>
    );
};

export default OAuthSuccess;
