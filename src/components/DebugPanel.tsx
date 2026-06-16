import React, { useEffect, useState } from "react";
import { Sliders, EyeOff, LayoutGrid, RotateCcw, AlertCircle, Sparkles, Wand2, Activity } from "lucide-react";
import { AppConfig, GestureType } from "../types";

interface DebugPanelProps {
  config: AppConfig;
  onChangeConfig: (newConfig: AppConfig) => void;
  detectedGesture: GestureType;
  simulatedGesture: GestureType;
  onSimulateGesture: (gesture: GestureType) => void;
  activeInteractionState: GestureType; // Actual current morph target mapping
  fps: number;
  detectedHands: number;
  isOpen: boolean;
  onToggle: () => void;
}

export default function DebugPanel({
  config,
  onChangeConfig,
  detectedGesture,
  simulatedGesture,
  onSimulateGesture,
  activeInteractionState,
  fps,
  detectedHands,
  isOpen,
  onToggle,
}: DebugPanelProps) {
  const [localConfig, setLocalConfig] = useState<AppConfig>({ ...config });

  // Sync state with props
  useEffect(() => {
    setLocalConfig({ ...config });
  }, [config]);

  const handleChange = (key: keyof AppConfig, value: any) => {
    const updated = { ...localConfig, [key]: value };
    setLocalConfig(updated);
    onChangeConfig(updated);
  };

  const resetConfig = () => {
    const defaultVal: AppConfig = {
      particleCount: 8000,
      morphSpeed: 2.2,
      scatterRadius: 2.5,
      baseColor: "#cbd5e1", // Silver slate-200
      highlightColor: "#06b6d4", // Cyan-500
      transparency: 0.8,
      autoRotate: true,
      rotationSpeed: 0.6,
      circuitSpeed: true,
      flowIntensity: 0.8,
      pointSize: 1.8,
    };
    setLocalConfig(defaultVal);
    onChangeConfig(defaultVal);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 left-6 z-50 font-mono text-[10px] text-cyan-400 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur border border-cyan-400/30 rounded shadow-[0_0_15px_rgba(0,242,255,0.15)] select-none">
        <kbd className="px-1.5 py-0.5 bg-neutral-900 rounded border border-neutral-800 text-neutral-300 font-bold">H</kbd>
        <span className="tracking-wide uppercase">Toggle HUD Panel</span>
      </div>
    );
  }

  return (
    <div id="cyber-debug-panel" className="fixed top-6 left-6 z-50 w-80 bg-black/60 backdrop-blur-xl border border-cyan-400/30 rounded shadow-[0_25px_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col font-mono text-xs select-none">
      {/* Header bar */}
      <div className="p-4 bg-white/5 border-b border-cyan-500/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-[0.15em] text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2ff]"></span>
          <span>CONTROL_PANEL_V2</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[8px] bg-cyan-400/20 px-1.5 py-0.5 text-cyan-400 tracking-wider font-bold rounded uppercase">
            DEBUG_ON
          </div>
          <button
            onClick={onToggle}
            className="text-[9px] text-neutral-400 hover:text-white border border-cyan-500/20 hover:border-cyan-500/40 p-0.5 px-1.5 rounded transition cursor-pointer active:scale-95"
            title="Press H to toggle"
          >
            H
          </button>
        </div>
      </div>

      {/* Main body parameters */}
      <div className="p-5 flex-1 overflow-y-auto max-h-[70vh] space-y-4 text-[10px] text-slate-300">
        {/* Particle density / counts */}
        <div className="space-y-1.5">
          <div className="flex justify-between uppercase opacity-80 tracking-wider">
            <span>PARTICLE_COUNT</span>
            <span className="text-cyan-400 font-bold">{localConfig.particleCount.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="2000"
            max="16000"
            step="1000"
            value={localConfig.particleCount}
            onChange={(e) => handleChange("particleCount", parseInt(e.target.value))}
            className="w-full h-[1.5px] bg-white/10 appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Morphing speeds */}
        <div className="space-y-1.5">
          <div className="flex justify-between uppercase opacity-80 tracking-wider">
            <span>CONVERGE_SPEED</span>
            <span className="text-cyan-400 font-bold">{localConfig.morphSpeed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="6.0"
            step="0.1"
            value={localConfig.morphSpeed}
            onChange={(e) => handleChange("morphSpeed", parseFloat(e.target.value))}
            className="w-full h-[1.5px] bg-white/10 appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Outer dispersed orbits size */}
        <div className="space-y-1.5">
          <div className="flex justify-between uppercase opacity-80 tracking-wider">
            <span>SCATTER_RADIUS</span>
            <span className="text-cyan-400 font-bold">{localConfig.scatterRadius.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.1"
            value={localConfig.scatterRadius}
            onChange={(e) => handleChange("scatterRadius", parseFloat(e.target.value))}
            className="w-full h-[1.5px] bg-white/10 appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Highlight details / color picks */}
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-slate-400 font-medium mb-1 tracking-wider uppercase text-[9px]">BASE_COLOR</span>
              <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded">
                <input
                  type="color"
                  value={localConfig.baseColor}
                  onChange={(e) => handleChange("baseColor", e.target.value)}
                  className="w-4 h-4 border-0 rounded cursor-pointer bg-transparent"
                />
                <span className="uppercase text-[9px] text-slate-300 font-semibold">
                  {localConfig.baseColor}
                </span>
              </div>
            </div>
            <div>
              <span className="block text-slate-400 font-medium mb-1 tracking-wider uppercase text-[9px]">GLOW_COLOR</span>
              <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-[#00f2ff]/20 rounded">
                <input
                  type="color"
                  value={localConfig.highlightColor}
                  onChange={(e) => handleChange("highlightColor", e.target.value)}
                  className="w-4 h-4 border-0 rounded cursor-pointer bg-transparent"
                />
                <span className="uppercase text-[9px] text-[#00f2ff] font-semibold">
                  {localConfig.highlightColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Optical transparency */}
        <div className="space-y-1.5">
          <div className="flex justify-between uppercase opacity-80 tracking-wider">
            <span>GLOW_OPACITY</span>
            <span className="text-cyan-400 font-bold">{(localConfig.transparency * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="1.0"
            step="0.05"
            value={localConfig.transparency}
            onChange={(e) => handleChange("transparency", parseFloat(e.target.value))}
            className="w-full h-[1.5px] bg-white/10 appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Point Size sizing */}
        <div className="space-y-1.5">
          <div className="flex justify-between uppercase opacity-80 tracking-wider">
            <span>PARTICLE_SIZE</span>
            <span className="text-cyan-400 font-bold">{localConfig.pointSize.toFixed(1)}px</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="3.5"
            step="0.1"
            value={localConfig.pointSize}
            onChange={(e) => handleChange("pointSize", parseFloat(e.target.value))}
            className="w-full h-[1.5px] bg-white/10 appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Interactive circuit options */}
        <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
          <label className="flex items-center gap-1.5 p-1.5 bg-white/5 border border-white/5 rounded cursor-pointer hover:border-[#00f2ff]/20 transition-colors">
            <input
              type="checkbox"
              checked={localConfig.circuitSpeed}
              onChange={(e) => handleChange("circuitSpeed", e.target.checked)}
              className="accent-cyan-400 rounded-sm"
            />
            <span className="text-slate-400 uppercase text-[9px]">电路纹路</span>
          </label>
          <label className="flex items-center gap-1.5 p-1.5 bg-white/5 border border-white/5 rounded cursor-pointer hover:border-[#00f2ff]/20 transition-colors">
            <input
              type="checkbox"
              checked={localConfig.autoRotate}
              onChange={(e) => handleChange("autoRotate", e.target.checked)}
              className="accent-cyan-400 rounded-sm"
            />
            <span className="text-slate-400 uppercase text-[9px]">自动旋转</span>
          </label>
        </div>

        {localConfig.circuitSpeed && (
          <div className="space-y-1.5">
            <div className="flex justify-between uppercase opacity-80 tracking-wider">
              <span>FLOW_INTENSITY</span>
              <span className="text-cyan-400 font-bold">{localConfig.flowIntensity.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={localConfig.flowIntensity}
              onChange={(e) => handleChange("flowIntensity", parseFloat(e.target.value))}
              className="w-full h-[1.5px] bg-white/10 appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        )}

        {/* Hand Simulation inputs */}
        <div className="border-t border-white/5 pt-3.5 space-y-2">
          <div className="text-[9px] opacity-40 uppercase tracking-widest">
            CURRENT_GESTURE_INPUT
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onSimulateGesture("fist")}
              className={`p-1.5 rounded-sm border text-center transition-all cursor-pointer font-mono uppercase text-[9px] ${
                simulatedGesture === "fist" && detectedGesture === "idle"
                  ? "bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.15)]"
                  : "bg-white/5 border-white/5 hover:border-white/10 text-neutral-400"
              }`}
            >
              FIST ✊
            </button>
            <button
              onClick={() => onSimulateGesture("palm")}
              className={`p-1.5 rounded-sm border text-center transition-all cursor-pointer font-mono uppercase text-[9px] ${
                simulatedGesture === "palm" && detectedGesture === "idle"
                  ? "bg-[#00f2ff]/15 border-[#00f2ff]/40 text-[#00f2ff] shadow-[0_0_8px_rgba(0,242,255,0.15)]"
                  : "bg-white/5 border-white/5 hover:border-white/10 text-neutral-400"
              }`}
            >
              PALM 🖐️
            </button>
            <button
              onClick={() => onSimulateGesture("idle")}
              className={`p-1.5 rounded-sm border text-center transition-all cursor-pointer font-mono uppercase text-[9px] ${
                simulatedGesture === "idle" && detectedGesture === "idle"
                  ? "bg-neutral-800 border-neutral-700 text-white"
                  : "bg-white/5 border-white/5 hover:border-white/10 text-neutral-400"
              }`}
            >
              RESET 💤
            </button>
          </div>

          {detectedGesture !== "idle" && (
            <div className="mt-1 text-[8.5px] text-amber-500/80 leading-normal bg-amber-500/5 p-2 rounded border border-amber-500/20">
              提示: 检测到真实摄像头手部输入，手势仿真按钮已自动禁用。
            </div>
          )}
        </div>

        {/* Diagnostic list */}
        <div className="border-t border-white/5 pt-3.5 space-y-1.5 text-[9.5px] opacity-60">
          <div className="flex justify-between">
            <span>SYSTEM_STABILITY</span>
            <span className="text-emerald-400 font-semibold">{fps.toFixed(1)} FPS</span>
          </div>
          <div className="flex justify-between">
            <span>CV_HAND_DETECTED</span>
            <span>{detectedHands > 0 ? "TRUE" : "FALSE"}</span>
          </div>
          <div className="flex justify-between">
            <span>PROJECTION_LAYER</span>
            <span className="text-[#00f2ff] uppercase font-bold">
              {activeInteractionState === "fist" ? "GESTURE_MASK_ACTIVE" : "AITO_LOGO_ACTIVE"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer bar with quick resetting */}
      <div className="p-3 bg-white/5 border-t border-white/5 flex items-center justify-between text-[10px]">
        <span className="opacity-35 tracking-wider">AITO LABS CORP © 2026</span>
        <button
          onClick={resetConfig}
          className="flex items-center gap-1 opacity-70 hover:opacity-100 text-white border border-white/10 hover:border-cyan-500/30 p-1 px-2.5 rounded bg-white/5 hover:bg-cyan-500/10 transition-all cursor-pointer active:scale-95 text-[9px]"
        >
          <RotateCcw className="w-3 h-3" />
          <span>INITIALIZE</span>
        </button>
      </div>
    </div>
  );
}
