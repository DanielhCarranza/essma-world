import React, { useEffect, useRef } from 'react';
import { TrackData } from '../game/trackData';

interface TrackCardImageProps {
  track: TrackData;
  isSelected: boolean;
  className?: string;
}

export const TrackCardImage: React.FC<TrackCardImageProps> = ({ track, isSelected, className = 'w-full h-28' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Environment Background based on track theme / ID
    if (track.id === 'desierto_sonora' || track.id === 'sonora') {
      // Golden Hour Sonoran Sunset
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#f97316'); // Warm Orange
      grad.addColorStop(0.4, '#fbbf24'); // Yellow Sun
      grad.addColorStop(0.8, '#d97706'); // Red Canyons
      grad.addColorStop(1, '#78350f'); // Dirt Track
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Sun
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(width * 0.7, height * 0.3, 18, 0, Math.PI * 2);
      ctx.fill();

      // Cacti Silhouettes
      ctx.fillStyle = '#451a03';
      ctx.fillRect(20, height * 0.45, 4, 18);
      ctx.fillRect(16, height * 0.52, 12, 3);
      ctx.fillRect(16, height * 0.48, 3, 5);
      ctx.fillRect(25, height * 0.48, 3, 5);

      ctx.fillRect(width - 24, height * 0.4, 5, 22);
      ctx.fillRect(width - 29, height * 0.48, 15, 3);
      ctx.fillRect(width - 29, height * 0.43, 3, 6);
      ctx.fillRect(width - 17, height * 0.43, 3, 6);

      // Rock Archway Frame
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#9a3412';
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.35, 28, Math.PI, 0);
      ctx.stroke();

    } else if (track.id === 'pueblo_cactus' || track.id === 'ranchero_fiesta') {
      // Pueblo del Cactus Day Festival
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#f59e0b'); // Warm Sun
      grad.addColorStop(0.5, '#fef08a'); // Sky
      grad.addColorStop(1, '#78350f'); // Cobblestone
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Papel Picado Strings (Festive Flags)
      const flagColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'];
      ctx.beginPath();
      ctx.moveTo(0, 12);
      ctx.quadraticCurveTo(width / 2, 28, width, 12);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      for (let i = 0; i < 7; i++) {
        const x = 15 + i * ((width - 30) / 6);
        const y = 14 + Math.sin((i / 6) * Math.PI) * 12;
        ctx.fillStyle = flagColors[i % flagColors.length];
        ctx.fillRect(x - 4, y, 8, 9);
      }

    } else if (track.id === 'cueva_coyote' || track.id === 'cueva_cristales') {
      // Underground Crystal Cavern
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#0f172a'); // Cavern Darkness
      grad.addColorStop(0.6, '#1e1b4b'); // Purple Glow
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Glowing Crystals
      const drawCrystal = (cx: number, cy: number, color: string, scale = 1) => {
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 12 * scale);
        ctx.lineTo(cx + 6 * scale, cy);
        ctx.lineTo(cx + 4 * scale, cy + 10 * scale);
        ctx.lineTo(cx - 4 * scale, cy + 10 * scale);
        ctx.lineTo(cx - 6 * scale, cy);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      };

      drawCrystal(18, height * 0.6, '#38bdf8', 1.2);
      drawCrystal(width - 20, height * 0.5, '#c084fc', 1.4);
      drawCrystal(width * 0.4, 25, '#38bdf8', 0.9);

    } else {
      // Oasis Escondido (Tropical Waterfalls)
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#0284c7'); // Tropical Sky
      grad.addColorStop(0.4, '#38bdf8'); // Water Blue
      grad.addColorStop(0.8, '#059669'); // Jungle Green
      grad.addColorStop(1, '#064e3b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Waterfall Stream
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(width * 0.45, 0, 14, height * 0.6);

      // Palm Trees
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(22, 22, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(width - 22, 22, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Compute Spline Bounds to overlay Track Layout
    const spline = track.spline;
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    spline.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
    });

    const padding = 20;
    const scaleX = (x: number) => ((x - minX) / (maxX - minX)) * (width - padding * 2) + padding;
    const scaleZ = (z: number) => ((z - minZ) / (maxZ - minZ)) * (height - padding * 2) + padding;

    // Draw Track Border Shadow
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    spline.forEach((p, idx) => {
      const cx = scaleX(p.x);
      const cy = scaleZ(p.z);
      if (idx === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.closePath();
    ctx.stroke();

    // Draw Asphalt/Dirt Track Ribbon
    ctx.lineWidth = 6;
    ctx.strokeStyle = track.id === 'sonora' ? '#fde047' : track.id === 'cueva_cristales' ? '#38bdf8' : '#ffffff';
    ctx.stroke();

    // Draw Center Dashed Line
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#000000';
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Start/Finish Checkered Flag Icon Dot
    const startX = scaleX(spline[0].x);
    const startZ = scaleZ(spline[0].z);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(startX, startZ, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

  }, [track]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-3 transition-all ${
        isSelected ? 'border-amber-500 shadow-md ring-2 ring-amber-400' : 'border-stone-300'
      } ${className}`}
    >
      <canvas ref={canvasRef} width={240} height={120} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex flex-col justify-between p-2 text-white pointer-events-none">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
            {track.name}
          </span>
          <span className="text-[10px] font-extrabold bg-black/60 px-2 py-0.5 rounded-full text-amber-400">
            🏁 3 LAPS
          </span>
        </div>
        <p className="text-[10px] text-amber-100/90 font-semibold line-clamp-1 truncate">
          {track.description}
        </p>
      </div>
    </div>
  );
};
