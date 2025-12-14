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
        if (code && !processedRef.current) {
            processedRef.current = true;
            getAccessToken(code).then((tokenData) => {
                if (!tokenData || !tokenData.access_token) {
                    console.error("No token received");
                    throw new Error("No access token received from Spotify");
                }
                registerToken(tokenData);
                navigate('/');
            }).catch((err) => {
                console.error("Failed to get token", err);
                alert("Login missing: " + err.message);
                navigate('/');
            });
        }
    }, [code, registerToken, navigate]);

    return (
        <div className="min-h-screen bg-black text-purple-400 flex items-center justify-center">
            <div className="text-xl animate-pulse">Authenticating with Spotify...</div>
        </div>
    );
}
