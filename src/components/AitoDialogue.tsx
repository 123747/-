import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, MessageSquare, Terminal } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "mask";
  content: string;
  timestamp: Date;
}

export default function AitoDialogue() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "mask",
      content: "AITO已准备就绪，你可以向我提问任何问题",
      timestamp: new Date(),
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      content: inputVal,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "mask",
          content: data.reply || "未能接收到全息意识回复。",
          timestamp: new Date(),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "mask",
          content: "⚠️ 通信链路未检测到服务端：请确保运行了 `npm run dev` 启动的全栈 Express 代理。临时为您开启本地自研全息仿真回应：\n\n“面具全息矩阵正在分析您输入的：'" + userMsg.content + "'。”",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="aito-dialogue-panel" className="fixed top-24 right-6 bottom-56 w-80 md:w-96 flex flex-col pointer-events-auto z-40 select-none font-mono">
      {/* Toggle button when collapsed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="ml-auto flex items-center gap-2 px-3.5 py-2 bg-white/85 backdrop-blur-md border border-[#00a5bc]/40 hover:border-[#00a5bc] text-[#00a5bc] rounded shadow-[0_4px_15px_rgba(6,182,212,0.1)] cursor-pointer transition-all active:scale-95"
        >
          <MessageSquare className="w-4 h-4 animate-bounce" />
          <span className="text-[10px] uppercase tracking-widest font-bold">【艾投客户】唤醒对话</span>
        </button>
      )}

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col bg-white/85 backdrop-blur-md border border-slate-200 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          {/* Panel Header */}
          <div className="p-3.5 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#00a5bc] font-bold uppercase tracking-[0.15em] text-[10px]">
              <Sparkles className="w-3.5 h-3.5 text-[#00a5bc] animate-pulse" />
              <span>【艾投智能助理】</span>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="text-[9px] text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 p-0.5 px-1.5 rounded transition cursor-pointer active:scale-95 bg-white/50"
              title="Minimize chat"
            >
              MINIM_CHAT
            </button>
          </div>

          {/* Diagnostic Stats Overlay */}
          <div className="bg-sky-50 border-b border-cyan-100 p-1.5 px-3 flex items-center justify-between text-[8px] text-[#00a5bc] font-bold tracking-wider">
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
              <span>COMMUNICATION LINK: HEALTHY</span>
            </div>
            <span>PORT: 3000/API/CHAT</span>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[10px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                {/* Meta details */}
                <span className="text-[8px] opacity-60 text-slate-500 mb-1 hover:opacity-100 transition-opacity">
                  {msg.sender === "user" ? "USER_PROMPT" : "AITO_HELIOS_SYSTEM"} •{" "}
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                
                {/* Text Bubble */}
                <div
                  className={`max-w-[85%] rounded p-2.5 leading-relaxed break-words border font-sans whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-sky-50 border-sky-100 text-slate-800 shadow-[0_2px_10px_rgba(6,182,212,0.04)]"
                      : "bg-slate-50 border-slate-100 text-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.01)]"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex flex-col items-start">
                <span className="text-[8px] opacity-60 text-slate-500 mb-1">AITO_HELIOS_SYSTEM • DECRYPTING RESPONSE...</span>
                <div className="bg-slate-50 border border-slate-150 rounded p-3 text-slate-600 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 animate-spin text-[#00a5bc]" />
                  <span>等离子序列重构中 [GRID PROCESS ON]...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-slate-50/50 border-t border-slate-100 flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="向全息面具传送指令或对话..."
              className="flex-1 bg-white border border-slate-200 rounded py-1.5 px-3 text-[10px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00a5bc] focus:shadow-[0_0_8px_rgba(6,182,212,0.15)] transition-all font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="p-1.5 bg-[#00a5bc]/10 hover:bg-[#00a5bc]/20 border border-[#00a5bc]/30 text-[#00a5bc] rounded cursor-pointer transition-all active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed"
              title="Transmit"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
