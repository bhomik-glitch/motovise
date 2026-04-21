"use client";

interface VideoPlayerProps {
  src: string;
  className?: string;
}

export function VideoPlayer({ src, className }: VideoPlayerProps) {
  return (
    <video
      src={src}
      autoPlay
      loop
      muted
      playsInline
      className={className}
    />
  );
}
