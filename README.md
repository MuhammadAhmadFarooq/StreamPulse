# StreamPulse 🎬

A modern, full-stack YouTube to MP4 downloader with a stunning glassmorphism UI. Download videos in up to **4K quality** with merged video + audio in a single MP4 file.

![StreamPulse](https://img.shields.io/badge/StreamPulse-v1.0.0-6366f1?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)

## ✨ Features

- 🎥 **1080p / 4K MP4 Downloads** — full H.264 video + AAC audio merged
- 📊 **Real-time Progress** — live download speed, ETA, and progress bar via SSE
- 🎨 **Modern UI** — dark glassmorphism design with smooth animations
- 🎵 **Audio Extraction** — download as MP3 or M4A
- 📋 **Quality Selector** — 144p, 240p, 360p, 480p, 720p, 1080p, 1440p, 2160p (4K)
- 🕘 **Download History** — persisted in localStorage
- 📱 **Fully Responsive** — works on desktop and mobile

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Downloader | yt-dlp-exec |
| Merger | @ffmpeg-installer/ffmpeg |
| Streaming | Server-Sent Events (SSE) |

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/MuhammadAhmadFarooq/StreamPulse.git
cd StreamPulse

# Install all dependencies (root + server + client)
npm install
npm install --prefix server
npm install --prefix client
```

### Run in Development

```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
StreamPulse/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── context/        # Global state (MediaContext)
│   │   ├── services/       # API calls
│   │   └── types/          # TypeScript interfaces
│   └── vite.config.ts
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # yt-dlp + SSE logic
│   │   ├── routes/         # API routes
│   │   └── utils/          # Helpers
│   └── downloads/          # Temp download storage (git-ignored)
└── package.json            # Root concurrent runner
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/media/info` | Fetch video metadata & available formats |
| `POST` | `/api/media/download` | Start a download job |
| `GET` | `/api/media/progress/:jobId` | SSE stream of download progress |
| `GET` | `/api/media/file/:jobId` | Serve the completed MP4/MP3 file |

## ⚠️ Disclaimer

This tool is intended for downloading videos you are authorized to download (e.g. your own content, Creative Commons licensed videos). Respect YouTube's Terms of Service and copyright laws.

## 📄 License

MIT
