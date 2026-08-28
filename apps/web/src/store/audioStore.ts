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

const HVL_COVER = "https://hidden-music-api.postlain-music.workers.dev/api/stream/covers/HVL_Album_Cover.jpg";

export const DEFAULT_TRACKS: Track[] = [
  {
    id: "mck-01",
    title: "01. Elegie",
    artist: "MCK",
    album: "HVL",
    duration: 198,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    palette: { primary: "#6366f1", secondary: "#ec4899", accent: "#8b5cf6", glow: "rgba(99, 102, 241, 0.45)" },
    genre: "Hip-Hop / Rap"
  },
  {
    id: "mck-02",
    title: "02. IDK",
    artist: "MCK",
    album: "HVL",
    duration: 215,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    palette: { primary: "#06b6d4", secondary: "#3b82f6", accent: "#10b981", glow: "rgba(6, 182, 212, 0.45)" },
    genre: "Melodic Rap"
  },
  {
    id: "mck-03",
    title: "03. Wtf Bby I'm Lit",
    artist: "MCK",
    album: "HVL",
    duration: 180,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf7b5b5.mp3?filename=electronic-future-beats-117997.mp3",
    palette: { primary: "#f43f5e", secondary: "#fb923c", accent: "#d946ef", glow: "rgba(244, 63, 94, 0.45)" },
    genre: "Trap"
  },
  {
    id: "mck-04",
    title: "04. Anh Không Muốn Nó Dễ Dàng",
    artist: "MCK",
    album: "HVL",
    duration: 224,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=chill-abstract-intention-12099.mp3",
    palette: { primary: "#14b8a6", secondary: "#0284c7", accent: "#a855f7", glow: "rgba(20, 184, 166, 0.45)" },
    genre: "R&B / Soul"
  },
  {
    id: "mck-05",
    title: "05. Baby",
    artist: "MCK ft. marzuz",
    album: "HVL",
    duration: 230,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    palette: { primary: "#ec4899", secondary: "#8b5cf6", accent: "#f43f5e", glow: "rgba(236, 72, 153, 0.45)" },
    genre: "Alternative R&B"
  },
  {
    id: "mck-06",
    title: "06. Yêu Anh Giết Anh",
    artist: "MCK",
    album: "HVL",
    duration: 210,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    palette: { primary: "#ef4444", secondary: "#7c3aed", accent: "#f97316", glow: "rgba(239, 68, 68, 0.45)" },
    genre: "Emo Rap"
  },
  {
    id: "mck-07",
    title: "07. Mắt Môi Tay Chân",
    artist: "MCK ft. Tage",
    album: "HVL",
    duration: 240,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf7b5b5.mp3?filename=electronic-future-beats-117997.mp3",
    palette: { primary: "#8b5cf6", secondary: "#06b6d4", accent: "#3b82f6", glow: "rgba(139, 92, 246, 0.45)" },
    genre: "Hip-Hop"
  },
  {
    id: "mck-08",
    title: "08. Đạo Của Anh Vừa",
    artist: "MCK",
    album: "HVL",
    duration: 195,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=chill-abstract-intention-12099.mp3",
    palette: { primary: "#eab308", secondary: "#ef4444", accent: "#f97316", glow: "rgba(234, 179, 8, 0.45)" },
    genre: "Trap"
  },
  {
    id: "mck-09",
    title: "09. Là Gì Của Nhau",
    artist: "MCK",
    album: "HVL",
    duration: 205,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    palette: { primary: "#3b82f6", secondary: "#ec4899", accent: "#6366f1", glow: "rgba(59, 130, 246, 0.45)" },
    genre: "R&B"
  },
  {
    id: "mck-10",
    title: "10. Night In Prague",
    artist: "MCK",
    album: "HVL",
    duration: 250,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    palette: { primary: "#6366f1", secondary: "#14b8a6", accent: "#a855f7", glow: "rgba(99, 102, 241, 0.45)" },
    genre: "Chillhop / Jazzhop"
  },
  {
    id: "mck-11",
    title: "11. Một Cái Ôm",
    artist: "MCK",
    album: "HVL",
    duration: 218,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf7b5b5.mp3?filename=electronic-future-beats-117997.mp3",
    palette: { primary: "#f43f5e", secondary: "#8b5cf6", accent: "#06b6d4", glow: "rgba(244, 63, 94, 0.45)" },
    genre: "Acoustic / Rap"
  },
  {
    id: "mck-12",
    title: "12. Liệm",
    artist: "MCK",
    album: "HVL",
    duration: 235,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=chill-abstract-intention-12099.mp3",
    palette: { primary: "#7c3aed", secondary: "#000000", accent: "#dc2626", glow: "rgba(124, 58, 237, 0.45)" },
    genre: "Dark Trap"
  },
  {
    id: "mck-13",
    title: "13. Nếu Như Ta Chẳng Còn",
    artist: "MCK ft. AAP Ướt Mi",
    album: "HVL",
    duration: 242,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    palette: { primary: "#0ea5e9", secondary: "#6366f1", accent: "#ec4899", glow: "rgba(14, 165, 233, 0.45)" },
    genre: "R&B / Soul"
  },
  {
    id: "mck-14",
    title: "14. Ai Mới Là Kẻ Xấu Xa",
    artist: "MCK",
    album: "HVL",
    duration: 212,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    palette: { primary: "#e11d48", secondary: "#f59e0b", accent: "#8b5cf6", glow: "rgba(225, 29, 72, 0.45)" },
    genre: "Hip-Hop"
  },
  {
    id: "mck-15",
    title: "15. Slippery",
    artist: "MCK ft. Tùng Dương",
    album: "HVL",
    duration: 260,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf7b5b5.mp3?filename=electronic-future-beats-117997.mp3",
    palette: { primary: "#d946ef", secondary: "#06b6d4", accent: "#f43f5e", glow: "rgba(217, 70, 239, 0.45)" },
    genre: "Art Pop / Rap"
  },
  {
    id: "mck-16",
    title: "16. Interpol",
    artist: "MCK",
    album: "HVL",
    duration: 185,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=chill-abstract-intention-12099.mp3",
    palette: { primary: "#10b981", secondary: "#3b82f6", accent: "#6366f1", glow: "rgba(16, 185, 129, 0.45)" },
    genre: "Trap"
  },
  {
    id: "mck-17",
    title: "17. Tây Thi",
    artist: "MCK",
    album: "HVL",
    duration: 210,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    palette: { primary: "#f43f5e", secondary: "#ec4899", accent: "#fbbf24", glow: "rgba(244, 63, 94, 0.45)" },
    genre: "Oriental Trap"
  },
  {
    id: "mck-18",
    title: "18. Hút và Hút",
    artist: "MCK",
    album: "HVL",
    duration: 198,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    palette: { primary: "#84cc16", secondary: "#06b6d4", accent: "#10b981", glow: "rgba(132, 204, 22, 0.45)" },
    genre: "Chillhop"
  },
  {
    id: "mck-19",
    title: "19. Dưa Chua",
    artist: "MCK",
    album: "HVL",
    duration: 204,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf7b5b5.mp3?filename=electronic-future-beats-117997.mp3",
    palette: { primary: "#eab308", secondary: "#84cc16", accent: "#f97316", glow: "rgba(234, 179, 8, 0.45)" },
    genre: "Hip-Hop"
  },
  {
    id: "mck-20",
    title: "20. Xa Xôi",
    artist: "MCK ft. Obito",
    album: "HVL",
    duration: 232,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=chill-abstract-intention-12099.mp3",
    palette: { primary: "#6366f1", secondary: "#ec4899", accent: "#06b6d4", glow: "rgba(99, 102, 241, 0.45)" },
    genre: "Melodic Rap"
  },
  {
    id: "mck-21",
    title: "21. Che Phù",
    artist: "MCK",
    album: "HVL",
    duration: 190,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    palette: { primary: "#a855f7", secondary: "#f43f5e", accent: "#3b82f6", glow: "rgba(168, 85, 247, 0.45)" },
    genre: "Hip-Hop"
  },
  {
    id: "mck-22",
    title: "22. Oanh M - Thuoc",
    artist: "MCK",
    album: "HVL",
    duration: 215,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    palette: { primary: "#06b6d4", secondary: "#6366f1", accent: "#10b981", glow: "rgba(6, 182, 212, 0.45)" },
    genre: "Trap"
  },
  {
    id: "mck-23",
    title: "23. Ghét Xog Lại Thik",
    artist: "MCK",
    album: "HVL",
    duration: 188,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf7b5b5.mp3?filename=electronic-future-beats-117997.mp3",
    palette: { primary: "#ec4899", secondary: "#f43f5e", accent: "#fb923c", glow: "rgba(236, 72, 153, 0.45)" },
    genre: "Pop Rap"
  },
  {
    id: "mck-24",
    title: "24. Nhìn Kẻ Thù Của Tao",
    artist: "MCK",
    album: "HVL",
    duration: 220,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=chill-abstract-intention-12099.mp3",
    palette: { primary: "#dc2626", secondary: "#7c3aed", accent: "#000000", glow: "rgba(220, 38, 38, 0.45)" },
    genre: "Hardcore Trap"
  },
  {
    id: "mck-25",
    title: "25. Envy",
    artist: "MCK ft. THANHDRAW",
    album: "HVL",
    duration: 230,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    palette: { primary: "#10b981", secondary: "#f59e0b", accent: "#ef4444", glow: "rgba(16, 185, 129, 0.45)" },
    genre: "Trap"
  },
  {
    id: "mck-26",
    title: "26. Cảm Ơn",
    artist: "MCK",
    album: "HVL",
    duration: 245,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    palette: { primary: "#3b82f6", secondary: "#8b5cf6", accent: "#ec4899", glow: "rgba(59, 130, 246, 0.45)" },
    genre: "Melodic Rap"
  },
  {
    id: "mck-27",
    title: "27. Không Cần Lo Cho Tao",
    artist: "MCK",
    album: "HVL",
    duration: 215,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf7b5b5.mp3?filename=electronic-future-beats-117997.mp3",
    palette: { primary: "#f97316", secondary: "#6366f1", accent: "#06b6d4", glow: "rgba(249, 115, 22, 0.45)" },
    genre: "Hip-Hop"
  },
  {
    id: "mck-28",
    title: "28. Huh",
    artist: "MCK ft. RPT Orijinn & THANHDRAW",
    album: "HVL",
    duration: 255,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=chill-abstract-intention-12099.mp3",
    palette: { primary: "#8b5cf6", secondary: "#ef4444", accent: "#eab308", glow: "rgba(139, 92, 246, 0.45)" },
    genre: "Drill / Trap"
  },
  {
    id: "mck-29",
    title: "29. Nguyễn Văn Mười",
    artist: "MCK",
    album: "HVL",
    duration: 220,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    palette: { primary: "#14b8a6", secondary: "#f43f5e", accent: "#6366f1", glow: "rgba(20, 184, 166, 0.45)" },
    genre: "Hip-Hop"
  },
  {
    id: "mck-30",
    title: "30. Thịt Lợn",
    artist: "MCK",
    album: "HVL",
    duration: 210,
    coverUrl: HVL_COVER,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    palette: { primary: "#ec4899", secondary: "#f97316", accent: "#8b5cf6", glow: "rgba(236, 72, 153, 0.45)" },
    genre: "Trap"
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
