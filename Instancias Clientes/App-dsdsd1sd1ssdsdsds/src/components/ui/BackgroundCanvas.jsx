import React, { useEffect, useRef } from 'react';

/**
 * BackgroundCanvas
 * Renderizador ligero y portable en Canvas HTML5 de partículas GPU, orbs mesh, auroras y rejillas 3D animadas.
 * Lee las propiedades en caliente de :root (CSS variables) inyectadas por el generador.
 */
import { PARTICLES_ICONS_BY_KEY } from './particlesIcons';

export default function BackgroundCanvas({
  bgType = null,
  bgMouseTracking = null,
  bgParticlesCount = null,
  bgParticlesSpeed = null,
  bgParticlesSize = null,
  bgParticlesColor = null,
  bgParticlesOpacity = null,
  bgParticlesDirection = null,
  bgParticlesShape = null,
  bgParticlesIcon = null,
  bgOrbsCount = null,
  bgOrbsOpacity = null,
  primaryColor = null,
  secondaryColor = null,
  spotlightPos = null,
  niche = null,
  bgOrbsSpeed = null,
  bgOrbsSize = null,
  bgOrbsBlur = null
}) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const orbsRef = useRef([]);

  // Referencias persistentes para evitar recrear la animación al mover el mouse
  const spotlightRef = useRef({ x: -1000, y: -1000 });
  const hasMouseRef = useRef(false);

  // Sincronizar spotlightPos en caliente sin recrear el loop del canvas
  useEffect(() => {
    if (spotlightPos && spotlightPos.x !== -1000 && spotlightPos.y !== -1000) {
      spotlightRef.current = { x: spotlightPos.x, y: spotlightPos.y };
      hasMouseRef.current = true;
    } else {
      if (spotlightPos) {
        spotlightRef.current = { x: -1000, y: -1000 };
        hasMouseRef.current = false;
      }
    }
  }, [spotlightPos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationId = null;
    let disposed = false;
    let lastTime = performance.now();

    // ─── LECTURA DINÁMICA DE VARIABLES CSS DESDE :ROOT ───
    const rootStyle = getComputedStyle(document.documentElement);
    
    const resolvedBgType = bgType || rootStyle.getPropertyValue('--bg-type').trim() || 'solid';
    const resolvedMouseTracking = bgMouseTracking !== null 
      ? bgMouseTracking 
      : (rootStyle.getPropertyValue('--bg-mouse-tracking').trim() === '1');
      
    const resolvedParticlesCount = bgParticlesCount !== null
      ? bgParticlesCount 
      : parseInt(rootStyle.getPropertyValue('--bg-particles-count').trim(), 10) || 40;
      
    // Tratar la velocidad de las partículas como número float
    const speedRaw = bgParticlesSpeed || rootStyle.getPropertyValue('--bg-particles-speed').trim() || 'normal';
    let resolvedParticlesSpeed = parseFloat(speedRaw);
    if (isNaN(resolvedParticlesSpeed)) {
      // Fallback retrocompatible para strings legacy 'slow'/'normal'/'fast'
      const speedStr = String(speedRaw).toLowerCase();
      resolvedParticlesSpeed = speedStr === 'fast' ? 1.6 : speedStr === 'slow' ? 0.3 : 0.8;
    }
      
    const resolvedParticlesSize = bgParticlesSize !== null
      ? bgParticlesSize 
      : parseFloat(rootStyle.getPropertyValue('--bg-particles-size').trim()) || 2;
      
    const resolvedParticlesColor = bgParticlesColor 
      ? bgParticlesColor 
      : rootStyle.getPropertyValue('--bg-particles-color').trim() || 'primary';

    const resolvedParticlesOpacity = bgParticlesOpacity !== null
      ? bgParticlesOpacity 
      : parseFloat(rootStyle.getPropertyValue('--bg-particles-opacity').trim()) || 0.35;

    const resolvedParticlesDirection = bgParticlesDirection 
      ? bgParticlesDirection 
      : rootStyle.getPropertyValue('--bg-particles-direction').trim() || 'random';

    const resolvedParticlesShape = bgParticlesShape 
      ? bgParticlesShape 
      : rootStyle.getPropertyValue('--bg-particles-shape').trim() || 'circle';
      
    const resolvedParticlesIcon = bgParticlesIcon
      ? bgParticlesIcon
      : rootStyle.getPropertyValue('--bg-particles-icon').trim() || 'default';
      
    const resolvedOrbsCount = bgOrbsCount !== null
      ? bgOrbsCount 
      : parseInt(rootStyle.getPropertyValue('--bg-orbs-count').trim(), 10) || 3;
      
    const resolvedOrbsOpacity = bgOrbsOpacity !== null
      ? bgOrbsOpacity 
      : parseFloat(rootStyle.getPropertyValue('--bg-orbs-opacity').trim()) || 0.16;

    const resolvedOrbsSpeed = bgOrbsSpeed !== null
      ? bgOrbsSpeed 
      : parseFloat(rootStyle.getPropertyValue('--bg-orbs-speed').trim()) || 1.0;

    const resolvedOrbsSize = bgOrbsSize !== null
      ? bgOrbsSize 
      : parseFloat(rootStyle.getPropertyValue('--bg-orbs-size').trim()) || 1.0;

    const resolvedOrbsBlur = bgOrbsBlur !== null
      ? bgOrbsBlur 
      : parseFloat(rootStyle.getPropertyValue('--bg-orbs-blur').trim()) || 1.0;

    const resolvedNiche = niche 
      ? niche 
      : rootStyle.getPropertyValue('--brand-niche').trim() || 'retail_clothing';

    // Colores de marca leídos de las variables de tema activas en :root
    const activePrimary = primaryColor || rootStyle.getPropertyValue('--color-primary').trim() || '#6366f1';
    const activeSecondary = secondaryColor || rootStyle.getPropertyValue('--color-accent').trim() || '#a855f7';
    const activeBg = rootStyle.getPropertyValue('--color-bg').trim() || rootStyle.getPropertyValue('--color-surface').trim() || '#070a13';

    const parseColorToRgb = (colorStr) => {
      if (!colorStr) return { r: 7, g: 10, b: 19 };
      const str = colorStr.trim().toLowerCase();

      // 1. Caso HSL
      if (str.includes('hsl') || /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%/.test(str)) {
        const matches = str.match(/\d+(\.\d+)?/g);
        if (matches && matches.length >= 3) {
          const h = parseFloat(matches[0]);
          const s = parseFloat(matches[1]) / 100;
          const l = parseFloat(matches[2]) / 100;
          const a = s * Math.min(l, 1 - l);
          const f = (n) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color);
          };
          return { r: f(0), g: f(8), b: f(4) };
        }
      }

      // 2. Caso RGB/RGBA
      if (str.includes('rgb')) {
        const matches = str.match(/\d+/g);
        if (matches && matches.length >= 3) {
          return {
            r: parseInt(matches[0], 10),
            g: parseInt(matches[1], 10),
            b: parseInt(matches[2], 10)
          };
        }
      }

      // 3. Caso HEX
      const cleanHex = str.replace(/[^0-9a-f]/g, '');
      if (cleanHex.length === 3) {
        return {
          r: parseInt(cleanHex[0] + cleanHex[0], 16),
          g: parseInt(cleanHex[1] + cleanHex[1], 16),
          b: parseInt(cleanHex[2] + cleanHex[2], 16)
        };
      }
      if (cleanHex.length >= 6) {
        return {
          r: parseInt(cleanHex.slice(0, 2), 16),
          g: parseInt(cleanHex.slice(2, 4), 16),
          b: parseInt(cleanHex.slice(4, 6), 16)
        };
      }

      return { r: 7, g: 10, b: 19 };
    };

    const brandRgb = parseColorToRgb(activePrimary);
    const secRgb = parseColorToRgb(activeSecondary);
    const bgRgb = parseColorToRgb(activeBg);
    const colors = {
      primary: [activePrimary],
      brand: [activePrimary],
      pastel: [activePrimary, activeSecondary, '#ec4899', '#3b82f6', '#10b981'],
      mixed: [activePrimary, activeSecondary, '#ec4899', '#3b82f6', '#10b981'],
      neutral: ['#ffffff', '#cbd5e1', '#94a3b8']
    }[resolvedParticlesColor] || [activePrimary];

    // Calcular luminosidad del fondo para adaptar el blending en Modo Claro
    const bgLuminosity = (0.299 * bgRgb.r + 0.587 * bgRgb.g + 0.114 * bgRgb.b) / 255;
    const isBgLight = bgLuminosity > 0.5;

    const path2dCache = {};
    const imageCache = {};
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = canvas.clientWidth || canvas.offsetWidth || 300;
    let h = canvas.clientHeight || canvas.offsetHeight || 150;

    const resize = () => {
      if (disposed) return;
      w = canvas.clientWidth || canvas.offsetWidth || 300;
      h = canvas.clientHeight || canvas.offsetHeight || 150;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // 1. Inicializar partículas (modo particles)
    const count = Math.min(resolvedParticlesCount || 40, 150);
    if (resolvedBgType === 'particles') {
      if (particlesRef.current.length !== count) {
        if (particlesRef.current.length < count) {
          const toAdd = count - particlesRef.current.length;
          for (let i = 0; i < toAdd; i++) {
            particlesRef.current.push({
              x: Math.random() * w,
              y: Math.random() * h,
              baseVx: Math.random() - 0.5,
              baseVy: Math.random() - 0.5,
              baseRadius: Math.random() * 0.8 + 0.2,
              colorFactor: Math.random(),
              alphaFactor: Math.random() * 0.4 + 0.6
            });
          }
        } else {
          particlesRef.current = particlesRef.current.slice(0, count);
        }
      }
    } else {
      particlesRef.current = [];
    }

    // 2. Inicializar esferas físicas (modo mesh)
    const orbsCount = resolvedOrbsCount || 3;
    if (resolvedBgType === 'mesh') {
      if (orbsRef.current.length !== orbsCount) {
        if (orbsRef.current.length < orbsCount) {
          const toAdd = orbsCount - orbsRef.current.length;
          const currentLength = orbsRef.current.length;
          for (let i = 0; i < toAdd; i++) {
            orbsRef.current.push({
              x: Math.random() * w,
              y: Math.random() * h,
              vx: (Math.random() - 0.5) * 180,
              vy: (Math.random() - 0.5) * 180,
              baseRadius: Math.random() * 60 + 110,
              colorIndex: currentLength + i
            });
          }
        } else {
          orbsRef.current = orbsRef.current.slice(0, orbsCount);
        }
      }
    } else {
      orbsRef.current = [];
    }

    // Posicionamiento físico del spotlight
    const spot = { x: w / 2, y: h / 2 };

    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width ? w / rect.width : 1;
      const scaleY = rect.height ? h / rect.height : 1;
      spotlightRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
      hasMouseRef.current = true;
    };

    const handlePointerLeave = () => {
      spotlightRef.current = { x: -1000, y: -1000 };
      hasMouseRef.current = false;
    };

    const parent = canvas.parentElement;
    if (resolvedMouseTracking && parent) {
      parent.addEventListener('pointermove', handlePointerMove, { passive: true });
      parent.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    }

    const animate = (now) => {
      if (disposed) return;
      const dt = Math.min(32, now - lastTime) / 1000;
      lastTime = now;

      ctx.clearRect(0, 0, w, h);

      // ─── DIBUJAR MESH GRADIENT FLUÍDO ───
      if (resolvedBgType === 'mesh' && orbsRef.current.length > 0) {
        orbsRef.current.forEach(orb => {
          orb.x += orb.vx * resolvedOrbsSpeed * dt;
          orb.y += orb.vy * resolvedOrbsSpeed * dt;

          const currentRadius = orb.baseRadius * resolvedOrbsSize;

          if (orb.x - currentRadius < -35) { orb.x = -35 + currentRadius; orb.vx *= -1; }
          if (orb.x + currentRadius > w + 35) { orb.x = w + 35 - currentRadius; orb.vx *= -1; }
          if (orb.y - currentRadius < -35) { orb.y = -35 + currentRadius; orb.vy *= -1; }
          if (orb.y + currentRadius > h + 35) { orb.y = h + 35 - currentRadius; orb.vy *= -1; }

          const color = orb.colorIndex % 2 === 0 ? activePrimary : activeSecondary;
          const rgb = parseColorToRgb(color);
          const radG = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, currentRadius);
          const stopMiddle = Math.min(0.99, Math.max(0.01, 0.45 * resolvedOrbsBlur));
          radG.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${resolvedOrbsOpacity})`);
          radG.addColorStop(stopMiddle, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${resolvedOrbsOpacity * 0.38})`);
          radG.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

          ctx.globalCompositeOperation = isBgLight ? 'source-over' : 'screen';
          ctx.fillStyle = radG;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, currentRadius, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalCompositeOperation = 'source-over';
      }

      // ─── DIBUJAR AURORA LÍQUIDA ───
      if (resolvedBgType === 'aurora') {
        const timeVal = now * 0.001;
        const x1 = w * 0.5 + Math.sin(timeVal * 0.6) * w * 0.28;
        const y1 = h * 0.4 + Math.cos(timeVal * 0.4) * h * 0.22;
        const x2 = w * 0.5 + Math.cos(timeVal * 0.5) * w * 0.32;
        const y2 = h * 0.6 + Math.sin(timeVal * 0.7) * h * 0.25;

        const rad1 = Math.max(w, h) * 0.75;
        const rad2 = Math.max(w, h) * 0.6;

        const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, rad1);
        g1.addColorStop(0, `rgba(${brandRgb.r}, ${brandRgb.g}, ${brandRgb.b}, 0.24)`);
        g1.addColorStop(0.5, `rgba(${brandRgb.r}, ${brandRgb.g}, ${brandRgb.b}, 0.08)`);
        g1.addColorStop(1, 'rgba(0,0,0,0)');

        const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, rad2);
        g2.addColorStop(0, `rgba(${secRgb.r}, ${secRgb.g}, ${secRgb.b}, 0.18)`);
        g2.addColorStop(0.5, `rgba(${secRgb.r}, ${secRgb.g}, ${secRgb.b}, 0.05)`);
        g2.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = g1;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
      }

      // ─── DIBUJAR REJILLA 3D TECNOLÓGICA ───
      if (resolvedBgType === 'grid') {
        const timeVal = now * 0.0015;
        const gridY = h * 0.48;
        ctx.strokeStyle = `rgba(${brandRgb.r}, ${brandRgb.g}, ${brandRgb.b}, 0.16)`;
        ctx.lineWidth = 1.0;

        const numVLines = 14;
        for (let i = 0; i <= numVLines; i++) {
          const ratio = i / numVLines;
          const horizonX = w * 0.5 + (ratio - 0.5) * w * 0.12;
          const bottomX = w * 0.5 + (ratio - 0.5) * w * 1.6;

          ctx.beginPath();
          ctx.moveTo(horizonX, gridY);
          ctx.lineTo(bottomX, h);
          ctx.stroke();
        }

        const numHLines = 8;
        const speedFactor = (timeVal % 1.0);
        for (let i = 0; i < numHLines; i++) {
          const normY = Math.pow((i + speedFactor) / numHLines, 2.2);
          const currentY = gridY + normY * (h - gridY);

          ctx.strokeStyle = `rgba(${brandRgb.r}, ${brandRgb.g}, ${brandRgb.b}, ${(0.26 * normY).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(0, currentY);
          ctx.lineTo(w, currentY);
          ctx.stroke();
        }

        const fade = ctx.createLinearGradient(0, gridY - 5, 0, h);
        fade.addColorStop(0, `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, 1)`);
        fade.addColorStop(0.12, `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, 0.3)`);
        fade.addColorStop(0.35, `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, 0)`);
        fade.addColorStop(1, `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, 0.4)`);

        ctx.fillStyle = fade;
        ctx.fillRect(0, gridY - 8, w, h - gridY + 8);
      }

      // ─── DIBUJAR SPOTLIGHT CURSOR TRACING ───
      const targetSpot = spotlightRef.current;
      const hasMouse = hasMouseRef.current;
      if (resolvedMouseTracking && (hasMouse || Math.abs(spot.x - targetSpot.x) > 0.1)) {
        const follow = 1 - Math.exp(-12 * dt);
        const isTargetValid = targetSpot.x !== -1000 && targetSpot.y !== -1000;
        const targetX = isTargetValid ? targetSpot.x : w / 2;
        const targetY = isTargetValid ? targetSpot.y : h / 2;

        spot.x += (targetX - spot.x) * (isTargetValid ? follow : follow * 0.25);
        spot.y += (targetY - spot.y) * (isTargetValid ? follow : follow * 0.25);

        const radius = Math.min(Math.max(w, h) * 0.65, 220);
        const g = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, radius);
        g.addColorStop(0, `rgba(${brandRgb.r}, ${brandRgb.g}, ${brandRgb.b}, 0.26)`);
        g.addColorStop(0.45, `rgba(${brandRgb.r}, ${brandRgb.g}, ${brandRgb.b}, 0.08)`);
        g.addColorStop(1, `rgba(${brandRgb.r}, ${brandRgb.g}, ${brandRgb.b}, 0)`);

        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
      }

      // ─── DIBUJAR PARTÍCULAS ───
      if (resolvedBgType === 'particles' && particlesRef.current.length > 0) {
        particlesRef.current.forEach(p => {
          let vx = 0;
          let vy = 0;

          if (resolvedParticlesDirection === 'random') {
            vx = p.baseVx * 12 * resolvedParticlesSpeed;
            vy = p.baseVy * 12 * resolvedParticlesSpeed;
          } else if (resolvedParticlesDirection === 'up') {
            vx = p.baseVx * 0.2 * 12 * resolvedParticlesSpeed;
            vy = -Math.abs(p.baseVy * 0.8 + 0.2) * 12 * resolvedParticlesSpeed;
          } else if (resolvedParticlesDirection === 'down') {
            vx = p.baseVx * 0.2 * 12 * resolvedParticlesSpeed;
            vy = Math.abs(p.baseVy * 0.8 + 0.2) * 12 * resolvedParticlesSpeed;
          } else if (resolvedParticlesDirection === 'left') {
            vx = -Math.abs(p.baseVx * 0.8 + 0.2) * 12 * resolvedParticlesSpeed;
            vy = p.baseVy * 0.2 * 12 * resolvedParticlesSpeed;
          } else if (resolvedParticlesDirection === 'right') {
            vx = Math.abs(p.baseVx * 0.8 + 0.2) * 12 * resolvedParticlesSpeed;
            vy = p.baseVy * 0.2 * 12 * resolvedParticlesSpeed;
          }

          p.x += vx;
          p.y += vy;

          const radius = p.baseRadius * (resolvedParticlesSize || 2) + 0.5;

          if (resolvedParticlesDirection === 'random') {
            if (p.x < 0) { p.x = 0; p.baseVx *= -1; }
            if (p.x > w) { p.x = w; p.baseVx *= -1; }
            if (p.y < 0) { p.y = 0; p.baseVy *= -1; }
            if (p.y > h) { p.y = h; p.baseVy *= -1; }
          } else {
            const margin = radius + 15;
            if (p.x < -margin) p.x = w + margin;
            if (p.x > w + margin) p.x = -margin;
            if (p.y < -margin) p.y = h + margin;
            if (p.y > h + margin) p.y = -margin;
          }

          if (resolvedMouseTracking && hasMouse) {
            const dx = targetSpot.x - p.x;
            const dy = targetSpot.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
              const force = (80 - dist) / 1600;
              p.x -= (dx / dist) * force * 10;
              p.y -= (dy / dist) * force * 10;
            }
          }

          const color = colors[Math.floor(p.colorFactor * colors.length)] || colors[0];
          const alpha = p.alphaFactor * resolvedParticlesOpacity;

          ctx.save();
          if (resolvedParticlesShape === 'circle') {
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            ctx.fill();
          } else if (resolvedParticlesShape === 'glow') {
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 2);
            const rgb = parseColorToRgb(color);
            grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`);
            grad.addColorStop(0.3, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`);
            grad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius * 2, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.globalAlpha = alpha;
            ctx.fill();
          } else if (resolvedParticlesShape === 'star') {
            ctx.beginPath();
            let rot = Math.PI / 2 * 3;
            const spikes = 4;
            const step = Math.PI / spikes;
            const outerRadius = radius * 1.8;
            const innerRadius = radius * 0.35;
            ctx.moveTo(p.x, p.y - outerRadius);
            for (let i = 0; i < spikes; i++) {
              let sx = p.x + Math.cos(rot) * outerRadius;
              let sy = p.y + Math.sin(rot) * outerRadius;
              ctx.lineTo(sx, sy);
              rot += step;
              sx = p.x + Math.cos(rot) * innerRadius;
              sy = p.y + Math.sin(rot) * innerRadius;
              ctx.lineTo(sx, sy);
              rot += step;
            }
            ctx.lineTo(p.x, p.y - outerRadius);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            ctx.fill();
          } else if (resolvedParticlesShape === 'niche') {
            const activeIcon = resolvedParticlesIcon && resolvedParticlesIcon !== 'default' ? resolvedParticlesIcon : resolvedNiche;
            const sizeLimit = Math.max(radius * 2.2, 12);
            const roundedSize = Math.round(sizeLimit);
            const cacheKey = `${activeIcon}:${color}:${roundedSize}`;

            if (!imageCache[cacheKey]) {
              const pathStr = PARTICLES_ICONS_BY_KEY[activeIcon] || PARTICLES_ICONS_BY_KEY['retail_clothing'];
              if (!path2dCache[activeIcon]) {
                path2dCache[activeIcon] = new Path2D(pathStr);
              }
              const pathObj = path2dCache[activeIcon];

              const offCanvas = document.createElement('canvas');
              const pad = 4;
              offCanvas.width = roundedSize + pad;
              offCanvas.height = roundedSize + pad;
              const offCtx = offCanvas.getContext('2d');
              if (offCtx) {
                offCtx.translate((roundedSize + pad) / 2, (roundedSize + pad) / 2);
                offCtx.scale(roundedSize / 24, roundedSize / 24);
                offCtx.translate(-12, -12);

                offCtx.strokeStyle = color;
                offCtx.lineWidth = roundedSize <= 14 ? 1.9 : 1.6;
                offCtx.lineJoin = 'round';
                offCtx.lineCap = 'round';
                offCtx.stroke(pathObj);
              }
              imageCache[cacheKey] = offCanvas;
            }

            const cachedCanvas = imageCache[cacheKey];
            const minAlpha = isBgLight ? 0.42 : 0.36;
            ctx.globalAlpha = Math.max(alpha * 0.75, minAlpha);
            ctx.drawImage(cachedCanvas, p.x - cachedCanvas.width / 2, p.y - cachedCanvas.height / 2);
          }
          ctx.restore();
        });
        ctx.globalAlpha = 1.0;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationId);
      ro.disconnect();
      if (parent) {
        parent.removeEventListener('pointermove', handlePointerMove);
        parent.removeEventListener('pointerleave', handlePointerLeave);
      }
    };
  }, [
    bgType, bgMouseTracking, bgParticlesCount, bgParticlesSpeed, bgParticlesSize,
    bgParticlesColor, bgParticlesOpacity, bgParticlesDirection, bgParticlesShape,
    bgOrbsCount, bgOrbsOpacity, primaryColor, secondaryColor, niche,
    bgOrbsSpeed, bgOrbsSize, bgOrbsBlur
  ]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[22px] z-0 select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
}
