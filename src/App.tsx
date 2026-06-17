import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Camera,
  Cpu,
  Monitor,
  Command,
  Eye,
  EyeOff,
  HelpCircle,
  Activity,
  Heart,
  CornerDownRight,
  Fingerprint,
  Server
} from "lucide-react";
import { AppConfig, GestureType } from "./types";
import MaskCanvas from "./components/MaskCanvas";
import DebugPanel from "./components/DebugPanel";
import CameraManager from "./components/CameraManager";
import AitoDialogue from "./components/AitoDialogue";
import BackendSystem from "./components/BackendSystem";

export default function App() {
  // Global active parameters config state
  const [config, setConfig] = useState<AppConfig>({
    particleCount: 8000,
    morphSpeed: 2.2,
    scatterRadius: 2.5,
    baseColor: "#e2e8f0", // Ice-silver base
    highlightColor: "#06b6d4", // Cyan highlight
    transparency: 0.8,
    autoRotate: true,
    rotationSpeed: 0.6,
    circuitSpeed: true,
    flowIntensity: 0.8,
    pointSize: 1.8,
  });

  // Toggle HUD parameters state
  const [isDebugOpen, setIsDebugOpen] = useState<boolean>(true);

  // Gesture Recognition States
  const [cameraGesture, setCameraGesture] = useState<GestureType>("idle");
  const [simulatedGesture, setSimulatedGesture] = useState<GestureType>("idle");
  const [detectedHands, setDetectedHands] = useState<number>(0);
  const [fps, setFps] = useState<number>(60);
  const [showQuickHelp, setShowQuickHelp] = useState<boolean>(true);
  const [isBackendOpen, setIsBackendOpen] = useState<boolean>(false);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "h" || e.key === "H") {
        setIsDebugOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Determine actual render target state (priority to actual camera, fallbacks to simulated button click)
  const activeInteractionState: GestureType = 
    detectedHands > 0 && cameraGesture !== "idle"
      ? cameraGesture
      : simulatedGesture;

  // Visual text helper for HUD banner
  const getFeedbackMessage = () => {
    if (detectedHands > 0) {
      if (cameraGesture === "fist") return { text: "MASK ACTIVE (✊ FIST)", class: "text-rose-400 bg-rose-500/10 border-rose-500/30" };
      if (cameraGesture === "palm") return { text: "LOGO ACTIVE (🖐️ PALM)", class: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" };
      return { text: "STANDBY IDLE (AITO LOGO)", class: "text-slate-400 bg-slate-950/40 border-slate-800" };
    } else {
      if (simulatedGesture === "fist") return { text: "SIMULATED MASK (✊ FIST)", class: "text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse" };
      if (simulatedGesture === "palm") return { text: "SIMULATED LOGO (🖐️ PALM)", class: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30 animate-pulse" };
      return { text: "STANDBY RECONNECTED (AITO LOGO)", class: "text-slate-400 bg-slate-950/40 border-slate-800" };
    }
  };

  const messageInfo = getFeedbackMessage();

  return (
    <div id="cyber-app-container" className="relative w-screen h-screen bg-[#020508] text-white overflow-hidden font-mono select-none">
      
      {/* 1. Backdrop 3D Three.js Particles Engine */}
      <MaskCanvas
        config={config}
        gestureState={activeInteractionState}
      />

      {/* Cyberpunk Vignette gradient overlay to lock depth focus in the center */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_15%,rgba(2,5,8,0.95)_100%)] z-1" />

      {/* 2. Top-Left Branding / Header */}
      <div className="absolute top-6 left-6 z-10 flex items-start gap-4 pointer-events-auto bg-black/40 backdrop-blur-md border border-cyan-500/10 rounded-sm p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            {/* Elegant 3D stylized A logo emblem */}
            <div className="relative w-9 h-9 rounded flex items-center justify-center bg-cyan-400/10 border border-[#00f2ff]/30 shadow-[0_0_15px_rgba(0,242,255,0.2)] overflow-hidden">
              <span className="font-extrabold text-[#00f2ff] text-xl">A</span>
              {/* Tilted orbit micro rings */}
              <div className="absolute inset-0.5 rounded border border-cyan-500/10 rotate-12 scale-105" />
              <div className="absolute inset-1.5 rounded -rotate-12 scale-95 border border-cyan-500/15" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-[0.1em] text-[#e0e8f0] uppercase">
                  艾投 AITO Labs
                </h1>
                <span className="text-[8px] px-1.5 py-0.5 bg-cyan-400/20 border border-[#00f2ff]/30 text-[#00f2ff] rounded uppercase font-bold tracking-widest">
                  SYS_BETA
                </span>
              </div>
              <p className="text-[9px] text-[#00f2ff]/60 tracking-[0.05em] uppercase font-semibold">
                3D Particle Light Mask Streamer
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Top Center Gesture Diagnostics Status Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`px-4 py-2 border rounded shadow-[0_0_20px_rgba(0,242,255,0.1)] backdrop-blur-xl flex items-center gap-2.5 transition-all duration-300 ${messageInfo.class}`}
        >
          <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span className="text-[10px] font-mono tracking-widest font-bold uppercase">
            {messageInfo.text}
          </span>
        </motion.div>
      </div>

      {/* 4. Left sidebar Parameter HUD Controllers */}
      <DebugPanel
        config={config}
        onChangeConfig={setConfig}
        detectedGesture={cameraGesture}
        simulatedGesture={simulatedGesture}
        onSimulateGesture={setSimulatedGesture}
        activeInteractionState={activeInteractionState}
        fps={fps}
        detectedHands={detectedHands}
        isOpen={isDebugOpen}
        onToggle={() => setIsDebugOpen(!isDebugOpen)}
      />

      {/* 5. Bottom Right: Live Webcam Preview Panel */}
      <div className="fixed bottom-6 right-6 z-10 w-72 h-44 shadow-[0_25px_50px_rgba(0,0,0,0.85)] pointer-events-auto">
        <CameraManager
          onGestureDetected={setCameraGesture}
          onFPSUpdate={setFps}
          onHandsCountUpdate={setDetectedHands}
          configColor={config.highlightColor}
        />
      </div>

      {/* 5.5 Right Side Hover Dialogue Assistant */}
      <AitoDialogue />

      {/* 6. Bottom-Left / Center: Shortcuts / Interactive Tips */}
      <AnimatePresence>
        {showQuickHelp && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 transform z-50 px-5 py-4 bg-black/80 backdrop-blur-xl border border-cyan-500/40 rounded shadow-[0_20px_50px_rgba(0,0,0,0.95)] text-[10px] text-[#e0e8f0]/80 tracking-wide max-w-sm w-[90%] md:w-96 select-text pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <Command className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-white font-bold uppercase tracking-wider text-[10px]">交互指南 (OPERATIONS)</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickHelp(false);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setShowQuickHelp(false);
                }}
                className="text-[9px] text-[#00f2ff] hover:text-white selection:bg-transparent tracking-widest font-bold cursor-pointer px-1.5 py-0.5 bg-black/40 hover:bg-[#00f2ff]/20 rounded border border-cyan-400/20 active:scale-95 transition-all pointer-events-auto z-50"
              >
                [HIDE]
              </button>
            </div>
            
            <ul className="space-y-2 text-[9px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-[#00f2ff] font-bold">✊</span>
                <span>
                  <b>握拳手势</b>：粒子流星瞬间受到约束，汇聚成高精度的
                  <span className="text-[#00f2ff]">「赛博朋克 3D 粒子智能面具」</span>。
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#00f2ff] font-bold">🖐️</span>
                <span>
                  <b>张开手掌</b> / <b>闲置</b>：粒子云极速炸裂，平稳散开成高空悬浮的
                  <span className="text-[#00f2ff]">「3D AITO 智能阵列 LOGO」</span>。
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#00f2ff] font-bold">🖱️</span>
                <span>
                  <b>鼠标位移</b>：在页面任何位置拖动或滑动，三维粒子将自适应产生深度差悬浮。
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#00f2ff] font-bold">⌨️</span>
                <span>
                  按键盘上的 <b>[ H ]</b> 键，可以快速折叠/呼出左侧专业的粒子神经中枢测试面板。
                </span>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Bottom Controllers Group */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 select-none pointer-events-none">
        {!showQuickHelp && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowQuickHelp(true);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              setShowQuickHelp(true);
            }}
            className="p-1 px-3 bg-black/60 backdrop-blur border border-cyan-400/20 rounded text-[9px] font-mono text-cyan-400 hover:text-white flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,242,255,0.1)] cursor-pointer active:scale-95 transition-all uppercase tracking-widest pointer-events-auto z-40"
          >
            <HelpCircle className="w-3 h-3 text-cyan-400" />
            <span>帮助指南 HELP TIPS_ON</span>
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsBackendOpen(true);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            setIsBackendOpen(true);
          }}
          className="p-1.5 px-3.5 bg-cyan-950/40 hover:bg-cyan-900/60 backdrop-blur border border-cyan-400/50 hover:border-cyan-400 rounded text-[9px] font-mono text-white flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,242,255,0.25)] cursor-pointer active:scale-95 transition-all uppercase font-bold tracking-wider animate-pulse hover:animate-none pointer-events-auto z-40"
        >
          <Server className="w-3.5 h-3.5 text-[#00f2ff]" />
          <span>[ 进入后台页面 ] ENTER BACKEND SYSTEM</span>
        </button>
      </div>

      {/* Backend Administration system Modal Container */}
      <AnimatePresence>
        {isBackendOpen && (
          <BackendSystem 
            isOpen={isBackendOpen} 
            onClose={() => setIsBackendOpen(false)} 
            highlightColor={config.highlightColor} 
          />
        )}
      </AnimatePresence>

      {/* Cyber decorative grid frame borders */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-cyan-400/40 pointer-events-none z-10 m-2" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-cyan-400/40 pointer-events-none z-10 m-2" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-cyan-400/40 pointer-events-none z-10 m-2" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-cyan-400/40 pointer-events-none z-10 m-2" />
    </div>
  );
}
