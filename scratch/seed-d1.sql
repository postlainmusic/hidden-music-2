-- Drop obsolete playlists tables
DROP TABLE IF EXISTS playlist_tracks;
DROP TABLE IF EXISTS playlists;

-- Ensure albums table structure
CREATE TABLE IF NOT EXISTS albums (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  model_3d_url TEXT,
  palette_colors TEXT,
  release_year INTEGER,
  genre TEXT,
  type TEXT DEFAULT 'album',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Ensure tracks table structure
CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  album_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  duration_sec INTEGER NOT NULL,
  audio_url TEXT NOT NULL,
  video_url TEXT,
  cover_url TEXT NOT NULL,
  waveform_data TEXT,
  play_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (album_id) REFERENCES albums(id)
);

-- Seed Album: HVL (99%) - MCK
INSERT OR REPLACE INTO albums (id, title, artist, cover_url, model_3d_url, palette_colors, release_year, genre, type, created_at)
VALUES (
  'hvl-99',
  'HVL (99%)',
  'MCK',
  'https://media.postlain.com/covers/HVL_Album_Cover.jpg',
  'https://media.postlain.com/models/vinyl_record_3d.glb',
  '{"primary":"#ffffff","secondary":"#cbd5e1","accent":"#94a3b8"}',
  2023,
  'Melodic Rap / R&B',
  'album',
  datetime('now')
);

-- Seed 30 Official Lossless FLAC Tracks with R2 Audio & Video Links
INSERT OR REPLACE INTO tracks (id, album_id, title, artist, duration_sec, audio_url, video_url, cover_url, play_count) VALUES
('mck-01', 'hvl-99', '01. Elegie', 'MCK', 198, 'https://media.postlain.com/audio/01.%20Elegie.flac', 'https://media.postlain.com/videos/01.%20Elegie%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 2400000),
('mck-02', 'hvl-99', '02. IDK', 'MCK', 215, 'https://media.postlain.com/audio/02.%20IDK.flac', 'https://media.postlain.com/videos/02.%20IDK%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 4800000),
('mck-03', 'hvl-99', '03. Suy Cung Dung', 'MCK', 204, 'https://media.postlain.com/audio/03.%20Suy%20Cung%20Dung.flac', 'https://media.postlain.com/videos/03.%20Suy%20Cung%20Dung%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 1900000),
('mck-04', 'hvl-99', '04. Chim Sau (feat. Trung Tran)', 'MCK ft. Trung Tran', 242, 'https://media.postlain.com/audio/04.%20Chim%20Sau.flac', 'https://media.postlain.com/videos/04.%20Chim%20Sau%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 8200000),
('mck-05', 'hvl-99', '05. Baby (feat. marzuz)', 'MCK ft. marzuz', 230, 'https://media.postlain.com/audio/05.%20Baby.flac', 'https://media.postlain.com/videos/05.%20Baby%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 6100000),
('mck-06', 'hvl-99', '06. Anh Da On Hon', 'MCK', 189, 'https://media.postlain.com/audio/06.%20Anh%20Da%20On%20Hon.flac', 'https://media.postlain.com/videos/06.%20Anh%20Da%20On%20Hon%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 3500000),
('mck-07', 'hvl-99', '07. Mắt Môi Tay Chân (feat. Tage)', 'MCK ft. Tage', 240, 'https://media.postlain.com/audio/07.%20Mat%20Moi%20Tay%20Chan.flac', 'https://media.postlain.com/videos/07.%20Mat%20Moi%20Tay%20Chan%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 3200000),
('mck-08', 'hvl-99', '08. Bad Trip', 'MCK', 211, 'https://media.postlain.com/audio/08.%20Bad%20Trip.flac', 'https://media.postlain.com/videos/08.%20Bad%20Trip%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 1800000),
('mck-09', 'hvl-99', '09. Chi Mot Dem Nua Thoi', 'MCK ft. TLinh', 218, 'https://media.postlain.com/audio/09.%20Chi%20Mot%20Dem%20Nua%20Thoi.flac', 'https://media.postlain.com/videos/09.%20Chi%20Mot%20Dem%20Nua%20Thoi%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 9500000),
('mck-10', 'hvl-99', '10. Gio Thi', 'MCK', 205, 'https://media.postlain.com/audio/10.%20Gio%20Thi.flac', 'https://media.postlain.com/videos/10.%20Gio%20Thi%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 2100000),
('mck-11', 'hvl-99', '11. Tho Ren', 'MCK', 195, 'https://media.postlain.com/audio/11.%20Tho%20Ren.flac', 'https://media.postlain.com/videos/11.%20Tho%20Ren%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 1600000),
('mck-12', 'hvl-99', '12. Khong The Say', 'MCK', 224, 'https://media.postlain.com/audio/12.%20Khong%20The%20Say.flac', 'https://media.postlain.com/videos/12.%20Khong%20The%20Say%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 4200000),
('mck-13', 'hvl-99', '13. Show Me Love', 'MCK', 208, 'https://media.postlain.com/audio/13.%20Show%20Me%20Love.flac', 'https://media.postlain.com/videos/13.%20Show%20Me%20Love%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 2700000),
('mck-14', 'hvl-99', '14. Cuoi Thang', 'MCK', 199, 'https://media.postlain.com/audio/14.%20Cuoi%20Thang.flac', 'https://media.postlain.com/videos/14.%20Cuoi%20Thang%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 1950000),
('mck-15', 'hvl-99', '15. Tai Vi Sao', 'MCK', 231, 'https://media.postlain.com/audio/15.%20Tai%20Vi%20Sao.flac', 'https://media.postlain.com/videos/15.%20Tai%20Vi%20Sao%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 5300000),
('mck-16', 'hvl-99', '16. Hen Gap Em Duoi Anh Trang', 'MCK ft. J Jade', 245, 'https://media.postlain.com/audio/16.%20Hen%20Gap%20Em%20Duoi%20Anh%20Trang.flac', 'https://media.postlain.com/videos/16.%20Hen%20Gap%20Em%20Duoi%20Anh%20Trang%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 3800000),
('mck-17', 'hvl-99', '17. Chuyen Rang', 'MCK', 216, 'https://media.postlain.com/audio/17.%20Chuyen%20Rang.flac', 'https://media.postlain.com/videos/17.%20Chuyen%20Rang%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 2900000),
('mck-18', 'hvl-99', '18. Va The La Het', 'MCK', 202, 'https://media.postlain.com/audio/18.%20Va%20The%20La%20Het.flac', 'https://media.postlain.com/videos/18.%20Va%20The%20La%20Het%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 1750000),
('mck-19', 'hvl-99', '19. Nho', 'MCK', 188, 'https://media.postlain.com/audio/19.%20Nho.flac', 'https://media.postlain.com/videos/19.%20Nho%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 2200000),
('mck-20', 'hvl-99', '20. Xa Xôi (feat. Obito)', 'MCK ft. Obito', 232, 'https://media.postlain.com/audio/20.%20Xa%20Xoi.flac', 'https://media.postlain.com/videos/20.%20Xa%20Xoi%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 5500000),
('mck-21', 'hvl-99', '21. Danh Doi', 'MCK', 214, 'https://media.postlain.com/audio/21.%20Danh%20Doi.flac', 'https://media.postlain.com/videos/21.%20Danh%20Doi%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 2600000),
('mck-22', 'hvl-99', '22. Su That', 'MCK', 196, 'https://media.postlain.com/audio/22.%20Su%20That.flac', 'https://media.postlain.com/videos/22.%20Su%20That%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 1500000),
('mck-23', 'hvl-99', '23. Thoang Qua', 'MCK', 207, 'https://media.postlain.com/audio/23.%20Thoang%20Qua.flac', 'https://media.postlain.com/videos/23.%20Thoang%20Qua%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 1850000),
('mck-24', 'hvl-99', '24. Lang Thang', 'MCK', 220, 'https://media.postlain.com/audio/24.%20Lang%20Thang.flac', 'https://media.postlain.com/videos/24.%20Lang%20Thang%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 2300000),
('mck-25', 'hvl-99', '25. Muon Roi', 'MCK', 201, 'https://media.postlain.com/audio/25.%20Muon%20Roi.flac', 'https://media.postlain.com/videos/25.%20Muon%20Roi%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 1700000),
('mck-26', 'hvl-99', '26. Buoc Di', 'MCK', 213, 'https://media.postlain.com/audio/26.%20Buoc%20Di.flac', 'https://media.postlain.com/videos/26.%20Buoc%20Di%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 2100000),
('mck-27', 'hvl-99', '27. Noi Dau Nay', 'MCK', 225, 'https://media.postlain.com/audio/27.%20Noi%20Dau%20Nay.flac', 'https://media.postlain.com/videos/27.%20Noi%20Dau%20Nay%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 1900000),
('mck-28', 'hvl-99', '28. Tro Ve', 'MCK', 210, 'https://media.postlain.com/audio/28.%20Tro%20Ve.flac', 'https://media.postlain.com/videos/28.%20Tro%20Ve%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 2450000),
('mck-29', 'hvl-99', '29. Loi Cuoi', 'MCK', 238, 'https://media.postlain.com/audio/29.%20Loi%20Cuoi.flac', 'https://media.postlain.com/videos/29.%20Loi%20Cuoi%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 3100000),
('mck-30', 'hvl-99', '30. 99 (Outro)', 'MCK', 190, 'https://media.postlain.com/audio/30.%2099%20Outro.flac', 'https://media.postlain.com/videos/30.%2099%20Outro%20-%20MCK.mkv', 'https://media.postlain.com/covers/HVL_Album_Cover.jpg', 4600000);
