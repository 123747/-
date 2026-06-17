import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini if environment variable is present
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // API Route for holographic chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required." });
      }

      // Check if API key is provided
      if (!process.env.GEMINI_API_KEY || !ai) {
        // Sophisticated mock answer for demo or testing
        return res.json({
          reply: "👋 你好！我是 AITO 智能面具全息助理。当前本地开发环境尚未检测到 `GEMINI_API_KEY` 环境变量。\n\n请在 Settings > Secrets 菜单中配置您的 Gemini API Key 开启全在线 AI 实时对话功能！现在可以点击下方的参数微调面板或手势控制按钮来进行全息粒子仿真测试。",
          isMock: true
        });
      }

      // Format messages: Retrieve the last user message
      const lastUserMessage = messages[messages.length - 1]?.content || "Hello";

      const systemInstruction = 
        "You are AITO Artificial Intelligence Mask (艾投智能全息面具), an advanced bio-mimetic cybernetic assistant. " +
        "Answer questions briefly in a sophisticated, friendly, tech-futuristic tone, using markdown format. " +
        "Keep your answers short and highly structured.";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: lastUserMessage,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const reply = response.text || "未能获取模型意识应答。";
      res.json({ reply, isMock: false });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.json({
        reply: `⚠️ 连接 Gemini 模型产生通信故障: ${error.message || "请求失败"}。已切换回本地智能中轨：面具支持在左侧 HUD 控制板直接调整参数属性流动。`,
        isMock: true
      });
    }
  });

  // API route for health checking
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", keyAvailable: !!process.env.GEMINI_API_KEY });
  });

  // Vite middleware for development vs static asset loading for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AITO SERVER] Server running on port ${PORT}`);
  });
}

startServer();
