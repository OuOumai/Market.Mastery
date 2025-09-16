import React, { useState, useRef, useEffect } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ videoUrl, videoTitle, onClose }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);

  let controlsTimeout = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    
    const handleError = () => {
      setError('Failed to load video');
      setLoading(false);
    };

    const handleLoadStart = () => setLoading(true);
    const handleCanPlay = () => setLoading(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [videoUrl]);

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      setShowControls(true);
      controlsTimeout.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    resetControlsTimeout();
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [isPlaying]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const rect = e.target.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    const container = document.querySelector('.video-player-container');
    
    if (!isFullscreen) {
      if (container.requestFullscreen) {
        await container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        await container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        await container.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    videoRef.current.playbackRate = rate;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  if (error) {
    return (
      <div className="video-player">
        <div className="video-header">
          <h3>Error Loading Video</h3>
          <button onClick={onClose} className="close-btn">✕ Close</button>
        </div>
        <div className="video-error">
          <div className="error-icon">🎥</div>
          <h3>Unable to Load Video</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()} className="retry-btn">
              Retry
            </button>
            <button onClick={onClose} className="back-btn">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player">
      <div className="video-header">
        <div className="video-title">
          <h3>{videoTitle || 'Video'}</h3>
          <span className="file-info">Video Player</span>
        </div>
        <button onClick={onClose} className="close-btn">✕ Close</button>
      </div>

      <div 
        className={`video-player-container ${isFullscreen ? 'fullscreen' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          className="video-element"
          onClick={togglePlayPause}
          onDoubleClick={toggleFullscreen}
        />

        {loading && (
          <div className="video-loading">
            <div className="loading-spinner"></div>
            <p>Loading video...</p>
          </div>
        )}

        {/* Video Controls */}
        <div className={`video-controls ${showControls ? 'visible' : 'hidden'}`}>
          {/* Progress Bar */}
          <div className="progress-container">
            <div 
              className="progress-bar"
              onClick={handleSeek}
            >
              <div 
                className="progress-filled"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
              <div 
                className="progress-handle"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="controls-row">
            <div className="controls-left">
              <button onClick={togglePlayPause} className="play-pause-btn">
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              
              <div className="volume-controls">
                <button onClick={toggleMute} className="mute-btn">
                  {isMuted ? '🔇' : '🔊'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
              </div>

              <div className="time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="controls-right">
              <div className="playback-rate">
                <select 
                  value={playbackRate} 
                  onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                  className="rate-select"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>

              <button onClick={toggleFullscreen} className="fullscreen-btn">
                {isFullscreen ? '🗗' : '🗖'}
              </button>
            </div>
          </div>
        </div>

        {/* Center Play Button */}
        {!isPlaying && !loading && (
          <div className="center-play-btn" onClick={togglePlayPause}>
            <div className="play-icon">▶️</div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="video-info">
        <div className="info-item">
          <span className="info-label">Duration:</span>
          <span className="info-value">{formatTime(duration)}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Progress:</span>
          <span className="info-value">
            {duration > 0 ? Math.round((currentTime / duration) * 100) : 0}%
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Speed:</span>
          <span className="info-value">{playbackRate}x</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;