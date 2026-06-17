import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Server, Terminal, Settings, Database, Activity, 
  Cpu, HardDrive, RefreshCw, Send, CheckCircle, Wifi, Play, AlertTriangle
} from "lucide-react";

interface BackendSystemProps {
  isOpen: boolean;
  onClose: () => void;
  highlightColor: string;
}

export default function BackendSystem({ isOpen, onClose, highlightColor }: BackendSystemProps) {
  const [activeTab, setActiveTab] = useState<"neural" | "api" | "topology">("neural");
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "[AITO SERVER] Booting quantum neuromorphic engine on port 3000...",
    "[AITO SERVER] Standard human face mask metrics verified successfully.",
    "[AITO SERVER] Face grid contour calibrated: nose index 1.2, chin slope 0.42.",
    "[INTELLIGENT ROUTE] Registered active endpoint: POST /api/chat",
    "[AI_GROUNDING] Loaded system instructions (AITO Cybernetic Assistant ver 2.0).",
    "[CONNECTIVITY] Awaiting active handshake commands from frontend layers...",
  ]);
  const [systemKeyInput, setSystemKeyInput] = useState("");
  const [modelTemp, setModelTemp] = useState(0.7);
  const [activeModel, setActiveModel] = useState("gemini-3.5-flash");
  const [totalHandshakes, setTotalHandshakes] = useState(148);
  const [pipelineState, setPipelineState] = useState<"ONLINE" | "STANDBY" | "MAINTENANCE">("ONLINE");
  const [newLogPrompt, setNewLogPrompt] = useState("");
  
  const terminalRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll logs
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [systemLogs]);

  // Simulate logging ticks
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) return;
      const ticks = [
        `[METRICS] Active dynamic particle morph pipeline tick. FPS stable.`,
        `[HEALTH] Express server heartbeat: OK • RAM usage: ${(42 + Math.random() * 4).toFixed(1)} MB`,
        `[API] Ping validation test from user client - origin: localhost:3000 - status 200`,
        `[NEURAL NETWORK] Active weights stable. Sub-layer feedback loops optimal.`,
        `[IMAGE COGNITION] Real-time video pose landmarks verified. Detected 1 hand.`,
      ];
      const randomTick = ticks[Math.floor(Math.random() * ticks.length)];
      setSystemLogs(prev => [...prev.slice(-35), `${new Date().toLocaleTimeString()} ${randomTick}`]);
      setTotalHandshakes(prev => prev + 1);
    }, 4500);

    return () => clearInterval(interval);
  }, [isOpen]);

  const addCustomLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogPrompt.trim()) return;
    setSystemLogs(prev => [...prev, `${new Date().toLocaleTimeString()} [USER INPUT CMD] ${newLogPrompt}`]);
    setNewLogPrompt("");
  };

  const clearLogs = () => {
    setSystemLogs([`[AITO SERVER] Terminal reset at ${new Date().toLocaleTimeString()} • Logs flushed.`]);
  };

  if (!isOpen) return null;

  return (
    <div id="hto-backend-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-5xl h-[80vh] bg-neutral-950 border border-cyan-400/40 rounded shadow-[0_0_60px_rgba(0,242,255,0.15)] flex flex-col overflow-hidden text-slate-200"
      >
        {/* Dynamic decorative border corners */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 px-6 bg-white/5 border-b border-cyan-400/20">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <h2 className="text-[12px] font-bold text-white tracking-[0.2em] uppercase">
                艾投全息智能后台管理系统
              </h2>
              <p className="text-[8px] text-cyan-400/60 font-medium tracking-wider">
                AITO INTELLIGENT COGNITIVE BACKEND CONTROLLER • DEV_PORT: 3000
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[9px] bg-cyan-950/40 px-3 py-1 rounded border border-cyan-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-cyan-400">系统节点：运行正常</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded cursor-pointer transition-colors active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* System Diagnostics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-white/5 text-[9px] bg-neutral-900/60 divide-x divide-white/5 font-semibold">
          <div className="p-3 px-5 flex items-center justify-between">
            <span className="text-slate-400 uppercase">接口端口 (DEV PORT)</span>
            <span className="text-cyan-400 font-bold">:3000/api/chat</span>
          </div>
          <div className="p-3 px-5 flex items-center justify-between">
            <span className="text-slate-400 uppercase">服务端代理SDK</span>
            <span className="text-[#00f2ff]">@google/genai</span>
          </div>
          <div className="p-3 px-5 flex items-center justify-between">
            <span className="text-slate-400 uppercase">累计呼叫次数</span>
            <span className="text-cyan-400 font-bold">{totalHandshakes} ITEMS</span>
          </div>
          <div className="p-3 px-5 flex items-center justify-between">
            <span className="text-slate-400 uppercase">安全连接级</span>
            <span className="text-emerald-400 font-bold">TLS v1.3 OVERLAY</span>
          </div>
        </div>

        {/* Content Body Pane split into Local Sidebar + Content Stage */}
        <div className="flex-1 flex overflow-hidden">
          {/* Subsystem local Navigation tabs */}
          <div className="w-48 border-r border-white/5 p-4 space-y-2 flex flex-col justify-between bg-neutral-950">
            <div className="space-y-1.5">
              <div className="text-[8px] opacity-40 uppercase tracking-widest px-2 mb-2 font-black">
                后台子系统
              </div>
              <button
                onClick={() => setActiveTab("neural")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-[10px] rounded transition-all text-left cursor-pointer ${
                  activeTab === "neural"
                    ? "bg-cyan-500/10 text-[#00f2ff] border border-cyan-400/30 font-bold"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>神经突触调整</span>
              </button>

              <button
                onClick={() => setActiveTab("api")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-[10px] rounded transition-all text-left cursor-pointer ${
                  activeTab === "api"
                    ? "bg-cyan-500/10 text-[#00f2ff] border border-cyan-400/30 font-bold"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>实时日志终端</span>
              </button>

              <button
                onClick={() => setActiveTab("topology")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-[10px] rounded transition-all text-left cursor-pointer ${
                  activeTab === "topology"
                    ? "bg-cyan-500/10 text-[#00f2ff] border border-cyan-400/30 font-bold"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>服务器指标监控</span>
              </button>
            </div>

            {/* Quick action buttons block */}
            <div className="space-y-1.5 border-t border-white/5 pt-4">
              <div className="text-[8px] opacity-30 uppercase font-black px-2">系统总阀</div>
              <button
                onClick={() => {
                  setPipelineState(prev => prev === "ONLINE" ? "STANDBY" : "ONLINE");
                  setSystemLogs(prev => [...prev, `${new Date().toLocaleTimeString()} [CMD] Changed pipeline state.`]);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-[8.5px] bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 rounded text-red-400 transition-colors pointer-events-auto cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3 h-3" />
                  <span>切换仿真/真机代理</span>
                </div>
                <span className="font-bold text-[8px]">{pipelineState === "ONLINE" ? "LIVE" : "MOCK"}</span>
              </button>
            </div>
          </div>

          {/* Content Stage area */}
          <div className="flex-1 overflow-y-auto p-6 bg-neutral-900/10">
            <AnimatePresence mode="wait">
              {/* Tab 1: Neural System configs */}
              {activeTab === "neural" && (
                <motion.div
                  key="neural"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6 text-[10px]"
                >
                  <div className="bg-neutral-900/50 border border-white/5 rounded p-4 space-y-4">
                    <div className="flex items-center gap-2 text-[#00f2ff] font-bold uppercase text-[10px] tracking-wide border-b border-white/5 pb-2">
                      <Settings className="w-4 h-4" />
                      <span>全息大模型接入配置 (Google Gemini Model Link)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-slate-400 uppercase font-medium">模型部署版本 (Target AI Model)</label>
                        <select
                          value={activeModel}
                          onChange={(e) => {
                            setActiveModel(e.target.value);
                            setSystemLogs(prev => [...prev, `[CONFIG] Selected target model: ${e.target.value}`]);
                          }}
                          className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-cyan-400"
                        >
                          <option value="gemini-3.5-flash">gemini-3.5-flash (最高效，推荐)</option>
                          <option value="gemini-2.5-pro">gemini-2.5-pro (强逻辑，高响应力)</option>
                          <option value="gemini-2.5-flash">gemini-2.5-flash (极轻量级)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-slate-400 uppercase font-medium">环境密钥配置 (Holographic API Auth Status)</label>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            placeholder="GEMINI_API_KEY 已托管于 Settings 环境变量"
                            disabled
                            className="flex-1 bg-black/40 border border-white/5 rounded px-2.5 py-1.5 text-[10px] text-slate-500 cursor-not-allowed italic"
                          />
                          <button
                            onClick={() => {
                              alert("API 密钥由 AI Studio 系统 Settings > Secrets 面板统一管理，无需手动在此处输入任何秘钥。");
                            }}
                            className="px-3 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 text-cyan-400 rounded cursor-pointer transition-colors active:scale-95"
                          >
                            提示管理
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-slate-400">
                        <span className="uppercase">思维温度 (TEMPERATURE COGNITION):</span>
                        <span className="text-cyan-400 font-bold">{modelTemp.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={modelTemp}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setModelTemp(val);
                          setSystemLogs(prev => [...prev, `[CONFIG] Parameter temp modified to: ${val}`]);
                        }}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* System Prompter Card */}
                  <div className="bg-neutral-900/50 border border-white/5 rounded p-4 space-y-3">
                    <div className="flex items-center gap-2 text-[#00f2ff] font-bold uppercase text-[10px] tracking-wide border-b border-white/5 pb-2">
                      <Database className="w-4 h-4" />
                      <span>系统预设身份模板设定 (AITO System Instruction Frame)</span>
                    </div>

                    <div className="space-y-1.5 text-xs text-neutral-300">
                      <div className="bg-black/40 border border-white/5 p-3 rounded leading-relaxed text-[10px] font-sans text-neutral-400 space-y-2">
                        <p className="font-semibold text-slate-200">当前激活的神经意识流规则：</p>
                        <blockquote className="border-l-2 border-cyan-500 pl-2 italic">
                          "You are AITO Artificial Intelligence Mask (艾投智能全息面具), an advanced bio-mimetic cybernetic assistant. Answer questions briefly in a sophisticated, friendly, tech-futuristic tone, using markdown format. Keep your answers short and highly structured."
                        </blockquote>
                        <p className="text-[9px] text-[#00f2ff]/60">注：如需自定义以上预设，可在后台服务端 `server.ts` 源码中轻松编辑 `systemInstruction` 属性，实现无缝部署更改。</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Terminal Logs */}
              {activeTab === "api" && (
                <motion.div
                  key="api"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4 flex flex-col h-full text-[10px]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <span>量子信道全息日志控制台</span>
                    </div>

                    <button
                      onClick={clearLogs}
                      className="text-[9px] hover:text-white border border-white/10 hover:border-red-500/30 p-1 px-2 rounded bg-white/5 hover:bg-red-500/10 cursor-pointer active:scale-95 transition-all"
                    >
                      清空日志流
                    </button>
                  </div>

                  {/* Terminal Area */}
                  <div 
                    ref={terminalRef}
                    className="flex-1 min-h-[220px] bg-black/90 p-4 rounded border border-white/10 font-mono text-[9.5px] leading-relaxed text-cyan-300/90 overflow-y-auto space-y-1.5 shadow-[inset_0_2px_12px_rgba(0,0,0,0.8)]"
                  >
                    {systemLogs.map((log, listIdx) => (
                      <div key={listIdx} className="flex gap-2.5 items-start">
                        <span className="opacity-30 select-none">[{String(listIdx + 1).padStart(3, "0")}]</span>
                        <span className="whitespace-pre-wrap">{log}</span>
                      </div>
                    ))}
                    <div className="h-1" />
                  </div>

                  {/* Interactive mock terminal control */}
                  <form onSubmit={addCustomLog} className="flex gap-2">
                    <input
                      type="text"
                      value={newLogPrompt}
                      onChange={(e) => setNewLogPrompt(e.target.value)}
                      placeholder="发送系统伪指令或调试参数指令 (例如 /reboot, /morph 12)..."
                      className="flex-1 bg-black/80 border border-white/10 rounded px-3 py-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-cyan-400/15 hover:bg-cyan-400/25 border border-cyan-400/30 text-cyan-400 font-bold rounded cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>执行</span>
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Tab 3: Topology/Monitoring */}
              {activeTab === "topology" && (
                <motion.div
                  key="topology"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6 text-[10px]"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* CPU load mock */}
                    <div className="bg-neutral-900/50 border border-white/5 rounded p-4 space-y-2">
                      <div className="text-slate-400 uppercase tracking-wider font-semibold">粒子运算处理器 CPU LOAD</div>
                      <div className="text-[20px] font-mono text-cyan-400 font-bold tracking-tight">
                        {(12 + Math.random() * 8).toFixed(1)}%
                      </div>
                      <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div className="bg-[#00f2ff] h-full" style={{ width: "18%" }}></div>
                      </div>
                      <span className="text-[8px] text-slate-500 block">Multicore processing layer optimal</span>
                    </div>

                    {/* RAM usage mock */}
                    <div className="bg-neutral-900/50 border border-white/5 rounded p-4 space-y-2">
                      <div className="text-slate-400 uppercase tracking-wider font-semibold">缓存节点内存 ALLOCATED RAM</div>
                      <div className="text-[20px] font-mono text-[#00f2ff] font-bold tracking-tight">
                        45.3 MB
                      </div>
                      <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div className="bg-[#00f2ff] h-full" style={{ width: "35%" }}></div>
                      </div>
                      <span className="text-[8px] text-slate-500 block">GC (Garbage Collection) cycle healthy</span>
                    </div>

                    {/* Latency mock */}
                    <div className="bg-neutral-900/50 border border-white/5 rounded p-4 space-y-2">
                      <div className="text-slate-400 uppercase tracking-wider font-semibold">信道通信延迟 LATENCY</div>
                      <div className="text-[20px] font-mono text-emerald-400 font-bold tracking-tight">
                        18 ms
                      </div>
                      <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div className="bg-emerald-400 h-full" style={{ width: "9%" }}></div>
                      </div>
                      <span className="text-[8px] text-slate-500 block">Fastest routes cached via local proxy</span>
                    </div>
                  </div>

                  {/* Pipeline graph visual */}
                  <div className="bg-neutral-900/50 border border-white/5 rounded p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[#00f2ff] font-bold uppercase">AITO 信道核心链路拓扑</span>
                      <span className="text-[8px] font-mono p-0.5 px-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded font-black">
                        SECURE WEBSOCK ACTIVE
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 justify-center py-6 text-center text-[9px]">
                      {/* Node A */}
                      <div className="p-3 bg-black/60 border border-cyan-400/30 rounded w-28 shadow-[0_0_10px_rgba(0,182,212,0.1)]">
                        <div className="font-bold text-white mb-0.5">FRONTEND VIEW</div>
                        <div className="text-[8px] opacity-60">THREE.js Canvas</div>
                        <div className="text-emerald-400 font-black mt-2">12,000 VERTICES</div>
                      </div>

                      {/* Bridge */}
                      <div className="flex flex-col items-center">
                        <div className="text-[#00f2ff] font-black tracking-widest animate-pulse font-mono">=== PROXY ==&gt;</div>
                        <span className="text-[7.5px] text-slate-400 mt-1 uppercase">Holographic link</span>
                      </div>

                      {/* Node B */}
                      <div className="p-3 bg-black/60 border border-cyan-400/30 rounded w-32 shadow-[0_0_10px_rgba(0,182,212,0.1)]">
                        <div className="font-bold text-white mb-0.5">EXPRESS API SERVICE</div>
                        <div className="text-[8px] opacity-60">Node.js Router</div>
                        <div className="text-[#00f2ff] font-black mt-2">PORT 3000 DEV</div>
                      </div>

                      {/* Bridge */}
                      <div className="flex flex-col items-center">
                        <div className="text-cyan-500 font-black tracking-widest animate-pulse font-mono">=== SECURE ==&gt;</div>
                        <span className="text-[7.5px] text-slate-400 mt-1 uppercase">Google API SDK</span>
                      </div>

                      {/* Node C */}
                      <div className="p-3 bg-cyan-950/20 border border-cyan-400/40 rounded w-32 shadow-[0_0_15px_rgba(0,242,255,0.15)]">
                        <div className="font-bold text-slate-100 mb-0.5">GEMINI 3.5 FLASH</div>
                        <div className="text-[8px] opacity-60">Google AI Model</div>
                        <div className="text-emerald-400 font-bold mt-2">COGNITIVE ENGINE</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-6 bg-white/5 border-t border-cyan-400/20 flex items-center justify-between text-[8px] text-slate-400/80">
          <span>AITO HOLOGRAPHIC CLOUD PIPELINE LAYER v2.1.2</span>
          <span>© 2026 AITO INC • ALL SYSTEMS OPERATIONAL</span>
        </div>
      </motion.div>
    </div>
  );
}
