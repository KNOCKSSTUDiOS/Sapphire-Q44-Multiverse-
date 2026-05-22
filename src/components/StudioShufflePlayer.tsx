'use strict';

import React, { useEffect, useRef, useState } from 'react';

const SOURCES: string[] = [
  '/media/scene1_8k.m3u8',
  '/media/scene2_8k.m3u8',
  '/media/scene3_8k.m3u8'
];

export const StudioShufflePlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const src = SOURCES[index];
    video.src = src;
    void video.play();
  }, [index]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SOURCES.length);
    }, 30000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="studio-shell">
      <video
        ref={videoRef}
        className="studio-video"
        autoPlay
        muted
        playsInline
      />
      <button
        className="studio-shuffle"
        onClick={() => setIndex((i) => (i + 1) % SOURCES.length)}
      >
        Shuffle Scene
      </button>
    </div>
  );
};

