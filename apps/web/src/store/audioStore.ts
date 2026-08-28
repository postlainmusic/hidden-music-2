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
  videoUrl?: string;
  palette: TrackPalette;
  genre: string;
}

const R2_BASE = "https://hidden-music-api.postlain-music.workers.dev/api/stream";
const HVL_COVER = `${R2_BASE}/covers/HVL_Album_Cover.jpg`;

export const DEFAULT_TRACKS: Track[] = [
  {
    id: "mck-01",
    title: "01. Elegie",
    artist: "MCK",
    album: "HVL",
    duration: 198,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/01.%20Elegie.flac`,
    videoUrl: `${R2_BASE}/videos/01.%20Elegie%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/02.%20IDK.flac`,
    videoUrl: `${R2_BASE}/videos/02.%20IDK%20-%20MCK%20(Official%20Music%20Video).mkv`,
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
    audioUrl: `${R2_BASE}/audio/03.%20Wtf%20Bby%20I_m%20Lit.flac`,
    videoUrl: `${R2_BASE}/videos/03.%20Wtf%20Bby%20I'm%20Lit%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/04.%20Anh%20Kh%C3%B4ng%20Mu%E1%BB%91n%20N%C3%B3%20D%E1%BB%85%20D%C3%A0ng.flac`,
    videoUrl: `${R2_BASE}/videos/04.%20Anh%20Kh%C3%B4ng%20Mu%E1%BB%91n%20N%C3%B3%20D%E1%BB%85%20D%C3%A0ng%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/05.%20Baby%20(feat.%20marzuz).flac`,
    videoUrl: `${R2_BASE}/videos/05.%20Baby%20-%20MCK%20ft.%20marzuz.mkv`,
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
    audioUrl: `${R2_BASE}/audio/06.%20Y%C3%AAu%20Anh%20Gi%E1%BA%BFt%20Anh.flac`,
    videoUrl: `${R2_BASE}/videos/06.%20Y%C3%AAu%20Anh%20Gi%E1%BA%BFt%20Anh%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/07.%20M%E1%BA%AFt%20M%C3%B4i%20Tay%20Ch%C3%A2n%20(feat.%20Tage).flac`,
    videoUrl: `${R2_BASE}/videos/07.%20M%E1%BA%AFt%20M%C3%B4i%20Tay%20Ch%C3%A2n%20-%20MCK%20ft.%20Tage%20(Official%20Music%20Video).mkv`,
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
    audioUrl: `${R2_BASE}/audio/08.%20%C4%90%E1%BA%A1o%20C%E1%BB%A7a%20Anh%20V%E1%BB%ABa.flac`,
    videoUrl: `${R2_BASE}/videos/08.%20%C4%90%E1%BA%A1o%20C%E1%BB%A7a%20Anh%20V%E1%BB%ABa%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/09.%20L%C3%A0%20G%C3%AC%20C%E1%BB%A7a%20Nhau.flac`,
    videoUrl: `${R2_BASE}/videos/09.%20L%C3%A0%20G%C3%AC%20C%E1%BB%A7a%20Nhau%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/10.%20Night%20In%20Prague.flac`,
    videoUrl: `${R2_BASE}/videos/10.%20Night%20In%20Prague%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/11.%20M%E1%BB%99t%20C%C3%A1i%20%C3%94m.flac`,
    videoUrl: `${R2_BASE}/videos/11.%20M%E1%BB%99t%20C%C3%A1i%20%C3%94m%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/12.%20Li%E1%BB%87m.flac`,
    videoUrl: `${R2_BASE}/videos/12.%20Li%E1%BB%87m%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/13.%20N%E1%BA%BFu%20Nh%C6%B0%20Ta%20Ch%E1%BA%B3ng%20C%C3%B2n%20(feat.%20AAP%20%C6%AF%E1%BB%9Bt%20Mi).flac`,
    videoUrl: `${R2_BASE}/videos/13.%20N%E1%BA%BFu%20Nh%C6%B0%20Ta%20Ch%E1%BA%B3ng%20C%C3%B2n%20-%20MCK%20ft.%20AAP%20%C6%AF%E1%BB%9Bt%20Mi.mkv`,
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
    audioUrl: `${R2_BASE}/audio/14.%20Ai%20M%E1%BB%9Bi%20L%C3%A0%20K%E1%BA%BB%20X%E1%BA%A5u%20Xa.flac`,
    videoUrl: `${R2_BASE}/videos/14.%20Ai%20M%E1%BB%9Bi%20L%C3%A0%20K%E1%BA%BB%20X%E1%BA%A5u%20Xa%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/15.%20Slippery%20(feat.%20T%C3%B9ng%20D%C6%B0%C6%A1ng).flac`,
    videoUrl: `${R2_BASE}/videos/15.%20Slippery%20-%20MCK%20ft.%20T%C3%B9ng%20D%C6%B0%C6%A1ng%20(Official%20Music%20Video).mkv`,
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
    audioUrl: `${R2_BASE}/audio/16.%20Intenpol.flac`,
    videoUrl: `${R2_BASE}/videos/16.%20Intenpol%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/17.%20T%C3%A2y%20Thi.flac`,
    videoUrl: `${R2_BASE}/videos/17.%20T%C3%A2y%20Thi%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/18.%20H%C3%BAt%20v%C3%A0%20H%C3%BAt.flac`,
    videoUrl: `${R2_BASE}/videos/18.%20H%C3%BAt%20v%C3%A0%20H%C3%BAt%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/19.%20D%C6%B0a%20Chua.flac`,
    videoUrl: `${R2_BASE}/videos/19.%20D%C6%B0a%20Chua%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/20.%20Xa%20X%C3%B4i%20(feat.%20Obito).flac`,
    videoUrl: `${R2_BASE}/videos/20.%20Xa%20X%C3%B4i%20-%20MCK%20ft.%20Obito%20(Official%20Music%20Video).mkv`,
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
    audioUrl: `${R2_BASE}/audio/21.%20Che%20Ph%C3%B9.flac`,
    videoUrl: `${R2_BASE}/videos/21.%20Che%20Ph%C3%B9%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/22.%20Oanh%20M%20-%20Thuoc.flac`,
    videoUrl: `${R2_BASE}/videos/22.%20Oanh%20M%20-%20Thuoc%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/23.%20Gh%C3%A9t%20Xog%20L%E1%BA%A1i%20Thik.flac`,
    videoUrl: `${R2_BASE}/videos/23.%20Gh%C3%A9t%20Xog%20L%E1%BA%A1i%20Thik%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/24.%20Nh%C3%ACn%20K%E1%BA%BB%20Th%C3%B9%20C%E1%BB%A7a%20Tao.flac`,
    videoUrl: `${R2_BASE}/videos/24.%20Nh%C3%ACn%20K%E1%BA%BB%20Th%C3%B9%20C%E1%BB%A7a%20Tao%20-%20MCK%20(Official%20Music%20Video).mkv`,
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
    audioUrl: `${R2_BASE}/audio/25.%20Envy%20(feat.%20THANHDRAW).flac`,
    videoUrl: `${R2_BASE}/videos/25.%20Envy%20-%20MCK%20ft.%20THANHDRAW.mkv`,
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
    audioUrl: `${R2_BASE}/audio/26.%20C%E1%BA%A3m%20%C6%A0n.flac`,
    videoUrl: `${R2_BASE}/videos/26.%20C%E1%BA%A3m%20%C6%A0n%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/27.%20Kh%C3%B4ng%20C%E1%BA%A7n%20Lo%20Cho%20Tao.flac`,
    videoUrl: `${R2_BASE}/videos/27.%20Kh%C3%B4ng%20C%E1%BA%A7n%20Lo%20Cho%20Tao%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/28.%20Huh%20(feat.%20RPT%20Orijinn%20%26%20THANHDRAW).flac`,
    videoUrl: `${R2_BASE}/videos/28.%20Huh%20-%20MCK%20ft.%20RPT%20ORIJINN%20%26%20THANHDRAW.mkv`,
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
    audioUrl: `${R2_BASE}/audio/29.%20Nguy%E1%BB%85n%20V%C4%83n%20M%C6%B0%E1%BB%9Di.flac`,
    videoUrl: `${R2_BASE}/videos/29.%20Nguy%E1%BB%85n%20V%C4%83n%20M%C6%B0%E1%BB%9Di%20-%20MCK.mkv`,
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
    audioUrl: `${R2_BASE}/audio/30.%20Th%E1%BB%8Bt%20L%E1%BB%A3n.flac`,
    videoUrl: `${R2_BASE}/videos/30.%20Th%E1%BB%8Bt%20L%E1%BB%A3n%20-%20MCK.mkv`,
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

    audioElement.addEventListener("playing", () => {
      set({ isPlaying: true });
    });

    audioElement.addEventListener("pause", () => {
      set({ isPlaying: false });
    });

    audioElement.addEventListener("ended", () => {
      get().nextTrack();
    });

    // Update initial theme
    updateCssTheme(DEFAULT_TRACKS[0].palette);
  },

  playTrack: async (track: Track) => {
    if (!audioElement) {
      get().initAudioEngine();
    }

    if (!audioContext && typeof window !== "undefined") {
      try {
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
      } catch (err) {
        console.warn("Web Audio Graph initialization fallback:", err);
      }
    }

    if (audioContext && audioContext.state === "suspended") {
      await audioContext.resume().catch(() => {});
    }

    if (audioElement) {
      if (audioElement.src !== track.audioUrl) {
        audioElement.src = track.audioUrl;
        audioElement.load();
      }
      audioElement.currentTime = 0;
      audioElement.play().catch((e) => {
        console.warn("Audio playback deferred or interrupted:", e);
      });
    }

    updateCssTheme(track.palette);

    set({
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
      duration: track.duration
    });
  },

  togglePlay: async () => {
    const { isPlaying, currentTrack, initAudioEngine, playTrack } = get();

    if (!audioElement) {
      initAudioEngine();
    }

    if (!currentTrack && DEFAULT_TRACKS.length > 0) {
      playTrack(DEFAULT_TRACKS[0]);
      return;
    }

    if (audioContext && audioContext.state === "suspended") {
      await audioContext.resume().catch(() => {});
    }

    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        set({ isPlaying: false });
      } else {
        audioElement.play().catch((e) => console.warn("Audio play error:", e));
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
