import os
import sys
import glob
import json
import time

# Ensure UTF-8 stdout for Windows cmd/powershell
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

import numpy as np
import soundfile as sf
import librosa

MUSIC_DIR = r"c:\Users\Admin\Documents\github\hidden-music-2\music"
OUTPUT_JSON = r"c:\Users\Admin\Documents\github\hidden-music-2\apps\web\src\audio\hvlGroundTruthRhythmGrid.json"

print("==================================================================")
print("[START] DEEP GROUND-TRUTH AUDIO ANALYSIS FOR 30 FLAC TRACKS")
print("==================================================================\n")

flac_files = sorted(glob.glob(os.path.join(MUSIC_DIR, "*.flac")))
print(f"Found {len(flac_files)} Lossless FLAC files to analyze.\n")

results = {}

for idx, filepath in enumerate(flac_files):
    filename = os.path.basename(filepath)
    print(f"[{idx+1}/{len(flac_files)}] Analyzing: {filename} ...")
    start_t = time.time()

    try:
        # 1. Load Audio
        y, sr = librosa.load(filepath, sr=22050, mono=True)
        duration = float(librosa.get_duration(y=y, sr=sr))

        # 2. Harmonic-Percussive Source Separation (HPSS)
        # Separates drums/kicks/percussion from vocals/synths
        y_harmonic, y_percussive = librosa.effects.hpss(y)

        # 3. Precise Tempo & Beat Grid Tracking
        tempo, beat_frames = librosa.beat.beat_track(y=y_percussive, sr=sr, tightness=100)
        beat_times = librosa.frames_to_time(beat_frames, sr=sr).tolist()

        if isinstance(tempo, np.ndarray):
            tempo = float(tempo[0])
        else:
            tempo = float(tempo)

        first_beat_offset_ms = int(round(beat_times[0] * 1000)) if len(beat_times) > 0 else 0

        # 4. Onset Detection on Percussive Track
        onset_frames = librosa.onset.onset_detect(y=y_percussive, sr=sr, units='frames')
        onset_times = librosa.frames_to_time(onset_frames, sr=sr).tolist()

        # Identify fast kick roll timestamps (intervals between 48ms and 135ms)
        fast_roll_times = []
        for i in range(1, len(onset_times)):
            dt_ms = (onset_times[i] - onset_times[i-1]) * 1000
            if 48 <= dt_ms <= 135:
                fast_roll_times.append(round(onset_times[i], 3))

        # 5. Key Estimation via Chroma CQT
        chroma = librosa.feature.chroma_cqt(y=y_harmonic, sr=sr)
        chroma_mean = np.mean(chroma, axis=1)
        notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        estimated_root = notes[int(np.argmax(chroma_mean))]

        # 6. Low-end energy estimation (Sub vs Kick ratio)
        spec = np.abs(librosa.stft(y))
        freqs = librosa.fft_frequencies(sr=sr)
        sub_mask = (freqs >= 20) & (freqs <= 65)
        kick_mask = (freqs >= 65) & (freqs <= 160)
        bass_mask = (freqs >= 160) & (freqs <= 320)

        sub_energy = float(np.mean(spec[sub_mask, :]))
        kick_energy = float(np.mean(spec[kick_mask, :]))
        bass_energy = float(np.mean(spec[bass_mask, :]))

        # Format Record
        track_id = filename.split(".")[0].strip() # e.g. "01", "02"
        record = {
            "trackId": track_id,
            "filename": filename,
            "duration": round(duration, 2),
            "bpm": round(tempo, 1),
            "rootKey": estimated_root,
            "firstBeatOffsetMs": first_beat_offset_ms,
            "totalBeats": len(beat_times),
            "beatGrid": [round(t, 3) for t in beat_times],
            "fastKickRolls": fast_roll_times,
            "lowEndBalance": {
                "subEnergy": round(sub_energy, 4),
                "kickEnergy": round(kick_energy, 4),
                "bassEnergy": round(bass_energy, 4)
            }
        }
        results[filename] = record

        elapsed = time.time() - start_t
        print(f"   -> BPM: {record['bpm']} | Key: {record['rootKey']} | Offset: {record['firstBeatOffsetMs']}ms | Beats: {record['totalBeats']} | Rolls: {len(fast_roll_times)} ({elapsed:.1f}s)")

    except Exception as e:
        print(f"   [ERROR] Error analyzing {filename}: {str(e)}")

# Ensure directory exists
os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)

with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\n==================================================================")
print(f"[DONE] Deep Ground-Truth Audio Analysis Finished! Saved {len(results)} profiles.")
print(f"Output: {OUTPUT_JSON}")
print(f"==================================================================")
