import { Html } from "@react-three/drei";
import React from "react";

const SceneLoader: React.FC = () => (
  <Html center>
    <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
  </Html>
);

export default SceneLoader;
