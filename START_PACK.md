# 🚀 HIDDEN MUSIC 2 — QUICK START & DEVTOOLS GUIDE

---

## 🌐 1. Chrome DevTools MCP (Kết Nối Chrome Thật)

### Cách Mở Chrome Ở Chế Độ Debugging Port:
Chạy lệnh sau từ Command Prompt / PowerShell hoặc hộp thoại `Win + R`:
```powershell
chrome.exe --remote-debugging-port=9222
```

> **Hoặc trên Chrome mới (Chrome 144+):**
> 1. Mở tab: `chrome://inspect/#remote-debugging`
> 2. Bật tùy chọn **Remote debugging**.

### File Cấu Hình MCP:
Đã được cấu hình tự động tại:
* [mcp_config.json](file:///c:/Users/Admin/Documents/github/hidden-music-2/mcp_config.json)
* [.agents/mcp_config.json](file:///c:/Users/Admin/Documents/github/hidden-music-2/.agents/mcp_config.json)

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest", "--browser-url=http://127.0.0.1:9222"]
    }
  }
}
```

---

## 💻 2. Khởi Chạy Local Dev Server

Mở Terminal trong thư mục dự án và chạy:
```powershell
# Chạy Frontend Web (Vite + React 19)
npm run dev:web

# Chạy Backend Cloudflare Worker API (Hono)
npm run dev:api
```

---

## ⚡ 3. Các Lệnh Build & Deploy

```powershell
# Build toàn bộ Web và API
npm run build

# Deploy Web lên Cloudflare Pages
npx wrangler pages deploy apps/web/dist --project-name=hidden-music-web

# Deploy API lên Cloudflare Workers
cd apps/api
npx wrangler deploy
```

---

## ☁️ 4. Đường Dẫn Hạ Tầng Đang Hoạt Động (Production)

* **Live Web App**: `https://hidden-music-web.pages.dev`
* **Live Worker API**: `https://hidden-music-api.postlain-music.workers.dev`
* **Media CDN (Cloudflare R2)**: `https://media.postlain.com` (30 FLAC Lossless + 30 Video MKV)
