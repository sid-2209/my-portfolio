'use client';

import { useEffect, useState, useRef } from 'react';
import { Play, Pause, X, Maximize2 } from 'lucide-react';
import type WaveSurfer from 'wavesurfer.js';

interface StickyMiniPlayerProps {
  isVisible: boolean;
  audioUrl: string;
  title?: string;
  artist?: string;
  coverArt?: string;
  audioType?: 'local' | 'spotify' | 'soundcloud' | 'apple-music' | 'other';
  // Platform-specific controllers
  wavesurferInstance?: WaveSurfer | null;
  spotifyController?: unknown;
  soundcloudWidget?: unknown;
  onClose: () => void;
  onExpand: () => void;
}

export default function StickyMiniPlayer({
  isVisible,
  audioUrl,
  title,
  artist,
  coverArt,
  audioType = 'local',
  wavesurferInstance,
  spotifyController,
  soundcloudWidget,
  onClose,
  onExpand,
}: StickyMiniPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Local Audio: WaveSurfer Integration
  useEffect(() => {
    if (audioType !== 'local' || !wavesurferInstance) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = (time: number) => {
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
  }, [audioType, wavesurferInstance]);

  // Spotify: iFrame API Integration
  useEffect(() => {
    if (audioType !== 'spotify' || !spotifyController) return;

    const controller = spotifyController as {
      addListener: (event: string, callback: (state: unknown) => void) => void;
      removeListener: (event: string, callback: (state: unknown) => void) => void;
    };

    const handlePlaybackUpdate = (state: unknown) => {
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
  }, [audioType, spotifyController]);

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
  }, [audioType, soundcloudWidget]);

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (audioType === 'local' && wavesurferInstance) {
      wavesurferInstance.playPause();
    } else if (audioType === 'spotify' && spotifyController) {
      const controller = spotifyController as { pause: () => void; resume: () => void };
      if (isPlaying) {
        controller.pause();
      } else {
        controller.resume();
      }
    } else if (audioType === 'soundcloud' && soundcloudWidget) {
      const widget = soundcloudWidget as { toggle: () => void };
      widget.toggle();
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
        w-[350px] h-[70px]
        backdrop-blur-[12px]
        bg-gradient-to-r from-white/[0.12] via-white/[0.06] to-white/[0.12]
        border border-white/[0.15]
        rounded-full
        shadow-[0_8px_32px_rgba(0,0,0,0.6),0_2px_8px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.4)]
        transition-all duration-400 ease-out
        mini-player-enter
        px-4 py-3
        flex items-center gap-3
      `}
      role="region"
      aria-label="Mini audio player"
    >
      {/* Cover Art (optional) */}
      {coverArt && (
        <div className="flex-shrink-0 w-11 h-11 rounded-full overflow-hidden bg-white/10">
          <img
            src={coverArt}
            alt={title || 'Audio cover'}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {/* Title and Artist */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            {title && (
              <div className="text-white text-sm font-medium truncate michroma">
                {title}
              </div>
            )}
            {artist && (
              <div className="text-white/60 text-xs truncate michroma">
                {artist}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white fill-white" />
              ) : (
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              )}
            </button>

            {/* Expand */}
            <button
              onClick={onExpand}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Expand to full player"
            >
              <Maximize2 className="w-3.5 h-3.5 text-white/80" />
            </button>

            {/* Close */}
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors"
              aria-label="Close mini player"
            >
              <X className="w-3.5 h-3.5 text-white/80" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          <div
            className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer group relative"
            onClick={handleProgressClick}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full bg-white/60 group-hover:bg-white/80 rounded-full transition-all relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Time Display */}
          <div className="text-white/60 text-[10px] font-mono whitespace-nowrap">
            {currentTime} / {duration}
          </div>
        </div>
      </div>
    </div>
  );
}
