import React, { useEffect, useRef, useState, useMemo } from "react";
import { Mic2, Music2 } from "lucide-react";
import { useAudioStore } from "../store/audioStore";
import { dualDeckAudioEngine } from "../audio/DualDeckAudioEngine";
import { LRC_VAULT } from "../lyrics/lrcVault";

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
  const { currentTrack } = useAudioStore();
  const [lrcContent, setLrcContent] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const isUserScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<any>(null);

  // Load Real Synchronized Lyrics (0ms Instant Vault with R2 CDN Fallback)
  useEffect(() => {
    if (!currentTrack) {
      setLrcContent("");
      return;
    }

    const trackTitle = currentTrack.title || "";
    const trackId = currentTrack.id || "";
    const trackNum = trackTitle.match(/^(\d+)/)?.[1] || trackId.replace(/\D/g, "");

    // 1. Check bundled LRC_VAULT
    let foundLrc =
      LRC_VAULT[trackTitle] ||
      LRC_VAULT[trackNum] ||
      LRC_VAULT[trackNum.padStart(2, "0")] ||
      Object.entries(LRC_VAULT).find(([k]) => k.toLowerCase().includes(trackTitle.toLowerCase()))?.[1];

    if (foundLrc) {
      setLrcContent(foundLrc);
      return;
    }

    // 2. Fetch from Cloudflare R2
    const enc = encodeURIComponent(trackTitle) + ".lrc";
    fetch(`https://media.postlain.com/lyrics/${enc}`)
      .then((res) => {
        if (res.ok) return res.text();
        throw new Error("404");
      })
      .then((text) => setLrcContent(text))
      .catch(() => {
        setLrcContent(
          `[00:00.00] ♪ ${currentTrack.title} - ${currentTrack.artist}\n[00:04.50] Hidden Music Lossless Audio Experience\n[00:10.00] Master Quality M4A High-Fidelity`
        );
      });
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
        if (state.currentTime >= parsedLyrics[i].time - 0.20) {
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
    }, 2800);
  };

  const handleLineClick = (time: number) => {
    if (time >= 0 && onSeek) {
      onSeek(time);
      isUserScrollingRef.current = false;
    }
  };

  if (!currentTrack) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "rgba(255, 255, 255, 0.4)",
          padding: "48px 0",
        }}
      >
        <Mic2 size={32} style={{ marginBottom: "12px", opacity: 0.3 }} />
        <p style={{ fontSize: "0.85rem" }}>Chưa có bài hát nào được chọn</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleContainerScroll}
      className={className}
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "20px 24px",
        scrollBehavior: "smooth",
        background: "transparent",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "14px",
          maxWidth: "640px",
          margin: "0 auto",
          padding: "30px 0",
        }}
      >
        {parsedLyrics.length > 0 ? (
          parsedLyrics.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPast = idx < activeIndex;

            return (
              <p
                key={idx}
                ref={(el) => {
                  lineRefs.current[idx] = el;
                }}
                onClick={() => handleLineClick(line.time)}
                style={{
                  fontSize: "1.05rem", // Consistent, elegant readable size
                  fontWeight: isActive ? 700 : 500,
                  textAlign: "center",
                  lineHeight: 1.45,
                  cursor: line.time >= 0 ? "pointer" : "default",
                  color: isActive
                    ? "#ffffff"
                    : isPast
                    ? "rgba(255, 255, 255, 0.50)"
                    : "rgba(255, 255, 255, 0.25)",
                  transition: "color 0.2s ease, opacity 0.2s ease, text-shadow 0.2s ease",
                  textShadow: isActive
                    ? "0 0 16px rgba(239, 68, 68, 0.7), 0 0 30px rgba(239, 68, 68, 0.35)"
                    : "none",
                  userSelect: "none",
                  margin: 0,
                  padding: "3px 12px",
                  borderRadius: "6px",
                  maxWidth: "100%",
                  wordBreak: "break-word",
                }}
                onMouseEnter={(e) => {
                  if (!isActive && line.time >= 0) {
                    (e.currentTarget as HTMLElement).style.color = "rgba(255, 255, 255, 0.85)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive && line.time >= 0) {
                    (e.currentTarget as HTMLElement).style.color = isPast
                      ? "rgba(255, 255, 255, 0.50)"
                      : "rgba(255, 255, 255, 0.25)";
                  }
                }}
              >
                {line.text}
              </p>
            );
          })
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 0",
              color: "rgba(255, 255, 255, 0.4)",
            }}
          >
            <Music2 size={28} style={{ marginBottom: "8px", opacity: 0.3 }} />
            <p style={{ fontSize: "0.85rem" }}>Không tìm thấy lời bài hát</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncedLyricsView;
