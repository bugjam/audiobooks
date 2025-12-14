import { createContext, useContext, useState, useEffect } from 'react';
import { redirectToAuthCodeFlow, fetchProfile } from '../services/spotify';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('spotify_access_token');
            const storedRefreshToken = localStorage.getItem('spotify_refresh_token');
            const storedExpiresAt = localStorage.getItem('spotify_expires_at');

            // 1. Check if we have a valid access token
            if (storedToken && storedExpiresAt && Date.now() < parseInt(storedExpiresAt)) {
                setToken(storedToken);
                try {
                    const data = await fetchProfile(storedToken);
                    if (data.error) throw new Error(data.error.message || 'Invalid token');
                    setUser(data);
                } catch (e) {
                    // If profile fetch fails, try refreshing
                    await handleTokenRefresh(storedRefreshToken);
                }
            }
            // 2. If expired but we have a refresh token, try to refresh
            else if (storedRefreshToken) {
                await handleTokenRefresh(storedRefreshToken);
            }
            // 3. No tokens
            else {
                logout(); // Ensure clean state
            }
            setLoading(false);
        };

        const handleTokenRefresh = async (refreshToken) => {
            try {
                if (!refreshToken) throw new Error("No refresh token");
                const data = await import('../services/spotify').then(m => m.refreshAccessToken(refreshToken));
                registerToken(data);

                // Fetch user with new token
                const userData = await fetchProfile(data.access_token);
                setUser(userData);
            } catch (err) {
                console.error("Failed to refresh token", err);
                logout();
            }
        };

        initAuth();
    }, []);

    const login = () => {
        redirectToAuthCodeFlow();
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_expires_at');
    };

    const registerToken = (tokenData) => {
        const { access_token, refresh_token, expires_in } = tokenData;
        const formatedRefreshToken = refresh_token || localStorage.getItem('spotify_refresh_token');

        setToken(access_token);

        localStorage.setItem('spotify_access_token', access_token);
        if (formatedRefreshToken) {
            localStorage.setItem('spotify_refresh_token', formatedRefreshToken);
        }

        // Calculate expiration time (allow some buffer, e.g., 60s)
        const expiresAt = Date.now() + (expires_in * 1000) - 60000;
        localStorage.setItem('spotify_expires_at', expiresAt.toString());

        // If we have a refresh_token in the response (initial login), or it's known, we are good.
        // Usually initial login returns both. Refresh might return a new refresh token or not.
    };

    // We need to expose a way to set the user after initial login if registerToken doesn't do it automatically
    // The previous implementation did fetchProfile inside registerToken. Let's keep that pattern or allow Callback to do it.
    // Ideally registerToken sets the token state. The caller might want to fetch the user.
    // Let's make registerToken fetch the user to be consistent with previous behavior, 
    // OR create a separate function. To minimize changes in Callback, let's keep it simple.
    // The previous registerToken did fetchProfile.

    const handleRegisterAndFetchUser = (tokenData) => {
        registerToken(tokenData);
        fetchProfile(tokenData.access_token).then(setUser);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, registerToken: handleRegisterAndFetchUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
