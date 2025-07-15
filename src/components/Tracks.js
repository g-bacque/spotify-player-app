import React, { useEffect, useState } from 'react';

function Tracks({ token, playlistId, onBack, deviceId, player }) {
  const [tracks, setTracks] = useState([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [currentTrackUri, setCurrentTrackUri] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [isPlayingPlaylist, setIsPlayingPlaylist] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  useEffect(() => {
    async function fetchTracks() {
      try {
        const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTracks(data.items.map(item => item.track));
      } catch (err) {
        console.error("❌ Error al obtener tracks:", err);
      }
    }

    fetchTracks();
  }, [token, playlistId]);

  useEffect(() => {
    if (!player || !isPlayingPlaylist) return;

    const handleStateChange = async (state) => {
      if (!state || !state.track_window?.current_track) return;

      const track = state.track_window.current_track;
      const halfDuration = Math.floor(track.duration_ms / 2);

      console.log(`🎶 Playing: ${track.name}, will skip in ${halfDuration} ms`);

      if (window.halfTimeout) clearTimeout(window.halfTimeout);

      window.halfTimeout = setTimeout(() => {
        if (currentTrackIndex + 1 < tracks.length && isPlayingPlaylist) {
          playTrackAtIndex(currentTrackIndex + 1);
        } else {
          setIsPlayingPlaylist(false);
          stopProgressTracking();
        }
      }, halfDuration);
    };

    player.addListener('player_state_changed', handleStateChange);

    return () => {
      player.removeListener('player_state_changed', handleStateChange);
      if (window.halfTimeout) clearTimeout(window.halfTimeout);
    };
  }, [player, isPlayingPlaylist, currentTrackIndex, tracks]);

  const playTrack = async (trackUri) => {
    if (!player || !deviceId) return;

    const state = await player.getCurrentState();

    if (state && state.track_window.current_track.uri === trackUri && isPaused) {
      await player.resume();
      setIsPaused(false);
      startProgressTracking();
      return;
    }

    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: [trackUri] }),
      });

      setCurrentTrackUri(trackUri);
      setIsPaused(false);
      startProgressTracking();
    } catch (error) {
      console.error("❌ Error al reproducir pista:", error);
    }
  };

  const pauseTrack = async () => {
    if (player) {
      await player.pause();
      setIsPaused(true);
      stopProgressTracking();
    }
  };

  const startProgressTracking = () => {
    if (!player) return;
    stopProgressTracking();

    const id = setInterval(async () => {
      const state = await player.getCurrentState();
      if (state) {
        setProgress(state.position);
        setDuration(state.duration);
      }
    }, 1000);

    setIntervalId(id);
  };

  const stopProgressTracking = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const formatMs = (ms) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const playTrackAtIndex = async (index) => {
    if (!deviceId || !tracks[index]) return;

    const track = tracks[index];
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: [track.uri] }),
    });

    setCurrentTrackUri(track.uri);
    setIsPaused(false);
    setCurrentTrackIndex(index);
    startProgressTracking();
  };

  const playFullPlaylist = () => {
    setIsPlayingPlaylist(true);
    playTrackAtIndex(0);
  };

  return (
    <div>
      <button onClick={onBack}>🔙 Volver</button>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={playFullPlaylist}>▶️ Reproducir Playlist</button>
      </div>

      <h3>🎧 Tracks</h3>
      <ul>
        {tracks.map((track) => (
          <li key={track.id}>
            {track.name} — {track.artists[0]?.name}
            {currentTrackUri === track.uri && !isPaused ? (
              <button onClick={pauseTrack}>⏸️</button>
            ) : (
              <button onClick={() => playTrack(track.uri)}>▶️</button>
            )}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '20px' }}>
        <button onClick={pauseTrack}>⏸ Pause</button>
        <div
          style={{
            position: 'relative',
            width: '300px',
            height: '10px',
            background: '#ccc',
            cursor: 'pointer',
            marginBottom: '8px',
          }}
          onClick={(e) => {
            if (!player || !duration) return;

            const rect = e.target.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickPosition = (clickX / rect.width) * duration;

            player.seek(clickPosition);
            setProgress(clickPosition);
          }}
        >
          <div
            style={{
              position: 'absolute',
              height: '100%',
              width: `${(progress / duration) * 100}%`,
              background: '#1DB954',
            }}
          />
        </div>
        <div>{formatMs(progress)} / {formatMs(duration)}</div>
      </div>
    </div>
  );
}

export default Tracks;
