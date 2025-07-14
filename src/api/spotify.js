// src/spotify.js
export async function getUserPlaylists(token) {
    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error("Error al obtener las playlists");
    }
  
    const data = await response.json();
    return data.items; // Array de playlists
  }
  
  