-- Hidden Music Database Schema (Cloudflare D1 SQLite)

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    google_id TEXT,
    username TEXT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password_hash TEXT DEFAULT 'oauth_google',
    avatar_url TEXT,
    role TEXT DEFAULT 'free', -- 'admin' | 'vip' | 'free'
    status TEXT DEFAULT 'active', -- 'active' | 'banned'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at INTEGER
);

CREATE TABLE IF NOT EXISTS user_favorites (
    user_id TEXT NOT NULL,
    track_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, track_id)
);

CREATE TABLE IF NOT EXISTS albums (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    cover_url TEXT NOT NULL,
    model_3d_url TEXT, -- Path to .glb 3D asset in R2
    palette_colors TEXT, -- JSON object of dominant hex colors {primary, secondary, accent, glow}
    release_year INTEGER,
    genre TEXT,
    type TEXT DEFAULT 'album', -- 'album' | 'single' | 'ep'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tracks (
    id TEXT PRIMARY KEY,
    album_id TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    duration_sec INTEGER NOT NULL,
    audio_url TEXT NOT NULL, -- Path to audio file in R2 or external stream
    video_url TEXT, -- Path to video master file in R2 or stream
    cover_url TEXT NOT NULL,
    r2_key TEXT,
    video_type TEXT DEFAULT 'r2_master', -- 'r2_master' | 'youtube' | 'direct'
    video_quality TEXT DEFAULT '4K MASTER',
    video_aspect_ratio TEXT DEFAULT '16:9',
    audio_source_type TEXT DEFAULT 'r2_flac', -- 'r2_flac' | 'soundcloud' | 'zingmp3' | 'nct'
    audio_bitrate TEXT DEFAULT '24-BIT / 96kHz',
    lyrics_synced TEXT, -- Raw LRC string or JSON timestamps
    bpm INTEGER DEFAULT 120,
    key_signature TEXT,
    mood_tier TEXT DEFAULT 'melodic_ambient', -- 'aggressive_drill' | 'melodic_ambient' | 'dark_atmospheric'
    palette_json TEXT, -- JSON { primary, secondary, accent, glow }
    play_count INTEGER DEFAULT 0,
    release_status TEXT DEFAULT 'live', -- 'live' | 'coming_soon' | 'archived'
    scheduled_at INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(album_id) REFERENCES albums(id)
);

CREATE TABLE IF NOT EXISTS home_sections (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    template_type TEXT NOT NULL, -- 'album_showcase' | 'cover_flow' | 'hero_banner' | 'artist_spotlight' | 'editorial_press' | 'video_premiere' | 'explore_universe'
    order_index INTEGER NOT NULL,
    is_enabled INTEGER DEFAULT 1,
    config_json TEXT NOT NULL, -- JSON template parameters
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vault_slots (
    id TEXT PRIMARY KEY,
    slot_number INTEGER NOT NULL UNIQUE,
    album_id TEXT,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    cover_url TEXT NOT NULL,
    badge TEXT DEFAULT 'Lossless Ready',
    status TEXT DEFAULT 'live', -- 'live' | 'coming_soon' | 'locked'
    release_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

