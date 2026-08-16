"use client";

import { useEffect, useRef, useState } from "react";

export const INTRO_VIDEO_SOURCES = [
  "/assets/intro/v1/essma-world-intro-video.mp4",
  "/assets/intro/v1/essma-bros-intro-video.mp4",
  "/assets/intro/v1/essma-kart-intro-video.mp4",
] as const;

type IntroVideosProps = {
  muted: boolean;
  onDone: () => void;
};

export default function IntroVideos({ muted, onDone }: IntroVideosProps) {
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const source = INTRO_VIDEO_SOURCES[index];

  function finish() {
    doneRef.current();
  }

  function advance() {
    if (index + 1 >= INTRO_VIDEO_SOURCES.length) {
      finish();
      return;
    }
    setIndex((current) => current + 1);
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    video.controls = false;
    void video.play().catch(() => undefined);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      video.pause();
    };
  }, [index, muted]);

  return (
    <div className="intro-videos" role="dialog" aria-label="Introducción">
      <button
        type="button"
        className="intro-videos-close"
        onClick={finish}
        aria-label="Cerrar"
      >
        ×
      </button>
      <video
        key={source}
        ref={videoRef}
        className="intro-videos-player"
        src={source}
        autoPlay
        muted={muted}
        playsInline
        preload="auto"
        controls={false}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        onEnded={advance}
        onError={advance}
        onContextMenu={(event) => event.preventDefault()}
        onPointerDown={() => {
          const video = videoRef.current;
          if (video?.paused) void video.play().catch(() => undefined);
        }}
      />
    </div>
  );
}
