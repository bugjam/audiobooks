import { HashRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Callback from './components/Callback';
import Home from './components/Home';
import React, { useState, useEffect, useRef } from 'react';

function Login() {
  const { login } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Audiobook Discovery
      </h1>
      <p className="mb-12 text-zinc-400 text-center max-w-md text-lg">
        Explore a world of stories. Connect your Spotify account to discover, filter, and curate your audiobook library.
      </p>
      <button onClick={login} className="btn-primary flex items-center gap-3 px-8 py-4 rounded-full text-lg font-bold shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 transform hover:-translate-y-1 transition-all">
        Connect Spotify
      </button>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-purple-500">Loading...</div>;
  return token ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-black"></div>;
  return !token ? children : <Navigate to="/" />;
}

// Handle redirect from Spotify which comes as query params on the root URL
// because GitHub pages doesn't support SPA routing natively for history mode.
// We intercept ?code=... and redirect to /#/callback?code=...
function AuthRedirectHandler() {
  const processedRef = useRef(false);

  useEffect(() => {
    // Only process once
    if (processedRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      processedRef.current = true;

      // Build the new URL: keep pathname, clear search, set hash with code
      const newUrl = window.location.pathname + '#/callback?code=' + code;

      // Use location.replace to avoid adding to history and prevent loops
      window.location.replace(newUrl);
    }
  }, []);

  return null;
}

function App() {
  return (
    <HashRouter>
      <AuthRedirectHandler />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/callback" element={<Callback />} />
          <Route path="/" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
