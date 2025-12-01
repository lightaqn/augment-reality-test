"use client";

import { useEffect, useRef } from "react";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";

export default function PoseDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const pose = new Pose({
      locateFile: (path) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${path}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
    });

    pose.onResults((results) => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 3,
      });

      drawLandmarks(ctx, results.poseLandmarks, {
        color: "red",
        radius: 3,
      });

      ctx.restore();
    });

    const camera = new Camera(videoRef.current, {
      width: 640,
      height: 480,
      onFrame: async () => {
        await pose.send({ image: videoRef.current! });
      },
    });

    camera.start();
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} width={640} height={480} />
    </div>
  );
}
