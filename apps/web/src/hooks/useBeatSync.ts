// 🎵 useBeatSync: High-Performance React Hook for Real-Time Beat, Tempo & Downbeat Synchronization
import { useState, useEffect, useRef } from "react";
import { studioBeatEngine, StudioBeatState } from "../audio/StudioBeatEngine";
import { useAudioStore } from "../store/audioStore";

export interface UseBeatSyncOptions {
  enableEvents?: boolean;
  onDownbeat?: (bar: number) => void;
  onKickHit?: (impact: number, isRoll: boolean) => void;
  onSnareHit?: (flash: number) => void;
}

export const useBeatSync = (options?: UseBeatSyncOptions) => {
  const { isPlaying } = useAudioStore();
  const [beatState, setBeatState] = useState<StudioBeatState>(() => studioBeatEngine.getBeatState());
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    let animId: number;

    const loop = () => {
      const state = studioBeatEngine.update();
      setBeatState(state);

      // Trigger user event callbacks
      if (optionsRef.current?.enableEvents) {
        if (state.isDownbeat && optionsRef.current.onDownbeat) {
          optionsRef.current.onDownbeat(state.currentBar);
        }
        if (state.isKickHit && optionsRef.current.onKickHit) {
          optionsRef.current.onKickHit(state.kickImpact, state.isKickRoll);
        }
        if (state.isSnareHit && optionsRef.current.onSnareHit) {
          optionsRef.current.onSnareHit(state.snareImpact || state.snareStrobe);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    if (isPlaying) {
      animId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  return beatState;
};
