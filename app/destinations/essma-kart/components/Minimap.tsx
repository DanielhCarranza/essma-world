import React, { useEffect, useRef } from 'react';
import { ALL_TRACKS } from '../game/trackData';
import { useGameStore } from '../store/gameStore';
import { Vector3D } from '../types';

export const Minimap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectedTrack = useGameStore((state) => state.selectedTrack);

  const activeTrackObj = ALL_TRACKS.find((t) => t.id === selectedTrack) || ALL_TRACKS[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const width = canvas.width;
    const height = canvas.height;

    const spline = activeTrackObj.spline;

    // Compute bounding box for current track
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;

    spline.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
    });

    minX -= 40;
    maxX += 40;
    minZ -= 40;
    maxZ += 40;

    const scaleX = (x: number) => ((x - minX) / (maxX - minX)) * (width - 24) + 12;
    const scaleZ = (z: number) => ((z - minZ) / (maxZ - minZ)) * (height - 24) + 12;

    const renderMinimap = () => {
      const { playerPosition, playerRotationY, aiPositions } = useGameStore.getState();

      // Clear background
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Track Spline Path
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      spline.forEach((p, idx) => {
        const cx = scaleX(p.x);
        const cy = scaleZ(p.z);
        if (idx === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.closePath();
      ctx.stroke();

      // Inner track line
      ctx.beginPath();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 4;
      spline.forEach((p, idx) => {
        const cx = scaleX(p.x);
        const cy = scaleZ(p.z);
        if (idx === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.closePath();
      ctx.stroke();

      // 2. Draw Start Line
      const startX = scaleX(spline[0].x);
      const startZ = scaleZ(spline[0].z);
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(startX, startZ, 4, 0, Math.PI * 2);
      ctx.fill();

      // 3. Draw AI Racers (Yellow dots)
      aiPositions.forEach((pos) => {
        const ax = scaleX(pos.x);
        const az = scaleZ(pos.z);
        ctx.fillStyle = '#EAB308';
        ctx.beginPath();
        ctx.arc(ax, az, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Draw Player Racer (Pink Arrow / Glowing Dot)
      const px = scaleX(playerPosition.x);
      const pz = scaleZ(playerPosition.z);

      // Glow
      ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
      ctx.beginPath();
      ctx.arc(px, pz, 9, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.fillStyle = '#EC4899';
      ctx.beginPath();
      ctx.arc(px, pz, 5, 0, Math.PI * 2);
      ctx.fill();

      // Heading indicator
      const dirX = -Math.sin(playerRotationY) * 10;
      const dirZ = -Math.cos(playerRotationY) * 10;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, pz);
      ctx.lineTo(px + dirX, pz + dirZ);
      ctx.stroke();

      animId = requestAnimationFrame(renderMinimap);
    };

    renderMinimap();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [activeTrackObj]);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border-2 border-slate-700/80 rounded-2xl p-2 shadow-2xl flex flex-col items-center">
      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1 truncate max-w-[120px]">
        {activeTrackObj.name}
      </span>
      <canvas ref={canvasRef} width={130} height={130} className="rounded-xl bg-slate-950/80" />
    </div>
  );
};
