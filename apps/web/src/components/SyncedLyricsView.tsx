import React, { useEffect, useRef, useState, useMemo } from "react";
import { Mic2, Music2 } from "lucide-react";
import { useAudioStore } from "../store/audioStore";

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
  const { currentTrack, currentTime, isPlaying } = useAudioStore();
  const [lrcContent, setLrcContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const isUserScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Graceful LRC lyrics parser
  useEffect(() => {
    if (!currentTrack) {
      setLrcContent("");
      return;
    }

    // Default synchronized aesthetic preview
    const defaultLyrics = `[00:00.00] ♪ ${currentTrack.title} - ${currentTrack.artist}\n[00:04.50] Hidden Music Lossless Vault Experience\n[00:12.00] 24-bit / 96kHz High Fidelity Audio Master\n[00:24.00] ♪ [Giai điệu Master FLAC không nén] ♪\n[00:45.00] ♪ [Drop & Kick Bass Roll] ♪`;
    setLrcContent(defaultLyrics);
    setLoading(false);
  }, [currentTrack]);

  const parsedLyrics = useMemo(() => parseLrc(lrcContent), [lrcContent]);
  const isSynced = useMemo(() => parsedLyrics.some((l) => l.time >= 0), [parsedLyrics]);

  // Find active line index
  const activeIndex = useMemo(() => {
    if (!isSynced || parsedLyrics.length === 0) return -1;
    let idx = -1;
    for (let i = parsedLyrics.length - 1; i >= 0; i--) {
      if (currentTime >= parsedLyrics[i].time - 0.25) {
        idx = i;
        break;
      }
    }
    return idx;
  }, [parsedLyrics, currentTime, isSynced]);

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

  const handleScroll = () => {
    isUserScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 2500);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        padding: "16px 12px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        scrollbarWidth: "none",
        textAlign: "center"
      }}
    >
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(255, 255, 255, 0.5)", gap: "8px" }}>
          <Mic2 size={16} className="animate-pulse" />
          <span style={{ fontSize: "0.85rem" }}>Đang đồng bộ lời bài hát...</span>
        </div>
      ) : parsedLyrics.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(255, 255, 255, 0.4)" }}>
          <Music2 size={24} style={{ marginBottom: "8px", opacity: 0.5 }} />
          <p style={{ fontSize: "0.88rem", fontWeight: 600 }}>Chưa có lời đồng bộ cho bài hát này</p>
          <p style={{ fontSize: "0.74rem", opacity: 0.6, marginTop: "4px" }}>Thưởng thức bản phối Master 24-bit Lossless</p>
        </div>
      ) : (
        parsedLyrics.map((line, idx) => {
          const isActive = idx === activeIndex;
          const isPassed = activeIndex > idx;

          return (
            <p
              key={idx}
              ref={(el) => { lineRefs.current[idx] = el; }}
              onClick={() => {
                if (line.time >= 0 && onSeek) {
                  onSeek(line.time);
                }
              }}
              style={{
                fontSize: isActive ? "1.08rem" : "0.90rem",
                fontWeight: isActive ? 800 : 500,
                color: isActive ? "#ffffff" : isPassed ? "rgba(255, 255, 255, 0.38)" : "rgba(255, 255, 255, 0.65)",
                textShadow: isActive ? `0 0 20px ${currentTrack?.palette?.primary || "#6366f1"}, 0 0 35px rgba(255, 255, 255, 0.6)` : "none",
                transform: isActive ? "scale(1.05)" : "scale(1)",
                transition: "all 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
                cursor: line.time >= 0 ? "pointer" : "default",
                padding: "4px 8px",
                borderRadius: "8px",
                lineHeight: 1.5
              }}
            >
              {line.text}
            </p>
          );
        })
      )}
    </div>
  );
};
