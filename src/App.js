// App.js
import React, { useEffect, useState } from 'react';
import { redirectToSpotifyLogin, getAccessToken } from './auth/SpotifyAuth';
import Playlists from "./components/Playlists";
import Tracks from "./components/Tracks";
import { loadSpotifyPlayer } from "./components/SpotifyPlayer"; // 👈 Asegúrate de tener esta importación


function App() {
  const [token, setToken] = useState(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [player, setPlayer] = useState(null);

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

  useEffect(() => {
    if (!token || deviceId) return;
  
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);
  
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "My React Spotify Player",
        getOAuthToken: cb => cb(token),
        volume: 0.5,
      });
  
      player.addListener("ready", ({ device_id }) => {
        console.log("✅ Player is ready with device ID:", device_id);
        setDeviceId(device_id);
      });
  
      player.addListener("initialization_error", ({ message }) => {
        console.error("❌ Initialization error:", message);
      });
  
      player.addListener("authentication_error", ({ message }) => {
        console.error("❌ Authentication error:", message);
      });
  
      player.addListener("account_error", ({ message }) => {
        console.error("❌ Account error:", message);
      });
  
      player.connect();
    };
  }, [token, deviceId]);
  

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('code_verifier'); // opcional
    window.location.reload(); // recarga la app desde cero
  };
  
  useEffect(() => {
    if (token && !deviceId) {
      loadSpotifyPlayer(token, (id, playerInstance) => {
        setDeviceId(id);
        setPlayer(playerInstance); // 👈 Guardamos player
      });
    }
  }, [token, deviceId]
  );

  return (
    <div>
      {token ? (
        <>
        <button onClick={handleLogout} style={{ marginBottom: '10px' }}>
      🔒 Cerrar sesión
    </button>
          <h2>✅ Token obtenido con éxito</h2>
          {!selectedPlaylistId ? (
            <Playlists token={token} onSelect={setSelectedPlaylistId}  />
          ) : (
            <Tracks
              token={token}
              playlistId={selectedPlaylistId}
              deviceId={deviceId} // 👈 Pasamos el deviceId
              onBack={() => setSelectedPlaylistId(null)}
              player={player}
            />          )}
        </>
      ) : (
        <h2>🔄 Redirigiendo a Spotify...</h2>
      )}
    </div>
  );
}

export default App;

