"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import MinimalLoader from "./MinimalLoader";
import SceneLoader from "./SceneLoader";
import { Canvas } from "@react-three/fiber";
import { Loader } from "@react-three/drei";

const DynamicGhibliScene = dynamic(
  () =>
    new Promise((resolve) => {
      setTimeout(() => resolve(import("./scene")), 1500); // artificial delay for loader test
    }),
  {
    ssr: false,
    loading: () => <SceneLoader />,
  }
);

const LazyGhibliSection: React.FC = () => {
  const [showScene, setShowScene] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById("ghibli-section");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        !showScene
      ) {
        setShowScene(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // check on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showScene]);

  return (
    <section
      id="ghibli-section"
      style={{
        height: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        background: "transparent",
        zIndex: 2,
      }}
    >
      {!showScene && <MinimalLoader />}
      {showScene && (
        <>
          <Canvas style={{ width: "100%", height: "100%", position: "relative", zIndex: 1 }}>
            <DynamicGhibliScene />
          </Canvas>
          <Loader />
        </>
      )}
    </section>
  );
};

export default LazyGhibliSection;
