import React from 'react';

export const CoverBackgroundIllustration: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden bg-gradient-to-b from-sky-400 via-amber-400 to-amber-800">
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 1200 675"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sky Gradient */}
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="45%" stopColor="#FDBA74" />
            <stop offset="70%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>

          {/* Dirt Track Gradient */}
          <linearGradient id="trackGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="50%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Mountain Gradient */}
          <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9A3412" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          {/* Heart Kart Pink Gradient */}
          <linearGradient id="pinkKartGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#BE185D" />
          </linearGradient>

          {/* Lightning Kart Blue Gradient */}
          <linearGradient id="blueKartGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          {/* Beetle Kart Green Gradient */}
          <linearGradient id="greenKartGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="50%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#14532D" />
          </linearGradient>

          {/* Butterfly Kart Purple Gradient */}
          <linearGradient id="purpleKartGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="50%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#581C87" />
          </linearGradient>
        </defs>

        {/* 1. Sky */}
        <rect width="1200" height="675" fill="url(#skyGrad)" />

        {/* Sun Glow */}
        <circle cx="600" cy="220" r="180" fill="#FEF08A" opacity="0.35" filter="blur(20px)" />

        {/* Clouds */}
        <path d="M 100 120 Q 140 90 180 120 Q 220 90 260 120 Q 280 140 240 160 L 120 160 Z" fill="#FFFFFF" opacity="0.75" />
        <path d="M 900 100 Q 940 70 980 100 Q 1020 70 1060 100 Q 1080 120 1040 140 L 920 140 Z" fill="#FFFFFF" opacity="0.65" />

        {/* Hot Air Balloons */}
        {/* Balloon 1: Blue/Yellow with Paw */}
        <g transform="translate(200, 90) scale(0.85)">
          <path d="M 0 0 C -40 -60, 40 -60, 0 0 Z" fill="#2563EB" />
          <ellipse cx="0" cy="-30" rx="35" ry="40" fill="#38BDF8" />
          <path d="M -20 -30 Q 0 -50 20 -30 Q 0 -10 -20 -30 Z" fill="#F59E0B" />
          <text x="0" y="-25" textAnchor="middle" fontSize="16" fill="#FFF">🐾</text>
          <rect x="-8" y="15" width="16" height="12" fill="#78350F" rx="2" />
        </g>

        {/* Balloon 2: Pink/Orange */}
        <g transform="translate(980, 110) scale(0.7)">
          <ellipse cx="0" cy="-30" rx="30" ry="38" fill="#EC4899" />
          <path d="M -25 -30 Q 0 -45 25 -30 Q 0 -15 -25 -30 Z" fill="#F97316" />
          <rect x="-6" y="12" width="12" height="10" fill="#78350F" rx="2" />
        </g>

        {/* 2. Papel Picado Bunting Flags */}
        <path d="M 0 40 Q 300 80 600 40 Q 900 80 1200 40" stroke="#FEF08A" strokeWidth="3" fill="none" />
        {[
          { x: 50, color: '#EC4899' },
          { x: 150, color: '#38BDF8' },
          { x: 250, color: '#F59E0B' },
          { x: 350, color: '#10B981' },
          { x: 450, color: '#8B5CF6' },
          { x: 550, color: '#EF4444' },
          { x: 650, color: '#EC4899' },
          { x: 750, color: '#38BDF8' },
          { x: 850, color: '#F59E0B' },
          { x: 950, color: '#10B981' },
          { x: 1050, color: '#8B5CF6' },
          { x: 1150, color: '#EF4444' },
        ].map((f, i) => (
          <polygon key={i} points={`${f.x-18},${50 + (i%2)*10} ${f.x+18},${50 + (i%2)*10} ${f.x},${85 + (i%2)*10}`} fill={f.color} opacity="0.9" />
        ))}

        {/* 3. Desert Mountains & Red Rock Canyons */}
        <path d="M 0 380 L 150 260 L 320 320 L 500 240 L 700 310 L 920 220 L 1100 290 L 1200 240 L 1200 500 L 0 500 Z" fill="url(#mountainGrad)" opacity="0.95" />
        <path d="M 0 420 L 220 310 L 480 380 L 680 290 L 880 360 L 1200 310 L 1200 675 L 0 675 Z" fill="#78350F" opacity="0.8" />

        {/* Saguaro Cacti Silhouettes */}
        <g fill="#15803D">
          {/* Cactus Left */}
          <path d="M 80 340 L 88 340 L 88 410 L 80 410 Z M 70 365 L 80 365 L 80 375 L 70 375 L 70 355 L 75 355 L 75 365 Z M 88 375 L 98 375 L 98 385 L 88 385 L 88 365 L 93 365 L 93 375 Z" transform="scale(1.5) translate(-20,0)" />
          {/* Cactus Right */}
          <path d="M 1120 320 L 1128 320 L 1128 390 L 1120 390 Z" transform="scale(1.4) translate(-300, 20)" />
        </g>

        {/* Pueblo del Cactus Gate Right */}
        <g transform="translate(920, 280)">
          <rect x="0" y="0" width="20" height="120" fill="#78350F" rx="3" />
          <rect x="160" y="0" width="20" height="120" fill="#78350F" rx="3" />
          <path d="M -10 -15 L 190 -15 L 190 20 L -10 20 Z" fill="#B45309" stroke="#78350F" strokeWidth="4" rx="6" />
          <text x="90" y="6" textAnchor="middle" fill="#FEF08A" fontWeight="900" fontSize="15" fontFamily="sans-serif">PUEBLO DEL CACTUS</text>
        </g>

        {/* 4. Dirt Racing Track Curve */}
        <path d="M -100 675 C 200 550, 400 480, 600 440 C 800 410, 950 400, 1200 420 L 1200 675 Z" fill="url(#trackGrad)" />
        <path d="M -50 675 C 220 560, 410 495, 600 455 C 790 425, 940 415, 1200 435" stroke="#FEF08A" strokeWidth="8" strokeDasharray="30 20" fill="none" opacity="0.8" />

        {/* Dust Clouds & Drifting Sparks */}
        <circle cx="580" cy="520" r="60" fill="#FDBA74" opacity="0.4" filter="blur(10px)" />
        <circle cx="640" cy="530" r="40" fill="#FED7AA" opacity="0.5" filter="blur(8px)" />

        {/* 5. KARTS & DRIVERS */}

        {/* JUANCITO (Left - Blue Lightning Kart) */}
        <g transform="translate(180, 480) scale(0.9)">
          {/* Kart Body */}
          <path d="M 0 40 L 140 10 L 180 50 L 20 80 Z" fill="url(#blueKartGrad)" stroke="#1E3A8A" strokeWidth="3" />
          {/* Lightning Bolt decal */}
          <path d="M 60 25 L 100 20 L 80 40 L 120 35 L 70 60 L 85 45 Z" fill="#F59E0B" />
          {/* Wheels */}
          <ellipse cx="25" cy="75" rx="22" ry="18" fill="#18181B" />
          <ellipse cx="25" cy="75" rx="10" ry="8" fill="#F59E0B" />
          <ellipse cx="165" cy="55" rx="20" ry="16" fill="#18181B" />
          <ellipse cx="165" cy="55" rx="9" ry="7" fill="#F59E0B" />
          {/* Driver Juancito (Squirrel) */}
          <circle cx="80" cy="-5" r="28" fill="#D97706" />
          {/* Green Bandana */}
          <path d="M 60 12 L 100 12 L 80 25 Z" fill="#16A34A" />
          <text x="80" y="-1" textAnchor="middle" fontSize="22">🐿️</text>
        </g>

        {/* ESSMA (CENTER HERO - Pink Heart Kart) */}
        <g transform="translate(480, 440) scale(1.15)">
          {/* Dust Aura */}
          <ellipse cx="90" cy="110" rx="110" ry="25" fill="#F59E0B" opacity="0.3" filter="blur(10px)" />
          {/* Front Giant Heart */}
          <path d="M 90 60 C 90 60, 40 10, 20 40 C 0 70, 90 120, 90 120 C 90 120, 180 70, 160 40 C 140 10, 90 60, 90 60 Z" fill="url(#pinkKartGrad)" stroke="#BE185D" strokeWidth="4" />
          {/* Paw Print in Heart */}
          <text x="90" y="75" textAnchor="middle" fontSize="32" fill="#FFF">🐾</text>
          {/* Wheels */}
          <ellipse cx="20" cy="100" rx="26" ry="20" fill="#18181B" />
          <circle cx="20" cy="100" r="10" fill="#EC4899" />
          <ellipse cx="160" cy="100" rx="26" ry="20" fill="#18181B" />
          <circle cx="160" cy="100" r="10" fill="#EC4899" />
          {/* Driver Essma */}
          {/* Fair Skin Head */}
          <circle cx="90" cy="5" r="32" fill="#FFE3D8" stroke="#F43F5E" strokeWidth="2" />
          {/* Curly Hair Puffs */}
          <circle cx="60" cy="-5" r="16" fill="#1A0D00" />
          <circle cx="120" cy="-5" r="16" fill="#1A0D00" />
          <circle cx="55" cy="15" r="14" fill="#1A0D00" />
          <circle cx="125" cy="15" r="14" fill="#1A0D00" />
          {/* Bright Blue Hair Bow */}
          <path d="M 65 -35 L 115 -35 L 90 -20 Z" fill="#2563EB" />
          <circle cx="90" cy="-28" r="8" fill="#38BDF8" />
          {/* Cute Face Expression */}
          <circle cx="78" cy="2" r="4" fill="#1A0D00" />
          <circle cx="102" cy="2" r="4" fill="#1A0D00" />
          <path d="M 82 16 Q 90 24 98 16" stroke="#1A0D00" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* White Collar */}
          <path d="M 72 32 L 108 32 L 90 42 Z" fill="#FFFFFF" />
        </g>

        {/* TORI (Right - Green Beetle Kart) */}
        <g transform="translate(760, 480) scale(0.9)">
          {/* Beetle Hood */}
          <ellipse cx="80" cy="50" rx="60" ry="35" fill="url(#greenKartGrad)" stroke="#14532D" strokeWidth="3" />
          {/* Paw decal */}
          <circle cx="80" cy="40" r="15" fill="#FEF08A" />
          <text x="80" y="46" textAnchor="middle" fontSize="16">🐾</text>
          {/* Antennae */}
          <path d="M 60 20 Q 50 -10 40 -15" stroke="#14532D" strokeWidth="3" fill="none" />
          <circle cx="40" cy="-15" r="5" fill="#F59E0B" />
          <path d="M 100 20 Q 110 -10 120 -15" stroke="#14532D" strokeWidth="3" fill="none" />
          <circle cx="120" cy="-15" r="5" fill="#F59E0B" />
          {/* Driver Tori (Ringtail Cat) */}
          <circle cx="80" cy="-2" r="26" fill="#78350F" />
          <text x="80" y="4" textAnchor="middle" fontSize="22">🦝</text>
        </g>

        {/* ANITA (Far Right - Purple Butterfly Kart) */}
        <g transform="translate(960, 470) scale(0.85)">
          {/* Butterfly Wings */}
          <path d="M 40 20 C -20 -40, 20 -80, 60 -10 Z" fill="url(#purpleKartGrad)" stroke="#581C87" strokeWidth="2" />
          <path d="M 120 20 C 180 -40, 140 -80, 100 -10 Z" fill="url(#purpleKartGrad)" stroke="#581C87" strokeWidth="2" />
          {/* Kart Base */}
          <ellipse cx="80" cy="45" rx="55" ry="30" fill="url(#purpleKartGrad)" stroke="#581C87" strokeWidth="3" />
          {/* Driver Anita (Calf) */}
          <circle cx="80" cy="-5" r="26" fill="#FEF3C7" />
          <text x="80" y="2" textAnchor="middle" fontSize="22">🐮</text>
        </g>
      </svg>
    </div>
  );
};
