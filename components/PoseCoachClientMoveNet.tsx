"use client";

import { useState, useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as posedetection from "@tensorflow-models/pose-detection";
import { MovenetPose } from "./typings";
type Props = {};

const PoseCoachClientMoveNet = (props: Props) => {
  const videoRef = useRef<HTMLVideoElement | any>(null);
  const canvasRef = useRef<HTMLCanvasElement | any>(null);
  const [calibrated, setCalibrated] = useState(false);
  const [baseline, setBaseline] = useState<any>(null);
  const [feedback, setFeedback] = useState("Stand straight to calibrate...");
  // const detectorRef = useRef<posedetection.PoseDetector | null>(null);
  useEffect(() => {
    // let detector = detectorRef?.current!;
    let animId: any;
    let detector: any;

    const run = async () => {
      await tf.setBackend("webgl");
      await tf.ready();
      detector = await posedetection.createDetector(
        posedetection.SupportedModels.MoveNet,
        {
          modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
          minPoseScore: 0.2,
        }
      );

      const video = videoRef?.current;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await video?.play();

      const ctx = canvasRef.current.getContext("2d");

      // const detect = async () => {
      //   const poses: MovenetPose[] = await detector.estimatePoses(video);
      //   ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      //   if (poses?.length! > 0) {
      //     drawPose(poses[0], ctx);
      //     handleCoaching(poses[0]);
      //   }
      //   animId = requestAnimationFrame(detect);
      // };
      // detect();
    };

    run();
    return () => cancelAnimationFrame(animId);
  }, []);

  const drawPose = (pose: any, ctx: any) => {
    const keypoints = pose.keypoints;
    keypoints.forEach((kp: any) => {
      if (kp.score > 0.4) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#00FF00";
        ctx.fill();
      }
    });
  };

  const handleCoaching = (pose: any) => {
    const keypoints = Object.fromEntries(
      pose.keypoints.map((k: any) => [k.name, k])
    );

    if (!calibrated) {
      if (keypoints["left_wrist"] && keypoints["right_wrist"]) {
        const shoulderWidth = Math.abs(
          keypoints["left_shoulder"].x - keypoints["right_shoulder"].x
        );
        const armSpan = Math.abs(
          keypoints["left_wrist"].x - keypoints["right_wrist"].x
        );
        const wristHeight =
          (keypoints["left_wrist"].y + keypoints["right_wrist"].y) / 2;
        setBaseline({ shoulderWidth, armSpan, wristHeight });
        setCalibrated(true);
        setFeedback("Calibration complete! Start practicing.");
        speak("Calibration complete. You can start now.");
      }
      return;
    }

    if (!baseline) return;

    const leftWrist = keypoints["left_wrist"];
    const rightWrist = keypoints["right_wrist"];
    const avgY = (leftWrist.y + rightWrist.y) / 2;

    if (avgY < baseline?.wristHeight - 50) {
      setFeedback("Good! Hands raised — this looks like handwashing motion.");
      speak("Good! Hands raised — continue washing motion.");
    } else if (avgY > baseline.wristHeight + 80) {
      setFeedback("Hands too low — consider raising them higher.");
      speak("Hands too low, raise them higher.");
    } else {
      setFeedback("Maintain posture — stay consistent.");
    }
  };

  const speak = (text: string) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 1;
    msg.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-2">MoveNet AR Coach</h1>
      <video
        ref={videoRef}
        className="w-full max-w-md rounded-lg"
        autoPlay
        playsInline
        muted
      ></video>
      <canvas
        ref={canvasRef}
        width={480}
        height={360}
        className="absolute top-0 left-0 w-full max-w-md"
      ></canvas>
      <p className="mt-4 text-center text-lg bg-gray-800 p-3 rounded-lg w-11/12">
        {feedback}
      </p>
    </div>
  );
};

export default PoseCoachClientMoveNet;
