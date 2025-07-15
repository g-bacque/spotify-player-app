// components/Tracks.js
import React, { useEffect, useState } from 'react';

function Tracks({ token, playlistId, onBack }) {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    async function fetchTracks() {
      try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setTracks(data.items);
      } catch (error) {
        console.error("Error al obtener tracks:", error);
      }
    }

    if (playlistId) {
      fetchTracks();
    }
  }, [playlistId, token]);

  return (
    <div>
        <button onClick={onBack} style={{ marginBottom: '1rem' }}>⬅️ Volver a playlists</button>
      <h3>🎶 Canciones de la playlist</h3>
      <ul>
        {tracks.map((item, index) => {
          const track = item.track;
          return (
            <li key={track.id || index}>
              <strong>{track.name}</strong> – {track.artists.map(a => a.name).join(', ')} ({Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')})
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Tracks;
