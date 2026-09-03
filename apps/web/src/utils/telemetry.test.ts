import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  sendTelemetryLog,
  getDeviceInfo,
  logPlayTrack,
  logFavorite,
  logAdminAction,
  initErrorWatchdog,
  TelemetryPayload
} from "./telemetry.ts";

describe("telemetry", () => {
  let originalFetch: typeof globalThis.fetch;
  let originalWindowDescriptor: PropertyDescriptor | undefined;
  let originalNavigatorDescriptor: PropertyDescriptor | undefined;
  let originalLocalStorageDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    originalWindowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
    originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");
    originalLocalStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;

    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, "window", originalWindowDescriptor);
    } else {
      delete (globalThis as any).window;
    }

    if (originalNavigatorDescriptor) {
      Object.defineProperty(globalThis, "navigator", originalNavigatorDescriptor);
    } else {
      delete (globalThis as any).navigator;
    }

    if (originalLocalStorageDescriptor) {
      Object.defineProperty(globalThis, "localStorage", originalLocalStorageDescriptor);
    } else {
      delete (globalThis as any).localStorage;
    }
  });

  function mockWindow(winObj: any) {
    Object.defineProperty(globalThis, "window", {
      value: winObj,
      writable: true,
      configurable: true
    });
  }

  function mockNavigator(navObj: any) {
    Object.defineProperty(globalThis, "navigator", {
      value: navObj,
      writable: true,
      configurable: true
    });
  }

  function mockLocalStorage(storageObj: any) {
    Object.defineProperty(globalThis, "localStorage", {
      value: storageObj,
      writable: true,
      configurable: true
    });
  }

  describe("sendTelemetryLog fetch error paths", () => {
    it("should silently handle fetch rejection without throwing an error", async () => {
      globalThis.fetch = (async () => {
        throw new Error("Network offline / connection refused");
      }) as any;

      await assert.doesNotReject(async () => {
        await sendTelemetryLog({
          eventType: "client_event",
          titleVi: "Test Fetch Rejection",
          severity: "info"
        });
      });
    });

    it("should silently handle fetch returning a rejected promise in .catch", async () => {
      globalThis.fetch = (() => {
        return Promise.reject(new TypeError("Failed to fetch"));
      }) as any;

      await assert.doesNotReject(async () => {
        await sendTelemetryLog({
          eventType: "client_error",
          titleVi: "Test Rejected Promise",
          severity: "error"
        });
      });
    });

    it("should handle synchronous exceptions thrown inside try block gracefully", async () => {
      mockWindow({});
      Object.defineProperty(globalThis, "localStorage", {
        get() {
          throw new Error("SecurityError: Access to localStorage is denied");
        },
        configurable: true
      });

      await assert.doesNotReject(async () => {
        await sendTelemetryLog({
          eventType: "admin_action",
          titleVi: "Test Sync Exception",
          severity: "info"
        });
      });
    });
  });

  describe("sendTelemetryLog successful request payload and headers", () => {
    it("should send POST request with correct payload and headers including bearer token when token exists", async () => {
      let capturedUrl = "";
      let capturedOptions: RequestInit = {};

      const mockStorage = new Map<string, string>();
      mockStorage.set("vault_token", "mock-bearer-token-123");

      mockWindow({
        location: { href: "https://hiddenmusic.app/dashboard" },
        innerWidth: 1920,
        innerHeight: 1080,
        devicePixelRatio: 2
      });

      mockNavigator({
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        language: "en-US"
      });

      mockLocalStorage({
        getItem: (key: string) => mockStorage.get(key) || null,
        setItem: (key: string, value: string) => mockStorage.set(key, value),
        removeItem: (key: string) => mockStorage.delete(key),
        clear: () => mockStorage.clear(),
        length: mockStorage.size,
        key: () => null
      });

      globalThis.fetch = (async (url: string, options: RequestInit) => {
        capturedUrl = url;
        capturedOptions = options;
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }) as any;

      const payload: TelemetryPayload = {
        eventType: "login",
        titleVi: "Đăng nhập thành công",
        severity: "info",
        userEmail: "test@example.com",
        userId: "usr_123"
      };

      await sendTelemetryLog(payload);

      assert.strictEqual(
        capturedUrl,
        "https://hidden-music-api.postlain-music.workers.dev/api/telemetry/log"
      );
      assert.strictEqual(capturedOptions.method, "POST");

      const headers = capturedOptions.headers as Record<string, string>;
      assert.strictEqual(headers["Content-Type"], "application/json");
      assert.strictEqual(headers["Authorization"], "Bearer mock-bearer-token-123");

      const body = JSON.parse(capturedOptions.body as string);
      assert.strictEqual(body.event_type, "login");
      assert.strictEqual(body.title_vi, "Đăng nhập thành công");
      assert.strictEqual(body.severity, "info");
      assert.strictEqual(body.user_email, "test@example.com");
      assert.strictEqual(body.user_id, "usr_123");
      assert.strictEqual(body.details.os, "macOS");
      assert.strictEqual(body.details.browser, "Chrome");
      assert.strictEqual(body.details.url, "https://hiddenmusic.app/dashboard");
    });

    it("should omit Authorization header when vault_token does not exist in localStorage", async () => {
      let capturedOptions: RequestInit = {};

      mockWindow({
        location: { href: "https://hiddenmusic.app" }
      });

      mockLocalStorage({
        getItem: () => null
      });

      globalThis.fetch = (async (_url: string, options: RequestInit) => {
        capturedOptions = options;
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }) as any;

      await sendTelemetryLog({
        eventType: "play_track",
        titleVi: "Bắt đầu phát nhạc",
        severity: "info"
      });

      const headers = capturedOptions.headers as Record<string, string>;
      assert.strictEqual(headers["Authorization"], undefined);
    });

    it("should deduplicate identical error logs within deduplication window", async () => {
      let fetchCallCount = 0;

      globalThis.fetch = (async () => {
        fetchCallCount++;
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }) as any;

      const errorPayload: TelemetryPayload = {
        eventType: "client_error",
        titleVi: "🚨 Lỗi kết nối mạng trùng lặp",
        severity: "error",
        details: { code: 500 }
      };

      await sendTelemetryLog(errorPayload);
      await sendTelemetryLog(errorPayload);
      await sendTelemetryLog(errorPayload);

      assert.strictEqual(fetchCallCount, 1);
    });
  });

  describe("getDeviceInfo()", () => {
    it("should return default fallback device info when window is undefined", () => {
      mockWindow(undefined);

      const info = getDeviceInfo();
      assert.strictEqual(info.os, "Unknown");
      assert.strictEqual(info.browser, "Unknown");
      assert.strictEqual(info.device, "Desktop");
      assert.strictEqual(info.screenWidth, 1920);
      assert.strictEqual(info.screenHeight, 1080);
      assert.strictEqual(info.pixelRatio, 1);
      assert.strictEqual(info.language, "vi-VN");
    });

    it("should detect Mobile device and iOS/Safari user agent correctly", () => {
      mockWindow({
        innerWidth: 390,
        innerHeight: 844,
        devicePixelRatio: 3
      });

      mockNavigator({
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        language: "vi"
      });

      const info = getDeviceInfo();
      assert.strictEqual(info.os, "iOS");
      assert.strictEqual(info.browser, "Safari");
      assert.strictEqual(info.device, "Mobile");
      assert.strictEqual(info.screenWidth, 390);
      assert.strictEqual(info.screenHeight, 844);
      assert.strictEqual(info.pixelRatio, 3);
      assert.strictEqual(info.language, "vi");
    });

    it("should detect Tablet device when width <= 1024 and not mobile UA", () => {
      mockWindow({
        innerWidth: 900,
        innerHeight: 1280,
        devicePixelRatio: 2
      });

      mockNavigator({
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        language: "en-US",
        connection: { effectiveType: "4g" }
      });

      const info = getDeviceInfo();
      assert.strictEqual(info.os, "macOS");
      assert.strictEqual(info.browser, "Chrome");
      assert.strictEqual(info.device, "Tablet");
      assert.strictEqual(info.connectionType, "4g");
    });
  });

  describe("helper loggers", () => {
    it("logPlayTrack should log play_track event with info severity", async () => {
      let loggedPayload: any;
      globalThis.fetch = (async (_url: string, options: RequestInit) => {
        loggedPayload = JSON.parse(options.body as string);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }) as any;

      logPlayTrack("Nocturne Op. 9 No. 2", "Chopin", "Lossless FLAC");

      await new Promise((resolve) => setTimeout(resolve, 10));

      assert.strictEqual(loggedPayload.event_type, "play_track");
      assert.ok(loggedPayload.title_vi.includes("Nocturne Op. 9 No. 2"));
      assert.strictEqual(loggedPayload.severity, "info");
      assert.strictEqual(loggedPayload.details.artist, "Chopin");
    });

    it("logFavorite should log favorite event when favorited and unfavorited", async () => {
      const loggedEvents: any[] = [];
      globalThis.fetch = (async (_url: string, options: RequestInit) => {
        loggedEvents.push(JSON.parse(options.body as string));
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }) as any;

      logFavorite("Clair de Lune", true);
      logFavorite("Clair de Lune", false);

      await new Promise((resolve) => setTimeout(resolve, 10));

      assert.strictEqual(loggedEvents.length, 2);
      assert.ok(loggedEvents[0].title_vi.includes("Đã thả tim"));
      assert.ok(loggedEvents[1].title_vi.includes("Đã bỏ tim"));
    });

    it("logAdminAction should log admin_action event", async () => {
      let loggedPayload: any;
      globalThis.fetch = (async (_url: string, options: RequestInit) => {
        loggedPayload = JSON.parse(options.body as string);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }) as any;

      logAdminAction("Cập nhật danh sách phát", { playlistId: "pl_001" });

      await new Promise((resolve) => setTimeout(resolve, 10));

      assert.strictEqual(loggedPayload.event_type, "admin_action");
      assert.ok(loggedPayload.title_vi.includes("Cập nhật danh sách phát"));
      assert.strictEqual(loggedPayload.details.playlistId, "pl_001");
    });
  });

  describe("initErrorWatchdog()", () => {
    it("should add window event listeners and not throw when called", () => {
      const addedListeners: string[] = [];
      mockWindow({
        addEventListener: (type: string) => {
          addedListeners.push(type);
        }
      });

      initErrorWatchdog();

      assert.ok(addedListeners.includes("error"));
      assert.ok(addedListeners.includes("unhandledrejection"));
    });
  });
});
