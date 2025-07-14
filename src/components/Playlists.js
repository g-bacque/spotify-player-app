// Playlists.js
import React, { useEffect, useState } from 'react';

function Playlists({ token }) {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await fetch('https://api.spotify.com/v1/me/playlists', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.items) {
          setPlaylists(data.items);
        } else {
          console.error("Error al obtener playlists:", data);
        }
      } catch (err) {
        console.error("Error al conectar con Spotify:", err);
      }
    };

    fetchPlaylists();
  }, [token]);

  return (
    <div>
      <h3>🎵 Tus Playlists</h3>
      <ul>
        {playlists.map((playlist) => (
          <li key={playlist.id}>
            <strong>{playlist.name}</strong> ({playlist.tracks.total} canciones)
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Playlists;
