// components/Playlists.js
import React, { useEffect, useState } from 'react';

function Playlists({ token, onSelect }) {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const response = await fetch('https://api.spotify.com/v1/me/playlists', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setPlaylists(data.items);
      } catch (error) {
        console.error("Error al obtener playlists:", error);
      }
    }

    fetchPlaylists();
  }, [token]);

  return (
    <div>
      <h3>🎵 Tus playlists</h3>
      <ul>
        {playlists.map((playlist) => (
          <li
            key={playlist.id}
            onClick={() => onSelect(playlist.id)}
            style={{ cursor: 'pointer', margin: '10px 0', color: 'blue' }}
          >
            {playlist.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Playlists;

