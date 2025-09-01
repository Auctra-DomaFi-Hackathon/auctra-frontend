"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import dynamic from "next/dynamic";

const World = dynamic(() => import("../ui/globe").then((m) => m.World), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  ),
});

export function GlobeDemo() {
  const [globeData, setGlobeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGlobeData = async () => {
      try {
        const response = await fetch('/components/ui/globe-data.json');
        const data = await response.json();
        setGlobeData(data);
      } catch (error) {
        console.error('Failed to load globe data:', error);
        // Fallback data
        setGlobeData({
          globeConfig: {
            pointSize: 4,
            globeColor: "#062056",
            showAtmosphere: true,
            atmosphereColor: "#FFFFFF",
            atmosphereAltitude: 0.1,
            emissive: "#062056",
            emissiveIntensity: 0.1,
            shininess: 0.9,
            polygonColor: "rgba(255,255,255,0.7)",
            ambientLight: "#38bdf8",
            directionalLeftLight: "#ffffff",
            directionalTopLight: "#ffffff",
            pointLight: "#ffffff",
            arcTime: 1000,
            arcLength: 0.9,
            rings: 1,
            maxRings: 3,
            initialPosition: { lat: 22.3193, lng: 114.1694 },
            autoRotate: true,
            autoRotateSpeed: 0.5,
          },
          sampleArcs: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadGlobeData();
  }, []);

  const optimizedArcs = useMemo(() => {
    if (!globeData?.sampleArcs) return [];
    
    // Reduce arcs for better performance - show only first 15 arcs
    return globeData.sampleArcs.slice(0, 15);
  }, [globeData]);

  if (isLoading || !globeData) {
    return (
      <div className="flex flex-row items-center justify-center py-20 h-screen md:h-auto dark:bg-black bg-transparent relative w-full">
        <div className="max-w-7xl mx-auto w-full relative overflow-hidden h-full md:h-[40rem] px-4">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="text-sm text-gray-500 animate-pulse">Loading globe...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center justify-center py-20 h-screen md:h-auto dark:bg-black bg-transparent relative w-full">
      <div className="max-w-7xl mx-auto w-full relative overflow-hidden h-full md:h-[40rem] px-4">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1,
          }}
          className="div"
        >
        </motion.div>
        <div className="absolute w-full bottom-0 inset-x-0 h-40 bg-gradient-to-b pointer-events-none select-none from-transparent dark:to-black to-white z-40" />
        <div className="absolute w-full -bottom-20 h-72 md:h-full z-10">
          <World data={optimizedArcs} globeConfig={globeData.globeConfig} />
        </div>
      </div>
    </div>
  );
}
