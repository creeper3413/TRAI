import React, { useEffect, useRef } from 'react';
import { AccentTheme } from '../types';

interface HolographicGlobeProps {
  accent: AccentTheme;
  isListening?: boolean;
  isSpeaking?: boolean;
  onClick?: () => void;
  isDarkMode?: boolean;
}

export const HolographicGlobe: React.FC<HolographicGlobeProps> = ({
  accent,
  isListening = false,
  isSpeaking = false,
  onClick,
  isDarkMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const colors = {
    cyan: { primary: '#22d3ee', secondary: '#0284c7', glow: 'rgba(34, 211, 238, 0.4)' },
    gold: { primary: '#fbbf24', secondary: '#d97706', glow: 'rgba(251, 191, 36, 0.4)' },
    emerald: { primary: '#34d399', secondary: '#059669', glow: 'rgba(52, 211, 153, 0.4)' },
    violet: { primary: '#a78bfa', secondary: '#7c3aed', glow: 'rgba(167, 139, 250, 0.4)' },
  }[accent];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;

    // Generate fixed 3D points on sphere
    const numPoints = 80;
    const points: Array<{ theta: number; phi: number }> = [];
    for (let i = 0; i < numPoints; i++) {
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();
      points.push({ theta, phi });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 95;

      const speed = isSpeaking ? 0.025 : isListening ? 0.018 : 0.008;
      rotation += speed;

      // Draw faint outer aura
      const grad = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius * 1.3);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Draw rotating equatorial and latitude ellipses
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.primary;

      // 3 Elliptical orbital rings
      for (let i = 0; i < 3; i++) {
        const tilt = (i * Math.PI) / 3 + rotation * 0.5;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(tilt);
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.35, radius * 0.45, 0, 0, Math.PI * 2);
        ctx.strokeStyle = i === 0 ? 'rgba(34, 211, 238, 0.35)' : 'rgba(14, 165, 233, 0.2)';
        ctx.stroke();

        // Little particle on orbit ring
        const orbitalAngle = rotation * (2 + i) + i;
        const ox = Math.cos(orbitalAngle) * radius * 1.35;
        const oy = Math.sin(orbitalAngle) * radius * 0.45;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ox, oy, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw 3D wireframe points projected on sphere
      const projected: Array<{ x: number; y: number; z: number }> = [];
      points.forEach((p) => {
        const x = radius * Math.sin(p.theta) * Math.cos(p.phi + rotation);
        const y = radius * Math.sin(p.theta) * Math.sin(p.phi + rotation);
        const z = radius * Math.cos(p.theta);

        // Project with slight perspective
        const scale = 220 / (220 + y);
        projected.push({
          x: centerX + x * scale,
          y: centerY + z * scale,
          z: y,
        });
      });

      // Connect nearby points with faint lines (constellation wireframe)
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 36 && projected[i].z > -20 && projected[j].z > -20) {
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.25 - dist / 160})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw point nodes
      projected.forEach((p) => {
        const alpha = Math.max(0.1, (p.z + radius) / (radius * 2));
        ctx.fillStyle = `rgba(34, 211, 238, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.z > 20 ? 1.8 : 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [accent, isListening, isSpeaking]);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      title="TRAİ Akıllı Çekirdek - Sesli Konuşmak İçin Tıklayın"
      className="relative flex items-center justify-center cursor-pointer select-none group w-[280px] h-[280px] sm:w-[320px] sm:h-[320px]"
    >
      <canvas
        ref={canvasRef}
        width={320}
        height={320}
        className="w-full h-full pointer-events-none drop-shadow-[0_0_25px_rgba(2,132,199,0.2)]"
      />

      {/* Center Holographic Title & Badge */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
        <h2 className={`text-2xl sm:text-3xl font-black font-mono tracking-widest text-transparent bg-clip-text ${
          isDarkMode
            ? 'bg-gradient-to-b from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]'
            : 'bg-gradient-to-b from-slate-900 via-sky-900 to-cyan-600 drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]'
        }`}>
          TRAİ
        </h2>
        <div className={`text-[11px] font-mono tracking-widest font-bold uppercase mt-0.5 ${
          isDarkMode ? 'text-cyan-300' : 'text-cyan-600'
        }`}>
          TRAİ SİSTEMİ
        </div>
        <div className={`text-[9px] font-mono tracking-wider mt-0.5 ${
          isDarkMode ? 'text-cyan-400/80' : 'text-slate-500'
        }`}>
          v3.2 · ÇEVRİMİÇİ
        </div>
      </div>
    </div>
  );
};
