import React, { useEffect, useRef, useState } from "react";
import { Camera as CameraIcon, ShieldAlert, VideoOff, RefreshCw, Zap, Heart } from "lucide-react";
import { GestureType, StatusCounts } from "../types";

interface CameraManagerProps {
  onGestureDetected: (gesture: GestureType) => void;
  onFPSUpdate: (fps: number) => void;
  onHandsCountUpdate: (count: number) => void;
  configColor: string; // Dynamic coloring
}

export default function CameraManager({
  onGestureDetected,
  onFPSUpdate,
  onHandsCountUpdate,
  configColor,
}: CameraManagerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraState, setCameraState] = useState<"uninitialized" | "requesting" | "running" | "denied" | "error">("uninitialized");
  const [loadingMediaPipe, setLoadingMediaPipe] = useState<boolean>(true);
  const [detectedGesture, setDetectedGesture] = useState<GestureType>("idle");
  const [activeHands, setActiveHands] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handsTrackerRef = useRef<any>(null);
  const mpCameraRef = useRef<any>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastFpsTime = useRef<number>(performance.now());
  const framesCount = useRef<number>(0);

  // Initialize and check for global CDN variables
  useEffect(() => {
    let checkInterval = setInterval(() => {
      if ((window as any).Hands && (window as any).Camera) {
        setLoadingMediaPipe(false);
        clearInterval(checkInterval);
        initMediaPipe();
      }
    }, 500);

    return () => {
      clearInterval(checkInterval);
      stopTracks();
    };
  }, []);

  const stopTracks = () => {
    if (mpCameraRef.current) {
      try {
        mpCameraRef.current.stop();
      } catch (e) {}
      mpCameraRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  };

  const initMediaPipe = () => {
    const HandsClass = (window as any).Hands;
    if (!HandsClass) return;

    try {
      const hands = new HandsClass({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65
      });

      hands.onResults(handleResults);
      handsTrackerRef.current = hands;
    } catch (err: any) {
      console.error("Failed to build MediaPipe Hands:", err);
      setErrorMsg("MediaPipe context instantiation failed.");
      setCameraState("error");
    }
  };

  // Human hand joints computation
  const calculateDistance = (p1: any, p2: any) => {
    return Math.sqrt(
      Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2)
    );
  };

  const handleResults = (results: any) => {
    // Frames stats
    framesCount.current++;
    const now = performance.now();
    if (now - lastFpsTime.current >= 1000) {
      const fpsValue = Math.round((framesCount.current * 1000) / (now - lastFpsTime.current));
      onFPSUpdate(fpsValue);
      framesCount.current = 0;
      lastFpsTime.current = now;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video feed on canvas
    if (videoRef.current) {
      ctx.save();
      // Mirror horizontal for intuitive camera interaction
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    const multiHandLandmarks = results.multiHandLandmarks;
    const count = multiHandLandmarks ? multiHandLandmarks.length : 0;
    setActiveHands(count);
    onHandsCountUpdate(count);

    if (count > 0) {
      const landmarks = multiHandLandmarks[0];

      // Draw futuristic vector skeleton on top
      drawSkeleton(ctx, landmarks, canvas.width, canvas.height);

      // Perform Gesture recognition
      // 0: Wrist, 5: Index base, 8: Index tip, 9: Middle base, 12: Middle tip
      // 13: Ring base, 16: Ring tip, 17: Pinky base, 20: Pinky tip
      const wrist = landmarks[0];
      const indexBase = landmarks[5];
      const middleBase = landmarks[9];
      const ringBase = landmarks[13];
      const pinkyBase = landmarks[17];

      // Hand Size normalization factor
      const handScale = calculateDistance(wrist, middleBase) || 0.1;

      const dIndex = calculateDistance(landmarks[8], indexBase) / handScale;
      const dMiddle = calculateDistance(landmarks[12], middleBase) / handScale;
      const dRing = calculateDistance(landmarks[16], ringBase) / handScale;
      const dPinky = calculateDistance(landmarks[20], pinkyBase) / handScale;

      const limits = { curl: 0.62, extend: 1.1 };
      
      let curledFingers = 0;
      let extendedFingers = 0;

      [dIndex, dMiddle, dRing, dPinky].forEach(dist => {
        if (dist < limits.curl) curledFingers++;
        if (dist > limits.extend) extendedFingers++;
      });

      let detected: GestureType = "idle";
      if (curledFingers >= 3) {
        detected = "fist";
      } else if (extendedFingers >= 3 || dMiddle > 1.2) {
        detected = "palm";
      }

      setDetectedGesture(detected);
      onGestureDetected(detected);
    } else {
      setDetectedGesture("idle");
      onGestureDetected("idle");
    }
  };

  const drawSkeleton = (ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
    // Modern cyber skeleton lines
    ctx.strokeStyle = configColor;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = configColor;
    ctx.shadowBlur = 10;

    // Connections map
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [5, 9], [9, 10], [10, 11], [11, 12], // Middle
      [9, 13], [13, 14], [14, 15], [15, 16], // Ring
      [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [0, 17] // Palm bottom
    ];

    connections.forEach(([p1Int, p2Int]) => {
      const p1 = landmarks[p1Int];
      const p2 = landmarks[p2Int];
      
      // Mirror X coordinates because we mirrored the background image
      const x1 = (1.0 - p1.x) * width;
      const y1 = p1.y * height;
      const x2 = (1.0 - p2.x) * width;
      const y2 = p2.y * height;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // Draw glowing node dots
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 4;
    landmarks.forEach((pt: any) => {
      const x = (1.0 - pt.x) * width;
      const y = pt.y * height;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Restore context
    ctx.shadowBlur = 0;
  };

  const startCamera = async () => {
    if (cameraState === "running") return;
    setCameraState("requesting");
    setErrorMsg("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        const CameraClass = (window as any).Camera;
        if (CameraClass && handsTrackerRef.current) {
          const cameraInstance = new CameraClass(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current && handsTrackerRef.current) {
                await handsTrackerRef.current.send({ image: videoRef.current });
              }
            },
            width: 320,
            height: 240
          });
          cameraInstance.start();
          mpCameraRef.current = cameraInstance;
          setCameraState("running");
        } else {
          // If MediaPipe window wrappers did not bind seamlessly, we create a manually ticked loop
          setCameraState("running");
          const renderLoop = async () => {
            if (handsTrackerRef.current && videoRef.current && !videoRef.current.paused) {
              try {
                await handsTrackerRef.current.send({ image: videoRef.current });
              } catch (e) {}
            }
            animationFrameId.current = requestAnimationFrame(renderLoop);
          };
          renderLoop();
        }
      }
    } catch (err: any) {
      console.error("Camera access denied or failed:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraState("denied");
        setErrorMsg("Webcam permission denied. Please grant access under browser settings.");
      } else {
        setCameraState("error");
        setErrorMsg(`Camera initialization failed: ${err.message || err}`);
      }
    }
  };

  const handleToggleCamera = () => {
    if (cameraState === "running" || cameraState === "requesting") {
      stopTracks();
      setCameraState("uninitialized");
    } else {
      startCamera();
    }
  };

  return (
    <div id="gesture-camera-preview" className="relative w-full h-full bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-lg overflow-hidden flex flex-col justify-between shadow-2xl select-none group">
      {/* Cyber corners */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
        <div className="absolute top-2 right-2 border-r border-t border-cyan-400 w-4 h-4 opacity-80"></div>
        <div className="absolute bottom-2 left-2 border-l border-b border-cyan-400 w-4 h-4 opacity-80"></div>
      </div>

      {/* Absolute Header with small active light */}
      <div className="absolute top-3 left-3 z-15 flex items-center gap-1.5 px-2 py-0.5 bg-black/85 backdrop-blur-md rounded border border-cyan-500/30 text-[9px] font-mono tracking-wider font-semibold">
        <span className={`w-1.5 h-1.5 rounded-full ${cameraState === "running" ? "bg-cyan-400 shadow-[0_0_8px_#00f2ff] animate-pulse" : "bg-neutral-600"}`}></span>
        <span>CV TRACKING</span>
      </div>

      {cameraState === "running" && (
        <div className="absolute top-3 right-3 text-[8px] bg-red-600 font-bold px-1 py-0.5 rounded uppercase tracking-wider z-15 animate-pulse">
          Live
        </div>
      )}

      {loadingMediaPipe ? (
        <div className="flex flex-col items-center justify-center flex-1 p-4 text-center text-slate-400">
          <RefreshCw className="w-5 h-5 mb-2 animate-spin text-cyan-400" />
          <p className="text-[10px] font-mono tracking-wider">LOADING CV DATASET...</p>
        </div>
      ) : (
        <div className="relative flex-1 flex flex-col items-center justify-center">
          {/* Hidden reference video element for MediaPipe input */}
          <video
            ref={videoRef}
            className="hidden"
            playsInline
            muted
          />

          {/* Canvas serving as both direct viewfinder, mirrored renderer and overlay painter */}
          <canvas
            ref={canvasRef}
            width={320}
            height={240}
            className={`w-full h-full object-cover transition-all duration-300 ${
              cameraState === "running" ? "opacity-50 mix-blend-screen" : "opacity-0 absolute pointer-events-none"
            }`}
          />

          {/* Placeholders for state display */}
          {cameraState === "uninitialized" && (
            <div className="p-4 flex flex-col items-center justify-center text-center">
              <CameraIcon className="w-8 h-8 text-neutral-600 mb-2 stroke-[1.2]" />
              <p className="text-[10px] text-neutral-400 font-mono tracking-wider mb-3">CAMERA IS OFFLINE</p>
              <button
                onClick={startCamera}
                className="px-3 py-1.5 bg-cyan-950/10 hover:bg-cyan-500/20 text-cyan-400 font-mono text-[10px] font-medium rounded border border-cyan-500/30 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.1)] active:scale-95"
              >
                授权并启动摄像头
              </button>
            </div>
          )}

          {cameraState === "requesting" && (
            <div className="p-4 flex flex-col items-center justify-center text-center">
              <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mb-2" />
              <p className="text-xs text-neutral-400 font-mono">Requesting webcam permission...</p>
            </div>
          )}

          {cameraState === "denied" && (
            <div className="p-4 flex flex-col items-center justify-center text-center max-w-xs">
              <ShieldAlert className="w-7 h-7 text-rose-500 mb-2 stroke-[1.5]" />
              <p className="text-[11px] text-rose-400 font-mono font-medium leading-tight mb-2">摄像头访问权限被拒绝</p>
              <p className="text-[10px] text-neutral-500 leading-normal mb-3">
                请在浏览器地址栏顶端，为当前网页开启摄像头权限后重试。
              </p>
              <button
                onClick={startCamera}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-[10px] rounded transition-all cursor-pointer active:scale-95"
              >
                RETRY AUTH
              </button>
            </div>
          )}

          {cameraState === "error" && (
            <div className="p-4 flex flex-col items-center justify-center text-center max-w-xs">
              <VideoOff className="w-7 h-7 text-neutral-500 mb-2 stroke-[1.5]" />
              <p className="text-[11px] text-neutral-400 font-mono leading-tight mb-1">Initialization Failed</p>
              <p className="text-[9px] text-neutral-500 leading-normal mb-3">{errorMsg}</p>
              <button
                onClick={location.reload}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px] rounded hover:border-neutral-700 transition-all"
              >
                Reload App
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer controls inside webcam pane */}
      <div className="p-2.5 bg-black/80 border-t border-cyan-500/10 flex items-center justify-between font-mono text-[10px] z-10">
        <div className="flex flex-col gap-0.5 text-neutral-400">
          <div className="flex items-center gap-1">
            <span className="text-neutral-500">GESTURE:</span>
            <span
              className={`font-semibold tracking-[0.05em] ${
                detectedGesture === "fist"
                  ? "text-rose-400"
                  : detectedGesture === "palm"
                  ? "text-cyan-400"
                  : "text-neutral-500"
              }`}
            >
              {detectedGesture === "fist" ? "✊ FIST_MASK" : detectedGesture === "palm" ? "🖐️ PALM_LOGO" : "STANDBY"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[8.5px] text-neutral-500 tracking-wider">
            <span>CV_TRACKING: HIGH_PRECISION</span>
          </div>
        </div>

        {cameraState === "running" && (
          <button
            onClick={handleToggleCamera}
            className="p-1 px-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 cursor-pointer transition-all active:scale-95 text-[9px]"
            title="Close camera"
          >
            CLOS_CAM
          </button>
        )}
      </div>
    </div>
  );
}
