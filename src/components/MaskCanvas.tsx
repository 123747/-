import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { AppConfig, GestureType } from "../types";
import { generateParticlePositions } from "../utils/generators";

interface MaskCanvasProps {
  config: AppConfig;
  gestureState: GestureType; // fist = Mask, palm/idle = Logo
}

export default function MaskCanvas({ config, gestureState }: MaskCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Reference for updating properties inside Three.js animation loop without re-instantiating scene
  const configRef = useRef<AppConfig>(config);
  const gestureStateRef = useRef<GestureType>(gestureState);

  // Sync refs on each render
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    gestureStateRef.current = gestureState;
  }, [gestureState]);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- THREE.JS INITIALIZATION ---
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create Scene + Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#ffffff"); // Rebranded crisp bright white
    scene.fog = new THREE.FogExp2("#ffffff", 0.08);

    // Create Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    // Create WebGLRenderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Orbit/Mouse interactivity tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse coords from -1 to 1
      mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Touch support for mobile device
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        mouse.targetX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // --- DATA STORE & PARTICLE ARRAYS ---
    let currentParticleCount = configRef.current.particleCount;
    let { maskPositions, logoPositions, flowVectors } = generateParticlePositions(currentParticleCount);

    // Dynamic arrays for active rendering
    const activePositions = new Float32Array(currentParticleCount * 3);
    const activeColors = new Float32Array(currentParticleCount * 3);
    const activeSizes = new Float32Array(currentParticleCount);

    // Initialize particle states
    const particleSpeeds = new Float32Array(currentParticleCount);
    const particlePhases = new Float32Array(currentParticleCount);
    for (let i = 0; i < currentParticleCount; i++) {
      // Randomly stagger lerp speeds slightly for organic morph flow
      particleSpeeds[i] = 1.0 + Math.random() * 1.5;
      particlePhases[i] = Math.random() * Math.PI * 2;
      // Start in Logo state initially (or random scatter)
      activePositions[i * 3] = logoPositions[i * 3] + (Math.random() - 0.5) * 5.0;
      activePositions[i * 3 + 1] = logoPositions[i * 3 + 1] + (Math.random() - 0.5) * 5.0;
      activePositions[i * 3 + 2] = logoPositions[i * 3 + 2] + (Math.random() - 0.5) * 5.0;
    }

    // Helper to compute and load vertex colors reactively
    const updateColorsArray = (count: number, baseHex: string, highlightHex: string) => {
      const colorBase = new THREE.Color(baseHex);
      const colorHighlight = new THREE.Color(highlightHex);
      
      for (let i = 0; i < count; i++) {
        // Stochastically distribute base vs highlight (say 70% Silver White base, 30% Cyan highlight)
        const isHighlight = (i % 3 === 0); // approx 33% highlighs
        const mixedColor = isHighlight ? colorHighlight : colorBase;
        
        activeColors[i * 3] = mixedColor.r;
        activeColors[i * 3 + 1] = mixedColor.g;
        activeColors[i * 3 + 2] = mixedColor.b;
      }
    };

    updateColorsArray(currentParticleCount, configRef.current.baseColor, configRef.current.highlightColor);

    // Create custom Canvas Texture (glowing circles) to get high fidelity 
    // circular glass/ice crystal particles instead of standard square dots
    const createParticleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // High-contrast radial glow circle
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.8)");
        gradient.addColorStop(0.6, "rgba(255, 255, 255, 0.3)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const particleTexture = createParticleTexture();

    // --- THREE.JS BUFFERS & MATERIALS ---
    const geometry = new THREE.BufferGeometry();
    const posAttribute = new THREE.BufferAttribute(activePositions, 3);
    const colorAttribute = new THREE.BufferAttribute(activeColors, 3);
    
    geometry.setAttribute("position", posAttribute);
    geometry.setAttribute("color", colorAttribute);

    const material = new THREE.PointsMaterial({
      size: configRef.current.pointSize * 0.08,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: configRef.current.transparency,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // --- CYBER LAB SCENE EXTRALEVELS ---
    // Dynamic circuit stream lines overlapping to capture "电路纹路" beautifully
    const totalLines = 24;
    const lineGeometries: THREE.BufferGeometry[] = [];
    const lineMaterials: THREE.LineBasicMaterial[] = [];
    const lineSystems: THREE.Line[] = [];

    const logoGlowColor = new THREE.Color(configRef.current.highlightColor);

    // Precreate circuit tracer streams around the canvas backspace
    for (let idx = 0; idx < totalLines; idx++) {
      const curvePoints: THREE.Vector3[] = [];
      const steps = 15;
      const xOffset = (Math.random() - 0.5) * 4.0;
      const yOffset = (Math.random() - 0.5) * 4.0;

      for (let s = 0; s < steps; s++) {
        // Orthogonal stepping path to simulate integrated electronic micro circuit pathways!
        curvePoints.push(new THREE.Vector3(
          xOffset + Math.sin(s * 0.5) * 0.8,
          yOffset + s * 0.3 - 2.0,
          -1.0 + Math.cos(s * 0.5) * 0.5
        ));
      }

      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const curveGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
      const curveMaterial = new THREE.LineBasicMaterial({
        color: logoGlowColor,
        transparent: true,
        opacity: 0.15 + Math.random() * 0.15,
        blending: THREE.NormalBlending,
      });

      const line = new THREE.Line(curveGeometry, curveMaterial);
      scene.add(line);
      lineSystems.push(line);
    }

    // Modern cyber grid background elements
    const gridHelper = new THREE.GridHelper(30, 30, "#0ea5e9", "#e2e8f0");
    gridHelper.position.set(0, -2.8, -2.0);
    gridHelper.material.opacity = 0.25;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Subtle lighting
    const dirLight = new THREE.DirectionalLight("#ffffff", 1.5);
    dirLight.position.set(2, 5, 5);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight("#e2e8f0", 0.9);
    scene.add(ambientLight);

    // --- ANIMATION / RENDERING LOOP ---
    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      const cfg = configRef.current;
      const targetState = gestureStateRef.current;

      // React to potential live coordinate regeneration or count updates
      if (cfg.particleCount !== currentParticleCount) {
        // Regenerate particles
        currentParticleCount = cfg.particleCount;
        
        const fresh = generateParticlePositions(currentParticleCount);
        maskPositions = fresh.maskPositions;
        logoPositions = fresh.logoPositions;
        flowVectors = fresh.flowVectors;

        const freshPositions = new Float32Array(currentParticleCount * 3);
        const freshColors = new Float32Array(currentParticleCount * 3);
        
        // Populate initial positions relative to old or random
        for (let i = 0; i < currentParticleCount; i++) {
          freshPositions[i * 3] = activePositions[i * 3] || rand(-2, 2);
          freshPositions[i * 3 + 1] = activePositions[i * 3 + 1] || rand(-2, 2);
          freshPositions[i * 3 + 2] = activePositions[i * 3 + 2] || rand(-2, 2);
        }

        points.geometry.dispose();
        
        const newGeom = new THREE.BufferGeometry();
        newGeom.setAttribute("position", new THREE.BufferAttribute(freshPositions, 3));
        newGeom.setAttribute("color", new THREE.BufferAttribute(freshColors, 3));
        
        points.geometry = newGeom;
        
        updateColorsArray(currentParticleCount, cfg.baseColor, cfg.highlightColor);
        points.geometry.attributes.color.needsUpdate = true;
      }

      // Smooth mouse interaction integration
      mouse.x += (mouse.targetX * 0.95 - mouse.x) * 0.05;
      mouse.y += (mouse.targetY * 0.95 - mouse.y) * 0.05;

      // Base auto rotating + manual cursor influence
      let rotSpeedY = 0;
      if (cfg.autoRotate) {
        rotSpeedY = elapsedTime * cfg.rotationSpeed * 0.15;
      }
      points.rotation.y = rotSpeedY + mouse.x * 0.65;
      points.rotation.x = mouse.y * 0.4;

      // Update particle count-dependent properties
      material.size = cfg.pointSize * 0.088;
      material.opacity = cfg.transparency;

      // Update color settings if slider changed them
      const colorBase = new THREE.Color(cfg.baseColor);
      const colorHighlight = new THREE.Color(cfg.highlightColor);
      
      const geomPositions = points.geometry.attributes.position.array as Float32Array;
      const geomColors = points.geometry.attributes.color.array as Float32Array;

      // Determine global targets based on active user state (fist vs palm/idle)
      const targetSource = targetState === "fist" ? maskPositions : logoPositions;

      // Linear interpolation factor adjusted by configured morphSpeed slider
      const lerpValue = Math.min(1.0, delta * cfg.morphSpeed * 1.5);

      for (let i = 0; i < currentParticleCount; i++) {
        const i3 = i * 3;

        // Target coordinates
        const tx = targetSource[i3];
        const ty = targetSource[i3 + 1];
        const tz = targetSource[i3 + 2];

        // Circuit wavy stream calculations to yield "流动效果"
        let flowOffsetX = 0;
        let flowOffsetY = 0;
        let flowOffsetZ = 0;

        if (cfg.circuitSpeed) {
          const flowSpeed = elapsedTime * 2.2;
          const phase = i % 10;
          // Apply elegant micro oscillations mimicking electrical pathways
          flowOffsetX = Math.sin(flowSpeed + tx * 2.2) * cfg.flowIntensity * 0.035;
          flowOffsetY = Math.cos(flowSpeed - ty * 1.8) * cfg.flowIntensity * 0.035;
          flowOffsetZ = Math.sin(flowSpeed - tz * 3.0) * cfg.flowIntensity * 0.035;
        }

        // Apply progressive lerping 
        geomPositions[i3] += (tx + flowOffsetX - geomPositions[i3]) * lerpValue;
        geomPositions[i3 + 1] += (ty + flowOffsetY - geomPositions[i3 + 1]) * lerpValue;
        geomPositions[i3 + 2] += (tz + flowOffsetZ - geomPositions[i3 + 2]) * lerpValue;

        // Dynamic base color interpolation
        const isHighlight = (i % 3 === 0);
        const activeColorObj = isHighlight ? colorHighlight : colorBase;

        geomColors[i3] += (activeColorObj.r - geomColors[i3]) * 0.08;
        geomColors[i3 + 1] += (activeColorObj.g - geomColors[i3 + 1]) * 0.08;
        geomColors[i3 + 2] += (activeColorObj.b - geomColors[i3 + 2]) * 0.08;
      }

      points.geometry.attributes.position.needsUpdate = true;
      points.geometry.attributes.color.needsUpdate = true;

      // Animate background circuit streams
      lineSystems.forEach((line, index) => {
        line.rotation.y = rotSpeedY * 0.3 + Math.sin(elapsedTime * 0.15 + index) * 0.1;
        // Fade lines dynamically
        const lineMat = line.material as THREE.LineBasicMaterial;
        lineMat.color.copy(colorHighlight);
        lineMat.opacity = (0.05 + Math.sin(elapsedTime * 1.2 + index) * 0.08);
      });

      // Render Scene
      renderer.render(scene, camera);
    };

    animate();

    // --- CLEAN RESIZING (ResizeObserver) ---
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    });
    
    resizeObserver.observe(container);

    // Helpers
    function rand(min: number, max: number) {
      return min + Math.random() * (max - min);
    }

    // Clean up
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      
      try {
        container.removeChild(renderer.domElement);
      } catch (e) {}

      // Dispose web buffers
      geometry.dispose();
      material.dispose();
      particleTexture.dispose();
      lineSystems.forEach(line => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
      gridHelper.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center select-none"
      id="3d-particles-mask-renderer"
    />
  );
}
