'use client';

import { useRef, useEffect, useState } from 'react';
import { useWavesurfer } from '@wavesurfer/react';
import { Play, Pause, ExternalLink } from 'lucide-react';

interface WaveformPlayerProps {
  url: string;
  platform?: 'spotify' | 'soundcloud' | 'apple-music' | 'local' | 'other';
  platformUrl?: string;
  autoplay?: boolean;
  loop?: boolean;
}

export default function WaveformPlayer({
  url,
  platform = 'other',
  platformUrl,
  autoplay = false,
  loop = false,
}: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  const { wavesurfer, isReady } = useWavesurfer({
    container: containerRef,
    url,
    height: 60,
    waveColor: 'rgba(255, 255, 255, 0.2)',
    progressColor: 'rgba(255, 255, 255, 0.8)',
    cursorColor: 'rgba(255, 255, 255, 0.9)',
    barWidth: 2,
    barGap: 1,
    barRadius: 2,
    cursorWidth: 2,
    normalize: true,
    autoplay,
  });

  useEffect(() => {
    if (!wavesurfer) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = (time: number) => {
      setCurrentTime(formatTime(time));
    };
    const onReady = () => {
      const dur = wavesurfer.getDuration();
      setDuration(formatTime(dur));
    };
    const onFinish = () => {
      if (loop) {
        wavesurfer.play();
      } else {
        setIsPlaying(false);
      }
    };

    wavesurfer.on('play', onPlay);
    wavesurfer.on('pause', onPause);
    wavesurfer.on('timeupdate', onTimeUpdate);
    wavesurfer.on('ready', onReady);
    wavesurfer.on('finish', onFinish);

    return () => {
      wavesurfer.un('play', onPlay);
      wavesurfer.un('pause', onPause);
      wavesurfer.un('timeupdate', onTimeUpdate);
      wavesurfer.un('ready', onReady);
      wavesurfer.un('finish', onFinish);
    };
  }, [wavesurfer, loop]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (wavesurfer) {
      wavesurfer.playPause();
    }
  };

  const getPlatformName = () => {
    switch (platform) {
      case 'spotify':
        return 'Spotify';
      case 'soundcloud':
        return 'SoundCloud';
      case 'apple-music':
        return 'Apple Music';
      default:
        return 'External Source';
    }
  };

  return (
    <div className="backdrop-blur-[12px] bg-gradient-to-r from-white/[0.05] to-white/[0.08] border border-white/10 rounded-2xl overflow-hidden">
      {/* Waveform Container */}
      <div className="relative">
        <div ref={containerRef} className="w-full" />
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
        {/* Play/Pause & Time */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlayPause}
            disabled={!isReady}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" fill="white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
            )}
          </button>

          <div className="text-sm text-white/80 font-mono">
            {currentTime} / {duration}
          </div>
        </div>

        {/* Platform Link */}
        {platformUrl && platform !== 'local' && (
          <a
            href={platformUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-white/60 hover:text-white/90 transition-colors"
          >
            <span>Playing from {getPlatformName()}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
