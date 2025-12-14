import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAccessToken } from '../services/spotify';
import { useAuth } from '../context/AuthContext';

export default function Callback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { registerToken } = useAuth();
    const code = searchParams.get('code');

    const processedRef = useRef(false);

    useEffect(() => {
        // If we already have a token in storage, don't try to exchange code again
        // This handles double-mounts or re-renders
        if (localStorage.getItem('spotify_access_token')) {
            navigate('/');
            return;
        }

        if (code && !processedRef.current) {
            processedRef.current = true;
            getAccessToken(code).then((tokenData) => {
                if (!tokenData || !tokenData.access_token) {
                    console.error("No token received");
                    throw new Error("No access token received from Spotify");
                }
                registerToken(tokenData);

                // Clear the hash/query to prevent replay on reload if user stays on this URL
                // window.history.replaceState({}, document.title, window.location.pathname); 
                // Don't need replaceState here if we navigate to '/'

                navigate('/');
            }).catch((err) => {
                console.error("Failed to get token", err);
                // If error is invalid_grant, it usually means code is expired/used. 
                // If we have a token (race condition?), we are fine.
                if (err.message.includes('invalid_grant') && localStorage.getItem('spotify_access_token')) {
                    navigate('/');
                } else {
                    alert("Login failed: " + err.message + "\nCheck console for details.");
                    // navigate('/'); 
                }
            });
        }
    }, [code, registerToken, navigate]);

    return (
        <div className="min-h-screen bg-black text-purple-400 flex items-center justify-center">
            <div className="text-xl animate-pulse">Authenticating with Spotify...</div>
        </div>
    );
}
