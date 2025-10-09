'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Play, Pause, X, Maximize2, SkipBack, SkipForward, Shuffle, List } from 'lucide-react';
import type WaveSurfer from 'wavesurfer.js';

export interface Track {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  year?: string;
  url: string;
  type: 'local' | 'spotify' | 'soundcloud' | 'apple-music' | 'other';
  coverArt?: string;
  language?: string;
  duration?: string;
  localAudioUrl?: string;
  mediaId?: string;
}

interface StickyMiniPlayerProps {
  isVisible: boolean;
  audioUrl: string;
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  coverArt?: string;
  audioType?: 'local' | 'spotify' | 'soundcloud' | 'apple-music' | 'other';
  tracks?: Track[];
  currentTrackIndex?: number;
  // Platform-specific controllers
  wavesurferInstance?: WaveSurfer | null;
  spotifyController?: unknown;
  soundcloudWidget?: unknown;
  isTransitioningRef?: React.MutableRefObject<boolean>;
  isLoadingTrack?: boolean;
  onClose: () => void;
  onTrackChange?: (trackIndex: number, autoplay?: boolean) => void;
}

export default function StickyMiniPlayer({
  isVisible,
  audioUrl,
  title,
  artist,
  album,
  year,
  coverArt,
  audioType = 'local',
  tracks = [],
  currentTrackIndex = 0,
  wavesurferInstance,
  spotifyController,
  soundcloudWidget,
  isTransitioningRef,
  isLoadingTrack = false,
  onClose,
  onTrackChange,
}: StickyMiniPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [progress, setProgress] = useState(0);
  const [showTrackList, setShowTrackList] = useState(false);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [dragLocked, setDragLocked] = useState(false); // Visual lock to prevent progress jumps after drag
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ref-based drag lock for synchronous checks (prevents sync race conditions)
  const isDraggingRef = useRef(false);

  // Local Audio: WaveSurfer Integration
  useEffect(() => {
    if (audioType !== 'local' || !wavesurferInstance) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = (time: number) => {
      // Don't update during drag to prevent race condition
      if (isDragging) return;

      setCurrentTime(formatTime(time));
      const dur = wavesurferInstance.getDuration();
      if (dur > 0) {
        setProgress((time / dur) * 100);
      }
    };
    const onReady = () => {
      const dur = wavesurferInstance.getDuration();
      setDuration(formatTime(dur));
    };

    wavesurferInstance.on('play', onPlay);
    wavesurferInstance.on('pause', onPause);
    wavesurferInstance.on('timeupdate', onTimeUpdate);
    wavesurferInstance.on('ready', onReady);

    // Initialize state if already loaded
    const duration = wavesurferInstance.getDuration();
    if (duration > 0) {
      setDuration(formatTime(duration));
      setIsPlaying(wavesurferInstance.isPlaying());
    }

    return () => {
      wavesurferInstance.un('play', onPlay);
      wavesurferInstance.un('pause', onPause);
      wavesurferInstance.un('timeupdate', onTimeUpdate);
      wavesurferInstance.un('ready', onReady);
    };
  }, [audioType, wavesurferInstance, isDragging]);

  // Spotify: iFrame API Integration
  useEffect(() => {
    if (audioType !== 'spotify' || !spotifyController) return;

    const controller = spotifyController as {
      addListener: (event: string, callback: (state: unknown) => void) => void;
      removeListener: (event: string, callback: (state: unknown) => void) => void;
    };

    const handlePlaybackUpdate = (state: unknown) => {
      // Don't update during drag to prevent race condition
      if (isDragging) return;

      const playbackState = state as { isPaused: boolean; duration: number; position: number };
      setIsPlaying(!playbackState.isPaused);

      // Duration and position are in milliseconds
      const durationSec = playbackState.duration / 1000;
      const positionSec = playbackState.position / 1000;

      setDuration(formatTime(durationSec));
      setCurrentTime(formatTime(positionSec));

      if (durationSec > 0) {
        setProgress((positionSec / durationSec) * 100);
      }
    };

    controller.addListener('playback_update', handlePlaybackUpdate);

    // Get initial state
    controller.addListener('ready', () => {
      console.log('[StickyMiniPlayer] Spotify controller ready');
    });

    return () => {
      controller.removeListener('playback_update', handlePlaybackUpdate);
    };
  }, [audioType, spotifyController, isDragging]);

  // SoundCloud: Widget API Integration
  useEffect(() => {
    if (audioType !== 'soundcloud' || !soundcloudWidget) return;

    const widget = soundcloudWidget as {
      getPosition: (callback: (position: number) => void) => void;
      getDuration: (callback: (duration: number) => void) => void;
      bind: (event: string, callback: () => void) => void;
      unbind: (event: string) => void;
      isPaused: (callback: (isPaused: boolean) => void) => void;
    };

    const updateProgress = () => {
      // Don't update during drag to prevent race condition
      if (isDragging) return;

      widget.getPosition((position: number) => {
        setCurrentTime(formatTime(position / 1000)); // Convert ms to seconds

        widget.getDuration((duration: number) => {
          setDuration(formatTime(duration / 1000));

          if (duration > 0) {
            setProgress((position / duration) * 100);
          }
        });
      });
    };

    const onPlay = () => {
      setIsPlaying(true);
      // Start polling for progress updates
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      progressIntervalRef.current = setInterval(updateProgress, 500);
    };

    const onPause = () => {
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };

    const onFinish = () => {
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };

    const onReady = () => {
      console.log('[StickyMiniPlayer] SoundCloud widget ready');
      // Get initial duration
      widget.getDuration((duration: number) => {
        setDuration(formatTime(duration / 1000));
      });
    };

    widget.bind('play', onPlay);
    widget.bind('pause', onPause);
    widget.bind('finish', onFinish);
    widget.bind('ready', onReady);

    // Check if already playing
    widget.isPaused((isPaused: boolean) => {
      setIsPlaying(!isPaused);
      if (!isPaused) {
        onPlay();
      }
    });

    return () => {
      widget.unbind('play');
      widget.unbind('pause');
      widget.unbind('finish');
      widget.unbind('ready');
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [audioType, soundcloudWidget, isDragging]);

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initial State Sync + Continuous Polling when mini player is visible
  useEffect(() => {
    if (!isVisible) {
      // Clear sync interval when hidden
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      return;
    }

    // Function to sync current state from audio instances
    const syncCurrentState = () => {
      // Use ref for synchronous check (prevents React state update race conditions)
      if (isDraggingRef.current || dragLocked) return; // Don't sync during drag or cooldown period
      if (isTransitioningRef?.current) {
        console.log('[StickyMiniPlayer] Skipping sync - track transition in progress');
        return; // Don't sync during track changes to prevent race conditions
      }

      if (audioType === 'local' && wavesurferInstance) {
        // Query WaveSurfer current state
        const currentTime = wavesurferInstance.getCurrentTime();
        const duration = wavesurferInstance.getDuration();
        const playing = wavesurferInstance.isPlaying();

        console.log('[StickyMiniPlayer] Syncing WaveSurfer state:', {
          playing,
          currentTime: formatTime(currentTime),
          duration: formatTime(duration),
        });

        setIsPlaying(playing);
        if (duration > 0) {
          setDuration(formatTime(duration));
          setCurrentTime(formatTime(currentTime));
          setProgress((currentTime / duration) * 100);
        }
      } else if (audioType === 'spotify' && spotifyController) {
        // Spotify state is handled via events, but we can trigger a manual check
        const controller = spotifyController as {
          getCurrentState?: (callback: (state: unknown) => void) => void;
        };
        if (controller.getCurrentState) {
          controller.getCurrentState((state: unknown) => {
            if (state) {
              const playbackState = state as { paused: boolean; duration: number; position: number };
              setIsPlaying(!playbackState.paused);
              const durationSec = playbackState.duration / 1000;
              const positionSec = playbackState.position / 1000;
              setDuration(formatTime(durationSec));
              setCurrentTime(formatTime(positionSec));
              if (durationSec > 0) {
                setProgress((positionSec / durationSec) * 100);
              }
            }
          });
        }
      } else if (audioType === 'soundcloud' && soundcloudWidget) {
        // Query SoundCloud widget state
        const widget = soundcloudWidget as {
          getPosition: (callback: (position: number) => void) => void;
          getDuration: (callback: (duration: number) => void) => void;
          isPaused: (callback: (isPaused: boolean) => void) => void;
        };

        widget.isPaused((isPaused: boolean) => {
          setIsPlaying(!isPaused);
        });

        widget.getPosition((position: number) => {
          setCurrentTime(formatTime(position / 1000));

          widget.getDuration((duration: number) => {
            setDuration(formatTime(duration / 1000));
            if (duration > 0) {
              setProgress((position / duration) * 100);
            }
          });
        });
      }
    };

    // Initial sync immediately when visible
    syncCurrentState();

    // Set up polling interval (500ms for smooth updates)
    syncIntervalRef.current = setInterval(syncCurrentState, 500);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [isVisible, audioType, dragLocked]); // Removed instance dependencies to prevent sync restart

  const handlePlayPause = () => {
    console.log('[StickyMiniPlayer] Play/Pause clicked:', {
      audioType,
      currentlyPlaying: isPlaying,
      hasWavesurfer: !!wavesurferInstance,
      hasSpotify: !!spotifyController,
      hasSoundcloud: !!soundcloudWidget,
    });

    if (audioType === 'local' && wavesurferInstance) {
      console.log('[StickyMiniPlayer] Toggling WaveSurfer playback');
      wavesurferInstance.playPause();
    } else if (audioType === 'spotify' && spotifyController) {
      const controller = spotifyController as { pause: () => void; resume: () => void };
      console.log('[StickyMiniPlayer] Toggling Spotify playback:', isPlaying ? 'pause' : 'resume');
      if (isPlaying) {
        controller.pause();
      } else {
        controller.resume();
      }
    } else if (audioType === 'soundcloud' && soundcloudWidget) {
      const widget = soundcloudWidget as { toggle: () => void };
      console.log('[StickyMiniPlayer] Toggling SoundCloud playback');
      widget.toggle();
    } else {
      console.warn('[StickyMiniPlayer] No valid audio controller found for type:', audioType);
    }
  };

  // Calculate progress percentage from mouse position
  const calculateProgressFromMouse = useCallback((clientX: number) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return x / rect.width;
  }, []);

  // Seek audio to specific percentage
  const seekToPercentage = useCallback((percentage: number) => {
    if (audioType === 'local' && wavesurferInstance) {
      wavesurferInstance.seekTo(percentage);
    } else if (audioType === 'spotify' && spotifyController) {
      const controller = spotifyController as { seek: (seconds: number) => void };
      const durationMs = parseFloat(duration.split(':')[0]) * 60000 + parseFloat(duration.split(':')[1]) * 1000;
      const positionMs = durationMs * percentage;
      controller.seek(positionMs / 1000);
    } else if (audioType === 'soundcloud' && soundcloudWidget) {
      const widget = soundcloudWidget as {
        getDuration: (callback: (duration: number) => void) => void;
        seekTo: (position: number) => void;
      };
      widget.getDuration((durationMs: number) => {
        const positionMs = durationMs * percentage;
        widget.seekTo(positionMs);
      });
    }
  }, [audioType, wavesurferInstance, spotifyController, soundcloudWidget, duration]);

  // Handle mouse down on progress bar - start dragging
  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDraggingRef.current = true; // Set ref immediately (synchronous)
    setIsDragging(true); // Set state for UI updates
    setDragLocked(true); // Lock visual updates to prevent jumps
    const percentage = calculateProgressFromMouse(e.clientX);
    setDragProgress(percentage);
  }, [calculateProgressFromMouse]);

  // Handle mouse move - update visual progress while dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const percentage = calculateProgressFromMouse(e.clientX);
      setDragProgress(percentage);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const percentage = calculateProgressFromMouse(e.clientX);
      seekToPercentage(percentage);
      isDraggingRef.current = false; // Clear ref immediately (synchronous)
      setIsDragging(false); // Clear state for UI updates

      // Keep visual lock for 100ms after drag to prevent sync from causing visual jump
      setTimeout(() => setDragLocked(false), 100);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, calculateProgressFromMouse, seekToPercentage]);

  // Get real-time playing state from audio instance (not component state)
  const getRealTimePlayingState = useCallback(() => {
    if (audioType === 'local' && wavesurferInstance) {
      return wavesurferInstance.isPlaying();
    } else if (audioType === 'spotify' && spotifyController) {
      // For Spotify, we rely on component state since we can't synchronously query
      return isPlaying;
    } else if (audioType === 'soundcloud' && soundcloudWidget) {
      // For SoundCloud, we rely on component state since we can't synchronously query
      return isPlaying;
    }
    return false;
  }, [audioType, wavesurferInstance, spotifyController, soundcloudWidget, isPlaying]);

  // Handle previous track (auto-play if currently playing)
  const handlePrevious = () => {
    if (tracks.length <= 1 || !onTrackChange) return;
    const newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1;
    const currentlyPlaying = getRealTimePlayingState();
    console.log('[StickyMiniPlayer] Previous track:', { newIndex, currentlyPlaying });
    onTrackChange(newIndex, currentlyPlaying);
  };

  // Handle next track (auto-play if currently playing)
  const handleNext = () => {
    if (tracks.length <= 1 || !onTrackChange) return;
    const currentlyPlaying = getRealTimePlayingState();
    if (shuffleEnabled) {
      // Random track (excluding current)
      const availableIndices = tracks.map((_, i) => i).filter(i => i !== currentTrackIndex);
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      console.log('[StickyMiniPlayer] Next track (shuffle):', { randomIndex, currentlyPlaying });
      onTrackChange(randomIndex, currentlyPlaying);
    } else {
      const newIndex = currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0;
      console.log('[StickyMiniPlayer] Next track:', { newIndex, currentlyPlaying });
      onTrackChange(newIndex, currentlyPlaying);
    }
  };

  // Toggle shuffle mode
  const handleShuffle = () => {
    setShuffleEnabled(!shuffleEnabled);
  };

  // Toggle track list
  const handleToggleTrackList = () => {
    setShowTrackList(!showTrackList);
  };

  // Handle track selection from list - respect current play state
  const handleSelectTrack = (index: number) => {
    if (onTrackChange) {
      const currentlyPlaying = getRealTimePlayingState();
      console.log('[StickyMiniPlayer] Track selected from list:', { index, currentlyPlaying });
      onTrackChange(index, currentlyPlaying);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;

    if (audioType === 'local' && wavesurferInstance) {
      wavesurferInstance.seekTo(percentage);
    } else if (audioType === 'spotify' && spotifyController) {
      const controller = spotifyController as { seek: (seconds: number) => void };
      // Spotify seek expects seconds
      // We need to calculate seconds from percentage and duration
      const durationMs = parseFloat(duration.split(':')[0]) * 60000 + parseFloat(duration.split(':')[1]) * 1000;
      const positionMs = durationMs * percentage;
      controller.seek(positionMs / 1000);
    } else if (audioType === 'soundcloud' && soundcloudWidget) {
      const widget = soundcloudWidget as {
        getDuration: (callback: (duration: number) => void) => void;
        seekTo: (position: number) => void;
      };
      // SoundCloud seek expects milliseconds
      widget.getDuration((durationMs: number) => {
        const positionMs = durationMs * percentage;
        widget.seekTo(positionMs);
      });
    }
  };

  const handleClose = () => {
    // Stop playback before closing
    if (audioType === 'local' && wavesurferInstance) {
      wavesurferInstance.pause();
    } else if (audioType === 'spotify' && spotifyController) {
      const controller = spotifyController as { pause: () => void };
      controller.pause();
    } else if (audioType === 'soundcloud' && soundcloudWidget) {
      const widget = soundcloudWidget as { pause: () => void };
      widget.pause();
    }
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed top-4 right-8 z-50
        w-[320px]
        backdrop-blur-[12px]
        bg-gradient-to-r from-white/[0.12] via-white/[0.06] to-white/[0.12]
        border border-white/[0.15]
        rounded-2xl
        shadow-[0_8px_32px_rgba(0,0,0,0.6),0_2px_8px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.4)]
        transition-all duration-400 ease-out
        mini-player-enter
        px-4 py-3
      `}
      role="region"
      aria-label="Mini audio player"
    >
      {/* Close Button - Top Right */}
      <button
        onClick={handleClose}
        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors z-10"
        aria-label="Close mini player"
      >
        <X className="w-3.5 h-3.5 text-white/80" />
      </button>

      {/* Title */}
      {title && (
        <h3 className="text-white text-sm font-bold mb-1.5 pr-8 michroma truncate">
          {title}
        </h3>
      )}

      {/* Loading Indicator */}
      {isLoadingTrack && (
        <div className="flex items-center gap-2 mb-2 px-2 py-1 bg-white/5 rounded-lg border border-white/10">
          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="text-white/60 text-[10px]">Loading track...</span>
        </div>
      )}

      {/* Metadata - Ultra compact, single line when possible */}
      <div className="text-white/60 text-[10px] mb-2.5 space-y-0.5">
        {artist && (
          <div className="truncate">
            <span className="text-white/50">Artist: </span>
            <span className="text-white/70">{artist}</span>
          </div>
        )}
        {album && (
          <div className="truncate">
            <span className="text-white/50">Album: </span>
            <span className="text-white/70">{album}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-[10px]">
          {year && (
            <div className="truncate">
              <span className="text-white/50">Year: </span>
              <span className="text-white/70">{year}</span>
            </div>
          )}
          {tracks.length > 1 && (
            <div className="text-white/60 font-medium whitespace-nowrap">
              {currentTrackIndex + 1} of {tracks.length}
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons - Compact */}
      <div className="flex items-center justify-center gap-1.5 mb-2.5">
        {/* Shuffle */}
        <button
          onClick={handleShuffle}
          disabled={tracks.length <= 1}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
            shuffleEnabled
              ? 'bg-white/30 text-white'
              : 'hover:bg-white/10 text-white/60'
          } ${tracks.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
          aria-label="Shuffle"
        >
          <Shuffle className="w-3 h-3" />
        </button>

        {/* Previous */}
        <button
          onClick={handlePrevious}
          disabled={tracks.length <= 1}
          className={`w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0 ${
            tracks.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''
          }`}
          aria-label="Previous track"
        >
          <SkipBack className="w-3.5 h-3.5 text-white/80" />
        </button>

        {/* Play/Pause - Large Primary Button */}
        <button
          onClick={handlePlayPause}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4.5 h-4.5 text-white fill-white" />
          ) : (
            <Play className="w-4.5 h-4.5 text-white fill-white ml-0.5" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={handleNext}
          disabled={tracks.length <= 1}
          className={`w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0 ${
            tracks.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''
          }`}
          aria-label="Next track"
        >
          <SkipForward className="w-3.5 h-3.5 text-white/80" />
        </button>

        {/* Track List Toggle */}
        <button
          onClick={handleToggleTrackList}
          disabled={tracks.length <= 1}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
            showTrackList
              ? 'bg-white/30 text-white'
              : 'hover:bg-white/10 text-white/60'
          } ${tracks.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
          aria-label="Track list"
        >
          <List className="w-3 h-3" />
        </button>
      </div>

      {/* Progress Bar with Time - Compact */}
      <div className="flex items-center gap-1.5">
        {/* Current Time */}
        <div className="text-white/60 text-[9px] font-mono whitespace-nowrap flex-shrink-0 min-w-[32px]">
          {currentTime}
        </div>

        {/* Progress Bar */}
        <div
          ref={progressBarRef}
          className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer group relative min-w-0"
          onMouseDown={handleProgressMouseDown}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={isDragging ? dragProgress * 100 : progress}
        >
          <div
            className="h-full bg-white/60 group-hover:bg-white/80 rounded-full transition-all relative"
            style={{ width: `${isDragging ? dragProgress * 100 : progress}%` }}
          >
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg transition-transform ${
              isDragging ? 'scale-150' : 'group-hover:scale-110'
            }`} />
          </div>
        </div>

        {/* Duration */}
        <div className="text-white/60 text-[9px] font-mono whitespace-nowrap flex-shrink-0 min-w-[32px] text-right">
          {duration}
        </div>
      </div>

      {/* Track List - Collapsible */}
      {tracks.length > 1 && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            showTrackList ? 'max-h-48 mt-3' : 'max-h-0'
          }`}
        >
          <div className="border-t border-white/10 pt-2.5 max-h-44 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {tracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => handleSelectTrack(index)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 group/track ${
                  index === currentTrackIndex
                    ? 'bg-gradient-to-r from-white/20 to-white/10 border border-white/20'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono flex-shrink-0 w-6 ${
                    index === currentTrackIndex ? 'text-white font-bold' : 'text-white/50'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-medium truncate ${
                      index === currentTrackIndex ? 'text-white' : 'text-white/80 group-hover/track:text-white'
                    }`}>
                      {track.title}
                    </div>
                    {(track.artist || track.language) && (
                      <div className="text-[9px] text-white/50 truncate flex items-center gap-1.5">
                        {track.artist && <span>{track.artist}</span>}
                        {track.language && (
                          <>
                            {track.artist && <span>•</span>}
                            <span className="italic">{track.language}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {track.duration && (
                    <span className="text-[9px] text-white/50 font-mono flex-shrink-0">
                      {track.duration}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
