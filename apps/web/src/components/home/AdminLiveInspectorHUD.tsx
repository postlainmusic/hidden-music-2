import React from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowUpRight } from "lucide-react";
import { useAudioStore, DynamicSection } from "../../store/audioStore";
import SectionElementEditorModal from "../admin/SectionElementEditorModal";

interface Props {
  isEditMode: boolean;
  setIsEditMode: (v: boolean) => void;
  activeEditingSection: DynamicSection | null;
  setActiveEditingSection: (sec: DynamicSection | null) => void;
}

import { useIsMobile } from "../../hooks/useIsMobile";

export const AdminLiveInspectorHUD: React.FC<Props> = ({
  isEditMode,
  setIsEditMode,
  activeEditingSection,
  setActiveEditingSection
}) => {
  const { currentUser, albums, queue, updateSection } = useAudioStore();
  const isMobile = useIsMobile();

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
      {/* ── FLOATING TOP ADMIN BAR (COMPACT ON MOBILE) ── */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          position: "fixed",
          top: isMobile ? "68px" : "80px",
          right: isMobile ? "12px" : "24px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: isMobile ? "6px" : "10px",
          padding: isMobile ? "5px 10px" : "8px 14px",
          borderRadius: "9999px",
          backgroundColor: "rgba(11, 11, 18, 0.85)",
          backdropFilter: "blur(20px)",
          border: isEditMode ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: isEditMode
            ? "0 8px 30px rgba(99, 102, 241, 0.4), 0 0 20px rgba(99, 102, 241, 0.2)"
            : "0 8px 30px rgba(0, 0, 0, 0.6)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: isEditMode ? "#34d399" : "#6366f1",
              boxShadow: isEditMode ? "0 0 8px #34d399" : "none"
            }}
          />
          <span style={{ fontSize: isMobile ? "0.68rem" : "0.75rem", fontWeight: 800, color: "#ffffff", letterSpacing: "0.05em" }}>
            ADMIN
          </span>
        </div>

        <button
          onClick={() => setIsEditMode(!isEditMode)}
          style={{
            padding: isMobile ? "4px 8px" : "5px 12px",
            borderRadius: "9999px",
            backgroundColor: isEditMode ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.08)",
            border: isEditMode ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.1)",
            color: isEditMode ? "#a5b4fc" : "rgba(255, 255, 255, 0.8)",
            fontSize: isMobile ? "0.68rem" : "0.74rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "4px",
            cursor: "pointer"
          }}
        >
          {isEditMode ? <EyeOff size={12} /> : <Eye size={12} />}
          <span>{isEditMode ? "Tắt" : (isMobile ? "Inspector" : "Visual Inspector")}</span>
        </button>

        <a
          href="/admin"
          style={{
            padding: isMobile ? "4px 8px" : "5px 10px",
            borderRadius: "9999px",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#ffffff",
            fontSize: isMobile ? "0.68rem" : "0.74rem",
            fontWeight: 700,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "3px"
          }}
        >
          <span>{isMobile ? "Portal" : "Admin Portal"}</span>
          <ArrowUpRight size={11} />
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
