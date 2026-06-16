export interface AppConfig {
  particleCount: number;
  morphSpeed: number;
  scatterRadius: number;
  baseColor: string; // Hex string e.g. "#e2e8f0"
  highlightColor: string; // Hex string e.g. "#06b6d4"
  transparency: number; // 0.7 - 0.85
  autoRotate: boolean;
  rotationSpeed: number;
  circuitSpeed: boolean; // toggle flow pattern animation
  flowIntensity: number; // intensity of the micro wavy/circuit lines movement
  pointSize: number;
}

export type GestureType = "fist" | "palm" | "idle";

export interface StatusCounts {
  fps: number;
  detectedHands: number;
  recognizedGesture: GestureType;
  lastGestureTime: string;
}
