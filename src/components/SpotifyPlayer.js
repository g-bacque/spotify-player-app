// SpotifyPlayer.js
export function loadSpotifyPlayer(token, onReady) {
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'My Web Player',
        getOAuthToken: cb => cb(token),
        volume: 0.5,
      });
  
      player.addListener('ready', ({ device_id }) => {
        console.log("✅ Player is ready with device ID:", device_id);
        onReady(device_id, player); // ⬅️ También pasamos el player
      });
  
      player.addListener('not_ready', ({ device_id }) => {
        console.warn('🟡 Player not ready:', device_id);
      });
  
      player.addListener('initialization_error', ({ message }) => {
        console.error('Initialization Error:', message);
      });
  
      player.addListener('authentication_error', ({ message }) => {
        console.error('Authentication Error:', message);
      });
  
      player.connect();
    };
  }
  