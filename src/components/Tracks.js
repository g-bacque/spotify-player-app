import React, { useEffect, useRef, useState } from 'react';
import './styles/minimal.css';

function Tracks({ token, playlistId, onBack, deviceId, player }) {
  const [tracks, setTracks] = useState([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [currentTrackUri, setCurrentTrackUri] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [isPlayingPlaylist, setIsPlayingPlaylist] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const timeoutRef = useRef(null); // 👈 Nuevo: controlar el avance automático
  
  const fadeVolume = async (from, to, duration = 3000) => {
    if (!player) return;
  
    const steps = 30;
    const stepTime = duration / steps;
    const volumeStep = (to - from) / steps;
  
    for (let i = 0; i <= steps; i++) {
      setTimeout(() => {
        const newVolume = Math.min(1, Math.max(0, from + volumeStep * i));
        player.setVolume(newVolume);
      }, i * stepTime);
    }
  };
  

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

  const playTrackAtIndex = async (index, shouldAutoAdvance = true) => {
    if (!deviceId || !tracks[index]) return;
  
    // 🔁 Siempre limpiar el timeout anterior
    if (timeoutRef.current) {
      console.log(`🧹 Limpiando timeout anterior del track ${currentTrackIndex}`);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  
    const track = tracks[index];
    const durationMs = track.duration_ms;
    const thirdDuration = Math.floor(durationMs / 2); // ⏱️ Un tercio
    const fadeDuration = 3000; // 3 segundos de crossfade
  
    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: [track.uri] }),
      });
  
      setCurrentTrackUri(track.uri);
      setCurrentTrackIndex(index);
      setIsPaused(false);
      startProgressTracking();
  
      // ✅ Sólo programar auto-avance si se permite
      if (shouldAutoAdvance && index + 1 < tracks.length && isPlayingPlaylist) {
        console.log(`⏱️ Nuevo timeout para avanzar del track ${index} al ${index + 1} en ${thirdDuration - fadeDuration}ms`);
        timeoutRef.current = setTimeout(() => {
          fadeVolume(1, 0.2, fadeDuration); // 🔈 fade out antes del cambio
          setTimeout(() => {
            fadeVolume(0.2, 1, fadeDuration); // 🔊 fade in en nueva canción
            playTrackAtIndex(index + 1, true);
          }, fadeDuration);
        }, thirdDuration - fadeDuration);
        
      }
    } catch (error) {
      console.error("❌ Error reproduciendo track:", error);
    }
  };
  

  const playFullPlaylist = () => {
    setIsPlayingPlaylist(true);
    playTrackAtIndex(0);
  };

  const nextTrack = () => {
    if (currentTrackIndex + 1 < tracks.length) {
      playTrackAtIndex(currentTrackIndex + 1, true); // ✅ reinicia timeout
    }
  };
  
  const previousTrack = () => {
    if (currentTrackIndex - 1 >= 0) {
      playTrackAtIndex(currentTrackIndex - 1, true); // ✅ reinicia timeout
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

  return (
    <div className="container">
      <button onClick={onBack}>🔙 Volver</button>

      <div className="track-controls">
        <button onClick={playFullPlaylist}>▶️ Playlist</button>
        <button onClick={previousTrack}>⏮</button>
        <button onClick={nextTrack}>⏭</button>
        <button onClick={pauseTrack}>⏸</button>
      </div>

      <ul className="track-list">
        {tracks.map((track, i) => (
          <li key={track.id} className="track-item">
            <span>{track.name} — {track.artists[0]?.name}</span>
            {currentTrackUri === track.uri && !isPaused ? (
              <button onClick={pauseTrack}>⏸</button>
            ) : (
              <button onClick={() => playTrackAtIndex(i, false)}>▶️</button>
            )}
          </li>
        ))}
      </ul>

      <div>
        <div
          className="progress-bar"
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
            className="progress-fill"
            style={{ width: `${(progress / duration) * 100}%` }}
          />
        </div>
        <div className="time-info">{formatMs(progress)} / {formatMs(duration)}</div>
      </div>
    </div>
  );

}

export default Tracks;
