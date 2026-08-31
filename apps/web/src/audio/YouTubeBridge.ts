/**
 * YouTubeBridge.ts
 * Headless YouTube IFrame API Bridge for Hidden Music
 * - Eliminates 100% CORS & 404 console errors
 * - Manages headless background playback for YouTube tracks
 * - Programmatic control: play, pause, seek, volume, speed
 * - Dispatches timeupdate, buffering, and play state events
 */

export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
}

export function isYouTubeSource(url?: string): boolean {
  return Boolean(extractYouTubeId(url));
}

let isApiLoading = false;
let isApiReady = false;
const readyCallbacks: (() => void)[] = [];

export function loadYouTubeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve();
    if ((window as any).YT && (window as any).YT.Player) {
      isApiReady = true;
      return resolve();
    }

    readyCallbacks.push(resolve);

    if (!isApiLoading) {
      isApiLoading = true;
      const tag = document.createElement("script");
      // Use youtube-nocookie to eliminate Google Ads conversion tracking cookies & CORS errors
      tag.src = "https://www.youtube-nocookie.com/iframe_api";
      tag.onerror = () => {
        // Fallback if nocookie script domain is blocked
        const fallbackTag = document.createElement("script");
        fallbackTag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(fallbackTag);
      };
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        isApiReady = true;
        readyCallbacks.forEach((cb) => cb());
        readyCallbacks.length = 0;
      };
    }
  });
}

class YouTubeAudioBridge {
  private static instance: YouTubeAudioBridge;
  private player: any = null;
  private containerEl: HTMLDivElement | null = null;
  private isPlayerReady: boolean = false;
  private isInitializing: boolean = false;
  private currentVideoId: string | null = null;
  private isPlaying: boolean = false;
  private volume: number = 85; // 0 - 100
  private pollInterval: any = null;

  private progressListeners: Set<(currentTime: number, duration: number) => void> = new Set();
  private stateListeners: Set<(isPlaying: boolean) => void> = new Set();
  private bufferListeners: Set<(isBuffering: boolean) => void> = new Set();

  private constructor() {
    if (typeof window !== "undefined") {
      this.initDomContainer();
    }
  }

  public static getInstance(): YouTubeAudioBridge {
    if (!YouTubeAudioBridge.instance) {
      YouTubeAudioBridge.instance = new YouTubeAudioBridge();
    }
    return YouTubeAudioBridge.instance;
  }

  private initDomContainer() {
    if (this.containerEl || typeof document === "undefined") return;

    this.containerEl = document.createElement("div");
    this.containerEl.id = "hidden-music-yt-audio-bridge";
    this.containerEl.style.position = "fixed";
    this.containerEl.style.top = "-9999px";
    this.containerEl.style.left = "-9999px";
    this.containerEl.style.width = "1px";
    this.containerEl.style.height = "1px";
    this.containerEl.style.opacity = "0";
    this.containerEl.style.pointerEvents = "none";

    const playerDiv = document.createElement("div");
    playerDiv.id = "yt-headless-audio-target";
    this.containerEl.appendChild(playerDiv);
    document.body.appendChild(this.containerEl);
  }

  public async init(): Promise<void> {
    if (this.isPlayerReady || this.isInitializing || typeof window === "undefined") return;
    this.isInitializing = true;
    await loadYouTubeApi();

    return new Promise((resolve) => {
      const YT = (window as any).YT;
      if (!YT || !YT.Player) {
        this.isInitializing = false;
        return resolve();
      }

      try {
        this.player = new YT.Player("yt-headless-audio-target", {
          host: "https://www.youtube-nocookie.com",
          height: "1",
          width: "1",
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            cc_load_policy: 0,
            iv_load_policy: 3,
            playsinline: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event: any) => {
              this.isPlayerReady = true;
              this.isInitializing = false;
              try {
                this.player.setVolume(this.volume);
              } catch {}
              resolve();
            },
            onStateChange: (event: any) => {
              const state = event.data;
              // YT.PlayerState: UNSTARTED (-1), ENDED (0), PLAYING (1), PAUSED (2), BUFFERING (3), CUED (5)
              if (state === 1) { // PLAYING
                this.isPlaying = true;
                this.emitState(true);
                this.emitBuffering(false);
                this.startPolling();
              } else if (state === 2 || state === 0) { // PAUSED or ENDED
                this.isPlaying = false;
                this.emitState(false);
                this.stopPolling();
              } else if (state === 3) { // BUFFERING
                this.emitBuffering(true);
              }
            },
            onError: () => {
              this.emitBuffering(false);
            }
          }
        });
      } catch {
        this.isInitializing = false;
        resolve();
      }
    });
  }

  public async playTrack(videoIdOrUrl: string): Promise<void> {
    const videoId = extractYouTubeId(videoIdOrUrl) || videoIdOrUrl;
    if (!videoId) return;

    if (!this.isPlayerReady) {
      await this.init();
    }

    if (this.isPlayerReady && this.player && typeof this.player.loadVideoById === "function") {
      try {
        this.currentVideoId = videoId;
        this.player.loadVideoById({ videoId });
        this.player.setVolume(this.volume);
        this.player.playVideo();
        this.isPlaying = true;
        this.emitState(true);
        this.startPolling();
      } catch {}
    }
  }

  public pause(): void {
    if (this.player && typeof this.player.pauseVideo === "function") {
      try {
        this.player.pauseVideo();
      } catch {}
    }
    this.isPlaying = false;
    this.emitState(false);
    this.stopPolling();
  }

  public resume(): void {
    if (this.player && typeof this.player.playVideo === "function") {
      try {
        this.player.playVideo();
        this.isPlaying = true;
        this.emitState(true);
        this.startPolling();
      } catch {}
    }
  }

  public seekTo(seconds: number): void {
    if (this.player && typeof this.player.seekTo === "function") {
      try {
        this.player.seekTo(seconds, true);
      } catch {}
    }
  }

  public setVolume(volume0to1: number): void {
    this.volume = Math.round(Math.max(0, Math.min(1, volume0to1)) * 100);
    if (this.player && typeof this.player.setVolume === "function") {
      try {
        this.player.setVolume(this.volume);
      } catch {}
    }
  }

  public getCurrentTime(): number {
    if (this.player && typeof this.player.getCurrentTime === "function") {
      try {
        return this.player.getCurrentTime() || 0;
      } catch {
        return 0;
      }
    }
    return 0;
  }

  public getDuration(): number {
    if (this.player && typeof this.player.getDuration === "function") {
      try {
        return this.player.getDuration() || 0;
      } catch {
        return 0;
      }
    }
    return 0;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollInterval = setInterval(() => {
      if (this.player) {
        const cur = this.getCurrentTime();
        const dur = this.getDuration();
        this.progressListeners.forEach((cb) => cb(cur, dur));
      }
    }, 250);
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private emitState(isPlaying: boolean) {
    this.stateListeners.forEach((cb) => cb(isPlaying));
  }

  private emitBuffering(isBuffering: boolean) {
    this.bufferListeners.forEach((cb) => cb(isBuffering));
  }

  public onProgress(cb: (currentTime: number, duration: number) => void): () => void {
    this.progressListeners.add(cb);
    return () => this.progressListeners.delete(cb);
  }

  public onStateChange(cb: (isPlaying: boolean) => void): () => void {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }

  public onBuffering(cb: (isBuffering: boolean) => void): () => void {
    this.bufferListeners.add(cb);
    return () => this.bufferListeners.delete(cb);
  }
}

export const youTubeAudioBridge = YouTubeAudioBridge.getInstance();
