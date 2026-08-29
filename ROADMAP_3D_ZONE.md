# 🌌 3D ALBUM IMMERSION ZONE: MASTER ROADMAP & ARCHITECTURAL QUESTIONNAIRE

> **Mục đích tài liệu**: Lưu trữ toàn bộ câu hỏi chuyên sâu, các quyết định kiến trúc đã phê duyệt, trạng thái hoàn thành từng phase, và lộ trình các phase tiếp theo để **mọi agent, máy tính hoặc phiên làm việc tiếp theo đều đọc được ngay lập tức**.

---

## 📊 TỔNG QUAN TIẾN ĐỘ THEO PHASE

| Phase | Nội Dung Trọng Tâm | Trạng Thái | File Đã Triển Khai |
| :--- | :--- | :--- | :--- |
| **Phase 1** | • Động cơ BEAT_DETECTION cao cấp (`StudioBeatEngine.ts`) với Live Dynamic Multi-Band Spectral Flux.<br>• Thuật toán bắt Kick dồn / Kick Rolls (1/16th & 1/32th) qua First-Derivative Acceleration.<br>• 3 Tầng không gian hạt Three.js WebGL theo thể loại (15,000 hạt) + Downbeat 4/4 PLL Clock.<br>• Thẻ Bìa Album HVL 3D nổi bật (Perspective Tilt + Mobile In-Place Flip 290x290). | ✅ **HOÀN THÀNH & DEPLOYED** | `StudioBeatEngine.ts`<br>`useBeatSync.ts`<br>`Album3DScene.tsx`<br>`Album3DZone.tsx`<br>`GenreParticleShaders.ts`<br>`GrainHalationShaders.ts` |
| **Phase 2** | • Thanh điều khiển Floating Liquid Glass Dock & Live Waveform Visualizer.<br>• Danh sách 30 bài hát kính mờ (Floating Glass Drawer).<br>• Hiệu ứng ánh sáng Synesthesia riêng biệt cho từng bài. | ⏳ **TIẾP THEO** | `FloatingPlayerDock.tsx`<br>`MobilePlayerDock.tsx` |
| **Phase 3** | • Chuyển cảnh Camera Fly-through từ Vault vào 3D Zone.<br>• Cảm biến con quay hồi chuyển Gyroscope trên Mobile.<br>• Tối ưu GPU Dynamic Resolution Scaling. | ⏳ **CHỜ PHASE 2** | (Sẽ tạo ở Phase 3) |

---

## 🏛️ BỘ QUY CHUẨN KIẾN TRÚC & QUYẾT ĐỊNH ĐÃ THỐNG NHẤT

### ✅ [CÁC QUYẾT ĐỊNH ĐÃ PHÊ DUYỆT]
- **Quyết định 1: Động cơ Beat Detection Live Dynamic 100% (Zero Hardcoded BPM)**:
  - Sử dụng `StudioBeatEngine` xử lý trực tiếp luồng Web Audio API.
  - Phân tích 5 dải tần (Sub-bass, Kick, Low-Mid, Vocal-Mid, Air-Treble) bằng Half-Wave Rectified Spectral Flux.
  - Nhận diện nhịp Kick dồn / Double Kicks / 808 Rolls qua đạo hàm bậc 1 tốc độ gia tốc năng lượng ($\frac{dE}{dt} > 1.8$) kết hợp Micro-cooldown ($55\text{ms}$).
  - Khóa pha liên tục (Phase-Locked Loop) cung cấp `beatProgress` ($0.0 \to 1.0$) và nhịp Downbeat phách 1 của ô nhịp 4/4.
- **Quyết định 2: Phạm vi thị giác 3D Zone (Không dùng đĩa than)**:
  - Tuyệt đối **không sử dụng mô hình 3D đĩa than / Turntable**.
  - Hiệu ứng thị giác tập trung hoàn toàn vào 3 thành phần:
    1. **Bìa Album HVL 3D**: Nghiêng tương tác theo chuột (Desktop) và lật $180^\circ$ tại chỗ xem 30 bài hát (Mobile), nảy theo nhịp Kick và Downbeat.
    2. **Thanh Floating Player Dock**: Thiết kế kính mờ Liquid Glass, hiển thị sóng âm phổ thực thời (Real spectrum bars).
    3. **Background Universe**: 15,000 hạt Three.js WebGL thích ứng 3 tầng Mood, dãn nở theo Downbeat và rực sáng khi có Kick dồn.
- **Quyết định 3: Pipeline Cinematic 35mm & An toàn thị giác**:
  - Film Grain $60\text{fps}$, Sub-bass Chromatic Aberration, ACES Filmic Tone Mapping, nền đen tuyền giới hạn trần sáng $\le 18\%$ luminance để bảo vệ mắt.

---

### ⏳ [DANH SÁCH CÁC CÂU HỎI CÒN LẠI CHO PHASE 2, 3, 4]

#### ❓ Câu hỏi 4: Giới Hạn Hiệu Năng GPU & Dynamic Scaling
*Khi máy yếu hoặc thiết bị nóng lên:*
- **Phương án 4A**: Giữ nguyên $20,000$ hạt và tự động hạ độ phân giải Render Target (Dynamic Resolution Scaling) từ $1.0\times \rightarrow 0.75\times$ khi FPS tụt dưới $55\text{fps}$.
- **Phương án 4B**: Tự động giảm số lượng hạt theo cấu hình phần cứng (Mobile: $6,000$ hạt, Laptop: $12,000$ hạt, Desktop GPU mạnh: $25,000$ hạt).

#### ❓ Câu hỏi 5: Độ Tinh Xảo Của Vật Liệu Đĩa Than (Vinyl Materiality)
- **Phương án 5A**: Đĩa than vân rãnh Micro-grooves kim loại PBR kết hợp vỏ bao Liquid Glass trong suốt hé lộ đĩa bên trong (Hiện tại đã có bản mẫu).
- **Phương án 5B**: Cho phép người dùng chuyển đổi skin đĩa: Đĩa than cổ điển (Black Vinyl), Đĩa bạch kim (Platinum Disc), hoặc Đĩa dạ quang phát sáng (Glow Disc).

#### ❓ Câu hỏi 6: Cơ Chế Tương Tác Vật Lý Với Đĩa Than
- **Phương án 6A (Khuyên dùng)**: Kéo chuột xoay tự do $360^\circ$ quanh đĩa với lực đàn hồi (Elastic Damping) tự trả về góc nhìn điện ảnh khi buông chuột.
- **Phương án 6B (DJ Scratch)**: Cho phép dùng chuột chà đĩa (Scratch) để tua nhạc tức thì.
- **Phương án 6C (Sleeve Eject Animation)**: Khi đổi bài, đĩa cũ trượt vào bao và đĩa mới trượt ra với hiệu ứng cơ khí sang trọng.

#### ❓ Câu hỏi 7: Cơ Chế Hiển Thị Điểm Đọc Nhạc
- **Phương án 7A (Khuyên dùng)**: Tia Laser ánh sáng mảnh màu xanh băng chiếu từ trên xuống rãnh đĩa, di chuyển từ mép vào tâm theo tiến trình bài hát.
- **Phương án 7B**: Cần kim đĩa than cổ điển (Turntable Tonearm) tự hạ xuống rãnh đĩa.
- **Phương án 7C**: Rãnh đĩa tự phát sáng theo vòng tròn đồng tâm khi bài hát chạy.

#### ❓ Câu hỏi 8: Bố Cục Danh Sách 30 Bài Hát
- **Phương án 8A (Khuyên dùng)**: Nút Capsule kính mờ ở góc dưới, khi bấm sẽ trượt mở ngăn kéo kính mờ bán trong suốt (`backdrop-filter: blur(24px)`) chia 2 CD (CD1/CD2) ở cạnh phải màn hình mà không che khuất đĩa 3D.
- **Phương án 8B (3D Orbit Selector)**: 30 thẻ kính 3 chiều bay lơ lửng thành vòng xoắn ốc quanh đĩa than trong không gian 3D.

#### ❓ Câu hỏi 9: Thanh Điều Khiển Playbar & Waveform HUD
- **Phương án 9A (Khuyên dùng)**: Viên thuốc Liquid Glass Dock lơ lửng ở đáy màn hình với thanh sóng âm nhỏ (Waveform Scrubber), nút Play/Pause, Next/Prev, Volume, và huy hiệu Lossless FLAC 24-bit.
- **Phương án 9B**: HUD ẩn hoàn toàn, chỉ hiện ra mờ ảo khi người dùng di chuột và tự ẩn sau 3 giây.

#### ❓ Câu hỏi 10: Chuyển Cảnh Khi Bước Vào / Rời Khỏi 3D Zone
- **Phương án 10A (Khuyên dùng)**: Camera bay xuyên qua lớp kính mờ (Camera Dive) từ trang chủ vào không gian 3D mượt mà không ngắt nhạc ($0\text{ms}$ audio drop).
- **Phương án 10B**: Hiệu ứng cổng ánh sáng Portal mở rộng từ tâm đĩa.

#### ❓ Câu hỏi 11: Trải Nghiệm Trên Điện Thoại Di Động
- **Phương án 11A (Khuyên dùng)**: Tích hợp cảm biến con quay hồi chuyển (Gyroscope): Nghiêng điện thoại thì góc nhìn 3D và ánh sáng phản chiếu trên đĩa nghiêng theo đời thực; bố cục dọc tối ưu cho 1 ngón tay cái.
- **Phương án 11B**: Cử chỉ vuốt chạm cảm ứng tiêu chuẩn.

#### ❓ Câu hỏi 12: Tiết Kiệm Pin Khi Ẩn Tab Trình Duyệt
- **Quy chuẩn:** Tự động tạm dừng vòng lặp Three.js `render()` khi người dùng chuyển sang tab khác (tiết kiệm $100\%$ GPU) trong khi nhạc Lossless FLAC vẫn tiếp tục phát êm đềm ở background.

#### ❓ Câu hỏi 13: Bản Sắc Ánh Sáng Synesthesia Chi Tiết Từng Track
- **Phương án 13A**: Từng bài trong 30 track có một sắc thái ánh sáng riêng biệt (vd: *Night In Prague* = Ánh đèn đêm Jazz; *Tây Thi* = Sắc đỏ hồng cổ phong; *Liệm* = Tím thạch anh huyền bí).
- **Phương án 13B**: Giữ nguyên gam màu theo 3 tầng Mood phân loại tự động.

---

## 🔒 CAM KẾT KIẾN TRÚC CHO CÁC PHIÊN TIẾP THEO
Mọi agent khi tiếp nhận dự án này bắt buộc phải:
1. Đọc file này (`ROADMAP_3D_ZONE.md`), `AGENTS.md` và `PROJECT_MANAGER.md`.
2. Kiểm tra câu trả lời của user cho các câu hỏi từ 4 đến 13 trước khi bắt đầu code Phase tiếp theo.
3. Tuyệt đối không xóa bỏ các thành quả kỹ thuật đã hoàn thành của Phase 1.
