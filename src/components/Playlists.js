// components/Playlists.js
import React, { useEffect, useState } from 'react';
import './Playlists.css'; // Importamos el CSS externo
import './styles/minimal.css';


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
    <div className="container">
      <h3>🎵 Tus playlists</h3>
      <ul className="playlist-list">
        {playlists.map((playlist) => (
          <li
            key={playlist.id}
            className="playlist-item"
            onClick={() => onSelect(playlist.id)}
          >
            {playlist.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Playlists;

