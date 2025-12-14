const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = [
    "user-read-private",
    "user-read-email",
    "user-library-modify",
    "user-library-read"
];

function generateRandomString(length) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

export async function redirectToAuthCodeFlow() {
    const verifier = generateRandomString(128);
    localStorage.setItem("verifier", verifier);

    const challenge = await generateCodeChallenge(verifier);

    const params = new URLSearchParams();
    params.append("client_id", CLIENT_ID);
    params.append("response_type", "code");
    params.append("redirect_uri", REDIRECT_URI);
    params.append("scope", SCOPES.join(" "));
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function getAccessToken(code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", CLIENT_ID);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", REDIRECT_URI);
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const json = await result.json();
    console.log("Token response:", json);
    if (!result.ok) {
        throw new Error(json.error_description || json.error || "Failed to get token");
    }
    return json;
}

export async function refreshAccessToken(refreshToken) {
    const params = new URLSearchParams();
    params.append("client_id", CLIENT_ID);
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const json = await result.json();
    if (!result.ok) {
        throw new Error(json.error_description || json.error || "Failed to refresh token");
    }

    return json;
}


export async function searchAudiobooks(query, token, limit = 20, offset = 0) {
    if (!query) return { items: [], total: 0 };
    const params = new URLSearchParams();
    params.append("q", query);
    params.append("type", "audiobook");
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());

    const result = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });

    const data = await result.json();
    return {
        items: data.audiobooks?.items || [],
        total: data.audiobooks?.total || 0
    };
}

export async function getAudiobook(id, token) {
    const result = await fetch(`https://api.spotify.com/v1/audiobooks/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });
    return await result.json();
}

export async function checkSavedAudiobooks(ids, token) {
    const params = new URLSearchParams();
    params.append("ids", ids.join(","));

    const result = await fetch(`https://api.spotify.com/v1/me/audiobooks/contains?${params.toString()}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });
    return await result.json();
}

export async function saveAudiobook(id, token) {
    await fetch(`https://api.spotify.com/v1/me/audiobooks?ids=${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
    });
}

export async function removeAudiobook(id, token) {
    await fetch(`https://api.spotify.com/v1/me/audiobooks?ids=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
}

export async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}
