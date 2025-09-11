
"use client";

import React, { useEffect, useState } from "react";

const NeonLineLoader: React.FC = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Hide loader when page is fully loaded
    const onLoad = () => setShow(false);
    if (document.readyState === "complete") {
      setShow(false);
    } else {
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "4px",
      zIndex: 9999,
      background: "transparent"
    }}>
      <div style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, #00f0ff 0%, #0055ff 100%)",
        boxShadow: "0 0 12px 2px #00f0ff, 0 0 24px 4px #0055ff",
        borderRadius: "2px",
        animation: "neon-loader-move 1.2s linear infinite"
      }} />
      <style>{`
        @keyframes neon-loader-move {
          0% { transform: scaleX(0); opacity: 0.7; }
          10% { opacity: 1; }
          100% { transform: scaleX(1); opacity: 1; }
        }
        div[style*='linear-gradient'] {
          transform-origin: left;
        }
      `}</style>
    </div>
  );
};

export default NeonLineLoader;
