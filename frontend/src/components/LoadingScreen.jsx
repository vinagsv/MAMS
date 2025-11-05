import React, { useEffect, useState } from "react";
import { Loader2, Zap, HexagonIcon, Clock, Hexagon } from "lucide-react";

export default function LoadingScreen() {
  const [seconds, setSeconds] = useState(110);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
      setProgress((p) => (p < 100 ? p + 100 / 102 : 100));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedTime = `${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-200">
      <div className="flex flex-col items-center gap-4 animate-fadeIn">
        <HexagonIcon size={48} className="text-blue-400 animate-pulse" />
        <h1 className="text-2xl font-bold tracking-wide">
          Booting up <span className="text-blue-400">MAMS Backend</span>
        </h1>
        <p className="text-gray-400 text-sm text-center">
          Please wait while the backend server wakes up (Render free tier, so it
          might take a bit)
        </p>

        <div className="w-64 h-2 bg-gray-700 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Clock size={16} />
          <p className="text-gray-300 text-sm">
            Estimated time remaining:{" "}
            <span className="font-mono">{formattedTime}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-gray-400 mt-4 text-sm">
          <Loader2 className="animate-spin" size={16} />
          <span>Initializing secure connections...</span>
        </div>

        <div className="mt-6 text-xs text-gray-600 tracking-wider uppercase">
          <Zap className="inline-block mr-1 text-yellow-400" size={14} />
          System Status: <span className="text-green-400">Starting Up</span>
        </div>
      </div>
    </div>
  );
}
