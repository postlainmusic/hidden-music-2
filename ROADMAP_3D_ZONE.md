# 🌌 3D ALBUM IMMERSION ZONE: MASTER ROADMAP & ARCHITECTURAL QUESTIONNAIRE

> **Mục đích tài liệu**: Lưu trữ toàn bộ câu hỏi chuyên sâu, các quyết định kiến trúc đã phê duyệt, trạng thái hoàn thành từng phase, và lộ trình các phase tiếp theo để **mọi agent, máy tính hoặc phiên làm việc tiếp theo đều đọc được ngay lập tức**.

---

## 📊 TỔNG QUAN TIẾN ĐỘ THEO PHASE

| Phase | Nội Dung Trọng Tâm | Trạng Thái | File Đã Triển Khai |
| :--- | :--- | :--- | :--- |
| **Phase 1** | • Động cơ 5 băng tần Web Audio API.<br>• 3 Tầng không gian hạt theo thể loại.<br>• Vật thể 3D tự do tương phản cao & bảo vệ thị giác.<br>• Pipeline Cinematic 35mm (Grain, Bloom, Halation, ACES). | ✅ **HOÀN THÀNH & DEPLOYED** | `AudioAnalyserEngine.ts`<br>`Album3DScene.tsx`<br>`FloatingVinylArtifact.ts`<br>`GenreParticleShaders.ts`<br>`GrainHalationShaders.ts` |
| **Phase 2** | • Tương tác vật lý đĩa than $360^\circ$ + Tia Laser đọc đĩa.<br>• Thanh điều khiển Glass Dock & Waveform Scrubber.<br>• Ngăn kéo 30 bài hát kính mờ (Floating Glass Drawer). | ⏳ **PENDING QUESTIONS** | (Sẽ tạo ở Phase 2) |
| **Phase 3** | • Chuyển cảnh Camera Fly-through từ Vault vào 3D.<br>• Cảm biến con quay hồi chuyển Gyroscope trên Mobile.<br>• Bản sắc màu Synesthesia riêng biệt cho từng track. | ⏳ **CHỜ PHASE 2** | (Sẽ tạo ở Phase 3) |
| **Phase 4** | • Tối ưu GPU Dynamic Resolution Scaling.<br>• Chế độ tiết kiệm pin & Background Tab Throttle Guard. | ⏳ **CHỜ PHASE 3** | (Sẽ tạo ở Phase 4) |

---

## 🏛️ BỘ 13 CÂU HỎI KIẾN TRÚC CHUYÊN SÂU & TRẠNG THÁI

### ✅ [ĐÃ GIẢI QUYẾT TRONG PHASE 1]
- **Câu 1: Bóc tách tần số âm thanh siêu chính xác**:
  - *Quyết định:* Web Audio API `AnalyserNode (FFT 2048, smoothing 0.80)` bóc tách 5 dải tần thực thời: **Sub-Bass (20-90Hz)**, **Kick (90-220Hz)**, **Low-Mid (220-600Hz)**, **Vocal/Mid (600-3000Hz)**, **Treble/Air (3000-16000Hz)** kèm thuật toán **Transient-Aware EMA Lerp** phản hồi tức thời $<16\text{ms}$.
- **Câu 2: Không gian hạt theo thể loại & Vật thể tự do**:
  - *Quyết định:* 3 Tầng không gian biến đổi theo nhạc:
    - *Tầng 1 (Chill/Poetic/Melancholic)*: Biển sương mù & dải lụa cực quang màu xanh đêm, tím khói.
    - *Tầng 2 (Cosmic/Ambient)*: Tinh vân vũ trụ xoay theo quỹ đạo đĩa than với sắc xanh ngọc và chàm thiên thể.
    - *Tầng 3 (Trap/Drill/High Energy)*: Không gian Cybernetic gia tốc cực đại với sóng xung kích phát nổ từ tâm.
    - *Vật thể tự do:* Đĩa than lơ lửng chuyển động tự do, nảy theo beat, vật liệu kim loại PBR rãnh đĩa siêu nhỏ luôn tương phản cao với nền.
    - *An toàn thị giác:* Nền mặc định đen tuyền, giới hạn độ sáng trần $\le 18\%$ luminance để không gây chói mắt.
- **Câu 3: Pipeline Cinematic 35mm**:
  - *Quyết định:* Tích hợp đầy đủ Selective Unreal Bloom, Film Halation 35mm (quầng sáng ấm mép tương phản), Dynamic 35mm Film Grain $60\text{fps}$, Sub-Bass Chromatic Aberration giật nhẹ khi dập bass, và ACES Filmic Tone Mapping.

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
