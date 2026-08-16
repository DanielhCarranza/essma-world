"use client";

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './engine';
import { DESERT_LEVEL, MINE_LEVEL, BOSS_LEVEL } from './levels';
import { audioEngine } from './audio';

const LEVELS = {
  'desert': DESERT_LEVEL,
  'mine': MINE_LEVEL,
  'boss': BOSS_LEVEL,
};

interface GameViewProps {
  playerImageSrc?: string;
  enemyImageSrc?: string;
  cowImageSrc?: string;
  bgImageSrc?: string;
  mineBgImageSrc?: string;
  bossBgImageSrc?: string;
  characterId: string;
  onScoreChange?: (score: number, tacos: number) => void;
}

export default function GameView({ playerImageSrc, enemyImageSrc, cowImageSrc, bgImageSrc, mineBgImageSrc, bossBgImageSrc, characterId, onScoreChange }: GameViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'gameover' | 'win'>('playing');
  const [gameKey, setGameKey] = useState(0);
  const engineRef = useRef<GameEngine | null>(null);
  const playerImageRef = useRef<HTMLImageElement | null>(null);
  const enemyImageRef = useRef<HTMLImageElement | null>(null);
  const cowImageRef = useRef<HTMLImageElement | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const mineBgImageRef = useRef<HTMLImageElement | null>(null);
  const bossBgImageRef = useRef<HTMLImageElement | null>(null);

  // Initialize audio on first click anywhere
  useEffect(() => {
    const initAudio = () => {
      audioEngine.init();
      window.removeEventListener('pointerdown', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
    window.addEventListener('pointerdown', initAudio);
    window.addEventListener('keydown', initAudio);
    return () => {
      window.removeEventListener('pointerdown', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  // Helper to load images with transparent background
  const loadTransparentImage = (src: string, ref: React.MutableRefObject<HTMLImageElement | null>) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          
          const w = canvas.width;
          const h = canvas.height;
          
          // Background color at (0,0)
          const r0 = data[0];
          const g0 = data[1];
          const b0 = data[2];

          if (r0 > 240 && g0 > 240 && b0 > 240) {
            const visited = new Uint8Array(w * h);
            const stack = [0]; 
            visited[0] = 1;
            
            while (stack.length > 0) {
              const idx = stack.pop()!;
              const x = idx % w;
              const y = Math.floor(idx / w);
              
              const pixelIdx = (y * w + x) * 4;
              data[pixelIdx + 3] = 0; // Make transparent
              
              // Neighbors
              if (x + 1 < w) {
                const nIdx = y * w + (x + 1);
                if (!visited[nIdx]) {
                  const pIdx = nIdx * 4;
                  if (data[pIdx] > 240 && data[pIdx+1] > 240 && data[pIdx+2] > 240) {
                    visited[nIdx] = 1;
                    stack.push(nIdx);
                  }
                }
              }
              if (x - 1 >= 0) {
                const nIdx = y * w + (x - 1);
                if (!visited[nIdx]) {
                  const pIdx = nIdx * 4;
                  if (data[pIdx] > 240 && data[pIdx+1] > 240 && data[pIdx+2] > 240) {
                    visited[nIdx] = 1;
                    stack.push(nIdx);
                  }
                }
              }
              if (y + 1 < h) {
                const nIdx = (y + 1) * w + x;
                if (!visited[nIdx]) {
                  const pIdx = nIdx * 4;
                  if (data[pIdx] > 240 && data[pIdx+1] > 240 && data[pIdx+2] > 240) {
                    visited[nIdx] = 1;
                    stack.push(nIdx);
                  }
                }
              }
              if (y - 1 >= 0) {
                const nIdx = (y - 1) * w + x;
                if (!visited[nIdx]) {
                  const pIdx = nIdx * 4;
                  if (data[pIdx] > 240 && data[pIdx+1] > 240 && data[pIdx+2] > 240) {
                    visited[nIdx] = 1;
                    stack.push(nIdx);
                  }
                }
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);
          const tImg = new Image();
          tImg.src = canvas.toDataURL();
          tImg.onload = () => {
            ref.current = tImg;
          };
        } else {
          ref.current = img;
        }
      } catch (e) {
        ref.current = img;
      }
    };
  };

  // Load player image
  useEffect(() => {
    if (playerImageSrc) {
      loadTransparentImage(playerImageSrc, playerImageRef);
    } else {
      playerImageRef.current = null;
    }
  }, [playerImageSrc]);

  // Load enemy image
  useEffect(() => {
    if (enemyImageSrc) {
      loadTransparentImage(enemyImageSrc, enemyImageRef);
    } else {
      enemyImageRef.current = null;
    }
  }, [enemyImageSrc]);

  // Load cow image
  useEffect(() => {
    if (cowImageSrc) {
      loadTransparentImage(cowImageSrc, cowImageRef);
    } else {
      cowImageRef.current = null;
    }
  }, [cowImageSrc]);

  // Load bg image
  useEffect(() => {
    if (bgImageSrc) {
      const img = new Image();
      img.src = bgImageSrc;
      img.onload = () => {
        bgImageRef.current = img;
      };
    } else {
      bgImageRef.current = null;
    }
  }, [bgImageSrc]);

  // Load boss bg image
  useEffect(() => {
    if (bossBgImageSrc) {
      const img = new Image();
      img.src = bossBgImageSrc;
      img.onload = () => {
        bossBgImageRef.current = img;
      };
    } else {
      bossBgImageRef.current = null;
    }
  }, [bossBgImageSrc]);

  // Load mine bg image
  useEffect(() => {
    if (mineBgImageSrc) {
      const img = new Image();
      img.src = mineBgImageSrc;
      img.onload = () => {
        mineBgImageRef.current = img;
      };
    } else {
      mineBgImageRef.current = null;
    }
  }, [mineBgImageSrc]);

  const onScoreChangeRef = useRef(onScoreChange);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    onScoreChangeRef.current = onScoreChange;
  }, [onScoreChange]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = Math.floor(rect.width);
        canvas.height = Math.floor(rect.height);
        if (engineRef.current) {
          engineRef.current.camera.w = canvas.width;
          engineRef.current.camera.h = canvas.height;
        }
      }
    };

    updateCanvasSize();
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(container);

    let lastTime = performance.now();
    let animationFrameId: number;

    const startLevel = (levelId: string, startX?: number, startY?: number) => {
      const lvl = LEVELS[levelId as keyof typeof LEVELS];
      const engine = new GameEngine(lvl, characterId);
      if (startX !== undefined) engine.player.x = startX;
      if (startY !== undefined) engine.player.y = startY;
      
      audioEngine.setTone(levelId === 'boss' ? 'boss' : (levelId === 'mine' ? 'mine' : 'normal'));
      
      engine.onDie = () => {
        audioEngine.stopBGM();
        audioEngine.playDie();
        setGameState('gameover');
      };
      engine.onWin = () => {
        audioEngine.stopBGM();
        audioEngine.playWin();
        setGameState('win');
      };
      engine.onScoreChange = (score, tacos) => onScoreChangeRef.current?.(score, tacos);
      engine.onPortal = (target, x, y) => {
        startLevel(target, x, y);
      };
      
      engine.onJump = () => audioEngine.playJump();
      engine.onTaco = () => audioEngine.playTaco();
      engine.onStomp = () => audioEngine.playStomp();

      engineRef.current = engine;
      setGameState('playing');
    };

    // Initialize first level
    startLevel('desert');

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const engine = engineRef.current;
      if (engine && gameStateRef.current === 'playing') {
        engine.update(dt);
        render(ctx, engine);
      } else if (engine) {
         // still render the game in background if dead
         render(ctx, engine);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') engine.keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') engine.keys.right = true;
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') engine.keys.up = true;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') engine.keys.down = true;
      if (e.code === 'KeyX' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') engine.keys.action = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') engine.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') engine.keys.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') engine.keys.up = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') engine.keys.down = false;
      if (e.code === 'KeyX' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') engine.keys.action = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [characterId, gameKey]);

  const render = (ctx: CanvasRenderingContext2D, engine: GameEngine) => {
    const canvasW = ctx.canvas.width;
    const canvasH = ctx.canvas.height;
    engine.camera.w = canvasW;
    engine.camera.h = canvasH;

    // Clear & bg
    ctx.fillStyle = engine.level.bgColor;
    ctx.fillRect(0, 0, canvasW, canvasH);
    
    if (bgImageRef.current && engine.level.id === 'desert') {
      ctx.drawImage(bgImageRef.current, 0, 0, canvasW, canvasH);
    } else if (bossBgImageRef.current && engine.level.id === 'boss') {
      ctx.drawImage(bossBgImageRef.current, 0, 0, canvasW, canvasH);
    } else if (mineBgImageRef.current && engine.level.id === 'mine') {
      ctx.drawImage(mineBgImageRef.current, 0, 0, canvasW, canvasH);
    }

    ctx.save();
    ctx.translate(-Math.floor(engine.camera.x), -Math.floor(engine.camera.y));

    // Draw entities
    engine.entities.forEach(e => {
      if (e.dead) return;
      
      ctx.fillStyle = e.color || '#fff';
      if (e.type === 'portal') {
        // Portal visual (a door or pipe)
        ctx.fillRect(e.x, e.y, e.w, e.h);
        ctx.fillStyle = '#000';
        ctx.fillRect(e.x + 10, e.y + 10, e.w - 20, e.h);
      } else if (e.type === 'enemy') {
        const spriteToUse = e.text === 'Cow' ? cowImageRef.current : enemyImageRef.current;
        
        if (e.text === 'Tumbleweed') {
          // Draw tumbleweed
          ctx.fillStyle = '#d4a373';
          ctx.beginPath();
          ctx.arc(e.x + e.w/2, e.y + e.h/2, e.w/2, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = '#8b5a2b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(e.x + e.w/2, e.y + e.h/2, e.w/2, 0, Math.PI * 2);
          ctx.stroke();
          
          // Draw some squiggly lines inside
          ctx.beginPath();
          ctx.moveTo(e.x + 5, e.y + 15);
          ctx.lineTo(e.x + 25, e.y + 15);
          ctx.moveTo(e.x + 10, e.y + 5);
          ctx.lineTo(e.x + 20, e.y + 25);
          ctx.stroke();

        } else if (spriteToUse) {
          ctx.save();
          // Assuming the sprite faces left by default based on prompt
          if (e.vx > 0) {
            ctx.translate(e.x + e.w, e.y);
            ctx.scale(-1, 1);
            ctx.drawImage(spriteToUse, 0, 0, e.w, e.h);
          } else {
            ctx.drawImage(spriteToUse, e.x, e.y, e.w, e.h);
          }
          ctx.restore();
        } else {
          // Fallback Bear ears / Cow horns
          if (e.text !== 'Cow') {
            ctx.fillRect(e.x, e.y - 5, 10, 10); 
            ctx.fillRect(e.x + e.w - 10, e.y - 5, 10, 10);
          } else {
            ctx.fillRect(e.x + 5, e.y - 8, 5, 10); 
            ctx.fillRect(e.x + e.w - 10, e.y - 8, 5, 10);
          }
          
          // Body
          ctx.fillRect(e.x, e.y, e.w, e.h);
          
          // Eyes
          ctx.fillStyle = '#000';
          ctx.fillRect(e.x + 5, e.y + 10, 5, 5);
          ctx.fillRect(e.x + e.w - 10, e.y + 10, 5, 5);
        }
      } else if (e.type === 'boss') {
        // Draw Capybara Boss
        ctx.fillStyle = e.color || '#8B4513';
        // Body
        ctx.fillRect(e.x, e.y + e.h * 0.2, e.w, e.h * 0.8);
        // Head
        ctx.fillRect(e.x - e.w * 0.2, e.y, e.w * 0.6, e.h * 0.5);
        // Ears
        ctx.fillRect(e.x - e.w * 0.1, e.y - 10, 20, 20);
        ctx.fillRect(e.x + e.w * 0.2, e.y - 10, 20, 20);
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(e.x - e.w * 0.05, e.y + 20, 10, 10);
        ctx.fillRect(e.x + e.w * 0.15, e.y + 20, 10, 10);
        // Nose
        ctx.fillRect(e.x - e.w * 0.2, e.y + 40, 15, 15);
        
        // Health Bar
        if (e.health !== undefined) {
          ctx.fillStyle = '#f00';
          ctx.fillRect(e.x, e.y - 20, e.w, 10);
          ctx.fillStyle = '#0f0';
          ctx.fillRect(e.x, e.y - 20, e.w * (e.health / 3), 10); // assuming max health is 3 for this level
        }
      
      } else if (e.type === 'attack' || e.type === 'projectile') {
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const cx = e.x + e.w / 2;
        const cy = e.y + e.h / 2;
        
        if (e.text === 'fireball') {
           ctx.fillText('🔥', cx, cy);
        } else if (e.text === 'lasso') {
           ctx.fillText('➰', cx, cy);
        } else if (e.text === 'sombrero') {
           // Draw sombrero
           ctx.fillStyle = e.color || '#e67e22';
           ctx.beginPath();
           ctx.ellipse(cx, cy, e.w/2, e.h/4, 0, 0, Math.PI * 2);
           ctx.fill();
           ctx.beginPath();
           ctx.ellipse(cx, cy - e.h/4, e.w/4, e.h/3, 0, Math.PI, 0);
           ctx.fill();
        } else if (e.text === 'slide') {
           ctx.fillText('🌵', cx, cy);
        } else if (e.text === 'maraca') {
           ctx.fillStyle = e.color || 'rgba(52, 152, 219, 0.5)';
           ctx.beginPath();
           ctx.arc(cx, cy, Math.max(e.w, e.h)/2, 0, Math.PI * 2);
           ctx.fill();
           ctx.fillText('🪇', cx, cy);
        } else {
           // default projectile
           ctx.fillStyle = e.color || '#654321';
           ctx.beginPath();
           ctx.arc(cx, cy, e.w / 2, 0, Math.PI * 2);
           ctx.fill();
        }
      } else if (e.type === 'powerup') {
        ctx.fillStyle = e.powerupType === 'red_salsa' ? '#e74c3c' : '#2ecc71';
        // Draw salsa bottle
        ctx.fillRect(e.x + 5, e.y + 10, 20, 20); // body
        ctx.fillRect(e.x + 10, e.y, 10, 10); // neck
        ctx.fillStyle = '#fff';
        ctx.fillRect(e.x + 5, e.y + 15, 20, 10); // label
        ctx.fillStyle = '#000';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText('SALSA', e.x + 6, e.y + 23);
      } else if (e.type === 'taco') {
        ctx.fillStyle = e.color || '#facc15';
        ctx.beginPath();
        ctx.arc(e.x + e.w / 2, e.y + e.h / 2 + 4, e.w / 2, Math.PI, 0); 
        ctx.fill();
        ctx.fillStyle = '#22c55e'; // lettuce
        ctx.fillRect(e.x + 2, e.y + e.h / 2, e.w - 4, 4);
        ctx.fillStyle = '#ef4444'; // tomato
        ctx.fillRect(e.x + 5, e.y + e.h / 2 - 2, 4, 2);
      } else if (e.type === 'plant') {
        // Draw a carnivorous plant
        ctx.fillStyle = '#2ecc71'; // Green stem
        ctx.fillRect(e.x + e.w * 0.4, e.y + e.h * 0.4, e.w * 0.2, e.h * 0.6); // Stem
        
        ctx.fillStyle = '#e74c3c'; // Red head
        ctx.beginPath();
        ctx.arc(e.x + e.w / 2, e.y + e.h * 0.4, e.w * 0.4, 0, Math.PI, true); // Top jaw
        ctx.fill();
        ctx.beginPath();
        ctx.arc(e.x + e.w / 2, e.y + e.h * 0.4, e.w * 0.4, 0, Math.PI, false); // Bottom jaw
        ctx.fill();
        
        // Teeth
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(e.x + e.w * 0.1 + i * e.w * 0.2, e.y + e.h * 0.4);
          ctx.lineTo(e.x + e.w * 0.2 + i * e.w * 0.2, e.y + e.h * 0.4 + 10);
          ctx.lineTo(e.x + e.w * 0.3 + i * e.w * 0.2, e.y + e.h * 0.4);
          ctx.fill();
        }
      } else if (e.type === 'spike') {
        // Draw a nice cactus
        ctx.fillStyle = '#2d6a4f'; // Dark green
        // Main trunk
        ctx.fillRect(e.x + e.w * 0.3, e.y, e.w * 0.4, e.h);
        ctx.beginPath();
        ctx.arc(e.x + e.w / 2, e.y, e.w * 0.2, Math.PI, 0);
        ctx.fill();
        
        // Left arm
        ctx.fillRect(e.x, e.y + e.h * 0.4, e.w * 0.3, e.h * 0.15);
        ctx.fillRect(e.x, e.y + e.h * 0.2, e.w * 0.15, e.h * 0.35);
        
        // Right arm
        ctx.fillRect(e.x + e.w * 0.7, e.y + e.h * 0.3, e.w * 0.3, e.h * 0.15);
        ctx.fillRect(e.x + e.w * 0.85, e.y + e.h * 0.1, e.w * 0.15, e.h * 0.35);
        
        // Prickles
        ctx.fillStyle = '#95d5b2'; // Light green for prickles
        ctx.fillRect(e.x + e.w * 0.4, e.y + 10, 2, 2);
        ctx.fillRect(e.x + e.w * 0.6, e.y + 25, 2, 2);
        ctx.fillRect(e.x + e.w * 0.4, e.y + 40, 2, 2);
        ctx.fillRect(e.x + 2, e.y + e.h * 0.3, 2, 2);
        ctx.fillRect(e.x + e.w * 0.9, e.y + e.h * 0.2, 2, 2);

      } else {
        // Block / platform rendering
        ctx.fillRect(e.x, e.y, e.w, e.h);
        
        // Add a clean top trim for ground & floating platforms
        ctx.save();
        if (e.id.startsWith('g') || e.id.startsWith('bg') || e.id.startsWith('mg')) {
          ctx.fillStyle = e.id.startsWith('bg') ? '#2ecc71' : e.id.startsWith('mg') ? '#34495e' : '#f77f00';
          ctx.fillRect(e.x, e.y, e.w, 6);
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.fillRect(e.x, e.y, e.w, 4);
        }
        ctx.restore();
      }

      if (e.text) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(e.text, e.x + e.w / 2, e.y - 10);
        ctx.textAlign = 'left'; // Reset
      }
    });

    // Draw player
    const p = engine.player;
    if (playerImageRef.current) {
      // Draw image
      ctx.save();
      if (!p.facingRight) {
        ctx.translate(p.x + p.w, p.y);
        ctx.scale(-1, 1);
        ctx.drawImage(playerImageRef.current, 0, 0, p.w, p.h);
      } else {
        ctx.drawImage(playerImageRef.current, p.x, p.y, p.w, p.h);
      }
      ctx.restore();
    } else {
      // Fallback shape
      ctx.fillStyle = p.color || '#f00';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      // Eye to show direction
      ctx.fillStyle = '#000';
      if (p.facingRight) {
        ctx.fillRect(p.x + p.w - 10, p.y + 10, 5, 5);
      } else {
        ctx.fillRect(p.x + 5, p.y + 10, 5, 5);
      }
    }

    // Draw player name
    const charName = characterId.charAt(0).toUpperCase() + characterId.slice(1);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    // Add text shadow for better contrast
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(charName, p.x + p.w / 2, p.y - 15);
    ctx.shadowBlur = 0; // Reset
    ctx.textAlign = 'left'; // Reset

    // Draw particles
    engine.particles.forEach(p => {
      ctx.globalAlpha = 1 - (p.time / p.maxTime); // fade out
      ctx.fillStyle = p.color;
      if (p.text) {
        ctx.font = 'bold 20px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(p.text, p.x, p.y);
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
      } else {
        ctx.fillRect(p.x, p.y, 8, 8); // draw small rect
      }
    });
    ctx.globalAlpha = 1.0;

    ctx.restore();
  };

  const restart = () => {
    setGameState('playing');
    setGameKey(k => k + 1);
    audioEngine.startBGM();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#38bdf8] select-none">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block select-none" 
      />
      
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6 text-center animate-fade-in">
          <h2 className="text-5xl font-black text-red-500 mb-2 drop-shadow-[0_4px_12px_rgba(239,68,68,0.5)] tracking-wider uppercase">GAME OVER</h2>
          <p className="text-gray-300 text-sm mb-6 max-w-xs font-medium">Don't give up! The Sonora Desert awaits your return.</p>
          <button 
            onClick={restart}
            className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-950 font-extrabold rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all text-base tracking-wider uppercase"
          >
            Try Again
          </button>
        </div>
      )}

      {gameState === 'win' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6 text-center animate-fade-in">
          <h2 className="text-5xl font-black text-yellow-400 mb-2 drop-shadow-[0_4px_12px_rgba(250,204,21,0.5)] tracking-wider uppercase">VICTORY!</h2>
          <p className="text-gray-200 text-base mb-6 font-semibold">You conquered all levels of the Sonora Desert!</p>
          <button 
            onClick={restart}
            className="px-8 py-3 bg-gradient-to-r from-emerald-400 to-green-500 text-gray-950 font-extrabold rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all text-base tracking-wider uppercase"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
