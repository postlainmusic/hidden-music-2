import React, { useEffect, useRef, useState, useMemo } from "react";
import { Mic2, Music2 } from "lucide-react";
import { useAudioStore } from "../store/audioStore";
import { dualDeckAudioEngine } from "../audio/DualDeckAudioEngine";

export interface LyricLine {
  time: number;
  text: string;
}

export function parseLrc(lrcText: string): LyricLine[] {
  if (!lrcText) return [];
  const lines = lrcText.split(/\r?\n/);
  const result: LyricLine[] = [];
  const timestampRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const line of lines) {
    if (/^\[(video_offset|music_start|ar|ti|al|by|offset):/i.test(line.trim())) {
      continue;
    }
    const matches = Array.from(line.matchAll(timestampRegex));
    if (matches.length > 0) {
      const text = line.replace(timestampRegex, "").trim();
      for (const match of matches) {
        const mins = parseInt(match[1], 10);
        const secs = parseInt(match[2], 10);
        let ms = 0;
        if (match[3]) {
          const rawMs = match[3];
          ms = parseInt(rawMs.length === 2 ? `${rawMs}0` : rawMs, 10);
        }
        const time = mins * 60 + secs + ms / 1000;
        result.push({ time, text: text || "♪" });
      }
    } else if (!matches.length && line.trim() && !line.trim().startsWith("[")) {
      result.push({ time: -1, text: line.trim() });
    }
  }

  const hasTimestamps = result.some((r) => r.time >= 0);
  if (hasTimestamps) {
    return result.filter((r) => r.time >= 0).sort((a, b) => a.time - b.time);
  }
  return result;
}

interface SyncedLyricsViewProps {
  onSeek?: (time: number) => void;
  className?: string;
}

export const SyncedLyricsView: React.FC<SyncedLyricsViewProps> = ({ onSeek, className = "" }) => {
  const { currentTrack, isPlaying } = useAudioStore();
  const [lrcContent, setLrcContent] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const isUserScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<any>(null);

  // Default lyrics generator for tracks
  useEffect(() => {
    if (!currentTrack) {
      setLrcContent("");
      return;
    }

    const defaultLyrics = `[00:00.00] ♪ ${currentTrack.title} - ${currentTrack.artist}\n[00:04.50] Hidden Music Lossless Audio Experience\n[00:12.00] Master Quality M4A High-Fidelity\n[00:24.00] ♪ [Giai điệu Master không nén] ♪\n[00:45.00] ♪ [Drop & Kick Bass Roll] ♪`;
    setLrcContent(defaultLyrics);
  }, [currentTrack]);

  const parsedLyrics = useMemo(() => parseLrc(lrcContent), [lrcContent]);
  const isSynced = useMemo(() => parsedLyrics.some((l) => l.time >= 0), [parsedLyrics]);

  // High-frequency subscription to track progress for real-time line highlighting
  useEffect(() => {
    let lastActive = -1;

    const unsubscribe = dualDeckAudioEngine.subscribeProgress((state) => {
      if (!isSynced || parsedLyrics.length === 0) return;

      let idx = -1;
      for (let i = parsedLyrics.length - 1; i >= 0; i--) {
        if (state.currentTime >= parsedLyrics[i].time - 0.25) {
          idx = i;
          break;
        }
      }

      if (idx !== lastActive) {
        lastActive = idx;
        setActiveIndex(idx);
      }
    });

    return () => unsubscribe();
  }, [parsedLyrics, isSynced]);

  // Auto-scroll to active line
  useEffect(() => {
    if (activeIndex >= 0 && !isUserScrollingRef.current && lineRefs.current[activeIndex] && containerRef.current) {
      const lineEl = lineRefs.current[activeIndex];
      const container = containerRef.current;
      if (lineEl) {
        const topPos = lineEl.offsetTop - container.clientHeight / 2 + lineEl.clientHeight / 2;
        container.scrollTo({ top: Math.max(0, topPos), behavior: "smooth" });
      }
    }
  }, [activeIndex]);

  const handleContainerScroll = () => {
    isUserScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 2500);
  };

  const handleLineClick = (time: number) => {
    if (time >= 0 && onSeek) {
      onSeek(time);
      isUserScrollingRef.current = false;
    }
  };

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12">
        <Mic2 size={36} className="mb-2 opacity-40" />
        <p className="text-sm">Chưa có bài hát nào được chọn</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleContainerScroll}
      className={`h-full overflow-y-auto px-6 py-6 scroll-smooth ${className}`}
      style={{ maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)" }}
    >
      <div className="flex flex-col items-center space-y-4 max-w-xl mx-auto py-10">
        {parsedLyrics.length > 0 ? (
          parsedLyrics.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPast = idx < activeIndex;

            return (
              <p
                key={idx}
                ref={(el) => { lineRefs.current[idx] = el; }}
                onClick={() => handleLineClick(line.time)}
                className={`text-center transition-all duration-300 select-none ${
                  line.time >= 0 ? "cursor-pointer hover:text-white" : ""
                } ${
                  isActive
                    ? "text-xl md:text-2xl font-bold text-white scale-105 drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                    : isPast
                    ? "text-base md:text-lg text-slate-400 opacity-60 font-medium"
                    : "text-base md:text-lg text-slate-500 opacity-40 font-normal"
                }`}
                style={{
                  color: isActive ? currentTrack.palette?.primary || "#ffffff" : undefined,
                  transform: isActive ? "scale(1.05)" : "scale(1.0)"
                }}
              >
                {line.text}
              </p>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 py-12">
            <Music2 size={32} className="mb-3 opacity-50" />
            <p className="text-sm font-medium">Đang đồng bộ lời bài hát chất lượng cao...</p>
          </div>
        )}
      </div>
    </div>
  );
};
