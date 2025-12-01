"use client";
import { useEffect, useRef, useState } from "react";

type Props = {};

const PoseCoachMediaPipe = (props: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const lastMovementRef = useRef<number>(Date.now());
  const lastSpokenRef = useRef<number>(0);

  useEffect(() => {
    let pose: any = null;
    let camera: any = null;
    let running = true;

    const loadScript = (src: string) =>
      new Promise((res, rej) => {
        if (document.querySelector(`script[src="${src}"]`)) return res(true);
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = () => res(true);
        s.onerror = (e) => rej(e);
        document.head.appendChild(s);
      });

    async function init() {
      setStatus("loading scripts");
      try {
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.min.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.4/drawing_utils.js"
        );

        setStatus("initializing model");
        // @ts-ignore
        pose = new window.Pose({
          locateFile: (file: any) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`,
        });
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        pose.onResults(onResults);

        setStatus("starting camera");
        const video = videoRef.current!;
        // @ts-ignore
        camera = new window.Camera(video, {
          onFrame: async () => {
            await pose.send({ image: video });
          },
          width: 640,
          height: 480,
        });
        camera.start();
        setStatus("running");
      } catch (err: any) {
        console.error(err);
        setStatus("error: " + (err.message || String(err)));
      }
    }

    function speakOnce(text: string) {
      const now = Date.now();
      if (now - lastSpokenRef.current < 2500) return; // rate limit speech
      lastSpokenRef.current = now;
      setMessage(text);
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "en-US";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch (e) {
        console.warn("Speech failed", e);
      }
    }

    // // simple helpers
    // function dist(a: any, b: any) {
    //   return Math.hypot(a.x - b.x, a.y - b.y);
    // }

    function onResults(results: any) {
      if (!running) return;
      const canvas = canvasRef.current!;
      const video = videoRef.current!;
      if (!canvas || !video) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.poseLandmarks) {
        // draw landmarks
        // @ts-ignore
        // window.drawConnectors &&
        //   window?.drawConnectors(
        //     ctx,
        //     results.poseLandmarks,
        //     window.POSE_CONNECTIONS,
        //     { color: "#00FF99", lineWidth: 2 }
        //   );
        // @ts-ignore
        // window.drawLandmarks &&
        //   window?.drawLandmarks(ctx, results.poseLandmarks, {
        //     color: "#FF0066",
        //     lineWidth: 2,
        //   });

        // read select landmarks: wrists, shoulders, nose
        const lm = results.poseLandmarks;
        const leftW = lm[15],
          rightW = lm[16];
        const leftS = lm[11],
          rightS = lm[12];
        const nose = lm[0];

        // calculate midline x between shoulders
        const midShoulderX = (leftS.x + rightS.x) / 2;
        const handsMidX = (leftW.x + rightW.x) / 2;

        // movement detection (simple): compare wrists to previous frame via distance to nose
        const leftDist = Math.hypot(leftW.x - nose.x, leftW.y - nose.y);
        const rightDist = Math.hypot(rightW.x - nose.x, rightW.y - nose.y);

        // --- RULE: Handwashing-like motion detection ---
        // If both hands are near center (handsMidX close to midShoulderX) and moving (distance to nose changing)
        const handsCentered = Math.abs(handsMidX - midShoulderX) < 0.12; // tuned threshold
        const motionDelta = Math.abs(leftDist - rightDist);

        // Track last movement time
        lastMovementRef.current = Date.now();

        if (handsCentered && motionDelta > 0.02) {
          // detected rubbing together-ish
          speakOnce("Good — rubbing palms together. Keep going for 20 seconds");
        }

        // --- RULE: PPE mask proximity ---
        // If both wrists move close to nose/face region for > 1 second, suggest mask
        const wristToNose = Math.min(
          Math.hypot(leftW.x - nose.x, leftW.y - nose.y),
          Math.hypot(rightW.x - nose.x, rightW.y - nose.y)
        );
        if (wristToNose < 0.18) {
          // hand near face
          speakOnce(
            "Hands near face detected — remember to wear or adjust your mask"
          );
        }

        // --- RULE: Idle detection ---
        // If no significant change for 5000 ms => prompt to move
        const now = Date.now();
        if (now - lastMovementRef.current > 5000) {
          speakOnce(
            "You seem idle — continue the practice to get accurate feedback"
          );
        }

        // --- RULE: Unsafe bend posture (simple) ---
        // If nose y is much lower (camera-relative) than shoulders average => bending too far
        const avgShoulderY = (leftS.y + rightS.y) / 2;
        if (nose.y - avgShoulderY > 0.25) {
          speakOnce(
            "Caution — avoid bending too far forward when transferring patients"
          );
        }
      } else {
        // no landmarks — show hint
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(8, 8, 220, 44);
        ctx.fillStyle = "#fff";
        ctx.font = "14px system-ui";
        ctx.fillText(
          "No person detected. Ensure full upper body in frame.",
          16,
          36
        );
      }
    }

    init();

    return () => {
      running = false;
      try {
        pose && pose.close && pose.close();
      } catch (e) {}
    };
  }, []);

  return (
    <div className="relative h-[420px] w-full bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-cover -scale-x-100"
        playsInline
        muted
      ></video>
      <canvas
        ref={canvasRef}
        className="absolute left-0 top-0 w-full h-full pointer-events-none"
      />

      <div className="absolute left-3 top-3 bg-black/60 text-white p-2 rounded-md text-sm">
        <div>
          Status: <span className="font-medium">{status}</span>
        </div>
        <div className="mt-1">
          Tip: Ensure good lighting and full upper body visible.
        </div>
      </div>

      <div className="absolute right-3 bottom-3 bg-white/90 text-gray-900 p-3 rounded-md max-w-xs">
        <div className="text-sm font-semibold">Coach</div>
        <div className="text-sm mt-1">
          {message || "Waiting for actions..."}
        </div>
      </div>
    </div>
  );
};

export default PoseCoachMediaPipe;
