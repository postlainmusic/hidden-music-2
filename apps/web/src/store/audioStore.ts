import { create } from "zustand";

export interface TrackPalette {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
  palette: TrackPalette;
  genre: string;
}

export const DEFAULT_TRACKS: Track[] = [
  {
    id: "track-1",
    title: "Midnight Aurora",
    artist: "Celestial Waves",
    album: "Solaris Prism",
    duration: 214,
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    palette: {
      primary: "#6366f1",
      secondary: "#ec4899",
      accent: "#8b5cf6",
      glow: "rgba(99, 102, 241, 0.45)"
    },
    genre: "Ambient Synthwave"
  },
  {
    id: "track-2",
    title: "Liquid Glass Dreams",
    artist: "Ethereal Echo",
    album: "Reflections in Neon",
    duration: 188,
    coverUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    palette: {
      primary: "#06b6d4",
      secondary: "#3b82f6",
      accent: "#10b981",
      glow: "rgba(6, 182, 212, 0.45)"
    },
    genre: "Lo-Fi Cinematic"
  },
  {
    id: "track-3",
    title: "Cybernetic Horizon",
    artist: "Nova Pulse",
    album: "Quantum Resonance",
    duration: 245,
    coverUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf7b5b5.mp3?filename=electronic-future-beats-117997.mp3",
    palette: {
      primary: "#f43f5e",
      secondary: "#fb923c",
      accent: "#d946ef",
      glow: "rgba(244, 63, 94, 0.45)"
    },
    genre: "Future Bass"
  },
  {
    id: "track-4",
    title: "Subtle Radiance",
    artist: "Aura Soundscape",
    album: "Luminescent Calm",
    duration: 196,
    coverUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=chill-abstract-intention-12099.mp3",
    palette: {
      primary: "#14b8a6",
      secondary: "#0284c7",
      accent: "#a855f7",
      glow: "rgba(20, 184, 166, 0.45)"
    },
    genre: "Chillout Electronic"
  }
];

interface UserSession {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  membershipTier: string;
}

interface AudioState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoginModalOpen: boolean;
  currentUser: UserSession | null;
  analyserNode: AnalyserNode | null;

  // Actions
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setLoginModalOpen: (open: boolean) => void;
  loginUser: (user: UserSession) => void;
  logoutUser: () => void;
  initAudioEngine: () => void;
  getFrequencyData: () => Uint8Array;
}

let audioElement: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;
let analyser: AnalyserNode | null = null;
let gainNode: GainNode | null = null;

// Apply dynamic theme color variables on root DOM
const updateCssTheme = (palette: TrackPalette) => {
  const root = document.documentElement;
  root.style.setProperty("--accent-primary", palette.primary);
  root.style.setProperty("--accent-secondary", palette.secondary);
  root.style.setProperty("--accent-tertiary", palette.accent);
  root.style.setProperty("--glow-color", palette.glow);
};

export const useAudioStore = create<AudioState>((set, get) => ({
  currentTrack: DEFAULT_TRACKS[0],
  queue: DEFAULT_TRACKS,
  isPlaying: false,
  currentTime: 0,
  duration: DEFAULT_TRACKS[0].duration,
  volume: 0.85,
  isMuted: false,
  isLoginModalOpen: false,
  currentUser: null,
  analyserNode: null,

  initAudioEngine: () => {
    if (typeof window === "undefined" || audioElement) return;

    audioElement = new Audio();
    audioElement.crossOrigin = "anonymous";
    audioElement.preload = "auto";
    audioElement.src = DEFAULT_TRACKS[0].audioUrl;

    audioElement.addEventListener("timeupdate", () => {
      if (audioElement) {
        set({ currentTime: audioElement.currentTime });
      }
    });

    audioElement.addEventListener("loadedmetadata", () => {
      if (audioElement) {
        set({ duration: audioElement.duration || DEFAULT_TRACKS[0].duration });
      }
    });

    audioElement.addEventListener("ended", () => {
      get().nextTrack();
    });

    // Update initial theme
    updateCssTheme(DEFAULT_TRACKS[0].palette);
  },

  playTrack: (track: Track) => {
    if (!audioElement) {
      get().initAudioEngine();
    }

    if (!audioContext && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContext = new AudioCtx();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      gainNode = audioContext.createGain();

      if (audioElement) {
        sourceNode = audioContext.createMediaElementSource(audioElement);
        sourceNode.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(audioContext.destination);
        set({ analyserNode: analyser });
      }
    }

    if (audioContext && audioContext.state === "suspended") {
      audioContext.resume();
    }

    if (audioElement) {
      audioElement.src = track.audioUrl;
      audioElement.currentTime = 0;
      audioElement.play().catch((e) => console.log("Audio playback deferred:", e));
    }

    updateCssTheme(track.palette);

    set({
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
      duration: track.duration
    });
  },

  togglePlay: () => {
    const { isPlaying, currentTrack, initAudioEngine, playTrack } = get();

    if (!audioElement) {
      initAudioEngine();
    }

    if (!currentTrack && DEFAULT_TRACKS.length > 0) {
      playTrack(DEFAULT_TRACKS[0]);
      return;
    }

    if (audioContext && audioContext.state === "suspended") {
      audioContext.resume();
    }

    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        set({ isPlaying: false });
      } else {
        audioElement.play().catch((e) => console.log("Audio play error:", e));
        set({ isPlaying: true });
      }
    }
  },

  nextTrack: () => {
    const { queue, currentTrack, playTrack } = get();
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    playTrack(queue[nextIndex]);
  },

  prevTrack: () => {
    const { queue, currentTrack, playTrack } = get();
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    playTrack(queue[prevIndex]);
  },

  seek: (time: number) => {
    if (audioElement) {
      audioElement.currentTime = time;
      set({ currentTime: time });
    }
  },

  setVolume: (volume: number) => {
    if (audioElement) {
      audioElement.volume = volume;
    }
    if (gainNode) {
      gainNode.gain.value = volume;
    }
    set({ volume, isMuted: volume === 0 });
  },

  toggleMute: () => {
    const { isMuted, setVolume } = get();
    if (isMuted) {
      setVolume(0.85);
    } else {
      setVolume(0);
    }
  },

  setLoginModalOpen: (open: boolean) => set({ isLoginModalOpen: open }),

  loginUser: (user: UserSession) => set({ currentUser: user, isLoginModalOpen: false }),

  logoutUser: () => set({ currentUser: null }),

  getFrequencyData: () => {
    if (!analyser) return new Uint8Array(32);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }
}));
