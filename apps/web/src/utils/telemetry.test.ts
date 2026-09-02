import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as telemetry from "./telemetry";

describe("logPlayTrack", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "ok" }),
    } as Response);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should spy on sendTelemetryLog and validate payload when logPlayTrack is called with default format", async () => {
    const sendSpy = vi.spyOn(telemetry, "sendTelemetryLog");

    telemetry.logPlayTrack("Hoa Sữa", "Hồng Đăng");

    expect(sendSpy).toHaveBeenCalledTimes(1);
    const payload = sendSpy.mock.calls[0][0];

    expect(payload.eventType).toBe("play_track");
    expect(payload.severity).toBe("info");
    expect(payload.details).toEqual({
      trackTitle: "Hoa Sữa",
      artist: "Hồng Đăng",
      format: "Lossless FLAC",
    });
    expect(payload.titleVi).toContain('🎵 Bắt đầu phát: "Hoa Sữa" (Hồng Đăng) [Lossless FLAC] trên');
  });

  it("should spy on sendTelemetryLog and validate payload when logPlayTrack is called with a custom format", async () => {
    const sendSpy = vi.spyOn(telemetry, "sendTelemetryLog");

    telemetry.logPlayTrack("Hà Nội Ngày Trở Về", "Phú Quang", "Hi-Res FLAC");

    expect(sendSpy).toHaveBeenCalledTimes(1);
    const payload = sendSpy.mock.calls[0][0];

    expect(payload.eventType).toBe("play_track");
    expect(payload.severity).toBe("info");
    expect(payload.details).toEqual({
      trackTitle: "Hà Nội Ngày Trở Về",
      artist: "Phú Quang",
      format: "Hi-Res FLAC",
    });
    expect(payload.titleVi).toContain('🎵 Bắt đầu phát: "Hà Nội Ngày Trở Về" (Phú Quang) [Hi-Res FLAC] trên');
  });

  it("should make HTTP POST request via fetch when logPlayTrack triggers sendTelemetryLog", async () => {
    telemetry.logPlayTrack("Nhớ Mùa Thu Hà Nội", "Trịnh Công Sơn", "Lossless FLAC");

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (globalThis.fetch as any).mock.calls[0];

    expect(url).toBe("https://hidden-music-api.postlain-music.workers.dev/api/telemetry/log");
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");

    const body = JSON.parse(options.body);
    expect(body.event_type).toBe("play_track");
    expect(body.severity).toBe("info");
    expect(body.details.trackTitle).toBe("Nhớ Mùa Thu Hà Nội");
    expect(body.details.artist).toBe("Trịnh Công Sơn");
    expect(body.details.format).toBe("Lossless FLAC");
  });
});

describe("getDeviceInfo & Environment Formatting in logPlayTrack", () => {
  const originalNavigator = globalThis.navigator;
  const originalWindow = globalThis.window;

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "window", {
      value: originalWindow,
      writable: true,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it("should format titleVi for Mobile (iOS)", () => {
    const sendSpy = vi.spyOn(telemetry, "sendTelemetryLog");

    Object.defineProperty(globalThis, "navigator", {
      value: {
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
        language: "vi-VN",
      },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "window", {
      value: {
        innerWidth: 390,
        innerHeight: 844,
        devicePixelRatio: 3,
        location: { href: "http://localhost/" },
      },
      writable: true,
      configurable: true,
    });

    telemetry.logPlayTrack("Cát Bụi", "Trịnh Công Sơn");

    expect(sendSpy).toHaveBeenCalledTimes(1);
    const payload = sendSpy.mock.calls[0][0];
    expect(payload.titleVi).toContain("trên Mobile (iOS)");
  });

  it("should format titleVi for Tablet (iOS)", () => {
    const sendSpy = vi.spyOn(telemetry, "sendTelemetryLog");

    Object.defineProperty(globalThis, "navigator", {
      value: {
        userAgent: "Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)",
        language: "en-US",
      },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "window", {
      value: {
        innerWidth: 834,
        innerHeight: 1194,
        devicePixelRatio: 2,
        location: { href: "http://localhost/" },
      },
      writable: true,
      configurable: true,
    });

    telemetry.logPlayTrack("Diễm Xưa", "Trịnh Công Sơn");

    expect(sendSpy).toHaveBeenCalledTimes(1);
    const payload = sendSpy.mock.calls[0][0];
    expect(payload.titleVi).toContain("trên Tablet (iOS)");
  });

  it("should format titleVi for Desktop (macOS)", () => {
    const sendSpy = vi.spyOn(telemetry, "sendTelemetryLog");

    Object.defineProperty(globalThis, "navigator", {
      value: {
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        language: "vi-VN",
      },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "window", {
      value: {
        innerWidth: 1440,
        innerHeight: 900,
        devicePixelRatio: 2,
        location: { href: "http://localhost/" },
      },
      writable: true,
      configurable: true,
    });

    telemetry.logPlayTrack("Biển Nhớ", "Trịnh Công Sơn");

    expect(sendSpy).toHaveBeenCalledTimes(1);
    const payload = sendSpy.mock.calls[0][0];
    expect(payload.titleVi).toContain("trên Desktop (macOS)");
  });

  it("should handle SSR / window undefined environment gracefully", () => {
    const sendSpy = vi.spyOn(telemetry, "sendTelemetryLog");

    Object.defineProperty(globalThis, "window", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const info = telemetry.getDeviceInfo();
    expect(info.os).toBe("Unknown");
    expect(info.browser).toBe("Unknown");
    expect(info.device).toBe("Desktop");

    telemetry.logPlayTrack("Hạ Trắng", "Trịnh Công Sơn");

    expect(sendSpy).toHaveBeenCalledTimes(1);
    const payload = sendSpy.mock.calls[0][0];
    expect(payload.titleVi).toContain("trên Desktop (Unknown)");
  });
});

describe("logFavorite, logAdminAction & sendTelemetryLog internal behaviors", () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "ok" }),
    } as Response);
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "window", {
      value: originalWindow,
      writable: true,
      configurable: true,
    });
    delete (globalThis as any).localStorage;
  });

  it("should spy on sendTelemetryLog when logFavorite is called (favorited true)", () => {
    const sendSpy = vi.spyOn(telemetry, "sendTelemetryLog");

    telemetry.logFavorite("Chiếc Lá Thu Phái", true);

    expect(sendSpy).toHaveBeenCalledWith({
      eventType: "favorite",
      titleVi: '❤️ Đã thả tim yêu thích bài hát: "Chiếc Lá Thu Phái"',
      severity: "info",
      details: { trackTitle: "Chiếc Lá Thu Phái", isFavorited: true },
    });
  });

  it("should spy on sendTelemetryLog when logFavorite is called (favorited false)", () => {
    const sendSpy = vi.spyOn(telemetry, "sendTelemetryLog");

    telemetry.logFavorite("Chiếc Lá Thu Phái", false);

    expect(sendSpy).toHaveBeenCalledWith({
      eventType: "favorite",
      titleVi: '💔 Đã bỏ tim bài hát: "Chiếc Lá Thu Phái"',
      severity: "info",
      details: { trackTitle: "Chiếc Lá Thu Phái", isFavorited: false },
    });
  });

  it("should spy on sendTelemetryLog when logAdminAction is called", () => {
    const sendSpy = vi.spyOn(telemetry, "sendTelemetryLog");

    telemetry.logAdminAction("Cập nhật metadata bài hát", { id: "track-123" });

    expect(sendSpy).toHaveBeenCalledWith({
      eventType: "admin_action",
      titleVi: "⚙️ Thao tác Quản trị: Cập nhật metadata bài hát",
      severity: "info",
      details: { id: "track-123" },
    });
  });

  it("should include Authorization header in sendTelemetryLog if vault_token exists in localStorage", async () => {
    const getItemMock = vi.fn().mockReturnValue("test-auth-token-xyz");
    const fakeLocalStorage = {
      getItem: getItemMock,
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };

    (globalThis as any).localStorage = fakeLocalStorage;
    Object.defineProperty(globalThis, "window", {
      value: {
        localStorage: fakeLocalStorage,
        location: { href: "http://localhost/" },
      },
      writable: true,
      configurable: true,
    });

    await telemetry.sendTelemetryLog({
      eventType: "client_event",
      titleVi: "Test event",
      severity: "info",
    });

    expect(getItemMock).toHaveBeenCalledWith("vault_token");
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [, options] = (globalThis.fetch as any).mock.calls[0];
    expect(options.headers["Authorization"]).toBe("Bearer test-auth-token-xyz");
  });

  it("should handle fetch network errors silently without throwing", async () => {
    (globalThis.fetch as any).mockRejectedValue(new Error("Network Error"));

    await expect(
      telemetry.sendTelemetryLog({
        eventType: "client_error",
        titleVi: "Network drop",
        severity: "error",
      })
    ).resolves.not.toThrow();
  });
});
