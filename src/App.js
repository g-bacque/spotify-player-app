// App.js
import React, { useEffect, useState } from 'react';
import { redirectToSpotifyLogin, getAccessToken } from './auth/SpotifyAuth';
import Playlists from "./components/Playlists";
import Tracks from "./components/Tracks";

function App() {
  const [token, setToken] = useState(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (accessToken) {
      setToken(accessToken);
    } else if (code) {
      getAccessToken(code).then((token) => {
        if (token) {
          setToken(token);
          window.history.replaceState({}, document.title, "/");
        }
      });
    } else {
      redirectToSpotifyLogin(); // guarda code_verifier y redirige
    }
  }, []);

  return (
    <div>
      {token ? (
        <>
          <h2>✅ Token obtenido con éxito</h2>
          {!selectedPlaylistId ? (
            <Playlists token={token} onSelect={setSelectedPlaylistId}  />
          ) : (
            <Tracks token={token} playlistId={selectedPlaylistId} onBack={() => setSelectedPlaylistId(null)}/>
          )}
        </>
      ) : (
        <h2>🔄 Redirigiendo a Spotify...</h2>
      )}
    </div>
  );
}

export default App;

