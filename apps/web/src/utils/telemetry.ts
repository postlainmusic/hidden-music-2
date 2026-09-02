// Client Telemetry & Global Bug Watchdog Service for Hidden Music
// Captures device metadata, user interactions, and translates technical errors into clear Vietnamese logs.

const API_BASE = "https://hidden-music-api.postlain-music.workers.dev";

export interface DeviceInfo {
  os: string;
  browser: string;
  device: "Mobile" | "Tablet" | "Desktop";
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  language: string;
  connectionType?: string;
}

export function getDeviceInfo(): DeviceInfo {
  if (typeof window === "undefined") {
    return {
      os: "Unknown",
      browser: "Unknown",
      device: "Desktop",
      screenWidth: 1920,
      screenHeight: 1080,
      pixelRatio: 1,
      language: "vi-VN"
    };
  }

  const ua = navigator.userAgent || "";
  let os = "Windows";
  if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  else if (/Windows NT/i.test(ua)) os = "Windows";

  let browser = "Chrome";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";

  const width = window.innerWidth || window.screen?.width || 1280;
  const height = window.innerHeight || window.screen?.height || 720;
  
  let device: "Mobile" | "Tablet" | "Desktop" = "Desktop";
  if (width < 768 || /Mobi|Android/i.test(ua)) device = "Mobile";
  else if (width <= 1024) device = "Tablet";

  const conn = (navigator as any).connection;
  const connectionType = conn ? `${conn.effectiveType || conn.type || ""}` : undefined;

  return {
    os,
    browser,
    device,
    screenWidth: width,
    screenHeight: height,
    pixelRatio: window.devicePixelRatio || 1,
    language: navigator.language || "vi-VN",
    connectionType
  };
}

export interface TelemetryPayload {
  eventType: "login" | "play_track" | "favorite" | "admin_action" | "client_error" | "api_error" | "client_event";
  titleVi: string;
  details?: Record<string, any>;
  severity?: "info" | "warning" | "error";
  userEmail?: string;
  userId?: string;
}

// In-memory queue to prevent duplicate logging of identical error cascades
const recentErrors = new Set<string>();

export async function sendTelemetryLog(payload: TelemetryPayload): Promise<void> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("vault_token") : null;
    const deviceInfo = getDeviceInfo();

    const fullDetails = {
      ...deviceInfo,
      url: typeof window !== "undefined" ? window.location.href : "",
      timestamp: new Date().toISOString(),
      ...(payload.details || {})
    };

    // Deduplicate identical errors within 10s
    if (payload.severity === "error") {
      const errKey = `${payload.titleVi}_${JSON.stringify(payload.details || {})}`;
      if (recentErrors.has(errKey)) return;
      recentErrors.add(errKey);
      setTimeout(() => recentErrors.delete(errKey), 10000);
    }

    await fetch(`${API_BASE}/api/telemetry/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        event_type: payload.eventType,
        title_vi: payload.titleVi,
        details: fullDetails,
        severity: payload.severity || "info",
        user_email: payload.userEmail,
        user_id: payload.userId
      })
    }).catch(() => {});
  } catch {
    // Silent fail so telemetry never disrupts user experience
  }
}

// ── Global Error Watchdog Setup ──
let watchdogInitialized = false;

export function initErrorWatchdog() {
  if (typeof window === "undefined" || watchdogInitialized) return;
  watchdogInitialized = true;

  // 1. Uncaught JS Runtime Exceptions
  window.addEventListener("error", (event) => {
    // Filter noise like cross-origin script or adblockers
    if (!event.message || event.message.includes("ResizeObserver")) return;

    let friendlyVi = "🚨 Lỗi ứng dụng web (JavaScript Runtime)";
    if (event.message.includes("network") || event.message.includes("fetch")) {
      friendlyVi = "🚨 Lỗi kết nối mạng: Không thể tải dữ liệu từ máy chủ";
    } else if (event.message.includes("Audio") || event.message.includes("play")) {
      friendlyVi = "🚨 Lỗi phát âm thanh: Trình duyệt chặn tự động phát hoặc mất kết nối file FLAC";
    }

    sendTelemetryLog({
      eventType: "client_error",
      titleVi: `${friendlyVi}: ${event.message.slice(0, 100)}`,
      severity: "error",
      details: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack ? event.error.stack.slice(0, 500) : undefined
      }
    });
  });

  // 2. Unhandled Promise Rejections
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const msg = typeof reason === "string" ? reason : reason?.message || "Promise rejection";
    if (msg.includes("AbortError") || msg.includes("ResizeObserver")) return;

    sendTelemetryLog({
      eventType: "client_error",
      titleVi: `🚨 Lỗi bất đồng bộ: ${msg.slice(0, 100)}`,
      severity: "error",
      details: {
        reason: msg,
        stack: reason?.stack ? reason.stack.slice(0, 500) : undefined
      }
    });
  });
}

import * as self from "./telemetry";

// Helper Loggers
export function logPlayTrack(trackTitle: string, artist: string, format = "Lossless FLAC") {
  const device = getDeviceInfo();
  self.sendTelemetryLog({
    eventType: "play_track",
    titleVi: `🎵 Bắt đầu phát: "${trackTitle}" (${artist}) [${format}] trên ${device.device} (${device.os})`,
    severity: "info",
    details: { trackTitle, artist, format }
  });
}

export function logFavorite(trackTitle: string, isFavorited: boolean) {
  self.sendTelemetryLog({
    eventType: "favorite",
    titleVi: isFavorited
      ? `❤️ Đã thả tim yêu thích bài hát: "${trackTitle}"`
      : `💔 Đã bỏ tim bài hát: "${trackTitle}"`,
    severity: "info",
    details: { trackTitle, isFavorited }
  });
}

export function logAdminAction(actionDescription: string, details?: any) {
  self.sendTelemetryLog({
    eventType: "admin_action",
    titleVi: `⚙️ Thao tác Quản trị: ${actionDescription}`,
    severity: "info",
    details
  });
}
