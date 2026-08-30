import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sliders, Eye, EyeOff, Sparkles, Settings2, Plus, ArrowUpRight } from "lucide-react";
import { useAudioStore, DynamicSection } from "../../store/audioStore";
import SectionElementEditorModal from "../admin/SectionElementEditorModal";

interface Props {
  isEditMode: boolean;
  setIsEditMode: (v: boolean) => void;
  activeEditingSection: DynamicSection | null;
  setActiveEditingSection: (sec: DynamicSection | null) => void;
}

export const AdminLiveInspectorHUD: React.FC<Props> = ({
  isEditMode,
  setIsEditMode,
  activeEditingSection,
  setActiveEditingSection
}) => {
  const { currentUser, sections, albums, queue, updateSection } = useAudioStore();

  const isAdmin = currentUser?.role === "admin" || (
    currentUser?.email && [
      "studionopu@gmail.com",
      "postlainmusic@gmail.com",
      "postlain.music@gmail.com",
      "admin@postlain.com"
    ].includes(currentUser.email.toLowerCase())
  );

  if (!isAdmin) return null;

  const handleSaveSection = async (config: any, title: string) => {
    if (!activeEditingSection) return;
    const token = localStorage.getItem("vault_token");
    const API_BASE = "https://hidden-music-api.postlain-music.workers.dev";

    // Optimistic UI update in 0ms
    updateSection(activeEditingSection.id, { title, config });

    try {
      const res = await fetch(`${API_BASE}/api/admin/sections/${activeEditingSection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, config })
      });
      const data = await res.json();
      if (data.success) {
        useAudioStore.getState().loadSections();
      }
    } catch (e) {
      console.warn("Live HUD save notice:", e);
    }
  };

  return (
    <>
      {/* ── FLOATING TOP ADMIN BAR ── */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          position: "fixed",
          top: "80px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 14px",
          borderRadius: "9999px",
          backgroundColor: "rgba(11, 11, 18, 0.85)",
          backdropFilter: "blur(20px)",
          border: isEditMode ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: isEditMode
            ? "0 8px 30px rgba(99, 102, 241, 0.4), 0 0 20px rgba(99, 102, 241, 0.2)"
            : "0 8px 30px rgba(0, 0, 0, 0.6)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: isEditMode ? "#34d399" : "#6366f1",
              boxShadow: isEditMode ? "0 0 8px #34d399" : "none"
            }}
          />
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#ffffff", letterSpacing: "0.05em" }}>
            ADMIN HUD
          </span>
        </div>

        <button
          onClick={() => setIsEditMode(!isEditMode)}
          style={{
            padding: "5px 12px",
            borderRadius: "9999px",
            backgroundColor: isEditMode ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.08)",
            border: isEditMode ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.1)",
            color: isEditMode ? "#a5b4fc" : "rgba(255, 255, 255, 0.8)",
            fontSize: "0.74rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "5px",
            cursor: "pointer"
          }}
        >
          {isEditMode ? <EyeOff size={13} /> : <Eye size={13} />}
          <span>{isEditMode ? "Tắt Edit Mode" : "Visual Inspector"}</span>
        </button>

        <a
          href="/admin"
          style={{
            padding: "5px 10px",
            borderRadius: "9999px",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#ffffff",
            fontSize: "0.74rem",
            fontWeight: 700,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <span>Admin Portal</span>
          <ArrowUpRight size={12} />
        </a>
      </motion.div>

      {/* ── MODAL CHỈNH SỬA ELEMENT NGAY TRÊN TRANG CHỦ ── */}
      <SectionElementEditorModal
        isOpen={!!activeEditingSection}
        onClose={() => setActiveEditingSection(null)}
        section={activeEditingSection}
        albums={albums}
        allTracks={queue}
        onSave={handleSaveSection}
      />
    </>
  );
};

export default AdminLiveInspectorHUD;
