"use client";

import { useEffect, useRef } from "react";

export const INTRO_VIDEOS = {
  world: {
    src: "/assets/intro/v1/essma-world-intro-video.mp4",
    width: 464,
    height: 688,
  },
  "essma-bros": {
    src: "/assets/intro/v1/essma-bros-intro-video.mp4",
    width: 736,
    height: 400,
  },
  "essma-kart": {
    src: "/assets/intro/v1/essma-kart-intro-video.mp4",
    width: 464,
    height: 688,
  },
} as const;

export type IntroId = keyof typeof INTRO_VIDEOS;

type IntroVideosProps = {
  introId: IntroId;
  muted: boolean;
  onDone: () => void;
};

export default function IntroVideos({
  introId,
  muted,
  onDone,
}: IntroVideosProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const doneRef = useRef(onDone);
  const clip = INTRO_VIDEOS[introId];

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  function finish() {
    doneRef.current();
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
        doneRef.current();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      video.pause();
    };
  }, [introId, muted]);

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
        key={clip.src}
        ref={videoRef}
        className="intro-videos-player"
        src={clip.src}
        autoPlay
        muted={muted}
        playsInline
        preload="auto"
        controls={false}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        onEnded={finish}
        onError={finish}
        onContextMenu={(event) => event.preventDefault()}
        onPointerDown={() => {
          const video = videoRef.current;
          if (video?.paused) void video.play().catch(() => undefined);
        }}
        style={{
          aspectRatio: `${clip.width} / ${clip.height}`,
          width: `min(100vw, calc(100svh * ${clip.width} / ${clip.height}))`,
          height: "auto",
          maxWidth: "100vw",
          maxHeight: "100svh",
        }}
      />
    </div>
  );
}
