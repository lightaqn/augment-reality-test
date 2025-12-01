"use client";
import dynamic from "next/dynamic";
import PoseCoachClientMoveNet from "@/components/PoseCoachClientMoveNet";
import React from "react";

type Props = {};

// const PoseMoveNet = dynamic(
//   () => import("../../components/PoseCoachClientMoveNet"),
//   { ssr: false }
// );

export default function Page() {
  return (
    <div className="space-y-4 flex flex-col items-center justify-center p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">AR Coach — Live</h2>
      </div>

      <div className="bg-black rounded-md overflow-hidden shadow">
        {/* PoseCoachClient handles camera, MediaPipe and voice/text prompts */}
        <PoseCoachClientMoveNet />{" "}
      </div>

      <div className="text-sm text-gray-600 mt-2">
        If camera doesn't start: ensure site is served over HTTPS and camera
        permission is allowed.
      </div>
    </div>
  );
}
