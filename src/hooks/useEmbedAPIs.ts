'use client';

import { useEffect, useState } from 'react';

interface EmbedAPIsState {
  spotifyReady: boolean;
  soundcloudReady: boolean;
  spotifyAPI: any;
  soundcloudAPI: any;
}

// Declare global types for external APIs
declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: any) => void;
    SC?: any;
    Spotify?: any;
  }
}

export function useEmbedAPIs() {
  const [state, setState] = useState<EmbedAPIsState>({
    spotifyReady: false,
    soundcloudReady: false,
    spotifyAPI: null,
    soundcloudAPI: null,
  });

  useEffect(() => {
    // Load Spotify iFrame API
    if (!document.querySelector('script[src*="spotify.com/embed/iframe-api"]')) {
      const spotifyScript = document.createElement('script');
      spotifyScript.src = 'https://open.spotify.com/embed/iframe-api/v1';
      spotifyScript.async = true;

      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        console.log('[useEmbedAPIs] Spotify iFrame API ready');
        setState(prev => ({
          ...prev,
          spotifyReady: true,
          spotifyAPI: IFrameAPI,
        }));
      };

      document.body.appendChild(spotifyScript);
    } else if (window.Spotify) {
      // Already loaded
      setState(prev => ({
        ...prev,
        spotifyReady: true,
        spotifyAPI: window.Spotify,
      }));
    }

    // Load SoundCloud Widget API
    if (!document.querySelector('script[src*="w.soundcloud.com/player/api.js"]')) {
      const soundcloudScript = document.createElement('script');
      soundcloudScript.src = 'https://w.soundcloud.com/player/api.js';
      soundcloudScript.async = true;

      soundcloudScript.onload = () => {
        console.log('[useEmbedAPIs] SoundCloud Widget API ready');
        setState(prev => ({
          ...prev,
          soundcloudReady: true,
          soundcloudAPI: window.SC,
        }));
      };

      document.body.appendChild(soundcloudScript);
    } else if (window.SC) {
      // Already loaded
      setState(prev => ({
        ...prev,
        soundcloudReady: true,
        soundcloudAPI: window.SC,
      }));
    }

    // Cleanup - don't remove scripts as they may be used by other components
    return () => {
      // Scripts remain loaded for performance
    };
  }, []);

  return state;
}
