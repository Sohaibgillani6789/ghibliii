import React from "react";

const MinimalLoader: React.FC = () => (
  <div className="flex items-center justify-center w-full h-full bg-transparent absolute top-0 left-0 z-50">
    <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
  </div>
);

export default MinimalLoader;