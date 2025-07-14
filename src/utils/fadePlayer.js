export function fadeOut(player, duration = 5000, onVolumeChange) {
    let volume = 1.0;
    const step = 0.1;
    const intervalTime = duration / (1 / step);
    const interval = setInterval(() => {
      volume = Math.max(0, volume - step);
      player.setVolume(volume);
      if (onVolumeChange) onVolumeChange(volume);
      if (volume <= 0) clearInterval(interval);
    }, intervalTime);
  }
  
  export function fadeIn(player, duration = 5000, onVolumeChange) {
    let volume = 0.0;
    const step = 0.1;
    const intervalTime = duration / (1 / step);
    const interval = setInterval(() => {
      volume = Math.min(1, volume + step);
      player.setVolume(volume);
      if (onVolumeChange) onVolumeChange(volume);
      if (volume >= 1) clearInterval(interval);
    }, intervalTime);
  }
  
  